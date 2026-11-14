import { create } from 'zustand';
import {
  BluetoothDeviceDto,
  ClipboardRecord,
  DEFAULT_PREFERENCES,
  PillPreferences,
  MediaTrackPayload,
  SystemTelemetryPayload,
  WifiNetworkDto,
} from '../types/preferences';

const PREFS_STORAGE_KEY = 'pill_win_prefs_v5';
const NOTES_STORAGE_KEY = 'pill_win_notes_v1';
const CLIPBOARD_STORAGE_KEY = 'pill_win_clipboard_v1';

function loadStoredPreferences(): PillPreferences {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      privacyMaskEnabled: false,
      widgetSizes: {
        ...DEFAULT_PREFERENCES.widgetSizes,
        ...(parsed.widgetSizes || {}),
      },
      controlTileSizes: {
        ...DEFAULT_PREFERENCES.controlTileSizes,
        ...(parsed.controlTileSizes || {}),
      },
      customTabNames: {
        ...DEFAULT_PREFERENCES.customTabNames,
        ...(parsed.customTabNames || {}),
      },
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function loadStoredNotes(): string {
  try {
    return (
      localStorage.getItem(NOTES_STORAGE_KEY) ||
      `# Sprint Sync & Architecture Notes\n\n> Captured automatically with Pill for Windows.\n\n## Key Points\n- DirectComposition fluid island layer.\n- Top-center bezel auto-reveal on cursor hover.\n- Windows DPAPI secure vault for Astra Gemini keys.\n\n## Action Items\n- [x] Integrate GSMTC media controls with live scrub.\n- [x] Configure WDA_EXCLUDEFROMCAPTURE screen-capture cloaking.\n`
    );
  } catch {
    return '# My Quick Notes';
  }
}

const INITIAL_DEMO_CLIPBOARD: ClipboardRecord[] = [
  {
    id: 'demo-c1',
    text: 'https://github.com/microsoft/windows-rs',
    category: 'link',
    badge_code: 'URL',
    source: 'Edge Browser',
    file_size_label: '38 B',
    timestamp_ms: Date.now() - 1000 * 60 * 3,
    pinned: true,
  },
  {
    id: 'demo-c2',
    text: '#22d3ee',
    category: 'color',
    badge_code: 'HEX',
    source: 'Figma Token',
    file_size_label: '7 B',
    timestamp_ms: Date.now() - 1000 * 60 * 8,
    pinned: false,
  },
  {
    id: 'demo-c3',
    text: 'const [expanded, setExpanded] = useState(false);',
    category: 'code',
    badge_code: 'CODE',
    source: 'VS Code',
    file_size_label: '52 B',
    timestamp_ms: Date.now() - 1000 * 60 * 15,
    pinned: false,
  },
  {
    id: 'demo-c4',
    text: 'Meeting agenda for Windows 11 Fluent Island redesign.',
    category: 'text',
    badge_code: 'TXT',
    source: 'Teams Chat',
    file_size_label: '56 B',
    timestamp_ms: Date.now() - 1000 * 60 * 30,
    pinned: false,
  },
];

function loadStoredClipboard(): ClipboardRecord[] {
  try {
    const raw = localStorage.getItem(CLIPBOARD_STORAGE_KEY);
    if (!raw) return INITIAL_DEMO_CLIPBOARD;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEMO_CLIPBOARD;
  } catch {
    return INITIAL_DEMO_CLIPBOARD;
  }
}

interface PillState {
  preferences: PillPreferences;
  isExpanded: boolean;
  activeTab: string;
  astraVisible: boolean;
  astraInterimSpeech: string;
  astraAnswerMarkdown: string;
  astraState: 'idle' | 'listening' | 'thinking' | 'speaking';
  audioAmplitude: number;
  mediaTrack: MediaTrackPayload | null;
  systemTelemetry: SystemTelemetryPayload;
  clipboardHistory: ClipboardRecord[];
  wifiNetworks: WifiNetworkDto[];
  bluetoothDevices: BluetoothDeviceDto[];
  notesContent: string;
  activePopdownId: string | null;

  // Actions
  updatePreferences: (updater: Partial<PillPreferences> | ((prev: PillPreferences) => PillPreferences)) => void;
  setExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
  setActiveTab: (tab: string) => void;
  setAstraVisible: (visible: boolean) => void;
  setAstraInterimSpeech: (speech: string) => void;
  setAstraAnswerMarkdown: (markdown: string) => void;
  setAstraState: (state: 'idle' | 'listening' | 'thinking' | 'speaking') => void;
  setAudioAmplitude: (amp: number) => void;
  setMediaTrack: (track: MediaTrackPayload | null) => void;
  setSystemTelemetry: (telemetry: Partial<SystemTelemetryPayload>) => void;
  addClipboardRecord: (record: ClipboardRecord) => void;
  removeClipboardRecord: (id: string) => void;
  togglePinClipboardRecord: (id: string) => void;
  clearClipboardHistory: () => void;
  setWifiNetworks: (networks: WifiNetworkDto[]) => void;
  setBluetoothDevices: (devices: BluetoothDeviceDto[]) => void;
  setNotesContent: (notes: string) => void;
  setActivePopdownId: (id: string | null) => void;
}

export const usePillStore = create<PillState>((set, get) => ({
  preferences: loadStoredPreferences(),
  isExpanded: false,
  activeTab: 'home',
  astraVisible: false,
  astraInterimSpeech: '',
  astraAnswerMarkdown: '',
  astraState: 'idle',
  audioAmplitude: 0,
  mediaTrack: {
    title: 'Solstice Euphoria',
    artist: 'Celestial Echoes',
    album: 'Ambient Resonance',
    thumbnail_data_url: null,
    duration_sec: 218,
    position_sec: 45,
    is_playing: true,
  },
  systemTelemetry: {
    battery_pct: 88,
    is_charging: true,
    battery_state: 'Charging',
    pd_watts: 65,
    cpu_usage_pct: 12.4,
    ram_used_gb: 11.2,
    ram_total_gb: 32.0,
    master_volume: 0.7,
    night_light_enabled: false,
  },
  clipboardHistory: loadStoredClipboard(),
  wifiNetworks: [
    { ssid: 'Home_WiFi_5G', signal_bars: 4, freq_ghz: 5.2, is_secured: true },
    { ssid: 'Office_Studio_Guest', signal_bars: 3, freq_ghz: 2.4, is_secured: true },
    { ssid: 'CoffeeShop_Free', signal_bars: 2, freq_ghz: 2.4, is_secured: false },
  ],
  bluetoothDevices: [
    { name: 'Sony WH-1000XM5', id: 'bt_sony_01', is_connected: true },
    { name: 'Logitech MX Master 3S', id: 'bt_logi_02', is_connected: true },
    { name: 'Keychron Q1 Pro', id: 'bt_keychron_03', is_connected: false },
  ],
  notesContent: loadStoredNotes(),
  activePopdownId: null,

  updatePreferences: (updater) => {
    set((state) => {
      const next = typeof updater === 'function' ? updater(state.preferences) : { ...state.preferences, ...updater };
      try {
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return { preferences: next };
    });
  },

  setExpanded: (expanded) => set({ isExpanded: expanded }),
  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setAstraVisible: (visible) => set({ astraVisible: visible }),
  setAstraInterimSpeech: (speech) => set({ astraInterimSpeech: speech }),
  setAstraAnswerMarkdown: (markdown) => set({ astraAnswerMarkdown: markdown }),
  setAstraState: (state) => set({ astraState: state }),
  setAudioAmplitude: (amp) => set({ audioAmplitude: amp }),
  setMediaTrack: (track) => set({ mediaTrack: track }),
  setSystemTelemetry: (telemetry) =>
    set((state) => ({ systemTelemetry: { ...state.systemTelemetry, ...telemetry } })),

  addClipboardRecord: (record) => {
    set((state) => {
      const filtered = state.clipboardHistory.filter((c) => c.text !== record.text);
      const next = [record, ...filtered].slice(0, 50);
      try {
        localStorage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return { clipboardHistory: next };
    });
  },

  removeClipboardRecord: (id) => {
    set((state) => {
      const next = state.clipboardHistory.filter((c) => c.id !== id);
      try {
        localStorage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return { clipboardHistory: next };
    });
  },

  togglePinClipboardRecord: (id) => {
    set((state) => {
      const next = state.clipboardHistory.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c));
      try {
        localStorage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return { clipboardHistory: next };
    });
  },

  clearClipboardHistory: () => {
    set((state) => {
      const next = state.clipboardHistory.filter((c) => c.pinned);
      try {
        localStorage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return { clipboardHistory: next };
    });
  },

  setWifiNetworks: (networks) => set({ wifiNetworks: networks }),
  setBluetoothDevices: (devices) => set({ bluetoothDevices: devices }),
  setNotesContent: (notes) => {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, notes);
    } catch {}
    set({ notesContent: notes });
  },
  setActivePopdownId: (id) => set({ activePopdownId: id }),
}));
