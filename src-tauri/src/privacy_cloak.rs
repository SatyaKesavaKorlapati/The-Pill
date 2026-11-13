use tauri::{AppHandle, Manager};
use windows::Win32::Foundation::HWND;
use windows::Win32::UI::WindowsAndMessaging::{
    GetWindowDisplayAffinity, SetWindowDisplayAffinity, WINDOW_DISPLAY_AFFINITY,
};

pub const WDA_NONE: u32 = 0x00000000;
pub const WDA_EXCLUDEFROMCAPTURE: u32 = 0x00000011;

#[tauri::command]
pub fn apply_privacy_cloak(
    app: AppHandle,
    privacy_mask_enabled: bool,
    public_passthrough_hud: bool,
    is_collapsed_public_hud_only: bool,
) -> Result<bool, String> {
    let Some(win) = app.get_webview_window("main-pill") else {
        return Ok(false);
    };
    let hwnd = HWND(win.hwnd().map_err(|e| e.to_string())?.0 as _);

    let should_cloak =
        privacy_mask_enabled && !(public_passthrough_hud && is_collapsed_public_hud_only);
    let target_affinity = WINDOW_DISPLAY_AFFINITY(if should_cloak {
        WDA_EXCLUDEFROMCAPTURE
    } else {
        WDA_NONE
    });

    if let Ok(mut f) = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open("d:\\Pill\\events.log")
    {
        use std::io::Write;
        let _ = writeln!(
            f,
            "APPLY PRIVACY CLOAK: mask_enabled={}, passthrough={}, collapsed_only={}, target_affinity=0x{:X}",
            privacy_mask_enabled, public_passthrough_hud, is_collapsed_public_hud_only, target_affinity.0
        );
        let _ = f.flush();
    }

    unsafe {
        let mut current: u32 = 0;
        if GetWindowDisplayAffinity(hwnd, &mut current).is_ok() && current == target_affinity.0 {
            return Ok(should_cloak);
        }
        let _ = SetWindowDisplayAffinity(hwnd, target_affinity);
    }

    // Also apply to Settings window if open
    if let Some(settings_win) = app.get_webview_window("settings-window") {
        if let Ok(s_hwnd) = settings_win.hwnd() {
            unsafe {
                let _ = SetWindowDisplayAffinity(
                    HWND(s_hwnd.0 as _),
                    WINDOW_DISPLAY_AFFINITY(if privacy_mask_enabled {
                        WDA_EXCLUDEFROMCAPTURE
                    } else {
                        WDA_NONE
                    }),
                );
            }
        }
    }

    Ok(should_cloak)
}
