use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use serde::Serialize;
use windows::Media::Control::{
    GlobalSystemMediaTransportControlsSessionManager,
    GlobalSystemMediaTransportControlsSessionPlaybackStatus,
};
use windows::Storage::Streams::DataReader;

#[derive(Debug, Clone, Serialize)]
pub struct MediaTrackPayload {
    pub title: String,
    pub artist: String,
    pub album: String,
    pub thumbnail_data_url: Option<String>,
    pub duration_sec: f64,
    pub position_sec: f64,
    pub is_playing: bool,
}

#[tauri::command]
pub async fn get_current_media_track() -> Result<Option<MediaTrackPayload>, String> {
    let manager = GlobalSystemMediaTransportControlsSessionManager::RequestAsync()
        .map_err(|e| e.to_string())?
        .get()
        .map_err(|e| e.to_string())?;

    let Ok(session) = manager.GetCurrentSession() else {
        return Ok(None);
    };

    let props = session
        .TryGetMediaPropertiesAsync()
        .map_err(|e| e.to_string())?
        .get()
        .map_err(|e| e.to_string())?;

    let playback_info = session.GetPlaybackInfo().map_err(|e| e.to_string())?;
    let timeline = session.GetTimelineProperties().map_err(|e| e.to_string())?;

    let is_playing = playback_info.PlaybackStatus().unwrap_or(
        GlobalSystemMediaTransportControlsSessionPlaybackStatus::Paused,
    ) == GlobalSystemMediaTransportControlsSessionPlaybackStatus::Playing;

    let duration_sec = (timeline.EndTime().unwrap_or_default().Duration as f64) / 10_000_000.0;
    let position_sec = (timeline.Position().unwrap_or_default().Duration as f64) / 10_000_000.0;

    let mut thumbnail_data_url = None;
    if let Ok(thumb_ref) = props.Thumbnail() {
        if let Ok(op) = thumb_ref.OpenReadAsync() {
            if let Ok(stream) = op.get() {
                let size = stream.Size().unwrap_or(0) as u32;
                if size > 0 {
                    if let Ok(reader) = DataReader::CreateDataReader(&stream) {
                        if reader.LoadAsync(size).and_then(|o| o.get()).is_ok() {
                            let mut buf = vec![0u8; size as usize];
                            if reader.ReadBytes(&mut buf).is_ok() {
                                thumbnail_data_url =
                                    Some(format!("data:image/png;base64,{}", BASE64.encode(buf)));
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(Some(MediaTrackPayload {
        title: props.Title().map(|s| s.to_string()).unwrap_or_default(),
        artist: props.Artist().map(|s| s.to_string()).unwrap_or_default(),
        album: props.AlbumTitle().map(|s| s.to_string()).unwrap_or_default(),
        thumbnail_data_url,
        duration_sec,
        position_sec,
        is_playing,
    }))
}

#[tauri::command]
pub async fn media_control_action(action: String, seek_sec: Option<f64>) -> Result<(), String> {
    let manager = GlobalSystemMediaTransportControlsSessionManager::RequestAsync()
        .map_err(|e| e.to_string())?
        .get()
        .map_err(|e| e.to_string())?;

    if let Ok(session) = manager.GetCurrentSession() {
        match action.as_str() {
            "play_pause" => {
                let _ = session.TryTogglePlayPauseAsync().and_then(|o| o.get());
            }
            "next" => {
                let _ = session.TrySkipNextAsync().and_then(|o| o.get());
            }
            "previous" => {
                let _ = session.TrySkipPreviousAsync().and_then(|o| o.get());
            }
            "seek" => {
                if let Some(sec) = seek_sec {
                    let ticks = (sec * 10_000_000.0) as i64;
                    let _ = session
                        .TryChangePlaybackPositionAsync(ticks)
                        .and_then(|o| o.get());
                }
            }
            _ => {}
        }
    }
    Ok(())
}
