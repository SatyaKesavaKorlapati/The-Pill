export type WidgetSizeVariant = 'Small' | 'Medium' | 'Large' | 'Vertical';
// Small = 1x1, Medium = 2x1 (Default for Music!), Large = 2x2, Vertical = 1x2

export type ControlCenterLayoutMode = 'SquarishBlocks' | 'CircularOrbs' | 'ClassicGrid';
export type ClipboardLayoutMode = 'DynamicBento' | 'ClassicList';
export type ClipboardSortBy = 'Newest' | 'Oldest' | 'Pinned' | 'Type' | 'Size';
export type ClipboardGroupBy = 'None' | 'Category';
export type AstraDisplayMode = 'OrbOnly' | 'OrbWithChat';
export type PillThemeMode = 'desktop' | 'cyberpunk' | 'paper';

export interface CustomWidgetTab {
  id: string;
  name: string;
  enabled: boolean;
  widgets: string[];
  widgetSizes: Record<string, WidgetSizeVariant>;
}

export interface PillPreferences {
  // Master AI & Astra (Diff 5 & 6)
  aiEnabled: boolean;                    // Default: true (Master kill-switch)
  astraWakeWordEnabled: boolean;         // Default: true ("Astra" / "Astram" / "అస్త్రం")
  astraMode: AstraDisplayMode;           // Default: 'OrbWithChat'

  // OS Screen-Capture Privacy Cloaking (Diff 6)
  privacyMaskEnabled: boolean;           // Default: true (WDA_EXCLUDEFROMCAPTURE 0x11)
  privacyPublicPassthroughHud: boolean;  // Default: false

  // Home Playground & Music Studio (Diff 1 & 2)
  isPlaygroundEditing: boolean;          // Default: false
  musicLyricsVisible: boolean;           // Default: true (Inline synced lyrics ON by default)
  homeWidgets: string[];                 // ['music', 'monitor', 'battery', 'weather', 'notes']
  widgetSizes: Record<string, WidgetSizeVariant>; // { music: 'Medium', monitor: 'Small', battery: 'Small', weather: 'Small', notes: 'Small' }

  // Control Center Playground (Diff 2)
  controlLayoutMode: ControlCenterLayoutMode; // Default: 'SquarishBlocks' (6-column compact rounded squares)
  isControlBlocksEditing: boolean;       // Default: false
  controlTileOrder: string[];            // ['wifi', 'bluetooth', 'nightlight', 'privacy', 'airplane', 'hotspot', 'volume', 'brightness']
  controlTileSizes: Record<string, '1x1' | '2x1'>;

  // Tab Renaming & Custom Pages (Diff 3)
  customTabNames: Record<string, string>; // Default: { home: 'Home', controls: 'Controls', clipboard: 'Clipboard', notes: 'Notes', ai: 'Search & AI' }
  customWidgetTabs: CustomWidgetTab[];

  // Smart Clipboard (Diff 4)
  clipboardLayoutMode: ClipboardLayoutMode; // Default: 'DynamicBento'
  clipboardSortBy: ClipboardSortBy;         // Default: 'Newest'
  clipboardGroupBy: ClipboardGroupBy;       // Default: 'None'

  // Theme
  theme: PillThemeMode;                  // Default: 'desktop'
}

export interface ClipboardRecord {
  id: string;
  text: string;
  category: 'text' | 'link' | 'color' | 'code' | 'image' | 'file';
  badge_code: 'TXT' | 'URL' | 'HEX' | 'CODE' | 'PNG' | 'FILE';
  source: string;
  preview_image_data_url?: string | null;
  file_size_label?: string | null;
  timestamp_ms: number;
  pinned: boolean;
}

export interface MediaTrackPayload {
  title: string;
  artist: string;
  album: string;
  thumbnail_data_url?: string | null;
  duration_sec: number;
  position_sec: number;
  is_playing: boolean;
}

export interface SystemTelemetryPayload {
  battery_pct: number;
  is_charging: boolean;
  battery_state: 'Charging' | 'Discharging' | 'IdleFull' | 'Low';
  pd_watts: number;
  cpu_usage_pct: number;
  ram_used_gb: number;
  ram_total_gb: number;
  master_volume: number;
  night_light_enabled: boolean;
}

export interface WifiNetworkDto {
  ssid: string;
  signal_bars: number;
  freq_ghz: number;
  is_secured: boolean;
}

export interface BluetoothDeviceDto {
  name: string;
  id: string;
  is_connected: boolean;
}

export interface LyricLine {
  timeMs: number;
  text: string;
}

export const DEFAULT_PREFERENCES: PillPreferences = {
  aiEnabled: true,
  astraWakeWordEnabled: true,
  astraMode: 'OrbWithChat',
  privacyMaskEnabled: false, // Off by default so window is visible in captures & screenshots
  privacyPublicPassthroughHud: false,
  isPlaygroundEditing: false,
  musicLyricsVisible: true,
  homeWidgets: ['music', 'monitor', 'weather', 'notes'],
  widgetSizes: {
    music: 'Medium',
    monitor: 'Small',
    weather: 'Small',
    notes: 'Small',
  },
  controlLayoutMode: 'SquarishBlocks',
  isControlBlocksEditing: false,
  controlTileOrder: ['wifi', 'bluetooth', 'nightlight', 'privacy', 'airplane', 'hotspot'],
  controlTileSizes: {
    wifi: '1x1',
    bluetooth: '1x1',
    nightlight: '1x1',
    privacy: '1x1',
    airplane: '1x1',
    hotspot: '1x1',
  },
  customTabNames: {
    home: 'Home',
    controls: 'Controls',
    clipboard: 'Clipboard',
    notes: 'Notes',
    ai: 'Search & AI',
  },
  customWidgetTabs: [],
  clipboardLayoutMode: 'DynamicBento',
  clipboardSortBy: 'Newest',
  clipboardGroupBy: 'None',
  theme: 'desktop',
};

export type LedgePreferences = PillPreferences;
