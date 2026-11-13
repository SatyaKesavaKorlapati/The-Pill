use serde::Serialize;
use sysinfo::System;
use windows::System::Power::{BatteryStatus, PowerManager};
use windows::Win32::Media::Audio::Endpoints::IAudioEndpointVolume;
use windows::Win32::Media::Audio::{
    eMultimedia, eRender, IMMDeviceEnumerator, MMDeviceEnumerator,
};
use windows::Win32::System::Com::{CoCreateInstance, CoInitializeEx, CLSCTX_ALL, COINIT_MULTITHREADED};
use winreg::enums::*;
use winreg::RegKey;

#[derive(Debug, Clone, Serialize)]
pub struct SystemTelemetryPayload {
    pub battery_pct: i32,
    pub is_charging: bool,
    pub battery_state: String, // "Charging" | "Discharging" | "IdleFull" | "Low"
    pub pd_watts: i32,
    pub cpu_usage_pct: f32,
    pub ram_used_gb: f32,
    pub ram_total_gb: f32,
    pub master_volume: f32,
    pub night_light_enabled: bool,
}

#[tauri::command]
pub fn get_system_telemetry() -> Result<SystemTelemetryPayload, String> {
    let pct = PowerManager::RemainingChargePercent().unwrap_or(85);
    let status = PowerManager::BatteryStatus().unwrap_or(BatteryStatus::Discharging);
    let is_charging = status == BatteryStatus::Charging;

    let battery_state = if is_charging {
        "Charging"
    } else if pct >= 99 && status == BatteryStatus::Idle {
        "IdleFull"
    } else if pct <= 20 {
        "Low"
    } else {
        "Discharging"
    }
    .to_string();

    let pd_watts = if is_charging { 65 } else { 14 };

    let mut sys = System::new_all();
    sys.refresh_cpu();
    sys.refresh_memory();
    let cpu_usage_pct = sys.global_cpu_info().cpu_usage();
    let ram_used_gb = (sys.used_memory() as f32) / (1024.0 * 1024.0 * 1024.0);
    let ram_total_gb = (sys.total_memory() as f32) / (1024.0 * 1024.0 * 1024.0);

    let master_volume = get_master_volume_internal().unwrap_or(0.65);
    let night_light_enabled = get_night_light_state_internal();

    Ok(SystemTelemetryPayload {
        battery_pct: pct,
        is_charging,
        battery_state,
        pd_watts,
        cpu_usage_pct,
        ram_used_gb,
        ram_total_gb,
        master_volume,
        night_light_enabled,
    })
}

fn get_master_volume_internal() -> Option<f32> {
    unsafe {
        let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
        let enumerator: IMMDeviceEnumerator =
            CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL).ok()?;
        let device = enumerator.GetDefaultAudioEndpoint(eRender, eMultimedia).ok()?;
        let endpoint: IAudioEndpointVolume = device.Activate(CLSCTX_ALL, None).ok()?;
        endpoint.GetMasterVolumeLevelScalar().ok()
    }
}

#[tauri::command]
pub fn set_master_volume(level_0_to_1: f32) -> Result<f32, String> {
    let clamped = level_0_to_1.clamp(0.0, 1.0);
    unsafe {
        let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
        if let Ok(enumerator) =
            CoCreateInstance::<_, IMMDeviceEnumerator>(&MMDeviceEnumerator, None, CLSCTX_ALL)
        {
            if let Ok(device) = enumerator.GetDefaultAudioEndpoint(eRender, eMultimedia) {
                if let Ok(endpoint) = device.Activate::<IAudioEndpointVolume>(CLSCTX_ALL, None) {
                    let _ = endpoint.SetMasterVolumeLevelScalar(clamped, std::ptr::null());
                }
            }
        }
    }
    Ok(clamped)
}

const NIGHT_LIGHT_REG_PATH: &str = r"Software\Microsoft\Windows\CurrentVersion\CloudStore\Store\DefaultAccount\Current\default$windows.data.bluelightreduction.bluelightreductionstate\windows.data.bluelightreduction.bluelightreductionstate";

fn get_night_light_state_internal() -> bool {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    if let Ok(key) = hkcu.open_subkey_with_flags(NIGHT_LIGHT_REG_PATH, KEY_READ) {
        if let Ok(raw) = key.get_raw_value("Data") {
            if raw.bytes.len() > 18 {
                return raw.bytes[18] == 0x15;
            }
        }
    }
    false
}

#[tauri::command]
pub fn toggle_night_light() -> Result<bool, String> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let Ok(key) = hkcu.open_subkey_with_flags(NIGHT_LIGHT_REG_PATH, KEY_READ | KEY_WRITE) else {
        return Ok(false);
    };
    let Ok(mut raw) = key.get_raw_value("Data") else {
        return Ok(false);
    };
    if raw.bytes.len() <= 18 {
        return Ok(false);
    }

    let currently_active = raw.bytes[18] == 0x15;
    if currently_active {
        raw.bytes[18] = 0x13;
        if raw.bytes.len() >= 25 {
            raw.bytes.drain(23..25);
        }
    } else {
        raw.bytes[18] = 0x15;
        if raw.bytes.len() >= 23 {
            raw.bytes.splice(23..23, [0x10, 0x00]);
        }
    }

    // Increment 4-byte timestamp counter at indices 10..14 so Windows CloudStore driver applies immediately
    for i in 10..14 {
        if raw.bytes[i] < 0xFF {
            raw.bytes[i] += 1;
            break;
        }
    }

    let _ = key.set_raw_value("Data", &raw);
    Ok(!currently_active)
}
