use serde::Serialize;
use windows::Devices::Bluetooth::{BluetoothAdapter, BluetoothConnectionStatus, BluetoothDevice};
use windows::Devices::Enumeration::DeviceInformation;
use windows::Devices::Radios::RadioState;
use windows::Devices::WiFi::WiFiAdapter;
use windows::Networking::Connectivity::NetworkAuthenticationType;

#[derive(Debug, Clone, Serialize)]
pub struct WifiNetworkDto {
    pub ssid: String,
    pub signal_bars: u8,
    pub freq_ghz: f64,
    pub is_secured: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct BluetoothDeviceDto {
    pub name: String,
    pub id: String,
    pub is_connected: bool,
}

#[tauri::command]
pub async fn scan_wifi_networks() -> Result<Vec<WifiNetworkDto>, String> {
    let adapters = WiFiAdapter::FindAllAdaptersAsync()
        .map_err(|e| e.to_string())?
        .get()
        .map_err(|e| e.to_string())?;

    if adapters.Size().unwrap_or(0) == 0 {
        return Ok(vec![]);
    }

    let wifi = adapters.GetAt(0).map_err(|e| e.to_string())?;
    let _ = wifi.ScanAsync().and_then(|o| o.get());

    let report = wifi.NetworkReport().map_err(|e| e.to_string())?;
    let networks = report.AvailableNetworks().map_err(|e| e.to_string())?;

    let mut list = Vec::new();
    for net in networks {
        let ssid = net.Ssid().map(|s| s.to_string()).unwrap_or_default();
        if ssid.is_empty() {
            continue;
        }
        let signal_bars = net.SignalBars().unwrap_or(0);
        let freq_ghz = (net.ChannelCenterFrequencyInKilohertz().unwrap_or(2412000) as f64) / 1_000_000.0;
        let is_secured = net
            .SecuritySettings()
            .and_then(|s| s.NetworkAuthenticationType())
            .unwrap_or(NetworkAuthenticationType::Open80211)
            != NetworkAuthenticationType::Open80211;

        list.push(WifiNetworkDto {
            ssid,
            signal_bars,
            freq_ghz,
            is_secured,
        });
    }
    Ok(list)
}

#[tauri::command]
pub async fn get_paired_bluetooth_devices() -> Result<Vec<BluetoothDeviceDto>, String> {
    let selector = BluetoothDevice::GetDeviceSelectorFromPairingState(true)
        .map_err(|e| e.to_string())?;
    let devices = DeviceInformation::FindAllAsyncAqsFilter(&selector)
        .map_err(|e| e.to_string())?
        .get()
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    for dev in devices {
        if let Ok(id) = dev.Id() {
            if let Ok(op) = BluetoothDevice::FromIdAsync(&id) {
                if let Ok(bt) = op.get() {
                    let name = bt.Name().map(|s| s.to_string()).unwrap_or_default();
                    let is_connected = bt.ConnectionStatus().unwrap_or(BluetoothConnectionStatus::Disconnected)
                        == BluetoothConnectionStatus::Connected;
                    results.push(BluetoothDeviceDto {
                        name,
                        id: id.to_string(),
                        is_connected,
                    });
                }
            }
        }
    }
    Ok(results)
}

#[tauri::command]
pub async fn toggle_bluetooth_radio(enable: bool) -> Result<bool, String> {
    let adapter = BluetoothAdapter::GetDefaultAsync()
        .map_err(|e| e.to_string())?
        .get()
        .map_err(|e| e.to_string())?;
    let radio = adapter
        .GetRadioAsync()
        .map_err(|e| e.to_string())?
        .get()
        .map_err(|e| e.to_string())?;
    let state = if enable { RadioState::On } else { RadioState::Off };
    let _ = radio.SetStateAsync(state).and_then(|o| o.get());
    Ok(enable)
}
