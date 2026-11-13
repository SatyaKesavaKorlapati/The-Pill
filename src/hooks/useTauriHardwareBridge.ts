import { useEffect } from 'react';
import { usePillStore } from '../store/usePillStore';
import { ClipboardRecord, MediaTrackPayload, SystemTelemetryPayload } from '../types/preferences';

export function useTauriHardwareBridge() {
  const isExpanded = usePillStore((s) => s.isExpanded);
  const astraVisible = usePillStore((s) => s.astraVisible);
  const toggleExpanded = usePillStore((s) => s.toggleExpanded);
  const setExpanded = usePillStore((s) => s.setExpanded);
  const setAstraVisible = usePillStore((s) => s.setAstraVisible);
  const addClipboardRecord = usePillStore((s) => s.addClipboardRecord);
  const setMediaTrack = usePillStore((s) => s.setMediaTrack);
  const setSystemTelemetry = usePillStore((s) => s.setSystemTelemetry);
  const setWifiNetworks = usePillStore((s) => s.setWifiNetworks);
  const setBluetoothDevices = usePillStore((s) => s.setBluetoothDevices);

  const privacyMaskEnabled = usePillStore((s) => s.preferences.privacyMaskEnabled);
  const privacyPublicPassthroughHud = usePillStore((s) => s.preferences.privacyPublicPassthroughHud);

  // 1. Setup Tauri Event Listeners (Global Hotkeys, Top-edge Hover, Clipboard events)
  useEffect(() => {
    let unlistenList: Array<() => void> = [];

    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (!isTauri) return;

    (async () => {
      try {
        const { listen } = await import('@tauri-apps/api/event');

        // Top-edge bezel auto-reveal
        const u1 = await listen('pill://top-edge-hover', () => {
          setExpanded(true);
        });
        unlistenList.push(u1);

        // Alt+L: Toggle Pill
        const u2 = await listen('pill://hotkey-toggle-pill', () => {
          toggleExpanded();
        });
        unlistenList.push(u2);

        // Alt+V: Summon Astra Voice Orb
        const u3 = await listen('pill://hotkey-summon-astra', () => {
          setAstraVisible(true);
        });
        unlistenList.push(u3);

        // Live Windows Clipboard Listener
        const u4 = await listen<ClipboardRecord>('pill://clipboard-item-added', (event) => {
          if (event.payload) {
            addClipboardRecord(event.payload);
          }
        });
        unlistenList.push(u4);
      } catch (err) {
        console.warn('Tauri event listeners registration error:', err);
      }
    })();

    return () => {
      unlistenList.forEach((un) => un());
    };
  }, [setExpanded, toggleExpanded, setAstraVisible, addClipboardRecord]);

  // 2. Sync Screen-Capture Privacy Cloaking (WDA_EXCLUDEFROMCAPTURE 0x11)
  useEffect(() => {
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (!isTauri) return;

    (async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('apply_privacy_cloak', {
          privacyMaskEnabled,
          publicPassthroughHud: privacyPublicPassthroughHud,
          isCollapsedPublicHudOnly: !isExpanded && !astraVisible,
        });
      } catch (err) {
        console.warn('Apply privacy cloak error:', err);
      }
    })();
  }, [privacyMaskEnabled, privacyPublicPassthroughHud, isExpanded, astraVisible]);

  // 3. Periodic GSMTC and System Telemetry Polling
  useEffect(() => {
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (!isTauri) return;

    let active = true;

    const pollHardware = async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core');

        // Poll GSMTC Track
        const track = await invoke<MediaTrackPayload | null>('get_current_media_track');
        if (active && track) {
          setMediaTrack(track);
        }

        // Poll Telemetry
        const telem = await invoke<SystemTelemetryPayload>('get_system_telemetry');
        if (active && telem) {
          setSystemTelemetry(telem);
        }
      } catch {
        // Silently handle polling errors
      }
    };

    pollHardware();
    const interval = setInterval(pollHardware, 1200);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [setMediaTrack, setSystemTelemetry]);

  // Hardware control helpers
  const mediaAction = async (action: 'play_pause' | 'next' | 'previous' | 'seek', seekSec?: number) => {
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('media_control_action', { action, seekSec });
      } catch (e) {
        console.warn('media_control_action failed:', e);
      }
    }
  };

  const setVolume = async (vol: number) => {
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('set_master_volume', { level0To1: vol });
      } catch (e) {
        console.warn('set_master_volume failed:', e);
      }
    }
  };

  const toggleNightLight = async () => {
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const nextState = await invoke<boolean>('toggle_night_light');
        setSystemTelemetry({ night_light_enabled: nextState });
      } catch (e) {
        console.warn('toggle_night_light failed:', e);
      }
    }
  };

  const scanWifi = async () => {
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const nets = await invoke<any>('scan_wifi_networks');
        if (nets) setWifiNetworks(nets);
      } catch (e) {
        console.warn('scan_wifi_networks failed:', e);
      }
    }
  };

  const scanBluetooth = async () => {
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const devs = await invoke<any>('get_paired_bluetooth_devices');
        if (devs) setBluetoothDevices(devs);
      } catch (e) {
        console.warn('get_paired_bluetooth_devices failed:', e);
      }
    }
  };

  const openSettings = async () => {
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('open_settings_window');
      } catch (e) {
        console.warn('open_settings_window failed:', e);
      }
    } else {
      window.open('?window=settings', '_blank', 'width=880,height=640');
    }
  };

  return {
    mediaAction,
    setVolume,
    toggleNightLight,
    scanWifi,
    scanBluetooth,
    openSettings,
  };
}
