use serde::Deserialize;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager, WebviewWindow};
use windows::Win32::Foundation::{HWND, POINT};
use windows::Win32::UI::WindowsAndMessaging::{
    GetCursorPos, GetSystemMetrics, GetWindowLongPtrW, SetForegroundWindow, SetWindowLongPtrW,
    SetWindowPos, GWL_EXSTYLE, HWND_TOPMOST, SM_CXSCREEN,
    WS_EX_NOACTIVATE, WS_EX_TOOLWINDOW, WS_EX_TOPMOST,
};

#[derive(Debug, Clone, Copy, Deserialize)]
pub struct HitRect {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

pub struct PillHitState {
    pub rect: HitRect,
    pub window_x: i32,
    pub window_y: i32,
    pub scale_factor: f64,
    pub force_interactive: bool,
}

pub fn configure_pill_overlay_window(window: &WebviewWindow) -> Arc<Mutex<PillHitState>> {
    let hwnd_raw = window.hwnd().unwrap().0;
    let hwnd = HWND(hwnd_raw as _);
    let scale = window.scale_factor().unwrap_or(1.0);

    let screen_w = unsafe { GetSystemMetrics(SM_CXSCREEN) };
    let stage_w = (720.0 * scale) as i32;
    let stage_h = (520.0 * scale) as i32;
    let win_x = (screen_w - stage_w) / 2;

    if let Ok(mut f) = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open("d:\\Pill\\events.log")
    {
        use std::io::Write;
        let _ = writeln!(
            f,
            "CONFIGURE PILL: HWND=0x{:X}, scale={}, screen_w={}, stage_w={}, stage_h={}, win_x={}",
            hwnd_raw as usize, scale, screen_w, stage_w, stage_h, win_x
        );
        let _ = f.flush();
    }

    unsafe {
        // Strip taskbar footprint
        let ex_style = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
        SetWindowLongPtrW(
            hwnd,
            GWL_EXSTYLE,
            ex_style
                | (WS_EX_TOOLWINDOW.0 as isize)
                | (WS_EX_TOPMOST.0 as isize),
        );

        let _ = SetWindowPos(
            hwnd,
            HWND_TOPMOST,
            win_x,
            0,
            stage_w,
            stage_h,
            windows::Win32::UI::WindowsAndMessaging::SWP_SHOWWINDOW,
        );
    }

    let screen_w = unsafe { GetSystemMetrics(SM_CXSCREEN) };
    let stage_w = (720.0 * scale) as i32;
    let win_x = (screen_w - stage_w) / 2;

    let state = Arc::new(Mutex::new(PillHitState {
        rect: HitRect {
            x: 255.0,
            y: 0.0,
            width: 210.0,
            height: 38.0,
        },
        window_x: win_x,
        window_y: 0,
        scale_factor: scale,
        force_interactive: false,
    }));

    // 120Hz High-Precision Cursor Hit-Tester & Top-Bezel Auto-Reveal
    let win_clone = window.clone();
    let state_clone = Arc::clone(&state);
    std::thread::spawn(move || {
        let mut last_ignore = true;
        let _ = win_clone.set_ignore_cursor_events(true);

        loop {
            std::thread::sleep(Duration::from_millis(8));
            let mut pt = POINT::default();
            if unsafe { GetCursorPos(&mut pt).is_ok() } {
                if let Ok(st) = state_clone.lock() {
                    let s = st.scale_factor;

                    // Top-edge bezel auto-reveal (y <= 2px near center)
                    let pill_left = st.window_x + (st.rect.x * s) as i32 - 12;
                    let pill_right = st.window_x + ((st.rect.x + st.rect.width) * s) as i32 + 12;
                    let pill_top = st.window_y + (st.rect.y * s) as i32;
                    let pill_bottom = st.window_y + ((st.rect.y + st.rect.height) * s) as i32 + 12;

                    if pt.y <= 2 && pt.x >= pill_left && pt.x <= pill_right {
                        let _ = win_clone.emit("pill://top-edge-hover", ());
                    }

                    let inside = st.force_interactive
                        || (pt.x >= pill_left
                            && pt.x <= pill_right
                            && pt.y >= pill_top
                            && pt.y <= pill_bottom);

                    let should_ignore = !inside;
                    if should_ignore != last_ignore {
                        let _ = win_clone.set_ignore_cursor_events(should_ignore);
                        last_ignore = should_ignore;
                    }
                }
            }
        }
    });

    state
}

#[tauri::command]
pub fn update_pill_hit_rect(
    state: tauri::State<'_, Arc<Mutex<PillHitState>>>,
    rect: HitRect,
) -> Result<(), String> {
    if let Ok(mut f) = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open("d:\\Pill\\events.log")
    {
        use std::io::Write;
        let _ = writeln!(f, "HIT RECT RECEIVED: {:?}", rect);
        let _ = f.flush();
    }
    if let Ok(mut st) = state.lock() {
        st.rect = rect;
    }
    Ok(())
}

#[tauri::command]
pub fn set_pill_focusable(app: AppHandle, focusable: bool) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("main-pill") {
        let hwnd = HWND(win.hwnd().map_err(|e| e.to_string())?.0 as _);
        unsafe {
            let ex_style = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
            if focusable {
                SetWindowLongPtrW(hwnd, GWL_EXSTYLE, ex_style & !(WS_EX_NOACTIVATE.0 as isize));
                let _ = SetForegroundWindow(hwnd);
            } else {
                SetWindowLongPtrW(hwnd, GWL_EXSTYLE, ex_style | (WS_EX_NOACTIVATE.0 as isize));
            }
        }
    }
    Ok(())
}

#[tauri::command]
pub fn open_settings_window(app: AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("settings-window") {
        let _ = win.show();
        let _ = win.set_focus();
    }
    Ok(())
}
