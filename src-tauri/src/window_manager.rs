use serde::Deserialize;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager, WebviewWindow};
use windows::Win32::Foundation::{HWND, POINT};
use windows::Win32::Graphics::Dwm::{
    DwmSetWindowAttribute, DWMWA_BORDER_COLOR, DWMWA_WINDOW_CORNER_PREFERENCE,
    DWMWCP_DONOTROUND,
};
use windows::Win32::UI::Input::KeyboardAndMouse::{GetAsyncKeyState, VK_LBUTTON};
use windows::Win32::UI::WindowsAndMessaging::{
    GetCursorPos, GetSystemMetrics, GetWindowLongPtrW, SetForegroundWindow, SetWindowLongPtrW,
    SetWindowPos, GWL_EXSTYLE, GWL_STYLE, HWND_TOPMOST, SM_CXSCREEN, SM_CYSCREEN,
    WS_BORDER, WS_DLGFRAME, WS_EX_NOACTIVATE, WS_EX_TOOLWINDOW, WS_EX_TOPMOST, WS_THICKFRAME,
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
    let stage_w = (960.0 * scale) as i32;
    let stage_h = (600.0 * scale) as i32;
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
        // Completely remove Windows 11 DWM window border and prevent corner rounding artifacts
        let border_none: u32 = 0xFFFFFFFE;
        let _ = DwmSetWindowAttribute(
            hwnd,
            DWMWA_BORDER_COLOR,
            &border_none as *const _ as *const _,
            std::mem::size_of::<u32>() as u32,
        );
        let corner_pref = DWMWCP_DONOTROUND;
        let _ = DwmSetWindowAttribute(
            hwnd,
            DWMWA_WINDOW_CORNER_PREFERENCE,
            &corner_pref as *const _ as *const _,
            std::mem::size_of_val(&corner_pref) as u32,
        );

        // Completely strip any standard Win32 window border styles
        let style = GetWindowLongPtrW(hwnd, GWL_STYLE);
        SetWindowLongPtrW(
            hwnd,
            GWL_STYLE,
            style & !(WS_BORDER.0 as isize) & !(WS_THICKFRAME.0 as isize) & !(WS_DLGFRAME.0 as isize),
        );

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
    let stage_w = (960.0 * scale) as i32;
    let win_x = (screen_w - stage_w) / 2;

    let state = Arc::new(Mutex::new(PillHitState {
        rect: HitRect {
            x: 375.0,
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
        let mut was_at_top_edge = false;
        let mut was_lbutton_down = false;
        let mut was_inside = false;
        let _ = win_clone.set_ignore_cursor_events(true);

        loop {
            std::thread::sleep(Duration::from_millis(8));
            let mut pt = POINT::default();
            if unsafe { GetCursorPos(&mut pt).is_ok() } {
                if let Ok(st) = state_clone.lock() {
                    let s = st.scale_factor;

                    // Top-edge bezel auto-reveal: only reveal once when mouse enters the top edge (y <= 4) of the middle section
                    let center_x = st.window_x + ((st.rect.x + (st.rect.width / 2.0)) * s) as i32;
                    let middle_radius = (240.0 * s) as i32;
                    let is_at_top_edge = if st.window_y == 0 {
                        pt.y <= 6 && pt.x >= (center_x - middle_radius) && pt.x <= (center_x + middle_radius)
                    } else {
                        let screen_h = unsafe { GetSystemMetrics(SM_CYSCREEN) };
                        pt.y >= (screen_h - 10) && pt.x >= (center_x - middle_radius) && pt.x <= (center_x + middle_radius)
                    };

                    if is_at_top_edge && !was_at_top_edge {
                        let _ = win_clone.emit("pill://top-edge-hover", ());
                    }
                    was_at_top_edge = is_at_top_edge;

                    let pill_left = st.window_x + (st.rect.x * s) as i32 - 12;
                    let pill_right = st.window_x + ((st.rect.x + st.rect.width) * s) as i32 + 12;
                    let pill_top = st.window_y + (st.rect.y * s) as i32 - 12;
                    let pill_bottom = st.window_y + ((st.rect.y + st.rect.height) * s) as i32 + 12;

                    let inside = st.force_interactive
                        || (pt.x >= pill_left
                            && pt.x <= pill_right
                            && pt.y >= pill_top
                            && pt.y <= pill_bottom);

                    // Detect cursor leaving/entering expanded pill
                    let is_expanded_rect = st.rect.height > 80.0;
                    if !inside && was_inside && is_expanded_rect {
                        let _ = win_clone.emit("pill://cursor-left-pill", ());
                    }
                    if inside && !was_inside {
                        let _ = win_clone.emit("pill://cursor-entered-pill", ());
                    }
                    was_inside = inside;

                    // Detect global outside click when pill is expanded (height > 80.0)
                    let lbutton_down = unsafe { GetAsyncKeyState(VK_LBUTTON.0 as i32) < 0 };
                    if !inside && is_expanded_rect && lbutton_down && !was_lbutton_down {
                        let _ = win_clone.emit("pill://outside-click", ());
                    }
                    was_lbutton_down = lbutton_down;

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
        let _ = win.unminimize();
        let _ = win.show();
        let _ = win.set_focus();
        if let Ok(hwnd_raw) = win.hwnd() {
            let hwnd = HWND(hwnd_raw.0 as _);
            unsafe {
                use windows::Win32::UI::WindowsAndMessaging::{
                    BringWindowToTop, SetForegroundWindow, SetWindowPos, ShowWindow, SW_RESTORE,
                    SW_SHOW, SWP_FRAMECHANGED, SWP_NOMOVE, SWP_NOSIZE, SWP_NOZORDER,
                };
                let _ = ShowWindow(hwnd, SW_RESTORE);
                let _ = ShowWindow(hwnd, SW_SHOW);
                let _ = SetWindowPos(
                    hwnd,
                    HWND(std::ptr::null_mut()),
                    0,
                    0,
                    0,
                    0,
                    SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_FRAMECHANGED,
                );
                let _ = BringWindowToTop(hwnd);
                let _ = SetForegroundWindow(hwnd);
            }
        }
    } else {
        let builder = tauri::WebviewWindowBuilder::new(
            &app,
            "settings-window",
            tauri::WebviewUrl::App("index.html#settings".into()),
        )
        .title("Pill Settings")
        .inner_size(920.0, 680.0)
        .center()
        .resizable(true)
        .decorations(false)
        .transparent(false)
        .shadow(false);

        if let Ok(win) = builder.build() {
            let _ = win.show();
            let _ = win.set_focus();
        }
    }
    Ok(())
}

#[tauri::command]
pub fn close_settings_window(app: AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("settings-window") {
        if let Ok(hwnd_raw) = win.hwnd() {
            let hwnd = HWND(hwnd_raw.0 as _);
            unsafe {
                use windows::Win32::UI::WindowsAndMessaging::{ShowWindow, SW_HIDE};
                let _ = ShowWindow(hwnd, SW_HIDE);
            }
        }
        let _ = win.hide();
    }
    Ok(())
}

#[tauri::command]
pub fn minimize_settings_window(app: AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("settings-window") {
        let _ = win.minimize();
    }
    Ok(())
}

#[tauri::command]
pub fn toggle_maximize_settings_window(app: AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("settings-window") {
        let is_max = win.is_maximized().unwrap_or(false);
        if is_max {
            let _ = win.unmaximize();
        } else {
            let _ = win.maximize();
        }
    }
    Ok(())
}

#[tauri::command]
pub fn toggle_fullscreen_settings_window(app: AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("settings-window") {
        let is_fs = win.is_fullscreen().unwrap_or(false);
        let _ = win.set_fullscreen(!is_fs);
    }
    Ok(())
}

#[tauri::command]
pub fn reposition_pill_window(app: AppHandle, anchor: String) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("main-pill") {
        let hwnd_raw = win.hwnd().map_err(|e| e.to_string())?.0;
        let hwnd = HWND(hwnd_raw as _);
        let scale = win.scale_factor().unwrap_or(1.0);

        let screen_w = unsafe { GetSystemMetrics(SM_CXSCREEN) };
        let screen_h = unsafe { GetSystemMetrics(SM_CYSCREEN) };

        let stage_w = (960.0 * scale) as i32;
        let stage_h = (600.0 * scale) as i32;

        let (win_x, win_y) = match anchor.as_str() {
            "top_left" => (0, 0),
            "top_right" => (screen_w - stage_w, 0),
            "bottom_taskbar" => ((screen_w - stage_w) / 2, screen_h - stage_h),
            _ => ((screen_w - stage_w) / 2, 0), // top_center default
        };

        if let Some(state) = app.try_state::<Arc<Mutex<PillHitState>>>() {
            if let Ok(mut st) = state.lock() {
                st.window_x = win_x;
                st.window_y = win_y;
            }
        }

        unsafe {
            use windows::Win32::UI::WindowsAndMessaging::{
                SetWindowPos, HWND_TOPMOST, SWP_NOACTIVATE, SWP_SHOWWINDOW,
            };
            let _ = SetWindowPos(
                hwnd,
                HWND_TOPMOST,
                win_x,
                win_y,
                stage_w,
                stage_h,
                SWP_SHOWWINDOW | SWP_NOACTIVATE,
            );
        }
    }
    Ok(())
}

#[tauri::command]
pub fn broadcast_preferences_sync(
    app: AppHandle,
    preferences_json: Option<String>,
    prefs_json: Option<String>,
) -> Result<(), String> {
    let json_str = preferences_json
        .or(prefs_json)
        .unwrap_or_else(|| "{}".to_string());
    let _ = app.emit("pill://preferences-updated", json_str.clone());
    if let Ok(val) = serde_json::from_str::<serde_json::Value>(&json_str) {
        if let Some(anchor) = val.get("anchorPosition").and_then(|a| a.as_str()) {
            let _ = reposition_pill_window(app, anchor.to_string());
        }
    }
    Ok(())
}
