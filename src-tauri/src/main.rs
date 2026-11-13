#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Set panic hook to log to file
    std::panic::set_hook(Box::new(|info| {
        let err_msg = format!("PANIC: {}\n", info);
        let _ = std::fs::write("d:\\Pill\\panic.log", err_msg);
    }));
    pill_for_windows::run();
}
