import {
  LedgeAnchorPosition,
  LedgeShapeStyle,
  LedgeSizeScale,
  SpringConfig,
  SpringPresetId,
} from '../utils/springPhysics';
import { ClipboardCategory } from '../utils/customizationLogic';
import {
  ControlCenterLayoutMode,
  ControlSliderOrientation,
  IconPackStyle,
  InnerCapsuleRadius,
  InnerPillScale,
  LedgeThemeId,
  SliderVisualStyle,
  TileSurfaceStyle,
} from '../utils/themeAndSliders';

export enum AppearanceMaterial {
  Obsidian = 'obsidian',
  LiquidGlass = 'glass',
  FrostedGraphite = 'graphite',
}

export enum WorkspacePage {
  Simulator = 'simulator',
  Settings = 'settings',
  Architecture = 'architecture',
  WinUISource = 'source',
}

export type BuiltinPillTab =
  | 'home'
  | 'control'
  | 'ai'
  | 'tray'
  | 'clipboard'
  | 'monitor'
  | 'notes'
  | 'mirror';

export type PillTab = BuiltinPillTab | `custom_${string}`;
export type BuiltinLedgeTab = BuiltinPillTab;
export type LedgeTab = PillTab;

export type WidgetSizeVariant = 'small' | 'medium' | 'large' | 'vertical';

export interface CustomWidgetTab {
  id: `custom_${string}`;
  name: string;
  enabled: boolean;
  widgets: HomeWidgetId[];
  widgetSizes: Partial<Record<HomeWidgetId, WidgetSizeVariant>>;
}

export type ClipboardLayoutMode = 'dynamic_bento' | 'classic_list';
export type ClipboardSortBy = 'newest' | 'oldest' | 'pinned' | 'type' | 'size';
export type ClipboardGroupBy = 'none' | 'category';
export type AstraDisplayMode = 'orb_only' | 'orb_with_captions' | 'orb_with_chat';
export type AstraOrbStyle =
  | 'siri_rainbow'
  | 'celestial_nebula'
  | 'cyber_plasma'
  | 'neon_pulse'
  | 'emerald_solar'
  | 'minimal_pearl';
export type ControlTileSpan = '1x1' | '2x1';

export type HomeWidgetId =
  | 'music'
  | 'voice_search'
  | 'timers'
  | 'network_mini'
  | 'vitals_mini'
  | 'quick_actions'
  | 'clipboard_peek'
  | 'notes_peek';

export type MusicVisualizerStyle =
  | 'liquid_ribbon'
  | 'harmonic_bars'
  | 'orbital_aura'
  | 'mirrored_wave'
  | 'particle_field'
  | 'minimal_pulse';

export type EdgeLightProfile =
  | 'off'
  | 'album_adaptive'
  | 'apple_aura'
  | 'northern_aurora'
  | 'solar_amber'
  | 'glacial_ice'
  | 'crimson_pulse';

export type SoundProfileId =
  | 'wooden_marimba'
  | 'velvet_droplet'
  | 'brushed_glass'
  | 'taptic_thump'
  | 'cyber_synth'
  | 'retro_cassette'
  | 'mechanical_gt'
  | 'zen_garden'
  | 'silent';

export type SoundActionKind =
  | 'expand'
  | 'collapse'
  | 'tab'
  | 'toggleOn'
  | 'toggleOff'
  | 'drop'
  | 'notification'
  | 'confirm';

export type ControlTileId =
  | 'wifi'
  | 'bluetooth'
  | 'airplane'
  | 'accessibility'
  | 'saver'
  | 'captions'
  | 'nightlight'
  | 'hotspot'
  | 'nearby'
  | 'cast'
  | 'project'
  | 'dnd'
  | 'spatial'
  | 'mic'
  | 'awake'
  | 'snip';

export type TransientHudKind =
  | 'none'
  | 'call'
  | 'agent'
  | 'volume'
  | 'brightness'
  | 'battery'
  | 'download';

export type AiAssistantModelId =
  | 'gemini-3.8-flash'
  | 'gemini-3.1-flash-lite'
  | 'gemini-4-argon'
  | 'gemini-4-carbon';

export type LiveVoiceName = 'Zephyr' | 'Kore' | 'Puck' | 'Fenrir' | 'Charon';

export interface VoiceAgentAction {
  name: string;
  args: Record<string, unknown>;
  summary?: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationSec: number;
  coverUrl: string;
  accentHex: string;
  secondaryHex: string;
  lyrics: string[];
}

export type AudioOutputDevice =
  | 'Surface Studio Speakers'
  | 'AirPods Pro (USB-C)'
  | 'Focusrite Scarlett DAC';

export interface AppAudioChannel {
  id: string;
  appName: string;
  volumePct: number;
  muted: boolean;
}

export interface WifiNetworkEntry {
  ssid: string;
  band: '6 GHz' | '5 GHz' | '2.4 GHz';
  signalPct: number;
  secured: boolean;
}

export interface BluetoothDeviceEntry {
  name: string;
  category: 'Audio' | 'Mouse' | 'Keyboard' | 'Controller';
  batteryPct?: number;
  connected: boolean;
}

export type ProjectDisplayMode = 'pc_only' | 'duplicate' | 'extend' | 'second_only';

export type NearbyShareScope = 'off' | 'my_devices' | 'everyone';

export interface TrayFileItem {
  id: string;
  name: string;
  extension: string;
  sizeLabel: string;
  addedAt: string;
  pinned: boolean;
  contentPreview: string;
}

export interface ClipboardItem {
  id: string;
  text: string;
  source: string;
  copiedAt: string;
  pinned: boolean;
  category: ClipboardCategory;
  badgeCode: string;
  fileSizeLabel?: string;
  previewImageUrl?: string;
  accentHex?: string;
  isOcrFromImage?: boolean;
}

export interface ReminderTask {
  id: string;
  title: string;
  dueTime: string;
  completed: boolean;
}

export interface AgentApprovalRequest {
  id: string;
  agentName: 'Claude Code' | 'Cursor' | 'Codex CLI' | 'Antigravity';
  commandSummary: string;
  workspacePath: string;
}

export interface IncomingCallSession {
  callerName: string;
  appSource: 'Microsoft Teams' | 'Phone Link' | 'WhatsApp';
  avatarUrl: string;
  isAccepted: boolean;
  isMuted: boolean;
  elapsedSec: number;
}

export interface WindowsSystemState {
  wifiEnabled: boolean;
  wifiSsid: string;
  bluetoothEnabled: boolean;
  bluetoothDevice: string;
  dndEnabled: boolean;
  batterySaver: boolean;
  airplaneMode: boolean;
  hotspotEnabled: boolean;
  nearbyShare: NearbyShareScope;
  liveCaptions: boolean;
  castDevice: string | null;
  projectMode: ProjectDisplayMode;
  accessibilityMonoAudio: boolean;
  accessibilityStickyKeys: boolean;
  accessibilityColorFilter: boolean;
  spatialAudio: boolean;
  hdrEnabled: boolean;
  powerMode: 'efficiency' | 'balanced' | 'performance';
  isCharging: boolean;
  chargingWatts: number;
  batteryPct: number;
  batteryTempC: number;
  gpuTempC: number;
  gpuUsagePct: number;
  cpuUsagePct: number;
  systemRamUsedGb: number;
  systemRamTotalGb: number;
  ledgeNativeRamMb: number;
  nvmeReadMb: number;
  netDownMbps: number;
  netUpMbps: number;
  netPeakDownMbps: number;
  pingMs: number;
  jitterMs: number;
  packetLossPct: number;
  sessionDownGb: number;
  sessionUpGb: number;
  localIpv4: string;
  publicIp: string;
  ispName: string;
  gatewayIp: string;
  dnsServer: string;
  wifiChannel: string;
  wifiRssiDbm: number;
  wifiLinkMbps: number;
  netHistoryDown: number[];
  netHistoryUp: number[];
  appMixer: AppAudioChannel[];
}

export interface PillFeatureFlags {
  nowPlaying: boolean;
  quickTimers: boolean;
  calendarEvents: boolean;
  systemHuds: boolean;
  chargingEtaHud: boolean;
  codingAgents: boolean;
  edgeLighting: boolean;
  livingProgressBar: boolean;
  fuseVisualizerInSlider: boolean;
  controlSubmenuChevrons: boolean;
  perAppVolumeMixer: boolean;
  voiceDictation: boolean;
  liveVoiceMode: boolean;
  webSearchGrounding: boolean;
  ocrFromImages: boolean;
  lowRamEcoMode: boolean;
}
export type LedgeFeatureFlags = PillFeatureFlags;

export type NotedownFormatStyle = 'structured_md' | 'executive_brief' | 'action_items';

export interface PillPreferences {
  // Color Theme, Style Kit, Icon Pack, Inner Pills & Sliders
  themeId: LedgeThemeId;
  tileSurfaceStyle: TileSurfaceStyle;
  customPrimaryHex: string;
  customSecondaryHex: string;
  iconPack: IconPackStyle;
  innerPillScale: InnerPillScale;
  innerCapsuleRadius: InnerCapsuleRadius;
  musicSliderStyle: SliderVisualStyle;
  controlSliderStyle: SliderVisualStyle;
  sliderGlowIntensity: number;

  // Control Center Layout Customization (Vertical & Horizontal Blocks + Sliders)
  controlLayoutMode: ControlCenterLayoutMode;
  controlSliderOrientation: ControlSliderOrientation;
  controlGridColumns: 3 | 4;
  showControlBrightnessSlider: boolean;
  showControlVolumeSlider: boolean;

  // Home Hub & Playground Building-Block Widget Sizes + Lyrics Default
  homeWidgets: HomeWidgetId[];
  widgetSizes: Record<HomeWidgetId, WidgetSizeVariant>;
  musicLyricsVisible: boolean;

  // Dynamic Clipboard Layout, Sort & Group
  clipboardLayout: ClipboardLayoutMode;
  clipboardSortBy: ClipboardSortBy;
  clipboardGroupBy: ClipboardGroupBy;

  // Shape & Location
  material: AppearanceMaterial;
  shapeStyle: LedgeShapeStyle;
  anchorPosition: LedgeAnchorPosition;
  floatingOffsetPx: number;
  sizeScale: LedgeSizeScale;
  isElongated: boolean;
  isFloatingPill: boolean;

  // Stealth Hide, Reveal & Astra (అస్త్రం / Astram) In-Pill Agent
  stealthAutoHide: boolean;
  revealOnEdgeTouch: boolean;
  toggleShortcut: string;
  voiceAgentShortcut: string;
  voiceAgentSpeakReplies: boolean;
  aiEnabled: boolean;
  astraWakeWordEnabled: boolean;
  astraMode: AstraDisplayMode;
  astraOrbStyle?: AstraOrbStyle;
  closeSettingsOnMouseLeave?: boolean;
  autoHideIdle: boolean;

  // OS-Level Screen-Capture Privacy Masking (SetWindowDisplayAffinity WDA_EXCLUDEFROMCAPTURE)
  privacyMaskEnabled: boolean;
  privacySimulateCaptureView: boolean;
  privacyPublicPassthroughHud: boolean;

  // Notedown & Assist Preferences
  notedownFormat: NotedownFormatStyle;
  assistAutoAnswer: boolean;
  assistCodeLanguage: string;

  // Motion & Music Animations
  springPreset: SpringPresetId;
  customSpring: SpringConfig;
  musicVisualizer: MusicVisualizerStyle;
  liveMusicBars: boolean;

  // Edge Lighting
  edgeLightProfile: EdgeLightProfile;
  edgeLightIntensity: number;
  edgeLightTrigger: 'always' | 'music_only' | 'alerts_only';

  // Soundscapes
  soundProfile: SoundProfileId;
  soundVolume: number;

  // AI & Voice Assistant Preferences
  defaultAiModel: AiAssistantModelId;
  defaultLiveVoice: LiveVoiceName;

  // Tab Order, Renaming, Extra Custom Widget Pages & Control Center Tiles
  tabOrder: BuiltinLedgeTab[];
  enabledTabs: Record<BuiltinLedgeTab, boolean>;
  customTabNames: Partial<Record<BuiltinLedgeTab, string>>;
  customWidgetTabs: CustomWidgetTab[];
  controlTiles: ControlTileId[];
  controlTileSizes: Partial<Record<ControlTileId, ControlTileSpan>>;
  featureFlags: LedgeFeatureFlags;

  // OS & Privacy
  openAtLogin: boolean;
  nowPlayingFilter: 'all' | 'music-only';
  enabledAgents: {
    claudeCode: boolean;
    cursor: boolean;
    codex: boolean;
    antigravity: boolean;
  };
  showCompactStats: boolean;
}

export type LedgePreferences = PillPreferences;
