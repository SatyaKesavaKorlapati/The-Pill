use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use regex::Regex;
use serde::Serialize;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter};
use windows::ApplicationModel::DataTransfer::{Clipboard, StandardDataFormats};
use windows::Storage::Streams::DataReader;
use windows::Win32::System::Com::{CoInitializeEx, COINIT_MULTITHREADED};

#[derive(Debug, Clone, Serialize)]
pub struct ClipboardRecordDto {
    pub id: String,
    pub text: String,
    pub category: String,   // "text" | "link" | "color" | "code" | "image" | "file"
    pub badge_code: String, // "TXT" | "URL" | "HEX" | "CODE" | "PNG" | "FILE"
    pub source: String,
    pub preview_image_data_url: Option<String>,
    pub file_size_label: Option<String>,
    pub timestamp_ms: u64,
    pub pinned: bool,
}

pub fn start_clipboard_watcher(app: AppHandle) {
    std::thread::spawn(move || {
        // Initialize COM on this worker thread for WinRT Clipboard APIs
        let _ = unsafe { CoInitializeEx(None, COINIT_MULTITHREADED) };

        let hex_re = Regex::new(r"^#(?:[0-9a-fA-F]{3}){1,2}$").ok();
        let mut last_text = String::new();
        let mut last_img_size: u64 = 0;

        loop {
            std::thread::sleep(Duration::from_millis(650));
            let Ok(content) = Clipboard::GetContent() else {
                continue;
            };

            let now_ms = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis() as u64;
            let id = format!("{:x}", now_ms);

            // 1. Check Text / Code / URL / HEX
            let has_text = StandardDataFormats::Text()
                .ok()
                .map(|fmt| content.Contains(&fmt).unwrap_or(false))
                .unwrap_or(false);

            if has_text {
                if let Ok(op) = content.GetTextAsync() {
                    if let Ok(hstr) = op.get() {
                        let text = hstr.to_string().trim().to_string();
                        if !text.is_empty() && text != last_text {
                            last_text = text.clone();
                            let is_hex = hex_re
                                .as_ref()
                                .map(|re| re.is_match(&text))
                                .unwrap_or(false);

                            let (category, badge_code) =
                                if text.starts_with("http://") || text.starts_with("https://") {
                                    ("link", "URL")
                                } else if is_hex {
                                    ("color", "HEX")
                                } else if text.contains('{')
                                    || text.contains("=>")
                                    || text.contains("function")
                                    || text.contains("const ")
                                    || text.contains("fn ")
                                {
                                    ("code", "CODE")
                                } else {
                                    ("text", "TXT")
                                };

                            let record = ClipboardRecordDto {
                                id,
                                text: text.clone(),
                                category: category.to_string(),
                                badge_code: badge_code.to_string(),
                                source: "System Clipboard".to_string(),
                                preview_image_data_url: None,
                                file_size_label: Some(format!("{} B", text.len())),
                                timestamp_ms: now_ms,
                                pinned: false,
                            };
                            let _ = app.emit("pill://clipboard-item-added", record);
                        }
                    }
                }
            }
            // 2. Check Uncropped Full Bitmap Previews
            else {
                let has_bitmap = StandardDataFormats::Bitmap()
                    .ok()
                    .map(|fmt| content.Contains(&fmt).unwrap_or(false))
                    .unwrap_or(false);

                if has_bitmap {
                    if let Ok(op) = content.GetBitmapAsync() {
                        if let Ok(stream_ref) = op.get() {
                            if let Ok(stream_op) = stream_ref.OpenReadAsync() {
                                if let Ok(stream) = stream_op.get() {
                                    let size = stream.Size().unwrap_or(0);
                                    if size > 0 && size != last_img_size {
                                        last_img_size = size;
                                        if let Ok(reader) = DataReader::CreateDataReader(&stream) {
                                            if reader
                                                .LoadAsync(size as u32)
                                                .and_then(|o| o.get())
                                                .is_ok()
                                            {
                                                let mut bytes = vec![0u8; size as usize];
                                                if reader.ReadBytes(&mut bytes).is_ok() {
                                                    let record = ClipboardRecordDto {
                                                        id,
                                                        text: "Captured Image Snip".to_string(),
                                                        category: "image".to_string(),
                                                        badge_code: "PNG".to_string(),
                                                        source: "Screen Snip".to_string(),
                                                        preview_image_data_url: Some(format!(
                                                            "data:image/bmp;base64,{}",
                                                            BASE64.encode(&bytes)
                                                        )),
                                                        file_size_label: Some(format!(
                                                            "{} KB",
                                                            bytes.len() / 1024
                                                        )),
                                                        timestamp_ms: now_ms,
                                                        pinned: false,
                                                    };
                                                    let _ =
                                                        app.emit("pill://clipboard-item-added", record);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
}
