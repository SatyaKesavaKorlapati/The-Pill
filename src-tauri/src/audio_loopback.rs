use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{AppHandle, Emitter};

static IS_RECORDING: AtomicBool = AtomicBool::new(false);

#[tauri::command]
pub fn start_audio_capture(app: AppHandle, _source: Option<String>) -> Result<bool, String> {
    if IS_RECORDING.load(Ordering::SeqCst) {
        return Ok(true);
    }
    IS_RECORDING.store(true, Ordering::SeqCst);

    std::thread::spawn(move || {
        while IS_RECORDING.load(Ordering::SeqCst) {
            std::thread::sleep(std::time::Duration::from_millis(100));
            // Emit mock/live amplitude or stream status
            let _ = app.emit("pill://audio-capture-status", true);
        }
    });

    Ok(true)
}

#[tauri::command]
pub fn stop_audio_capture() -> Result<bool, String> {
    IS_RECORDING.store(false, Ordering::SeqCst);
    Ok(false)
}
