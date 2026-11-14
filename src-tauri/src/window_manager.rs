use serde::Deserialize;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager, WebviewWindow};
use windows::Win32::Foundation::{HWND, POINT};
use windows::Win32::Graphics::Dwm::{
    DwmSetWindowAttribute, DWMWA_BORDER_COLOR, DWMWA_WINDOW_CORNER_PREFERENCE,
    DWMWCP_DONOTROUND,
};
use windows::Win32::UI::Input::KeyboardAndMouse::{GetAsyncKeyState, VK_LBUTTON, VK_RBUTTON};
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
    pub reveal_width: f64,
    pub reveal_height: f64,
    pub reveal_enabled: bool,
}

pub fn get_preferences_file_path() -> std::path::PathBuf {
    let p = std::path::PathBuf::from("d:\\Pill\\user_preferences.json");
    if let Some(parent) = p.parent() {
        if parent.exists() {
            return p;
        }
    }
    if let Ok(appdata) = std::env::var("APPDATA") {
        let dir = std::path::PathBuf::from(appdata).join("Pill");
        let _ = std::fs::create_dir_all(&dir);
        return dir.join("user_preferences.json");
    }
    p
}

pub fn save_preferences_to_disk(json_str: &str) {
    let path = get_preferences_file_path();
    let _ = std::fs::write(&path, json_str);
}

pub fn read_preferences_from_disk() -> Option<String> {
    let path = get_preferences_file_path();
    std::fs::read_to_string(&path).ok()
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

    let (init_reveal_w, init_reveal_h, init_reveal_en) = if let Some(saved) = read_preferences_from_disk() {
        if let Ok(val) = serde_json::from_str::<serde_json::Value>(&saved) {
            let w = val.get("revealAreaWidth").and_then(|v| v.as_f64()).unwrap_or(140.0);
            let h = val.get("revealAreaHeight").and_then(|v| v.as_f64()).unwrap_or(4.0);
            let en = val.get("revealOnEdgeTouch").and_then(|v| v.as_bool()).unwrap_or(true);
            (w, h, en)
        } else {
            (140.0, 4.0, true)
        }
    } else {
        (140.0, 4.0, true)
    };

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
        reveal_width: init_reveal_w.max(1.0),
        reveal_height: init_reveal_h.max(1.0),
        reveal_enabled: init_reveal_en,
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

                    // Top-edge bezel auto-reveal: only reveal when mouse enters user-defined hit bounds
                    let is_at_top_edge = if st.reveal_enabled {
                        let center_x = st.window_x + ((st.rect.x + (st.rect.width / 2.0)) * s) as i32;
                        let half_width = ((st.reveal_width / 2.0) * s).round().max(20.0) as i32;
                        let height_limit = (st.reveal_height * s).round().max(1.0) as i32;
                        if st.window_y == 0 {
                            pt.y <= height_limit && pt.x >= (center_x - half_width) && pt.x <= (center_x + half_width)
                        } else {
                            let screen_h = unsafe { GetSystemMetrics(SM_CYSCREEN) };
                            pt.y >= (screen_h - height_limit) && pt.x >= (center_x - half_width) && pt.x <= (center_x + half_width)
                        }
                    } else {
                        false
                    };

                    if is_at_top_edge && !was_at_top_edge {
                        let _ = win_clone.emit("pill://top-edge-hover", ());
                    }
                    was_at_top_edge = is_at_top_edge;

                    // Hysteresis deadband: 16px when already inside, 10px when outside to eliminate boundary oscillation
                    let pad = if was_inside { 16 } else { 10 };
                    let pill_left = st.window_x + (st.rect.x * s) as i32 - pad;
                    let pill_right = st.window_x + ((st.rect.x + st.rect.width) * s) as i32 + pad;
                    let pill_top = st.window_y + (st.rect.y * s) as i32 - pad;
                    let pill_bottom = st.window_y + ((st.rect.y + st.rect.height) * s) as i32 + pad;

                    let inside = st.force_interactive
                        || (pt.x >= pill_left
                            && pt.x <= pill_right
                            && pt.y >= pill_top
                            && pt.y <= pill_bottom);

                    // Detect cursor leaving/entering pill (both compact and expanded)
                    if !inside && was_inside {
                        let _ = win_clone.emit("pill://cursor-left-pill", ());
                    }
                    if inside && !was_inside {
                        let _ = win_clone.emit("pill://cursor-entered-pill", ());
                    }
                    was_inside = inside;

                    // Detect global outside click when cursor is outside the pill
                    let lbutton_down = unsafe { GetAsyncKeyState(VK_LBUTTON.0 as i32) < 0 };
                    let rbutton_down = unsafe { GetAsyncKeyState(VK_RBUTTON.0 as i32) < 0 };
                    let is_mouse_down = lbutton_down || rbutton_down;

                    let outside_stage = pt.x < st.window_x
                        || pt.x > st.window_x + (960.0 * s) as i32
                        || pt.y < st.window_y
                        || pt.y > st.window_y + (600.0 * s) as i32;

                    if ((!inside && lbutton_down) || (st.force_interactive && outside_stage && is_mouse_down))
                        && !was_lbutton_down
                    {
                        let _ = win_clone.emit("pill://outside-click", ());
                    }
                    was_lbutton_down = is_mouse_down;

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
    if let Ok(mut st) = state.lock() {
        st.rect = rect;
    }
    Ok(())
}

#[tauri::command]
pub fn set_pill_force_interactive(
    state: tauri::State<'_, Arc<Mutex<PillHitState>>>,
    force: bool,
) -> Result<(), String> {
    if let Ok(mut st) = state.lock() {
        st.force_interactive = force;
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

const ICON_WIN11: &[u8] = include_bytes!("../../public/assets/themes/icons/win11_cyan.png");
const ICON_CYBERPUNK: &[u8] = include_bytes!("../../public/assets/themes/icons/cyberpunk_neon.png");
const ICON_RETRO: &[u8] = include_bytes!("../../public/assets/themes/icons/retro_synth_crt.png");
const ICON_PAPER: &[u8] = include_bytes!("../../public/assets/themes/icons/paper_editorial.png");
const ICON_COZY: &[u8] = include_bytes!("../../public/assets/themes/icons/cozy_animals.png");
const ICON_BOTANICAL: &[u8] = include_bytes!("../../public/assets/themes/icons/botanical_sakura.png");
const ICON_MOTORSPORT: &[u8] = include_bytes!("../../public/assets/themes/icons/motorsport_gt.png");
const ICON_APPLE: &[u8] = include_bytes!("../../public/assets/themes/icons/apple_indigo.png");

pub fn get_icon_bytes_for_theme(theme_id: &str) -> &'static [u8] {
    match theme_id {
        "cyberpunk_neon" => ICON_CYBERPUNK,
        "retro_synth_crt" | "sunset_rose" => ICON_RETRO,
        "paper_editorial" => ICON_PAPER,
        "cozy_animals" | "emerald_forest" => ICON_COZY,
        "botanical_sakura" => ICON_BOTANICAL,
        "motorsport_gt" | "crimson_titanium" => ICON_MOTORSPORT,
        "apple_indigo" => ICON_APPLE,
        _ => ICON_WIN11,
    }
}

#[tauri::command]
pub fn update_window_theme_icon(app: AppHandle, theme_id: String) -> Result<(), String> {
    let bytes = get_icon_bytes_for_theme(&theme_id);
    let image = tauri::image::Image::from_bytes(bytes).map_err(|e| e.to_string())?;

    for label in &["main-pill", "settings-window"] {
        if let Some(win) = app.get_webview_window(label) {
            let _ = win.set_icon(image.clone());
        }
    }
    Ok(())
}

#[tauri::command]
pub fn get_saved_preferences() -> Result<Option<String>, String> {
    Ok(read_preferences_from_disk())
}

#[tauri::command]
pub fn save_user_preferences(preferences_json: String) -> Result<(), String> {
    save_preferences_to_disk(&preferences_json);
    Ok(())
}

#[tauri::command]
pub fn update_pill_reveal_settings(
    state: tauri::State<'_, Arc<Mutex<PillHitState>>>,
    width: f64,
    height: f64,
    enabled: bool,
) -> Result<(), String> {
    if let Ok(mut st) = state.lock() {
        st.reveal_width = width.max(1.0);
        st.reveal_height = height.max(1.0);
        st.reveal_enabled = enabled;
    }
    Ok(())
}

#[tauri::command]
pub fn broadcast_preferences_sync(
    app: AppHandle,
    state: tauri::State<'_, Arc<Mutex<PillHitState>>>,
    preferences_json: Option<String>,
    prefs_json: Option<String>,
) -> Result<(), String> {
    let json_str = preferences_json
        .or(prefs_json)
        .unwrap_or_else(|| "{}".to_string());
    save_preferences_to_disk(&json_str);
    let _ = app.emit("pill://preferences-updated", json_str.clone());
    if let Ok(val) = serde_json::from_str::<serde_json::Value>(&json_str) {
        if let Some(anchor) = val.get("anchorPosition").and_then(|a| a.as_str()) {
            let _ = reposition_pill_window(app.clone(), anchor.to_string());
        }
        if let Some(theme) = val.get("themeId").and_then(|t| t.as_str()) {
            let _ = update_window_theme_icon(app.clone(), theme.to_string());
        }
        if let Ok(mut st) = state.lock() {
            if let Some(w) = val.get("revealAreaWidth").and_then(|v| v.as_f64()) {
                st.reveal_width = w.max(1.0);
            }
            if let Some(h) = val.get("revealAreaHeight").and_then(|v| v.as_f64()) {
                st.reveal_height = h.max(1.0);
            }
            if let Some(en) = val.get("revealOnEdgeTouch").and_then(|v| v.as_bool()) {
                st.reveal_enabled = en;
            }
        }
    }
    Ok(())
}
