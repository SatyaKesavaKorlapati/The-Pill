pub mod audio_loopback;
pub mod bluetooth_wifi;
pub mod clipboard_watcher;
pub mod dpapi_vault;
pub mod media_gsmtc;
pub mod privacy_cloak;
pub mod system_controls;
pub mod window_manager;

use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        if shortcut.matches(Modifiers::ALT, Code::KeyL) {
                            let _ = app.emit("pill://hotkey-toggle-pill", ());
                        } else if shortcut.matches(Modifiers::ALT, Code::KeyV) {
                            let _ = app.emit("pill://hotkey-summon-astra", ());
                        }
                    }
                })
                .build(),
        )
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "settings-window" {
                    api.prevent_close();
                    if let Ok(hwnd_raw) = window.hwnd() {
                        let hwnd = windows::Win32::Foundation::HWND(hwnd_raw.0 as _);
                        unsafe {
                            let _ = windows::Win32::UI::WindowsAndMessaging::ShowWindow(
                                hwnd,
                                windows::Win32::UI::WindowsAndMessaging::SW_HIDE,
                            );
                        }
                    }
                    let _ = window.hide();
                }
            }
        })
        .setup(|app| {
            if let Some(main_win) = app.get_webview_window("main-pill") {
                let hit_state = window_manager::configure_pill_overlay_window(&main_win);
                app.manage(hit_state);

                // Privacy cloak off by default so window is visible in captures & screenshots
                let _ = privacy_cloak::apply_privacy_cloak(app.handle().clone(), false, false, false);
            }

            if let Some(settings_win) = app.get_webview_window("settings-window") {
                let _ = settings_win.hide();
            }

            // Register Alt+L (Toggle Pill) and Alt+V (Summon Astra Voice Orb)
            let alt_l = Shortcut::new(Some(Modifiers::ALT), Code::KeyL);
            let alt_v = Shortcut::new(Some(Modifiers::ALT), Code::KeyV);
            let _ = app.global_shortcut().register(alt_l);
            let _ = app.global_shortcut().register(alt_v);

            // Start live Windows Clipboard Watcher
            clipboard_watcher::start_clipboard_watcher(app.handle().clone());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            window_manager::update_pill_hit_rect,
            window_manager::set_pill_focusable,
            window_manager::reposition_pill_window,
            window_manager::open_settings_window,
            window_manager::close_settings_window,
            window_manager::minimize_settings_window,
            window_manager::toggle_maximize_settings_window,
            window_manager::toggle_fullscreen_settings_window,
            window_manager::broadcast_preferences_sync,
            window_manager::update_window_theme_icon,
            privacy_cloak::apply_privacy_cloak,
            dpapi_vault::save_custom_api_key,
            dpapi_vault::load_custom_api_key,
            dpapi_vault::has_custom_api_key,
            dpapi_vault::clear_custom_api_key,
            media_gsmtc::get_current_media_track,
            media_gsmtc::media_control_action,
            bluetooth_wifi::scan_wifi_networks,
            bluetooth_wifi::get_paired_bluetooth_devices,
            bluetooth_wifi::toggle_bluetooth_radio,
            system_controls::get_system_telemetry,
            system_controls::set_master_volume,
            system_controls::toggle_night_light,
            audio_loopback::start_audio_capture,
            audio_loopback::stop_audio_capture,
        ])
        .build(tauri::generate_context!())
        .expect("error while building Pill for Windows")
        .run(|_app_handle, event| {
            use std::io::Write;
            if let Ok(mut f) = std::fs::OpenOptions::new()
                .create(true)
                .append(true)
                .open("d:\\Pill\\events.log")
            {
                let _ = writeln!(f, "EVENT: {:?}", event);
                let _ = f.flush();
            }
            if let tauri::RunEvent::ExitRequested { ref code, ref api, .. } = event {
                if let Ok(mut f) = std::fs::OpenOptions::new()
                    .create(true)
                    .append(true)
                    .open("d:\\Pill\\events.log")
                {
                    let _ = writeln!(f, "EXIT REQUESTED: code={:?}", code);
                    let _ = f.flush();
                }
                api.prevent_exit();
            }
        });
}
