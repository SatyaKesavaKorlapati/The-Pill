import React, { useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Bluetooth,
  ChevronRight,
  Cpu,
  EyeOff,
  Grid,
  Keyboard,
  Layers,
  Maximize2,
  Mic,
  Minimize2,
  Minus,
  Music,
  Palette,
  PanelLeft,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Sparkles,
  Square,
  Sun,
  Trash2,
  Volume2,
  Wifi,
  X,
} from 'lucide-react';
import { DEFAULT_PREFERENCES } from '../data/demoData';
import {
  AiAssistantModelId,
  AppearanceMaterial,
  AstraDisplayMode,
  AstraOrbStyle,
  BuiltinLedgeTab,
  ClipboardGroupBy,
  ClipboardLayoutMode,
  ClipboardSortBy,
  ControlTileId,
  CustomWidgetTab,
  EdgeLightProfile,
  HomeWidgetId,
  LedgeFeatureFlags,
  LedgePreferences,
  LiveVoiceName,
  MusicVisualizerStyle,
  NotedownFormatStyle,
  SoundActionKind,
  SoundProfileId,
  WidgetSizeVariant,
} from '../types/ledge';
import { playTactilePop } from '../utils/audioSynth';
import { isTabEnabledInPrefs, moveOrderedItem } from '../utils/customizationLogic';
import {
  LedgeAnchorPosition,
  LedgeShapeStyle,
  LedgeSizeScale,
  SPRING_PRESETS,
  SpringPresetId,
} from '../utils/springPhysics';
import {
  COMPLETE_STYLE_KITS,
  KIT_ASTRA_STYLES,
  ControlCenterLayoutMode,
  ControlSliderOrientation,
  getThemeIconUrl,
  getThemeMotifUrl,
  IconPackStyle,
  InnerCapsuleRadius,
  InnerPillScale,
  LEDGE_THEMES,
  LedgeThemeId,
  resolveEdgeGlowCss,
  resolveIconPackMetrics,
  resolveInnerPillMetrics,
  resolveThemePalette,
  SliderVisualStyle,
  TileSurfaceStyle,
} from '../utils/themeAndSliders';
import { AnimatedBatterySymbol } from './AnimatedBatterySymbol';
import { AstraSiriOrbCanvas } from './AstraSiriOrbCanvas';
import { ThemedIcon } from './ThemedIcon';
import { ALL_CONTROL_TILES } from './ControlAndMonitorPanels';
import { CustomPopdown, PopdownOption } from './CustomPopdown';
import { FluidEffectSlider } from './FluidEffectSlider';
import { FluidMusicVisualizer } from './FluidMusicVisualizer';
import { HOME_WIDGET_CATALOG } from './LedgeExpandedContent';

const SETTINGS_CLIP_SORT_OPTIONS: PopdownOption<ClipboardSortBy>[] = [
  { value: 'newest', label: 'Newest First', sublabel: 'Most recently copied items first' },
  { value: 'oldest', label: 'Oldest First', sublabel: 'Chronological capture order' },
  { value: 'pinned', label: 'Pinned First', sublabel: 'Keep pinned snippets anchored on top' },
  { value: 'type', label: 'Format Type (A–Z)', sublabel: 'Sort alphabetically by extension/type' },
  { value: 'size', label: 'Payload Size', sublabel: 'Largest files and images first' },
];

const SETTINGS_CLIP_GROUP_OPTIONS: PopdownOption<ClipboardGroupBy>[] = [
  { value: 'none', label: 'Ungrouped Stream', sublabel: 'Single continuous Bento or Stack feed' },
  {
    value: 'category',
    label: 'Group by Category',
    sublabel: 'Separate Media, Code, Links & Files',
  },
];

const SETTINGS_MODEL_OPTIONS: PopdownOption<AiAssistantModelId>[] = [
  { value: 'gemini-3.1-flash-lite', label: 'Fast (3.1 Flash Lite)', sublabel: 'Ultra-low latency' },
  { value: 'gemini-3.8-flash', label: 'Balanced (3.8 Flash)', sublabel: 'Recommended everyday speed' },
  { value: 'gemini-4-argon', label: 'Complex Coding (4 Argon)', sublabel: 'STEM & code architecture' },
  { value: 'gemini-4-carbon', label: 'Deep Reasoning (4 Carbon)', sublabel: 'Maximum analytical depth' },
];

const SETTINGS_VOICE_OPTIONS: PopdownOption<LiveVoiceName>[] = [
  { value: 'Zephyr', label: 'Zephyr', sublabel: 'Warm & balanced conversational tone' },
  { value: 'Kore', label: 'Kore', sublabel: 'Clear & articulate' },
  { value: 'Puck', label: 'Puck', sublabel: 'Upbeat & energetic' },
  { value: 'Fenrir', label: 'Fenrir', sublabel: 'Deep & steady' },
  { value: 'Charon', label: 'Charon', sublabel: 'Calm studio narrator' },
];

const SETTINGS_NOTEDOWN_OPTIONS: PopdownOption<NotedownFormatStyle>[] = [
  { value: 'structured_md', label: 'Full Structured Markdown', sublabel: 'Summary, Key Points, Actions & Code' },
  { value: 'executive_brief', label: 'Executive Brief', sublabel: '2-sentence TL;DR + bullet takeaways' },
  { value: 'action_items', label: 'Action Checklist', sublabel: 'Task checklist + clean transcript' },
];

const SETTINGS_ASSIST_LANG_OPTIONS: PopdownOption<string>[] = [
  { value: 'auto', label: 'Auto-Detect Best Language', sublabel: 'Idiomatic language per question' },
  { value: 'TypeScript', label: 'TypeScript', sublabel: 'Strict typed TS / Node' },
  { value: 'Python', label: 'Python', sublabel: 'Clean Python 3.12' },
  { value: 'C#', label: 'C# (.NET 8)', sublabel: 'WinUI 3 & NativeAOT' },
  { value: 'C++', label: 'C++20', sublabel: 'Systems & algorithms' },
  { value: 'SQL', label: 'SQL', sublabel: 'Window queries & CTEs' },
];

interface FullSettingsViewProps {
  preferences: LedgePreferences;
  onUpdatePreferences: (patch: Partial<LedgePreferences>) => void;
  onBackToSimulator: () => void;
}

type SettingsSectionId =
  | 'themes_icons'
  | 'sliders_music'
  | 'control_designer'
  | 'island_geometry'
  | 'edge_sounds'
  | 'tabs_manager'
  | 'ai_astra';

const TAB_TITLES: Record<BuiltinLedgeTab, { title: string; desc: string; defaultLabel: string }> = {
  home: {
    title: 'Home Hub (Multi-Size Playground)',
    desc: 'Resizable S / M / L / V widgets, Now Playing lyrics, Search & Astra, timers',
    defaultLabel: 'Home',
  },
  control: {
    title: 'Windows Quick Settings (> Menus)',
    desc: 'Squarish Blocks, Circular Orbs, split Wi-Fi >, Bluetooth > & Per-App Volume Mixer',
    defaultLabel: 'Controls',
  },
  ai: {
    title: 'Search & AI (Astra Copilot)',
    desc: 'Fast Google Search grounding, Gemini reasoning, Audio Transcribe & Live Voice',
    defaultLabel: 'Search & AI',
  },
  tray: {
    title: 'File Drop Tray',
    desc: 'Drag-and-drop file shelf with one-click Merge and PKZIP export',
    defaultLabel: 'Tray',
  },
  clipboard: {
    title: 'Smart Dynamic Clipboard',
    desc: 'Dynamic Bento (fitted image rectangles + square tiles) or Classic Stack + Sort & Group',
    defaultLabel: 'Clipboard',
  },
  monitor: {
    title: 'Charging ETA & System Monitor',
    desc: 'USB-C PD wattage, time-to-full ETA, CPU load, GPU temp & 12.4 MB RAM gauge',
    defaultLabel: 'Monitor',
  },
  notes: {
    title: 'Instant Scratchpad + Dictation',
    desc: 'Persistent local notes with inline voice dictation and clipboard transfer',
    defaultLabel: 'Notes',
  },
  mirror: {
    title: 'Studio Camera Mirror',
    desc: 'Zero-recording framing preview with custom Rim Light profiles',
    defaultLabel: 'Mirror',
  },
};

const FEATURE_META: { key: keyof LedgeFeatureFlags; label: string; desc: string }[] = [
  {
    key: 'fuseVisualizerInSlider',
    label: 'Incorporate Visualizer Directly Into Progress Slider',
    desc: 'Merges the 60fps Liquid Silk Ribbon or Harmonic Bars directly into the music scrubber',
  },
  {
    key: 'livingProgressBar',
    label: 'Living Meniscus Slider Glow',
    desc: 'Sub-second 60fps interpolation, playhead halo & hover scrub time tooltip',
  },
  {
    key: 'controlSubmenuChevrons',
    label: 'Control Center > Drill-Down Submenus',
    desc: 'Adds split > buttons on Wi-Fi, Bluetooth, Accessibility, Cast & Project tiles',
  },
  {
    key: 'perAppVolumeMixer',
    label: 'Per-App Audio Mixer (> Next to Volume)',
    desc: 'Individual volume sliders for Music, Teams, Browser & System Sounds',
  },
  {
    key: 'nowPlaying',
    label: 'Now Playing Media Integration',
    desc: 'Windows SMTC music card, artwork & audio output routing',
  },
  {
    key: 'quickTimers',
    label: 'Live Countdown Timers & Dual Droplet Split',
    desc: 'Detaches a liquid metaball timer droplet beside music',
  },
  {
    key: 'calendarEvents',
    label: 'Calendar & Teams Meeting Heads-Up',
    desc: 'Shows upcoming call 5 minutes prior with one-click Join',
  },
  {
    key: 'systemHuds',
    label: 'Fluid System Volume & Brightness HUDs',
    desc: 'Replaces boxy OS flyouts with liquid pill sliders',
  },
  {
    key: 'chargingEtaHud',
    label: 'Charging Speed (Watts) & Time-to-Full HUD',
    desc: 'Displays PD wattage and exact battery ETA when plugged in',
  },
  {
    key: 'edgeLighting',
    label: 'Perimeter Edge Lighting Aura',
    desc: 'Subtle refractive color aura around the Dynamic Island',
  },
  {
    key: 'voiceDictation',
    label: 'Studio Voice Dictation & Audio Transcribe',
    desc: 'Hands-free microphone and audio file transcription in Notes & Voice tab',
  },
  {
    key: 'liveVoiceMode',
    label: 'Real-Time Live Voice Conversations',
    desc: 'Low-latency interruptible bidirectional voice inside the Island',
  },
  {
    key: 'webSearchGrounding',
    label: 'Live Google Search Grounding',
    desc: 'Grounds assistant answers with up-to-date web citations',
  },
  {
    key: 'codingAgents',
    label: 'Coding Assistant Approval Pipe',
    desc: 'Local IPC Allow/Deny prompts for Claude Code, Cursor & Codex',
  },
  {
    key: 'ocrFromImages',
    label: 'Windows On-Device Screenshot OCR',
    desc: 'Extracts text locally from copied screenshots',
  },
  {
    key: 'lowRamEcoMode',
    label: 'Ultra-Light Eco Mode (9.8 MB RAM Profile)',
    desc: 'Reduces canvas frame rate & disables ambient glow on battery',
  },
];

const SLIDER_STYLE_CATALOG: {
  id: SliderVisualStyle;
  name: string;
  desc: string;
  fusedEffect?: boolean;
}[] = [
  {
    id: 'fused_liquid_ribbon',
    name: 'Fused Liquid Silk Ribbon',
    desc: 'Multi-harmonic translucent silk wave woven directly along the played scrubber track',
    fusedEffect: true,
  },
  {
    id: 'fused_harmonic_bars',
    name: 'Fused Harmonic Spectrum Bars',
    desc: '34 live acoustic waveform bars sculpted directly inside the progress slider',
    fusedEffect: true,
  },
  {
    id: 'win11_fluent',
    name: 'Windows 11 Cyan Fluent',
    desc: 'Crisp accent rail with dark-ringed circular thumb matching Windows 11 Quick Settings',
  },
  {
    id: 'aurora_meniscus',
    name: 'Aurora Elastic Meniscus',
    desc: 'Hover-swelling gradient bar with luminous meniscus playhead orb',
  },
  {
    id: 'apple_thick_capsule',
    name: 'iOS Thick Glass Capsule',
    desc: 'Plush 22px frosted glass volume/brightness pill slider',
  },
  {
    id: 'minimal_hairline',
    name: 'Studio 2px Hairline Fader',
    desc: 'Ultra-clean precision studio fader with subtle vertical needle',
  },
  {
    id: 'cyberpunk_laser',
    name: 'Cyberpunk Laser Rail',
    desc: 'Chamfered high-voltage neon rail with cyber tick marks & laser thumb',
    fusedEffect: true,
  },
  {
    id: 'retro_vu_cassette',
    name: 'Retro 16-Segment VU Cassette',
    desc: '80s analog phosphor LED segments shifting from amber to peak magenta',
    fusedEffect: true,
  },
  {
    id: 'paper_ink_stroke',
    name: 'Paper & Fountain Ink Stroke',
    desc: 'Editorial calligraphy ink line with crisp nib playhead marker',
  },
  {
    id: 'botanical_petal_wave',
    name: 'Botanical Sakura Petal Wave',
    desc: 'Organic cherry-blossom & sage sinusoidal stem with floral dewdrop thumb',
    fusedEffect: true,
  },
  {
    id: 'gt_rpm_redline',
    name: 'Motorsport GT RPM Redline',
    desc: 'Slanted automotive tachometer segments ramping into redline shift zone',
    fusedEffect: true,
  },
];

export type AstraCategory = 'all' | 'naruto' | 'motorsport' | 'cosmos' | 'style_kits' | 'siri_orbs';

export interface AstraOrbDefinition {
  id: AstraOrbStyle;
  name: string;
  category: 'naruto' | 'motorsport' | 'cosmos' | 'style_kits' | 'siri_orbs';
  desc: string;
  hex: string;
  tag?: string;
}

export const ALL_ASTRA_ORB_DEFINITIONS: AstraOrbDefinition[] = [
  // --- Naruto Shinobi & Jutsu Pack ---
  {
    id: 'naruto_rasengan',
    name: 'Rasengan (Spiraling Sphere)',
    category: 'naruto',
    desc: 'Dense high-velocity swirling chakra spheres with turquoise orbital trails and micro-core',
    hex: '#38bdf8',
    tag: 'Chakra Jutsu',
  },
  {
    id: 'naruto_rasenshuriken',
    name: 'Wind Style: Rasenshuriken',
    category: 'naruto',
    desc: '4 rotating aerodynamic wind-blade scythes humming around ultra-compressed chakra core',
    hex: '#67e8f9',
    tag: 'Wind Blade',
  },
  {
    id: 'naruto_sharingan',
    name: 'Sharingan (3-Tomoe Ocular)',
    category: 'naruto',
    desc: 'Crimson iris with triple spinning black tomoe seals and pupil tracking aura',
    hex: '#dc2626',
    tag: 'Dojutsu',
  },
  {
    id: 'naruto_mangekyo_susano',
    name: 'Mangekyo & Susanoo Ribcage',
    category: 'naruto',
    desc: 'Pinwheel kaleidoscope Mangekyo with flaming violet Susanoo ethereal ribcage aura',
    hex: '#a855f7',
    tag: 'Ethereal Armor',
  },
  {
    id: 'naruto_akatsuki_cloud',
    name: 'Akatsuki Crimson Cloud',
    category: 'naruto',
    desc: 'Iconic stylized crimson cloud with crisp white border and drifting red ember particles',
    hex: '#ef4444',
    tag: 'Rogue Shinobi',
  },
  {
    id: 'naruto_white_cloud',
    name: 'Shinobi Replacement Smoke',
    category: 'naruto',
    desc: 'Volumetric puffy white ninja substitution smoke puff with drifting vapor rings',
    hex: '#e2e8f0',
    tag: 'Substitution',
  },

  // --- Motorsport & Formula 1 Pack ---
  {
    id: 'f1_telemetry_hud',
    name: 'F1 Steering Telemetry HUD',
    category: 'motorsport',
    desc: 'Full F1 carbon cockpit HUD with shift rev LEDs (Green/Amber/Red/Blue) and gear [8]',
    hex: '#ef4444',
    tag: 'Formula 1',
  },
  {
    id: 'f1_tyre_soft',
    name: 'Pirelli P-Zero Red [S] Soft',
    category: 'motorsport',
    desc: 'F1 Red Soft compound slick tyre with spinning directional rim and Pirelli lettering',
    hex: '#ef4444',
    tag: 'Compound C5',
  },
  {
    id: 'f1_tyre_medium',
    name: 'Pirelli P-Zero Yellow [M] Med',
    category: 'motorsport',
    desc: 'F1 Yellow Medium compound balanced slick tyre with high-spin speed rings',
    hex: '#eab308',
    tag: 'Compound C3',
  },
  {
    id: 'f1_tyre_hard',
    name: 'Pirelli P-Zero White [H] Hard',
    category: 'motorsport',
    desc: 'F1 White Hard compound endurance slick tyre with titanium hub bolt',
    hex: '#f8fafc',
    tag: 'Compound C1',
  },
  {
    id: 'f1_tyre_inter',
    name: 'Cinturato Green [I] Inter',
    category: 'motorsport',
    desc: 'F1 Intermediate damp weather tyre with visible water evacuation tread sipes',
    hex: '#22c55e',
    tag: 'Intermediate',
  },
  {
    id: 'f1_tyre_wet',
    name: 'Cinturato Blue [W] Full Wet',
    category: 'motorsport',
    desc: 'F1 Extreme Rain tyre with deep grooved monsoon aquachannel grooves',
    hex: '#3b82f6',
    tag: 'Monsoon Wet',
  },
  {
    id: 'motorsport_gt',
    name: 'Motorsport GT Tachometer',
    category: 'motorsport',
    desc: 'Automotive 9000-RPM redline sweep arc, twin-scroll turbo turbine and carbon face',
    hex: '#f97316',
    tag: 'GT Endurance',
  },

  // --- Celestial Planets & Cosmos Pack ---
  {
    id: 'space_sun',
    name: 'Sol (Solar Prominence)',
    category: 'cosmos',
    desc: 'Turbulent thermonuclear plasma surface with coronal prominence magnetic loops',
    hex: '#f59e0b',
    tag: 'Star G2V',
  },
  {
    id: 'space_earth',
    name: 'Terra (Blue Marble Earth)',
    category: 'cosmos',
    desc: 'Deep blue oceans, lush green continents, atmospheric haze, and swirling white clouds',
    hex: '#06b6d4',
    tag: 'Habitable Zone',
  },
  {
    id: 'space_moon',
    name: 'Luna (Lunar Orb)',
    category: 'cosmos',
    desc: 'Silver-grey lunar highlands, maria basalts, impact craters, and soft moonlight halo',
    hex: '#cbd5e1',
    tag: 'Satellite',
  },
  {
    id: 'space_mars',
    name: 'Ares (Red Planet Mars)',
    category: 'cosmos',
    desc: 'Iron oxide red desert dunes, bright polar ice cap, and drifting dust storms',
    hex: '#ea580c',
    tag: 'Terrestrial',
  },
  {
    id: 'space_milkyway',
    name: 'Milky Way Spiral Galaxy',
    category: 'cosmos',
    desc: 'Dual spiral stellar arms with supermassive luminous core and star dust particles',
    hex: '#8b5cf6',
    tag: 'Spiral Galaxy',
  },

  // --- Style Kits & Bespoke Themes ---
  {
    id: 'botanical_sakura',
    name: 'Botanical Sakura Blossom',
    category: 'style_kits',
    desc: 'Floating 5-petal cherry blossom with golden stamen filaments and orbital drifting petals',
    hex: '#f472b6',
    tag: 'Flora',
  },
  {
    id: 'cyberpunk_hud',
    name: 'Cyberpunk Sci-Fi Reticle',
    category: 'style_kits',
    desc: 'Holographic targeting brackets, rotating telemetry rings and pulsing laser core',
    hex: '#22d3ee',
    tag: 'Sci-Fi HUD',
  },
  {
    id: 'fluent_fluid',
    name: 'Fluent Aurora Wave',
    category: 'style_kits',
    desc: 'Border-free organic aurora ribbon wave floating over transparent canvas',
    hex: '#38bdf8',
    tag: 'Windows 11',
  },
  {
    id: 'retro_cassette_vu',
    name: 'Retro Cassette Deck',
    category: 'style_kits',
    desc: 'Dual spinning analog tape spools with reactive neon VU volume meters',
    hex: '#f59e0b',
    tag: '80s Analog',
  },
  {
    id: 'paper_ink_enso',
    name: 'Paper & Sumi-e Enso',
    category: 'style_kits',
    desc: 'Zen calligraphy enso ink circle with vermilion cinnabar seal imprint',
    hex: '#dc2626',
    tag: 'Zen Ink',
  },
  {
    id: 'cozy_woodland',
    name: 'Woodland Nature Leaf',
    category: 'style_kits',
    desc: 'Lush organic emerald forest leaf with floating luminescent fireflies',
    hex: '#10b981',
    tag: 'Cozy Flora',
  },
  {
    id: 'cupertino_silk',
    name: 'Cupertino Liquid Silk',
    category: 'style_kits',
    desc: 'Pearlescent Möbius ribbon knot with fluid caustic light reflections',
    hex: '#818cf8',
    tag: 'Liquid Glass',
  },

  // --- Classic Fluid Siri Shaders ---
  {
    id: 'siri_rainbow',
    name: 'Apple Siri Rainbow',
    category: 'siri_orbs',
    desc: 'Apple iridescent silk bands with prismatic spectrum aura and fluid morphing',
    hex: '#38bdf8',
    tag: 'Apple Siri',
  },
  {
    id: 'celestial_nebula',
    name: 'Interstellar Nebula',
    category: 'siri_orbs',
    desc: 'Deep violet interstellar cosmic dust with spiral plasma filaments',
    hex: '#a855f7',
    tag: 'Deep Cosmic',
  },
  {
    id: 'cyber_plasma',
    name: 'Cyber Magenta Plasma',
    category: 'siri_orbs',
    desc: 'Electric hot magenta with high-frequency neon energy arcs and plasma core',
    hex: '#f43f5e',
    tag: 'High Energy',
  },
  {
    id: 'neon_pulse',
    name: 'Neon Lime Pulse',
    category: 'siri_orbs',
    desc: 'Vibrant acoustic lime-cyan laser pulse with acoustic reactive wavelets',
    hex: '#84cc16',
    tag: 'Reactive',
  },
  {
    id: 'emerald_solar',
    name: 'Emerald Solar Flare',
    category: 'siri_orbs',
    desc: 'Radiant mint and emerald coronal flares with warm energetic core',
    hex: '#10b981',
    tag: 'Solar Flare',
  },
  {
    id: 'minimal_pearl',
    name: 'Minimal Titanium Pearl',
    category: 'siri_orbs',
    desc: 'Clean monochrome titanium sheen with pearl white bloom and specular glint',
    hex: '#e2e8f0',
    tag: 'Monochrome',
  },
];

export const FullSettingsView: React.FC<FullSettingsViewProps> = ({
  preferences,
  onUpdatePreferences,
  onBackToSimulator,
}) => {
  const [section, setSection] = useState<SettingsSectionId>('themes_icons');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [recordingShortcut, setRecordingShortcut] = useState(false);
  const [recordingAgentShortcut, setRecordingAgentShortcut] = useState(false);
  const [astraCategoryFilter, setAstraCategoryFilter] = useState<AstraCategory>('all');

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [testBounce, setTestBounce] = useState(false);
  const [isRazorSlicing, setIsRazorSlicing] = useState(false);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        handleToggleFullscreen();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleMinimize = async () => {
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('minimize_settings_window');
        return;
      } catch {}
      try {
        const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow');
        await getCurrentWebviewWindow().minimize();
      } catch {}
    }
  };

  const handleMaximize = async () => {
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('toggle_maximize_settings_window');
        return;
      } catch {}
      try {
        const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow');
        await getCurrentWebviewWindow().toggleMaximize();
      } catch {}
    }
  };

  const handleToggleFullscreen = async () => {
    setIsFullscreen((prev) => !prev);
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('toggle_fullscreen_settings_window');
        return;
      } catch {}
      try {
        const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow');
        const win = getCurrentWebviewWindow();
        const cur = await win.isFullscreen();
        await win.setFullscreen(!cur);
      } catch {}
    }
  };

  const handleClose = async () => {
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('close_settings_window');
        return;
      } catch {}
      try {
        const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow');
        await getCurrentWebviewWindow().hide();
      } catch {}
    }
    onBackToSimulator();
  };

  // Interactive preview values so users can drag and test every slider & tile live inside Settings
  const [previewMusicPct, setPreviewMusicPct] = useState(64);
  const [previewVolumePct, setPreviewVolumePct] = useState(74);
  const [previewWifiOn, setPreviewWifiOn] = useState(true);
  const [previewBtOn, setPreviewBtOn] = useState(true);
  const [newCustomTabName, setNewCustomTabName] = useState('');

  const palette = resolveThemePalette(
    preferences.themeId,
    preferences.customPrimaryHex,
    preferences.customSecondaryHex
  );
  const iconMetrics = resolveIconPackMetrics(preferences.iconPack);
  const pillMetrics = resolveInnerPillMetrics(
    preferences.innerPillScale,
    preferences.innerCapsuleRadius
  );

  const recordKeyCombo = (
    e: React.KeyboardEvent,
    targetField: 'toggleShortcut' | 'voiceAgentShortcut',
    stopRecording: () => void
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (['Alt', 'Control', 'Shift', 'Meta'].includes(e.key)) return;
    if (e.key === 'Escape') {
      stopRecording();
      return;
    }

    const parts: string[] = [];
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    if (parts.length === 0) parts.push('Alt');

    const keyLabel =
      e.code === 'Space'
        ? 'Space'
        : e.key.length === 1
          ? e.key.toUpperCase()
          : e.key;
    const combo = `${parts.join('+')}+${keyLabel}`;
    onUpdatePreferences({ [targetField]: combo });
    stopRecording();
    playTactilePop('confirm');
  };

  const toggleTabEnabled = (tab: BuiltinLedgeTab) => {
    const enabledCount = Object.values(preferences.enabledTabs).filter(Boolean).length;
    const currentlyOn = preferences.enabledTabs[tab];
    if (currentlyOn && enabledCount <= 1) return;
    onUpdatePreferences({
      enabledTabs: { ...preferences.enabledTabs, [tab]: !currentlyOn },
    });
    playTactilePop(!currentlyOn ? 'toggleOn' : 'toggleOff');
  };

  const handleAddCustomWidgetTab = (e: React.FormEvent) => {
    e.preventDefault();
    const label = newCustomTabName.trim() || `Deck ${(preferences.customWidgetTabs?.length ?? 0) + 1}`;
    const newTab: CustomWidgetTab = {
      id: `custom_${Date.now().toString(36)}`,
      name: label,
      enabled: true,
      widgets: ['timers', 'network_mini', 'vitals_mini', 'quick_actions'],
      widgetSizes: {
        timers: 'medium',
        network_mini: 'small',
        vitals_mini: 'small',
        quick_actions: 'medium',
      },
    };
    onUpdatePreferences({
      customWidgetTabs: [...(preferences.customWidgetTabs ?? []), newTab],
    });
    setNewCustomTabName('');
    playTactilePop('confirm');
  };

  const toggleFeatureFlag = (key: keyof LedgeFeatureFlags) => {
    const next = !preferences.featureFlags[key];
    onUpdatePreferences({
      featureFlags: { ...preferences.featureFlags, [key]: next },
    });
    playTactilePop(next ? 'toggleOn' : 'toggleOff');
  };

  const toggleControlTileIncluded = (id: ControlTileId) => {
    const exists = preferences.controlTiles.includes(id);
    const updated = exists
      ? preferences.controlTiles.filter((t) => t !== id)
      : [...preferences.controlTiles, id];
    if (updated.length > 0) {
      onUpdatePreferences({ controlTiles: updated });
      playTactilePop('tab');
    }
  };

  const toggleHomeWidgetIncluded = (id: HomeWidgetId) => {
    const exists = preferences.homeWidgets.includes(id);
    const updated = exists
      ? preferences.homeWidgets.filter((w) => w !== id)
      : [...preferences.homeWidgets, id];
    if (updated.length > 0) {
      onUpdatePreferences({ homeWidgets: updated });
      playTactilePop('tab');
    }
  };

  const NAV_ITEMS: {
    id: SettingsSectionId;
    label: string;
    Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  }[] = [
    { id: 'themes_icons', label: 'Color Themes, Icons & Pills', Icon: Palette },
    { id: 'sliders_music', label: 'Fused Sliders & Visualizers', Icon: Music },
    { id: 'control_designer', label: 'Control Center & > Menus', Icon: Grid },
    { id: 'island_geometry', label: 'Shape, Location & Edge-Hide', Icon: Sliders },
    { id: 'edge_sounds', label: 'Edge Lighting & Soundscapes', Icon: Volume2 },
    { id: 'tabs_manager', label: 'Tabs & Reordering', Icon: Layers },
    { id: 'ai_astra', label: 'Astra AI Copilot & Voice Orb', Icon: Sparkles },
  ];

  return (
    <div
      className="w-full h-screen flex flex-col bg-[#090b10] text-slate-100 overflow-hidden select-none"
    >
      {/* 1. Custom Titlebar Header with Window Drag Region and Windows 11 Controls */}
      <header
        data-tauri-drag-region
        className="h-10 shrink-0 w-full bg-[#07090e]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-3 select-none z-50"
      >
        <div className="flex items-center gap-2.5 pointer-events-auto">
          {/* Official Pill App Icon */}
          <img
            src={getThemeIconUrl(preferences.themeId)}
            alt="The Pill"
            className="w-5 h-5 object-contain shrink-0 drop-shadow select-none"
          />
          <span className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
            <span>The Pill Settings</span>
            <span className="text-[10px] font-mono text-slate-400 bg-white/10 px-1.5 py-0.5 rounded">v3.0</span>
          </span>

          {/* Sidebar Collapse/Expand Toggle Button */}
          <button
            type="button"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => {
              playTactilePop('tab');
              setIsSidebarCollapsed((v) => !v);
            }}
            className="p-1 ml-1 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors"
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Windows 11 Window Controls */}
        <div className="flex items-center h-full pointer-events-auto -mr-3">
          <button
            type="button"
            title="Minimize"
            onClick={handleMinimize}
            className="h-10 w-11 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Maximize / Restore"
            onClick={handleMaximize}
            className="h-10 w-11 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            type="button"
            title={isFullscreen ? 'Exit Fullscreen (F11)' : 'Enter Fullscreen (F11)'}
            onClick={handleToggleFullscreen}
            className="h-10 w-11 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            title="Close"
            onClick={handleClose}
            className="h-10 w-11 flex items-center justify-center hover:bg-red-500 hover:text-white text-slate-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Main Flex Layout (Collapsible Left Sidebar + Scrollable Right Content) */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left Collapsible Navigation Sidebar */}
        <aside
          aria-label="Settings categories"
          className={`h-full flex flex-col justify-between border-r border-white/10 bg-[#07090e]/75 backdrop-blur-md transition-all duration-200 shrink-0 select-none ${
            isSidebarCollapsed ? 'w-16 p-2' : 'w-60 p-3'
          }`}
        >
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.Icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={isSidebarCollapsed ? item.label : undefined}
                  onClick={() => {
                    playTactilePop('tab');
                    setSection(item.id);
                  }}
                  style={
                    active
                      ? {
                          backgroundColor: `${palette.primaryHex}22`,
                          borderColor: `${palette.primaryHex}66`,
                        }
                      : undefined
                  }
                  className={`w-full flex items-center rounded-xl text-xs font-medium border transition-colors ${
                    isSidebarCollapsed
                      ? 'justify-center p-2.5'
                      : 'gap-3 px-3 py-2.5 text-left'
                  } ${
                    active
                      ? 'text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border-transparent'
                  }`}
                >
                  <Icon
                    className="w-4 h-4 shrink-0"
                    style={{ color: active ? palette.primaryHex : undefined }}
                  />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="space-y-1 pt-3 border-t border-white/10">
            <button
              type="button"
              title={isSidebarCollapsed ? 'Back to Desktop' : undefined}
              onClick={handleClose}
              style={{ color: palette.primaryHex }}
              className={`w-full flex items-center rounded-xl text-xs font-medium hover:bg-white/[0.04] transition-colors ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2 text-left'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Back to Desktop</span>}
            </button>

            <button
              type="button"
              title={isSidebarCollapsed ? 'Reset Defaults' : undefined}
              onClick={() => {
                onUpdatePreferences({ ...DEFAULT_PREFERENCES });
                playTactilePop('confirm');
              }}
              className={`w-full flex items-center rounded-xl text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2 text-left'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Reset Defaults</span>}
            </button>
          </div>
        </aside>

        {/* Right Active Configuration Pane with Smooth Independent Scrolling */}
        <main className="flex-1 h-full overflow-y-auto ledge-scroll p-6 pb-24 bg-[#090b10] select-text">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Top Settings Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Pill for Windows — Deep Customization &amp; Studio Settings
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Every color theme, A–Z style kit, icon pack, slider style, &gt; Control Center layout, and Home module updates live with interactive previews below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onUpdatePreferences({ ...DEFAULT_PREFERENCES });
                  playTactilePop('confirm');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white/8 hover:bg-white/14 text-slate-200 rounded-xl transition-colors whitespace-nowrap self-start sm:self-auto shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Defaults</span>
              </button>
            </div>

            {/* STICKY Persistent Live Interactive Studio Preview Banner */}
            <div className="sticky top-0 z-30 bg-[#090b10]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl p-4 -mx-6 -mt-6 mb-6">
              <div className="flex flex-col gap-3">
                {/* Status Bar */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: palette.primaryHex }}
                      className="w-2 h-2 rounded-full animate-pulse shadow-sm"
                    />
                    <span className="text-xs font-semibold text-white tracking-wide uppercase">
                      {section === 'themes_icons' && 'Live Preview: Color Themes, Icons & Foundations'}
                      {section === 'sliders_music' && 'Live Preview: Fused Wave Sliders & Visualizers'}
                      {section === 'control_designer' && `Live Preview: Control Center (${String(preferences.controlLayoutMode || 'squarish_blocks').replace(/_/g, ' ')})`}
                      {section === 'island_geometry' && `Live Preview: Geometry & Spring Physics (${preferences.springPreset || 'liquid_silk'})`}
                      {section === 'edge_sounds' && `Live Preview: Edge Lighting (${preferences.edgeLightProfile || 'accent_flow'}) & Audio`}
                      {section === 'tabs_manager' && 'Live Preview: App Navigation & Tabs Strip'}
                      {section === 'ai_astra' && `Live Preview: Astra Voice Orb (${String(preferences.astraOrbStyle || 'siri_rainbow').replace(/_/g, ' ')})`}
                    </span>
                  </div>

                  {/* Section-Specific Interactive Action Pill */}
                  <div className="flex items-center gap-2">
                    {section === 'ai_astra' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            playTactilePop('toggleOn');
                            onUpdatePreferences({
                              astraMode: preferences.astraMode === 'orb_only' ? 'orb_with_captions' : 'orb_only',
                            });
                          }}
                          className="px-2 py-1 text-[11px] font-medium bg-white/10 hover:bg-white/20 text-cyan-300 rounded-lg transition-colors"
                        >
                          Mode: {preferences.astraMode === 'orb_only' ? 'Compact Orb' : preferences.astraMode === 'orb_with_captions' ? 'With Captions' : 'Chat Studio'}
                        </button>
                      </div>
                    )}
                    {section === 'island_geometry' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (preferences.shapeStyle === LedgeShapeStyle.MinimalistBar) {
                            setIsRazorSlicing(true);
                            playTactilePop('confirm');
                            window.setTimeout(() => setIsRazorSlicing(false), 550);
                          } else {
                            setTestBounce(true);
                            playTactilePop(preferences.shapeStyle === LedgeShapeStyle.SplitDualCapsule ? 'tab' : 'expand');
                            window.setTimeout(() => setTestBounce(false), 450);
                          }
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium bg-white/10 hover:bg-white/20 text-sky-300 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>
                          {preferences.shapeStyle === LedgeShapeStyle.MinimalistBar
                            ? '⚡ Test Razor Slice Gesture'
                            : preferences.shapeStyle === LedgeShapeStyle.SplitDualCapsule
                            ? '⚡ Test Dual Droplet Detach'
                            : '⚡ Test Spring Wobble'}
                        </span>
                      </button>
                    )}
                    {section === 'edge_sounds' && (
                      <button
                        type="button"
                        onClick={() => playTactilePop('notification')}
                        className="px-2.5 py-1 text-[11px] font-medium bg-white/10 hover:bg-white/20 text-emerald-300 rounded-lg transition-colors"
                      >
                        🔊 Test Sound Effect
                      </button>
                    )}
                    <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                      {palette.name}
                    </span>
                  </div>
                </div>

                {/* The Rendered Interactive Preview Surface */}
                <div
                  style={{
                    boxShadow: section === 'edge_sounds'
                      ? resolveEdgeGlowCss(preferences.edgeLightProfile, preferences.edgeLightIntensity, palette.primaryHex, palette.secondaryHex)
                      : undefined,
                    transition: 'box-shadow 0.25s ease',
                  }}
                  className="bg-[#050609] border border-white/15 rounded-2xl px-4 py-3 shadow-xl"
                >
                  {/* Dynamic Inner Content Based on Active Section */}
                  {section === 'themes_icons' && (
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                      {/* Active Theme Icon & Landscape Motif */}
                      <div className="flex items-center gap-3">
                        <img
                          src={getThemeIconUrl(preferences.themeId)}
                          alt={`${palette.name} Icon`}
                          className="w-11 h-11 object-contain drop-shadow-md shrink-0 select-none"
                        />
                        <img
                          src={getThemeMotifUrl(preferences.themeId)}
                          alt={`${palette.name} Motif`}
                          className="h-10 w-auto max-w-[130px] object-contain drop-shadow-md shrink-0 select-none"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                            <span className="truncate">{palette.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 shrink-0">
                              {palette.motifName || 'Motif'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 capitalize truncate">
                            {preferences.material} · {preferences.innerPillScale} scale
                          </div>
                        </div>
                      </div>

                      {/* Live Icon Pack Showcase (Reflecting the active drawing style) */}
                      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
                        <span className="text-[10px] text-slate-400 uppercase font-mono mr-1">Icons:</span>
                        <ThemedIcon name="wifi" packStyle={preferences.iconPack} size={16} color="#38bdf8" />
                        <ThemedIcon name="bluetooth" packStyle={preferences.iconPack} size={16} color="#818cf8" />
                        <ThemedIcon name="sun" packStyle={preferences.iconPack} size={16} color="#fbbf24" />
                        <ThemedIcon name="volume" packStyle={preferences.iconPack} size={16} color="#34d399" />
                        <ThemedIcon name="mic" packStyle={preferences.iconPack} size={16} color="#f43f5e" />
                      </div>

                      {/* Active Pill Tile Preview */}
                      <div
                        style={{ backgroundColor: palette.primaryHex }}
                        className={`${pillMetrics.tileHeightClass} ${pillMetrics.radiusClass} px-3.5 flex items-center gap-2 text-xs font-semibold shadow-md ${palette.onPrimaryTextClass} shrink-0`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Active State</span>
                      </div>
                    </div>
                  )}

                  {section === 'sliders_music' && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400 tabular-nums w-8">1:11</span>
                        <FluidEffectSlider
                          value={previewMusicPct}
                          min={0}
                          max={100}
                          onChange={setPreviewMusicPct}
                          styleVariant={preferences.musicSliderStyle}
                          primaryHex={palette.primaryHex}
                          secondaryHex={palette.secondaryHex}
                          animateWave={true}
                          glowIntensity={preferences.sliderGlowIntensity}
                          ariaLabel="Live preview music progress slider"
                          formatTooltip={(v) => `${v}%`}
                        />
                        <span className="text-[10px] font-mono text-slate-400 tabular-nums w-9 text-right">-3:17</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Sun className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <FluidEffectSlider
                          value={previewVolumePct}
                          min={0}
                          max={100}
                          onChange={setPreviewVolumePct}
                          styleVariant={preferences.controlSliderStyle}
                          primaryHex={palette.primaryHex}
                          secondaryHex={palette.secondaryHex}
                          glowIntensity={preferences.sliderGlowIntensity}
                          ariaLabel="Live preview hardware control slider"
                          formatTooltip={(v) => `${v}%`}
                        />
                        <span className="text-[10px] font-mono text-slate-300 tabular-nums w-9 text-right">{previewVolumePct}%</span>
                      </div>
                    </div>
                  )}

                  {section === 'control_designer' && (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          style={previewWifiOn ? { backgroundColor: palette.primaryHex } : undefined}
                          className={`flex-1 h-9 ${pillMetrics.radiusClass} flex items-center justify-between px-3 border transition-colors ${
                            previewWifiOn ? `border-transparent ${palette.onPrimaryTextClass}` : 'bg-[#2b2f3a] border-white/10 text-slate-200'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              playTactilePop('toggleOn');
                              setPreviewWifiOn((v) => !v);
                            }}
                            className="flex items-center gap-2 text-xs font-medium"
                          >
                            <ThemedIcon name="wifi" packStyle={preferences.iconPack} size={15} />
                            <span>{previewWifiOn ? 'IIT-Mandi-WiFi' : 'Wi-Fi Off'}</span>
                          </button>
                          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        </div>

                        <div
                          style={previewBtOn ? { backgroundColor: palette.primaryHex } : undefined}
                          className={`flex-1 h-9 ${pillMetrics.radiusClass} flex items-center justify-between px-3 border transition-colors ${
                            previewBtOn ? `border-transparent ${palette.onPrimaryTextClass}` : 'bg-[#2b2f3a] border-white/10 text-slate-200'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              playTactilePop('toggleOn');
                              setPreviewBtOn((v) => !v);
                            }}
                            className="flex items-center gap-2 text-xs font-medium"
                          >
                            <ThemedIcon name="bluetooth" packStyle={preferences.iconPack} size={15} />
                            <span>{previewBtOn ? 'AirPods Pro' : 'Bluetooth Off'}</span>
                          </button>
                          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        </div>
                      </div>

                      <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2 py-1 rounded border border-white/10 shrink-0">
                        Layout: {String(preferences.controlLayoutMode || 'squarish_blocks').replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}

                  {section === 'island_geometry' && (
                    <div className="space-y-3">
                      {/* Interactive Mini-Desktop Screen Frame */}
                      <div className="relative w-full h-40 rounded-xl bg-[#0a0d14] border border-white/10 overflow-hidden shadow-inner flex flex-col justify-between p-2">
                        {/* Top Screen Bezel with Notch Anchor */}
                        <div className="w-full relative flex items-center justify-between border-b border-white/5 pb-1">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest pl-1">Top Screen Bezel</span>
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                            <span className="w-6 h-1 rounded-full bg-slate-800" />
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest pr-1">100% Display</span>
                        </div>

                        {/* Positioned Island Capsule Preview inside Virtual Display */}
                        <div className="relative flex-1 w-full">
                          {/* Anchor Container */}
                          <div
                            className={`absolute transition-all duration-300 ${
                              preferences.anchorPosition === 'top_left'
                                ? 'left-3 top-1'
                                : preferences.anchorPosition === 'top_right'
                                ? 'right-3 top-1'
                                : preferences.anchorPosition === 'bottom_taskbar'
                                ? 'bottom-1 left-1/2 -translate-x-1/2'
                                : 'top-1 left-1/2 -translate-x-1/2'
                            }`}
                          >
                            {preferences.shapeStyle === LedgeShapeStyle.SplitDualCapsule ? (
                              /* PERMANENT DUAL SPLIT: Main Capsule + Detached Satellite Droplet separated by gap */
                              <div className={`flex items-center gap-2.5 ${testBounce ? 'animate-spring-wobble' : ''}`}>
                                <div
                                  className={`relative flex items-center justify-between px-3 text-slate-100 shadow-lg bg-[#050609] border border-white/20 rounded-full py-1 ${
                                    preferences.sizeScale === LedgeSizeScale.Small
                                      ? 'w-36 text-[10px]'
                                      : preferences.sizeScale === LedgeSizeScale.Large
                                      ? 'w-48 text-xs'
                                      : 'w-40 text-[11px]'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span
                                      style={{ backgroundColor: palette.primaryHex }}
                                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm animate-pulse"
                                    />
                                    <span className="font-semibold truncate">Dynamic Island</span>
                                  </div>
                                  <span className="text-emerald-400 font-mono text-[9px]">● Live</span>
                                </div>

                                {/* Completely Detached Companion Satellite Droplet */}
                                <div
                                  className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#050609] border border-white/20 shadow-lg text-[9px] font-mono text-amber-300 font-semibold"
                                >
                                  <span>5m</span>
                                </div>
                              </div>
                            ) : (
                              /* The Simulated Capsule for DynamicPill, Squircle, TopBezelLedge, and MinimalistBar */
                              <div
                                className={`relative flex items-center justify-between px-3 text-slate-100 shadow-lg ${
                                  testBounce ? 'animate-spring-wobble' : ''
                                } ${
                                  preferences.shapeStyle === LedgeShapeStyle.TopBezelLedge
                                    ? 'bg-[#050609] border-x border-b border-white/20 rounded-b-2xl pt-1 pb-1.5'
                                    : preferences.shapeStyle === LedgeShapeStyle.SuperellipseSquircle
                                    ? 'bg-[#050609] border border-white/20 rounded-[14px] py-1'
                                    : preferences.shapeStyle === LedgeShapeStyle.MinimalistBar
                                    ? 'bg-[#050609] border border-cyan-400/40 rounded-[6px] py-0.5 h-[26px] shadow-[0_0_12px_rgba(34,211,238,0.2)] overflow-hidden'
                                    : 'bg-[#050609] border border-white/20 rounded-full py-1'
                                } ${
                                  preferences.sizeScale === LedgeSizeScale.Small
                                    ? 'w-44 text-[10px]'
                                    : preferences.sizeScale === LedgeSizeScale.Large
                                    ? 'w-56 text-xs'
                                    : 'w-48 text-[11px]'
                                }`}
                              >
                                {/* Minimalist Razor Specular Edge Line & Slice Flare */}
                                {preferences.shapeStyle === LedgeShapeStyle.MinimalistBar && (
                                  <>
                                    <span className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent pointer-events-none" />
                                    {isRazorSlicing && (
                                      <span className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-cyan-200 to-transparent animate-razor-slice pointer-events-none" />
                                    )}
                                  </>
                                )}

                                {/* Concave Meniscus Fillets for Docked Bezel */}
                                {preferences.shapeStyle === LedgeShapeStyle.TopBezelLedge && (
                                  <>
                                    <span className="absolute -left-2 top-0 w-2 h-2 border-r border-t border-white/20 rounded-tr-lg" />
                                    <span className="absolute -right-2 top-0 w-2 h-2 border-l border-t border-white/20 rounded-tl-lg" />
                                  </>
                                )}

                                {/* Capsule Content Preview */}
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    style={{ backgroundColor: palette.primaryHex }}
                                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                                  />
                                  <span className="font-semibold truncate">
                                    {preferences.shapeStyle === LedgeShapeStyle.TopBezelLedge
                                      ? 'Bezel Ledge'
                                      : preferences.shapeStyle === LedgeShapeStyle.SuperellipseSquircle
                                      ? 'iOS Squircle'
                                      : preferences.shapeStyle === LedgeShapeStyle.MinimalistBar
                                      ? 'Razor Status'
                                      : 'Dynamic Island'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0 font-mono text-[9px] text-slate-400">
                                  <span className="text-emerald-400">● Live</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Taskbar Rail (for BottomTaskbar anchor orientation) */}
                        <div className="w-full flex items-center justify-between border-t border-white/5 pt-1 text-[9px] font-mono text-slate-500">
                          <span>Windows Desktop</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            {preferences.anchorPosition === 'bottom_taskbar' ? 'Pinned above Taskbar' : 'Screen Bezel View'}
                          </span>
                        </div>
                      </div>

                      {/* Live Specs & Physics Readout */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sky-300 bg-sky-950/60 border border-sky-400/20 px-2 py-0.5 rounded text-[11px]">
                            {preferences.sizeScale === LedgeSizeScale.Small ? '193 × 33 px (Compact)' : preferences.sizeScale === LedgeSizeScale.Large ? '229 × 39 px (Roomy)' : '210 × 36 px (Normal)'}
                          </span>
                          <span className="text-slate-300">
                            Anchor: <strong className="text-white capitalize">{String(preferences.anchorPosition || 'top_center').replace(/_/g, ' ')}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            preferences.stealthAutoHide
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                              : 'bg-white/5 text-slate-300 border border-white/10'
                          }`}>
                            {preferences.stealthAutoHide ? '🛡️ Stealth Auto-Hide Enabled' : 'Always Floating'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                            Physics: {preferences.springPreset}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {section === 'edge_sounds' && (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-white">Audio Pack: {String(preferences.soundProfile || 'wooden_marimba').replace(/_/g, ' ')}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {(['expand', 'tab', 'drop', 'confirm'] as const).map((snd) => (
                          <button
                            key={snd}
                            type="button"
                            onClick={() => playTactilePop(snd)}
                            className="px-2 py-0.5 text-[10px] font-mono bg-white/10 hover:bg-white/20 text-slate-200 rounded transition-colors capitalize"
                          >
                            {snd}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {section === 'tabs_manager' && (
                    <div className="flex items-center justify-between gap-4">
                      {/* Tab Strip Preview */}
                      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                        {preferences.tabOrder.filter((t) => isTabEnabledInPrefs(t, preferences)).map((t) => (
                          <span
                            key={t}
                            style={t === 'home' ? { backgroundColor: `${palette.primaryHex}33`, borderColor: `${palette.primaryHex}88`, color: palette.primaryHex } : undefined}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border flex items-center gap-1 ${
                              t === 'home' ? 'font-semibold' : 'bg-white/5 border-white/10 text-slate-300'
                            }`}
                          >
                            <span>{String(preferences.customTabNames?.[t] || t || '').replace(/_/g, ' ')}</span>
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 font-mono text-[10px] text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                        <span>Active: {preferences.tabOrder.filter((t) => isTabEnabledInPrefs(t, preferences)).length} Tabs</span>
                      </div>
                    </div>
                  )}

                  {section === 'ai_astra' && (
                    <div className="space-y-3">
                      {/* Simulated Mini Desktop Bezel with In-Pill Astra Orb */}
                      <div className="relative w-full h-24 rounded-xl bg-[#030407] border border-white/10 overflow-hidden flex flex-col justify-between p-2">
                        <div className="w-full flex items-center justify-between text-[9px] font-mono text-slate-500 border-b border-white/5 pb-1">
                          <span>TOP SCREEN BEZEL</span>
                          <span>In-Pill Morph Surface</span>
                        </div>

                        {/* Centered Pill Capsule with Active Astra Orb Style */}
                        <div className="flex items-center justify-center flex-1">
                          {preferences.astraMode === 'orb_only' ? (
                            <div className="px-3 py-1.5 rounded-full bg-[#07090e] border border-white/20 shadow-xl flex items-center justify-center">
                              <AstraSiriOrbCanvas
                                size={44}
                                state="listening"
                                audioLevel={0.48}
                                style={preferences.astraOrbStyle || 'siri_rainbow'}
                              />
                            </div>
                          ) : preferences.astraMode === 'orb_with_captions' ? (
                            <div className="px-3 py-1.5 rounded-full bg-[#07090e] border border-white/20 shadow-xl flex items-center gap-2.5 max-w-sm">
                              <AstraSiriOrbCanvas
                                size={36}
                                state="speaking"
                                audioLevel={0.62}
                                style={preferences.astraOrbStyle || 'siri_rainbow'}
                              />
                              <div className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[10px] text-slate-200 truncate backdrop-blur-sm">
                                <span className="text-cyan-300 font-mono mr-1">Astra:</span>
                                <span>I'm ready to assist you on Windows 11</span>
                              </div>
                            </div>
                          ) : (
                            <div className="px-3 py-2 rounded-2xl bg-[#07090e] border border-white/20 shadow-xl flex flex-col gap-1.5 w-64">
                              <div className="flex items-center gap-2 border-b border-white/10 pb-1">
                                <AstraSiriOrbCanvas
                                  size={24}
                                  state="thinking"
                                  style={preferences.astraOrbStyle || 'siri_rainbow'}
                                />
                                <span className="text-[10px] font-semibold text-white">Astra Chat Studio</span>
                              </div>
                              <div className="text-[9px] text-slate-300 bg-white/5 px-2 py-1 rounded">
                                "Volume set to 80%"
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="w-full flex items-center justify-between text-[9px] font-mono text-slate-500 border-t border-white/5 pt-1">
                          <span>Tap: Speak · Long Press: Chat</span>
                          <span className="text-cyan-400 capitalize">{String(preferences.astraOrbStyle || 'siri_rainbow').replace(/_/g, ' ')}</span>
                        </div>
                      </div>

                      {/* Interactive Orb Style Selector Pills */}
                      <div className="flex flex-col gap-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>Avatar Manifestations ({ALL_ASTRA_ORB_DEFINITIONS.length}):</span>
                          <span className="text-cyan-400">Scroll to preview</span>
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 ledge-scroll">
                          {ALL_ASTRA_ORB_DEFINITIONS.map((st) => {
                            const isSelected = (preferences.astraOrbStyle || 'siri_rainbow') === st.id;
                            return (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => {
                                  playTactilePop('tab');
                                  onUpdatePreferences({ astraOrbStyle: st.id });
                                }}
                                style={isSelected ? { borderColor: st.hex, backgroundColor: `${st.hex}22` } : undefined}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border transition-colors flex items-center gap-1 shrink-0 ${
                                  isSelected ? 'text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                }`}
                              >
                                <span style={{ backgroundColor: st.hex }} className="w-2 h-2 rounded-full shrink-0" />
                                <span className="whitespace-nowrap">{st.name.split(' (')[0]}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Active Configuration Pane Body */}
          {/* ================================================================
           * SECTION 1: COLOR THEMES, ICON PACKS & INNER PILL SIZES
           * ============================================================== */}
          {section === 'themes_icons' && (
            <div className="space-y-6">
              {/* Complete A–Z Coordinated Style Kits (Cyberpunk, Retro, Paper, Animals, Flowers, Cars, etc.) */}
              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    A–Z Complete Style Kits (One-Click Full Overhaul)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Applies a coordinated theme palette, custom slider track, tile surface finish, icon pack, capsule geometry, edge lighting, and acoustic soundscape — while keeping every control customizable below.
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {COMPLETE_STYLE_KITS.map((kit) => {
                    const th = LEDGE_THEMES[kit.themeId];
                    const active =
                      preferences.themeId === kit.themeId &&
                      preferences.tileSurfaceStyle === kit.tileSurfaceStyle;
                    return (
                      <button
                        key={kit.id}
                        type="button"
                        onClick={() => {
                          playTactilePop('confirm', kit.soundProfile);
                          onUpdatePreferences({
                            themeId: kit.themeId,
                            musicSliderStyle: kit.musicSliderStyle,
                            controlSliderStyle: kit.controlSliderStyle,
                            tileSurfaceStyle: kit.tileSurfaceStyle,
                            iconPack: kit.iconPack,
                            innerCapsuleRadius: kit.innerCapsuleRadius,
                            edgeLightProfile: kit.edgeLightProfile,
                            soundProfile: kit.soundProfile,
                            astraOrbStyle: KIT_ASTRA_STYLES[kit.id] || 'siri_rainbow',
                            featureFlags: {
                              ...preferences.featureFlags,
                              edgeLighting: kit.edgeLightProfile !== 'off',
                            },
                          });
                        }}
                        style={
                          active
                            ? { borderColor: th.primaryHex, boxShadow: `0 0 24px ${th.primaryHex}28` }
                            : undefined
                        }
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                          active
                            ? 'bg-white/[0.09] text-white ring-1 ring-white/20'
                            : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                        }`}
                      >
                        {/* Theme App Icon with Pill Typography */}
                        <img
                          src={getThemeIconUrl(kit.themeId)}
                          alt={kit.title}
                          className="h-12 w-12 object-contain shrink-0 drop-shadow-md select-none"
                        />

                        {/* Title, Badge, Summary, Dots */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-xs font-semibold text-white truncate">
                              {kit.title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 shrink-0">
                              {kit.genre}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{kit.summary}</p>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <span
                              style={{ backgroundColor: th.primaryHex }}
                              className="w-3.5 h-3.5 rounded-full ring-1 ring-white/25"
                            />
                            <span
                              style={{ backgroundColor: th.secondaryHex }}
                              className="w-3 h-3 rounded-full ring-1 ring-white/20"
                            />
                          </div>
                        </div>

                        {/* Theme Landscape Motif Capsule */}
                        <img
                          src={getThemeMotifUrl(kit.themeId)}
                          alt={`${kit.title} motif`}
                          className="h-10 w-auto max-w-[110px] object-contain shrink-0 drop-shadow-md hidden sm:block select-none"
                        />
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">Color Themes &amp; Custom Accent Studio</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Changes active Control Center tiles, sliders, music harmonics, tabs, and primary actions across the entire Dynamic Island.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(LEDGE_THEMES) as Exclude<LedgeThemeId, 'custom_hex'>[]).map(
                    (id) => {
                      const th = LEDGE_THEMES[id];
                      const selected = preferences.themeId === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            playTactilePop('tab');
                            onUpdatePreferences({ themeId: id });
                          }}
                          style={
                            selected ? { borderColor: th.primaryHex } : undefined
                          }
                          className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-colors ${
                            selected
                              ? 'bg-white/[0.08] text-white ring-1 ring-white/20'
                              : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={getThemeIconUrl(id)}
                              alt={th.name}
                              className="w-9 h-9 object-contain shrink-0 drop-shadow select-none"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold truncate">{th.name}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                {th.subtitle}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span
                              style={{ backgroundColor: th.primaryHex }}
                              className="w-4 h-4 rounded-full ring-1 ring-white/25"
                            />
                            <span
                              style={{ backgroundColor: th.secondaryHex }}
                              className="w-3.5 h-3.5 rounded-full ring-1 ring-white/20"
                            />
                          </div>
                        </button>
                      );
                    }
                  )}

                  {/* Custom Hex Theme Card */}
                  <div
                    style={
                      preferences.themeId === 'custom_hex'
                        ? { borderColor: preferences.customPrimaryHex }
                        : undefined
                    }
                    className={`p-3.5 rounded-xl border sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      preferences.themeId === 'custom_hex'
                        ? 'bg-white/[0.08] text-white'
                        : 'bg-white/[0.02] border-white/10 text-slate-300'
                    }`}
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() => onUpdatePreferences({ themeId: 'custom_hex' })}
                        className="text-xs font-semibold text-left hover:underline"
                      >
                        Custom Studio #HEX Palette
                      </button>
                      <p className="text-[11px] text-slate-400">
                        Pick any exact primary &amp; harmonic secondary hex colors
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-400">Primary</span>
                        <input
                          type="color"
                          aria-label="Custom primary accent color"
                          value={preferences.customPrimaryHex}
                          onChange={(e) =>
                            onUpdatePreferences({
                              themeId: 'custom_hex',
                              customPrimaryHex: e.target.value,
                            })
                          }
                          className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                        />
                      </label>
                      <label className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-400">Secondary</span>
                        <input
                          type="color"
                          aria-label="Custom secondary accent color"
                          value={preferences.customSecondaryHex}
                          onChange={(e) =>
                            onUpdatePreferences({
                              themeId: 'custom_hex',
                              customSecondaryHex: e.target.value,
                            })
                          }
                          className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              {/* Icon Packs + Inner Pill Sizes & Corner Shapes */}
              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-5">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Icon Packs &amp; Inner Pill Geometry
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customize icon stroke weights, aura badges, and the density and corner curvature of controls inside the main pill.
                  </p>
                </div>

                <div>
                  <div className="text-xs font-medium text-slate-300 mb-2">Icon Pack Style</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {(
                      [
                        { id: 'fluent_outline', label: 'Fluent Outline', sub: '1.75px OS native line' },
                        { id: 'apple_solid', label: 'Cupertino Solid', sub: '2.35px weighted glyphs' },
                        { id: 'duotone_glass', label: 'Duotone Glass', sub: 'Luminous frosted aura' },
                        { id: 'minimal_mono', label: 'Minimal Hairline', sub: '1.35px technical line' },
                        { id: 'cyberpunk_hud', label: 'Cyberpunk HUD', sub: 'Sci-Fi neon cyan chamfer' },
                        { id: 'retro_80s_crt', label: 'Retro 80s CRT', sub: 'Amber phosphor bloom & bevel' },
                        { id: 'paper_ink_brush', label: 'Paper & Ink Brush', sub: 'Sumi-e calligraphy & seal' },
                        { id: 'botanical_sakura', label: 'Botanical Sakura', sub: 'Cherry blossom petal contour' },
                        { id: 'motorsport_gt', label: 'Motorsport Cars GT', sub: 'Redline tachometer cuts' },
                        { id: 'cozy_woodland', label: 'Woodland Animals', sub: 'Organic pebble & moss earth' },
                        { id: 'cupertino_silk', label: 'Cupertino Liquid Silk', sub: 'Superellipse pearl sheen' },
                      ] as { id: IconPackStyle; label: string; sub: string }[]
                    ).map((pk) => {
                      const active = preferences.iconPack === pk.id;
                      const m = resolveIconPackMetrics(pk.id);
                      return (
                        <button
                          key={pk.id}
                          type="button"
                          onClick={() => {
                            playTactilePop('tab');
                            onUpdatePreferences({ iconPack: pk.id });
                          }}
                          style={active ? { borderColor: palette.primaryHex } : undefined}
                          className={`p-3 rounded-xl border text-left transition-colors ${
                            active
                              ? 'bg-white/[0.09] text-white'
                              : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <ThemedIcon
                              name="wifi"
                              packStyle={pk.id}
                              size={16}
                              color={active ? palette.primaryHex : undefined}
                              strokeWidth={m.strokeWidth}
                            />
                            <ThemedIcon
                              name="bluetooth"
                              packStyle={pk.id}
                              size={16}
                              color={active ? '#38bdf8' : undefined}
                              strokeWidth={m.strokeWidth}
                            />
                            <ThemedIcon
                              name="mic"
                              packStyle={pk.id}
                              size={16}
                              color={active ? '#34d399' : undefined}
                              strokeWidth={m.strokeWidth}
                            />
                            <ThemedIcon
                              name="sun"
                              packStyle={pk.id}
                              size={16}
                              color={active ? '#fbbf24' : undefined}
                              strokeWidth={m.strokeWidth}
                            />
                          </div>
                          <div className="text-xs font-semibold">{pk.label}</div>
                          <div className="text-[10px] text-slate-400">{pk.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10">
                  <div>
                    <div className="text-xs font-medium text-slate-300 mb-2">
                      Inner Pill / Tile Density
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'compact', label: 'Compact (36px)' },
                          { id: 'balanced', label: 'Balanced (44px)' },
                          { id: 'plush', label: 'Plush (48px)' },
                        ] as { id: InnerPillScale; label: string }[]
                      ).map((sc) => (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => {
                            playTactilePop('tab');
                            onUpdatePreferences({ innerPillScale: sc.id });
                          }}
                          style={
                            preferences.innerPillScale === sc.id
                              ? { backgroundColor: palette.primaryHex }
                              : undefined
                          }
                          className={`py-2 px-2 rounded-xl text-xs font-medium transition-colors ${
                            preferences.innerPillScale === sc.id
                              ? `${palette.onPrimaryTextClass} font-semibold`
                              : 'bg-white/[0.04] text-slate-300 hover:text-white'
                          }`}
                        >
                          {sc.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-slate-300 mb-2">
                      Inner Capsule Corner Shape
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: 'win11_card', label: 'Win11 Card' },
                          { id: 'pill_capsule', label: 'Full Pill' },
                          { id: 'squircle_soft', label: 'iOS Squircle' },
                        ] as { id: InnerCapsuleRadius; label: string }[]
                      ).map((rad) => (
                        <button
                          key={rad.id}
                          type="button"
                          onClick={() => {
                            playTactilePop('tab');
                            onUpdatePreferences({ innerCapsuleRadius: rad.id });
                          }}
                          style={
                            preferences.innerCapsuleRadius === rad.id
                              ? { backgroundColor: palette.primaryHex }
                              : undefined
                          }
                          className={`py-2 px-2 rounded-xl text-xs font-medium transition-colors ${
                            preferences.innerCapsuleRadius === rad.id
                              ? `${palette.onPrimaryTextClass} font-semibold`
                              : 'bg-white/[0.04] text-slate-300 hover:text-white'
                          }`}
                        >
                          {rad.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tile Surface Geometry */}
                <div className="pt-3 border-t border-white/10">
                  <div className="text-xs font-medium text-slate-300 mb-2">
                    Control Tile Surface Material
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(
                      [
                        { id: 'fluent_glass', label: 'Fluent Glass', sub: 'Crisp Windows 11 Mica' },
                        { id: 'chamfer_cyber', label: 'Chamfer Cyber', sub: '45° cut sci-fi corners' },
                        { id: 'retro_bevel', label: 'Retro Bevel Key', sub: 'Tactile 80s deck keycap' },
                        { id: 'paper_sketch', label: 'Paper & Ink', sub: 'Editorial ink shadow' },
                        { id: 'carbon_gt', label: 'Carbon Weave GT', sub: 'Motorsport cockpit mesh' },
                        { id: 'pebble_organic', label: 'Organic Pebble', sub: 'Soft nature & flora' },
                      ] as { id: TileSurfaceStyle; label: string; sub: string }[]
                    ).map((sf) => {
                      const active = preferences.tileSurfaceStyle === sf.id;
                      return (
                        <button
                          key={sf.id}
                          type="button"
                          onClick={() => {
                            playTactilePop('tab');
                            onUpdatePreferences({ tileSurfaceStyle: sf.id });
                          }}
                          style={active ? { borderColor: palette.primaryHex } : undefined}
                          className={`p-2.5 rounded-xl border text-left transition-colors ${
                            active
                              ? 'bg-white/[0.09] text-white'
                              : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="text-xs font-semibold">{sf.label}</div>
                          <div className="text-[10px] text-slate-400">{sf.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ================================================================
           * SECTION 2: FUSED EFFECT-IN-SLIDERS & 60FPS MUSIC VISUALIZERS
           * ============================================================== */}
          {section === 'sliders_music' && (
            <div className="space-y-6">
              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Interactive Slider Styles (Fused Effect-in-Slider Gallery)
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Drag any slider below to feel it live, and assign independent styles to your Music Progress Bar and Control Center Sliders.
                    </p>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-200 bg-white/[0.05] px-3 py-1.5 rounded-xl cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={preferences.featureFlags.fuseVisualizerInSlider}
                      onChange={() => toggleFeatureFlag('fuseVisualizerInSlider')}
                      className="rounded accent-cyan-400"
                    />
                    <span>Fuse Wave Into Music Scrubber</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SLIDER_STYLE_CATALOG.map((st) => {
                    const isMusic = preferences.musicSliderStyle === st.id;
                    const isControl = preferences.controlSliderStyle === st.id;
                    return (
                      <div
                        key={st.id}
                        style={
                          isMusic || isControl ? { borderColor: `${palette.primaryHex}88` } : undefined
                        }
                        className={`p-3.5 rounded-xl border space-y-2.5 transition-colors ${
                          isMusic || isControl
                            ? 'bg-white/[0.07]'
                            : 'bg-white/[0.02] border-white/10'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{st.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {st.desc}
                          </div>
                        </div>

                        {/* Live Rendered Interactive Slider Element */}
                        <div className="bg-[#070a10] border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
                          <FluidEffectSlider
                            value={previewMusicPct}
                            min={0}
                            max={100}
                            onChange={setPreviewMusicPct}
                            styleVariant={st.id}
                            primaryHex={palette.primaryHex}
                            secondaryHex={palette.secondaryHex}
                            animateWave={true}
                            glowIntensity={preferences.sliderGlowIntensity}
                            ariaLabel={`Preview ${st.name} slider`}
                          />
                          <span className="text-[10px] font-mono text-slate-400 tabular-nums w-8 text-right">
                            {previewMusicPct}%
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              playTactilePop('tab');
                              onUpdatePreferences({ musicSliderStyle: st.id });
                            }}
                            style={isMusic ? { backgroundColor: palette.primaryHex } : undefined}
                            className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-medium transition-colors ${
                              isMusic
                                ? `${palette.onPrimaryTextClass} font-semibold`
                                : 'bg-white/8 hover:bg-white/15 text-slate-300'
                            }`}
                          >
                            {isMusic ? '✓ Music Slider' : 'Use for Music'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playTactilePop('tab');
                              onUpdatePreferences({ controlSliderStyle: st.id });
                            }}
                            style={isControl ? { backgroundColor: palette.primaryHex } : undefined}
                            className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-medium transition-colors ${
                              isControl
                                ? `${palette.onPrimaryTextClass} font-semibold`
                                : 'bg-white/8 hover:bg-white/15 text-slate-300'
                            }`}
                          >
                            {isControl ? '✓ Control Slider' : 'Use for Controls'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <label className="block pt-2 border-t border-white/10">
                  <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                    <span>Playhead Halo &amp; Meniscus Glow Intensity</span>
                    <span className="font-mono tabular-nums" style={{ color: palette.primaryHex }}>
                      {Math.round(preferences.sliderGlowIntensity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={preferences.sliderGlowIntensity}
                    onChange={(e) =>
                      onUpdatePreferences({ sliderGlowIntensity: Number(e.target.value) })
                    }
                    className="w-full h-1.5 accent-cyan-400 bg-white/15 rounded-full cursor-pointer"
                  />
                </label>
              </section>

              {/* 60fps Upper/Collapsed Music Visualizers */}
              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    60fps Collapsed Pill &amp; Upper Music Visualizers
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Used on the collapsed Dynamic Island capsule and (when unfused) above the Home scrubber.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(
                    [
                      { id: 'liquid_ribbon', name: 'Liquid Silk Ribbon', desc: 'Flowing multi-harmonic translucent ribbons' },
                      { id: 'harmonic_bars', name: 'Harmonic Spectrum Bars', desc: '28 sub-pixel interpolated Dynamic Island bars' },
                      { id: 'orbital_aura', name: 'Orbital Plasma Aura', desc: 'Breathing concentric acoustic rings' },
                      { id: 'mirrored_wave', name: 'Symmetric Spline Wave', desc: 'Smooth studio oscilloscope curve' },
                      { id: 'particle_field', name: 'Acoustic Stardust', desc: 'Drifting harmonic light particles' },
                      { id: 'minimal_pulse', name: 'Minimal Stereo Filament', desc: 'Ultra-low-CPU dual horizontal meter' },
                    ] as { id: MusicVisualizerStyle; name: string; desc: string }[]
                  ).map((vis) => {
                    const active = preferences.musicVisualizer === vis.id;
                    return (
                      <div
                        key={vis.id}
                        onClick={() => {
                          playTactilePop('tab');
                          onUpdatePreferences({ musicVisualizer: vis.id });
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onUpdatePreferences({ musicVisualizer: vis.id });
                          }
                        }}
                        style={active ? { borderColor: palette.primaryHex } : undefined}
                        className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                          active
                            ? 'bg-white/[0.08]'
                            : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-white">{vis.name}</span>
                          {active && (
                            <span
                              className="text-[10px] font-medium"
                              style={{ color: palette.primaryHex }}
                            >
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mb-1.5">{vis.desc}</p>
                        <FluidMusicVisualizer
                          style={vis.id}
                          isPlaying={true}
                          accentHex={palette.primaryHex}
                          secondaryHex={palette.secondaryHex}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {/* ================================================================
           * SECTION 3: WINDOWS 11 CONTROL CENTER LAYOUT & `>` TILES DESIGNER
           * ============================================================== */}
          {section === 'control_designer' && (
            <div className="space-y-6">
              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Control Center Layout Architecture
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure split &gt; submenu tiles, column count, pagination, and hardware sliders.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {(
                    [
                      {
                        id: 'squarish_blocks',
                        title: 'Squarish Blocks (Default)',
                        desc: 'Space-efficient 6-col rounded squares with corner > drilldown & Playground resize',
                      },
                      {
                        id: 'circular_orbs',
                        title: 'Circular Orbs',
                        desc: 'Apple Control Center 6-col sculpted circular orbs with floating > badge',
                      },
                      {
                        id: 'win11_split',
                        title: 'Windows 11 Split Cards',
                        desc: 'Icon + > split capsule with centered caption below',
                      },
                      {
                        id: 'bento_mixed',
                        title: 'Mixed Vertical + Horizontal',
                        desc: '2-row tall vertical hero pillars paired with horizontal status blocks',
                      },
                      {
                        id: 'vertical_pillars',
                        title: 'Vertical Control Pillars',
                        desc: 'Tall iOS/macOS vertical columns with top > drill-down & bottom status',
                      },
                      {
                        id: 'horizontal_strips',
                        title: 'Wide Horizontal Strips',
                        desc: '2-column wide horizontal bars showing full SSID, device & status',
                      },
                      {
                        id: 'inline_pills',
                        title: 'Compact Inline Pills',
                        desc: 'Icon badge + title/status inline with trailing > button',
                      },
                      {
                        id: 'minimal_grid',
                        title: 'Minimal Studio Grid',
                        desc: 'Low-profile monochrome glyphs with clean status text',
                      },
                    ] as { id: ControlCenterLayoutMode; title: string; desc: string }[]
                  ).map((lm) => {
                    const active = preferences.controlLayoutMode === lm.id;
                    return (
                      <button
                        key={lm.id}
                        type="button"
                        onClick={() => {
                          playTactilePop('tab');
                          onUpdatePreferences({ controlLayoutMode: lm.id });
                        }}
                        style={active ? { borderColor: palette.primaryHex } : undefined}
                        className={`p-3.5 rounded-xl border text-left transition-colors ${
                          active
                            ? 'bg-white/[0.09] text-white'
                            : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="text-xs font-semibold">{lm.title}</div>
                        <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                          {lm.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                    <span>Slider Axis</span>
                    <div className="flex items-center gap-1">
                      {(
                        [
                          { id: 'horizontal', label: 'Horiz' },
                          { id: 'vertical', label: 'Vert' },
                        ] as { id: ControlSliderOrientation; label: string }[]
                      ).map((ax) => (
                        <button
                          key={ax.id}
                          type="button"
                          onClick={() =>
                            onUpdatePreferences({ controlSliderOrientation: ax.id })
                          }
                          style={
                            preferences.controlSliderOrientation === ax.id
                              ? { backgroundColor: palette.primaryHex }
                              : undefined
                          }
                          className={`px-2 py-1 rounded-lg font-semibold ${
                            preferences.controlSliderOrientation === ax.id
                              ? palette.onPrimaryTextClass
                              : 'bg-white/10 text-slate-300'
                          }`}
                        >
                          {ax.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                    <span>Grid Columns</span>
                    <div className="flex items-center gap-1">
                      {([3, 4] as const).map((cols) => (
                        <button
                          key={cols}
                          type="button"
                          onClick={() => onUpdatePreferences({ controlGridColumns: cols })}
                          style={
                            preferences.controlGridColumns === cols
                              ? { backgroundColor: palette.primaryHex }
                              : undefined
                          }
                          className={`px-2.5 py-1 rounded-lg font-mono font-semibold ${
                            preferences.controlGridColumns === cols
                              ? palette.onPrimaryTextClass
                              : 'bg-white/10 text-slate-300'
                          }`}
                        >
                          {cols} Col
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between cursor-pointer">
                    <span>Brightness Slider</span>
                    <input
                      type="checkbox"
                      checked={preferences.showControlBrightnessSlider}
                      onChange={(e) =>
                        onUpdatePreferences({ showControlBrightnessSlider: e.target.checked })
                      }
                      className="w-4 h-4 rounded accent-cyan-400"
                    />
                  </label>

                  <label className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between cursor-pointer">
                    <span>Volume + Mixer (&gt;)</span>
                    <input
                      type="checkbox"
                      checked={preferences.showControlVolumeSlider}
                      onChange={(e) =>
                        onUpdatePreferences({ showControlVolumeSlider: e.target.checked })
                      }
                      className="w-4 h-4 rounded accent-cyan-400"
                    />
                  </label>
                </div>
              </section>

              {/* Choose & Reorder All 16 Control Center Tiles */}
              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Choose &amp; Reorder Control Center Quick Actions (16 Available)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tiles automatically paginate across Page 1 and Page 2 (● · ▼) in the order you set.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALL_CONTROL_TILES.map((tile) => {
                    const idx = preferences.controlTiles.indexOf(tile.id);
                    const included = idx !== -1;
                    const Icon = tile.Icon;
                    return (
                      <div
                        key={tile.id}
                        style={
                          included ? { borderColor: `${palette.primaryHex}55` } : undefined
                        }
                        className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border ${
                          included
                            ? 'bg-white/[0.05] text-white'
                            : 'bg-white/[0.015] border-white/8 text-slate-500'
                        }`}
                      >
                        <label className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={included}
                            onChange={() => toggleControlTileIncluded(tile.id)}
                            className="w-4 h-4 rounded accent-cyan-400 shrink-0"
                          />
                          <Icon className="w-4 h-4 shrink-0" strokeWidth={iconMetrics.strokeWidth} />
                          <span className="text-xs font-medium truncate">
                            {tile.label}
                            {tile.hasSubmenu ? '  >' : ''}
                          </span>
                        </label>

                        {included && (
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] font-mono text-slate-400 mr-1 tabular-nums">
                              #{idx + 1}
                            </span>
                            <button
                              type="button"
                              disabled={idx === 0}
                              aria-label={`Move ${tile.label} up`}
                              onClick={() =>
                                onUpdatePreferences({
                                  controlTiles: moveOrderedItem(
                                    preferences.controlTiles,
                                    idx,
                                    -1
                                  ),
                                })
                              }
                              className="p-1 rounded bg-white/8 hover:bg-white/15 disabled:opacity-25"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === preferences.controlTiles.length - 1}
                              aria-label={`Move ${tile.label} down`}
                              onClick={() =>
                                onUpdatePreferences({
                                  controlTiles: moveOrderedItem(
                                    preferences.controlTiles,
                                    idx,
                                    1
                                  ),
                                })
                              }
                              className="p-1 rounded bg-white/8 hover:bg-white/15 disabled:opacity-25"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Smart Dynamic Clipboard Layout, Sort & Group Defaults */}
              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Smart Clipboard Layout, Sort &amp; Grouping
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Choose between Dynamic Bento (tight aspect-fitted image rectangles paired beside square tiles) or the Classic Full-Width Stack.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                    <div className="font-semibold text-white">Clipboard Layout</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(
                        [
                          { id: 'dynamic_bento', label: 'Dynamic Bento' },
                          { id: 'classic_list', label: 'Classic Stack' },
                        ] as { id: ClipboardLayoutMode; label: string }[]
                      ).map((opt) => {
                        const active = (preferences.clipboardLayout ?? 'dynamic_bento') === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => onUpdatePreferences({ clipboardLayout: opt.id })}
                            style={active ? { backgroundColor: palette.primaryHex } : undefined}
                            className={`py-1.5 px-2 rounded-lg font-semibold ${
                              active
                                ? palette.onPrimaryTextClass
                                : 'bg-white/10 text-slate-300 hover:text-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                    <span className="font-semibold text-white block">Default Sort Order</span>
                    <CustomPopdown
                      ariaLabel="Default clipboard sort order"
                      fullWidth
                      size="md"
                      accentHex={palette.primaryHex}
                      value={preferences.clipboardSortBy ?? 'newest'}
                      options={SETTINGS_CLIP_SORT_OPTIONS}
                      onChange={(next) => onUpdatePreferences({ clipboardSortBy: next })}
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                    <span className="font-semibold text-white block">Category Grouping</span>
                    <CustomPopdown
                      ariaLabel="Default clipboard category grouping"
                      fullWidth
                      size="md"
                      accentHex={palette.primaryHex}
                      value={preferences.clipboardGroupBy ?? 'none'}
                      options={SETTINGS_CLIP_GROUP_OPTIONS}
                      onChange={(next) => onUpdatePreferences({ clipboardGroupBy: next })}
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ================================================================
           * SECTION 4: PILL SHAPE, SCREEN LOCATION, SPRING CURVES & STEALTH HIDE
           * ============================================================== */}
          {section === 'island_geometry' && (
            <div className="space-y-6">
              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">Dynamic Island Outer Silhouette</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Keep classic Dynamic Island Pill or switch to Top-Bezel Ledge, Squircle, Minimalist Bar, or Permanent Dual Split.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(
                    [
                      {
                        id: LedgeShapeStyle.DynamicPill,
                        name: 'Dynamic Island Pill',
                        desc: 'Floating 360° rounded Apple capsule (Recommended)',
                      },
                      {
                        id: LedgeShapeStyle.TopBezelLedge,
                        name: 'Top-Bezel Ledge',
                        desc: 'Flush hardware notch with concave meniscus ears',
                      },
                      {
                        id: LedgeShapeStyle.SuperellipseSquircle,
                        name: 'Continuous Squircle',
                        desc: 'Sculpted iOS superellipse corner curvature',
                      },
                      {
                        id: LedgeShapeStyle.MinimalistBar,
                        name: 'Minimalist Razor Pill',
                        desc: 'Ultra-slim 28px panoramic status strip',
                      },
                      {
                        id: LedgeShapeStyle.SplitDualCapsule,
                        name: 'Permanent Dual Split',
                        desc: 'Always detaches a companion status droplet',
                      },
                    ] as const
                  ).map((sh) => {
                    const selected = preferences.shapeStyle === sh.id;
                    return (
                      <button
                        key={sh.id}
                        type="button"
                        onClick={() => {
                          playTactilePop('tab');
                          onUpdatePreferences({
                            shapeStyle: sh.id,
                            isFloatingPill: sh.id !== LedgeShapeStyle.TopBezelLedge,
                          });
                        }}
                        style={selected ? { borderColor: palette.primaryHex } : undefined}
                        className={`p-3 rounded-xl border text-left transition-colors flex flex-col justify-between gap-2 ${
                          selected
                            ? 'bg-white/[0.09] text-white shadow-lg'
                            : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="w-full flex items-center justify-between">
                          <div className="text-xs font-semibold">{sh.name}</div>
                          {/* Miniature Visual Shape Representation */}
                          <div className="h-5 flex items-center justify-center shrink-0">
                            {sh.id === LedgeShapeStyle.DynamicPill && (
                              <div className="w-12 h-3.5 rounded-full bg-slate-800 border border-white/30" />
                            )}
                            {sh.id === LedgeShapeStyle.TopBezelLedge && (
                              <div className="w-12 h-3 rounded-b-md bg-slate-800 border-x border-b border-white/30" />
                            )}
                            {sh.id === LedgeShapeStyle.SuperellipseSquircle && (
                              <div className="w-10 h-4 rounded-[6px] bg-slate-800 border border-white/30" />
                            )}
                            {sh.id === LedgeShapeStyle.MinimalistBar && (
                              <div className="w-14 h-2 rounded-[2px] bg-slate-800 border border-cyan-400/60 relative overflow-hidden">
                                <span className="absolute top-0 left-0 right-0 h-[1px] bg-cyan-300" />
                              </div>
                            )}
                            {sh.id === LedgeShapeStyle.SplitDualCapsule && (
                              <div className="flex items-center gap-1.5">
                                <div className="w-8 h-3.5 rounded-full bg-slate-800 border border-white/30" />
                                <div className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-white/30" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-400 leading-snug">
                          {sh.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-white">
                  Screen Anchor Location, Material &amp; Spring Physics
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: LedgeAnchorPosition.TopCenter, label: 'Top Center' },
                      { id: LedgeAnchorPosition.TopLeft, label: 'Top Left' },
                      { id: LedgeAnchorPosition.TopRight, label: 'Top Right' },
                      { id: LedgeAnchorPosition.BottomTaskbar, label: 'Bottom Taskbar' },
                    ] as const
                  ).map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => {
                        playTactilePop('tab');
                        onUpdatePreferences({ anchorPosition: pos.id });
                      }}
                      style={
                        preferences.anchorPosition === pos.id
                          ? { backgroundColor: palette.primaryHex }
                          : undefined
                      }
                      className={`py-2 px-3 rounded-xl border text-xs font-medium transition-colors ${
                        preferences.anchorPosition === pos.id
                          ? `${palette.onPrimaryTextClass} border-transparent font-semibold`
                          : 'bg-white/[0.03] border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="text-xs font-medium text-slate-300 mb-1.5">Material Finish</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { id: AppearanceMaterial.Obsidian, label: 'Obsidian' },
                          { id: AppearanceMaterial.LiquidGlass, label: 'Liquid Glass' },
                          { id: AppearanceMaterial.FrostedGraphite, label: 'Graphite' },
                        ] as const
                      ).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => onUpdatePreferences({ material: m.id })}
                          style={
                            preferences.material === m.id
                              ? { borderColor: palette.primaryHex }
                              : undefined
                          }
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                            preferences.material === m.id
                              ? 'bg-white/12 text-white'
                              : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="block">
                    <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                      <span>Floating Edge Margin</span>
                      <span className="font-mono tabular-nums" style={{ color: palette.primaryHex }}>
                        {preferences.floatingOffsetPx} px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={28}
                      value={preferences.floatingOffsetPx}
                      onChange={(e) =>
                        onUpdatePreferences({ floatingOffsetPx: Number(e.target.value) })
                      }
                      className="w-full h-1.5 accent-cyan-400 bg-white/15 rounded-full cursor-pointer"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                  <span className="text-xs text-slate-400 mr-1">Outer Scale:</span>
                  {(
                    [
                      { id: LedgeSizeScale.Small, label: 'Small' },
                      { id: LedgeSizeScale.Medium, label: 'Medium' },
                      { id: LedgeSizeScale.Large, label: 'Large' },
                    ] as const
                  ).map((sz) => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => onUpdatePreferences({ sizeScale: sz.id })}
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        preferences.sizeScale === sz.id
                          ? 'bg-white/20 text-white'
                          : 'bg-white/[0.04] text-slate-400 hover:text-white'
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}

                  <span className="text-xs text-slate-400 ml-3 mr-1">Spring:</span>
                  {(
                    [
                      { id: SpringPresetId.LiquidSilk, label: 'Liquid Silk' },
                      { id: SpringPresetId.ElasticDrop, label: 'Elastic' },
                      { id: SpringPresetId.Snappy, label: 'Snappy' },
                      { id: SpringPresetId.Calm, label: 'Calm' },
                    ] as const
                  ).map((sp) => (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() =>
                        onUpdatePreferences({
                          springPreset: sp.id,
                          customSpring: { ...SPRING_PRESETS[sp.id] },
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        preferences.springPreset === sp.id
                          ? 'bg-white/20 text-white'
                          : 'bg-white/[0.04] text-slate-400 hover:text-white'
                      }`}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Stealth Edge-Touch Hide */}
              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <EyeOff className="w-4 h-4" style={{ color: palette.primaryHex }} />
                      <span>Stealth Auto-Hide (Screen-Edge Touch or Shortcut Reveal)</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Hides the pill completely off-screen until your cursor touches the monitor edge or you press your global shortcut.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    aria-label="Hide Pill until edge touch or keyboard shortcut"
                    checked={preferences.stealthAutoHide}
                    onChange={(e) => {
                      playTactilePop(e.target.checked ? 'toggleOn' : 'toggleOff');
                      onUpdatePreferences({ stealthAutoHide: e.target.checked });
                    }}
                    className="w-5 h-5 rounded accent-cyan-400 shrink-0 mt-0.5"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-white">Reveal on Screen-Edge Touch</div>
                      <div className="text-[11px] text-slate-400">
                        Glide cursor to top/bottom bezel to summon
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.revealOnEdgeTouch}
                      onChange={(e) =>
                        onUpdatePreferences({ revealOnEdgeTouch: e.target.checked })
                      }
                      className="w-4 h-4 rounded accent-cyan-400 shrink-0 ml-2"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-white">Auto-Close Settings on Mouse Leave</div>
                      <div className="text-[11px] text-slate-400">
                        Dismiss settings window automatically when cursor exits
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.closeSettingsOnMouseLeave ?? true}
                      onChange={(e) =>
                        onUpdatePreferences({ closeSettingsOnMouseLeave: e.target.checked })
                      }
                      className="w-4 h-4 rounded accent-cyan-400 shrink-0 ml-2"
                    />
                  </label>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <div>
                      <div className="text-xs font-medium text-white flex items-center gap-1.5">
                        <Keyboard className="w-3.5 h-3.5" style={{ color: palette.primaryHex }} />
                        <span>Island Summon Shortcut</span>
                      </div>
                      <div className="text-[11px] text-slate-400">Expand / collapse pill</div>
                    </div>
                    <button
                      type="button"
                      onKeyDown={(e) =>
                        recordingShortcut &&
                        recordKeyCombo(e, 'toggleShortcut', () => setRecordingShortcut(false))
                      }
                      onClick={() => {
                        setRecordingAgentShortcut(false);
                        setRecordingShortcut((v) => !v);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors ${
                        recordingShortcut
                          ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                          : 'bg-black/50 border-white/15 text-white hover:border-white/40'
                      }`}
                    >
                      {recordingShortcut ? 'Press keys...' : preferences.toggleShortcut}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <div>
                      <div className="text-xs font-medium text-white flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5" style={{ color: palette.primaryHex }} />
                        <span>Windows Voice Agent Shortcut</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Siri / Assistant toggle for Wi-Fi, Volume &amp; Search
                      </div>
                    </div>
                    <button
                      type="button"
                      onKeyDown={(e) =>
                        recordingAgentShortcut &&
                        recordKeyCombo(e, 'voiceAgentShortcut', () =>
                          setRecordingAgentShortcut(false)
                        )
                      }
                      onClick={() => {
                        setRecordingShortcut(false);
                        setRecordingAgentShortcut((v) => !v);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors ${
                        recordingAgentShortcut
                          ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                          : 'bg-black/50 border-white/15 text-white hover:border-white/40'
                      }`}
                    >
                      {recordingAgentShortcut ? 'Press keys...' : preferences.voiceAgentShortcut}
                    </button>
                  </div>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer">
                    <div>
                      <div className="text-xs font-medium text-white">
                        Voice Agent Spoken Replies
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Reads assistant confirmations aloud via Gemini TTS
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.voiceAgentSpeakReplies}
                      onChange={(e) =>
                        onUpdatePreferences({ voiceAgentSpeakReplies: e.target.checked })
                      }
                      className="w-4 h-4 rounded accent-cyan-400"
                    />
                  </label>
                </div>

                {/* Cursor Reveal Area Geometry & Bezel Radar (Configurable Length & Height Limits) */}
                {preferences.revealOnEdgeTouch && (
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-2">
                          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Screen-Edge Reveal Trigger Zone (Cursor Hit Bounds)</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Controls the horizontal length and edge depth required to reveal the Pill. Tight limits prevent accidental triggers when using browser tabs.
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          {preferences.revealAreaWidth ?? 140}px × {preferences.revealAreaHeight ?? 4}px
                        </span>
                      </div>
                    </div>

                    {/* Interactive Monitor Bezel Radar Preview */}
                    <div className="relative h-20 w-full rounded-xl bg-gradient-to-b from-[#0c0f17] to-[#07090e] border border-white/10 overflow-hidden flex flex-col items-center">
                      <div className="w-full h-3 bg-slate-900/90 border-b border-white/10 flex items-center justify-center">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Top Monitor Bezel</span>
                      </div>
                      <div className="flex-1 w-full relative flex items-start justify-center">
                        {/* Dynamic Radar Trigger Zone */}
                        <div
                          style={{
                            width: `${Math.min(100, Math.max(12, ((preferences.revealAreaWidth ?? 140) / 400) * 100))}%`,
                            height: `${Math.min(32, Math.max(6, (preferences.revealAreaHeight ?? 4) * 3))}px`,
                            borderColor: palette.primaryHex,
                            boxShadow: `0 0 16px ${palette.primaryHex}50`,
                          }}
                          className="border-b-2 border-x-2 rounded-b-lg bg-cyan-500/15 flex items-center justify-center transition-all duration-150"
                        >
                          <span className="text-[9px] font-mono font-medium text-cyan-200">
                            {preferences.revealAreaWidth ?? 140}px Reveal Zone
                          </span>
                        </div>
                        <div className="absolute top-1 right-3 text-[10px] text-slate-500 font-mono">
                          Height Limit: {preferences.revealAreaHeight ?? 4}px
                        </div>
                      </div>
                    </div>

                    {/* Dual Sliders: Length Limit & Height Limit */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Length / Width Limit Slider */}
                      <div className="space-y-2 p-3 rounded-xl bg-black/20 border border-white/5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-white flex items-center gap-1.5">
                            <span>Reveal Trigger Length Limit</span>
                          </label>
                          <span className="text-xs font-mono font-bold text-cyan-400">
                            {preferences.revealAreaWidth ?? 140}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={50}
                          max={380}
                          step={5}
                          value={preferences.revealAreaWidth ?? 140}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            onUpdatePreferences({ revealAreaWidth: val });
                          }}
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                        <div className="flex items-center justify-between gap-1 pt-1">
                          {[
                            { label: 'Ultra (80px)', val: 80 },
                            { label: 'Compact (140px)', val: 140 },
                            { label: 'Medium (220px)', val: 220 },
                            { label: 'Wide (320px)', val: 320 },
                          ].map((preset) => (
                            <button
                              key={preset.val}
                              type="button"
                              onClick={() => onUpdatePreferences({ revealAreaWidth: preset.val })}
                              className={`px-2 py-0.5 text-[10px] rounded-lg border font-mono transition-all ${
                                (preferences.revealAreaWidth ?? 140) === preset.val
                                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold'
                                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Height Limit (Edge Distance) Slider */}
                      <div className="space-y-2 p-3 rounded-xl bg-black/20 border border-white/5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-white flex items-center gap-1.5">
                            <span>Edge Depth / Height Limit</span>
                          </label>
                          <span className="text-xs font-mono font-bold text-cyan-400">
                            {preferences.revealAreaHeight ?? 4}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={16}
                          step={1}
                          value={preferences.revealAreaHeight ?? 4}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            onUpdatePreferences({ revealAreaHeight: val });
                          }}
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                        <div className="flex items-center justify-between gap-1 pt-1">
                          {[
                            { label: 'Razor (2px)', val: 2 },
                            { label: 'Subtle (4px)', val: 4 },
                            { label: 'Standard (8px)', val: 8 },
                            { label: 'Deep (12px)', val: 12 },
                          ].map((preset) => (
                            <button
                              key={preset.val}
                              type="button"
                              onClick={() => onUpdatePreferences({ revealAreaHeight: preset.val })}
                              className={`px-2 py-0.5 text-[10px] rounded-lg border font-mono transition-all ${
                                (preferences.revealAreaHeight ?? 4) === preset.val
                                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold'
                                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ================================================================
           * SECTION 5: EDGE LIGHTING & PLEASANT ACOUSTIC SOUNDSCAPES
           * ============================================================== */}
          {section === 'edge_sounds' && (
            <div className="space-y-6">
              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4" style={{ color: palette.primaryHex }} />
                      <span>Perimeter Edge Lighting Profiles</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Optical rim glow around the Dynamic Island silhouette.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.featureFlags.edgeLighting}
                    onChange={() => toggleFeatureFlag('edgeLighting')}
                    className="w-5 h-5 rounded accent-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(
                    [
                      { id: 'album_adaptive', name: 'Theme / Album Adaptive', preview: 'from-cyan-400 via-sky-400 to-indigo-500' },
                      { id: 'apple_aura', name: 'Iridescent Fluid Aura', preview: 'from-sky-400 via-fuchsia-400 to-amber-300' },
                      { id: 'northern_aurora', name: 'Northern Aurora', preview: 'from-emerald-400 via-teal-400 to-cyan-400' },
                      { id: 'solar_amber', name: 'Solar Tungsten Gold', preview: 'from-amber-300 via-orange-400 to-rose-400' },
                      { id: 'glacial_ice', name: 'Glacial Silver-Blue', preview: 'from-slate-200 via-sky-300 to-blue-500' },
                      { id: 'crimson_pulse', name: 'Deep Ruby Focus', preview: 'from-rose-400 via-red-500 to-orange-500' },
                      { id: 'off', name: 'No Edge Glow', preview: 'from-slate-800 to-slate-900' },
                    ] as { id: EdgeLightProfile; name: string; preview: string }[]
                  ).map((prof) => {
                    const selected = preferences.edgeLightProfile === prof.id;
                    return (
                      <button
                        key={prof.id}
                        type="button"
                        onClick={() => {
                          playTactilePop('tab');
                          onUpdatePreferences({
                            edgeLightProfile: prof.id,
                            featureFlags: {
                              ...preferences.featureFlags,
                              edgeLighting: prof.id !== 'off',
                            },
                          });
                        }}
                        style={selected ? { borderColor: palette.primaryHex } : undefined}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-colors ${
                          selected
                            ? 'bg-white/10 text-white'
                            : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className="text-xs font-semibold">{prof.name}</span>
                        <span className={`w-14 h-3.5 rounded-full bg-gradient-to-r ${prof.preview}`} />
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Pleasant Acoustic Soundscape Profiles
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Gentle low-pass-filtered acoustic articulations with distinct notes per action.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(
                    [
                      { id: 'wooden_marimba', name: 'Warm Rosewood Marimba', desc: 'Soft muted woodblock harmonics (Default)' },
                      { id: 'velvet_droplet', name: 'Velvet Water Droplet', desc: 'Deep liquid meniscus ripple' },
                      { id: 'brushed_glass', name: 'Brushed Crystal Fifths', desc: 'Airy musical fifth interval' },
                      { id: 'taptic_thump', name: 'Taptic Micro-Impulse', desc: 'Sub-bass physical thump' },
                      { id: 'cyber_synth', name: 'Cyberpunk Neon Synth', desc: 'Crisp sci-fi FM harmonic blip' },
                      { id: 'retro_cassette', name: 'Retro Cassette Latch', desc: 'Warm 80s analog tape-deck click' },
                      { id: 'mechanical_gt', name: 'Motorsport GT Paddle', desc: 'Precision carbon paddle-shift detent' },
                      { id: 'zen_garden', name: 'Botanical & Paper Chime', desc: 'Soft bamboo & sumi-ink bell harmonic' },
                      { id: 'naruto_shinobi', name: 'Shinobi Jutsu Acoustic', desc: 'Rasengan chakra spin whistle, Chidori snap, Sharingan ocular chime' },
                      { id: 'silent', name: 'Silent (Muted)', desc: 'Disables all sound effects' },
                    ] as { id: SoundProfileId; name: string; desc: string }[]
                  ).map((snd) => {
                    const selected = preferences.soundProfile === snd.id;
                    return (
                      <button
                        key={snd.id}
                        type="button"
                        onClick={() => {
                          onUpdatePreferences({ soundProfile: snd.id });
                          if (snd.id !== 'silent') playTactilePop('expand', snd.id);
                        }}
                        style={selected ? { borderColor: palette.primaryHex } : undefined}
                        className={`p-3 rounded-xl border text-left transition-colors ${
                          selected
                            ? 'bg-white/10 text-white'
                            : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="text-xs font-semibold">{snd.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{snd.desc}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                  <span className="text-xs text-slate-400 mr-1">Audition Cues:</span>
                  {(
                    [
                      { k: 'expand', label: 'Expand' },
                      { k: 'collapse', label: 'Collapse' },
                      { k: 'tab', label: 'Tab Tap' },
                      { k: 'toggleOn', label: 'Toggle On' },
                      { k: 'drop', label: 'File Drop' },
                      { k: 'confirm', label: 'Confirm' },
                    ] as { k: SoundActionKind; label: string }[]
                  ).map((cue) => (
                    <button
                      key={cue.k}
                      type="button"
                      onClick={() => playTactilePop(cue.k, preferences.soundProfile)}
                      className="px-2.5 py-1 text-xs bg-white/8 hover:bg-white/15 text-slate-200 rounded-lg"
                    >
                      ▶ {cue.label}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ================================================================
           * SECTION 6: ASTRA (అస్త్రం) ORB, VOICE MODES & AI REASONING
           * ============================================================== */}
          {section === 'ai_astra' && (
            <div className="space-y-6">
              {/* Astra (అస్త్రం / Astram) In-Pill Morphing 3D Siri Orb & Master AI Control */}
              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <AstraSiriOrbCanvas size={48} state="listening" audioLevel={0.42} />
                    <div>
                      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4" style={{ color: palette.primaryHex }} />
                        <span>Astra (అస్త్రం / Astram) — In-Pill Siri Sphere &amp; Master AI Switch</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Morphs the existing Pill directly into Astra (never spawns a duplicate window), with 60fps 3D silk-ribbon sphere, &ldquo;Astra&rdquo; wake word, Assist, and Notedown.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer shrink-0">
                    <span className="text-xs font-semibold text-slate-200">
                      {preferences.aiEnabled ? 'AI Enabled' : 'AI Disabled'}
                    </span>
                    <input
                      type="checkbox"
                      aria-label="Master enable Search, AI, Assist, Notedown and Astra agent"
                      checked={preferences.aiEnabled}
                      onChange={(e) => {
                        playTactilePop(e.target.checked ? 'toggleOn' : 'toggleOff');
                        onUpdatePreferences({ aiEnabled: e.target.checked });
                      }}
                      className="w-5 h-5 rounded accent-cyan-400"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
                  {(
                    [
                      {
                        id: 'orb_only',
                        title: 'Compact Big Orb Only',
                        desc: 'Big 52px glowing 3D Siri sphere. Tap to wake/speak, long-press to open chat. Zero clutter.',
                      },
                      {
                        id: 'orb_with_captions',
                        title: 'Astra with Live Captions',
                        desc: 'Compact orb on the left with live streaming subtitles matching our pill design language.',
                      },
                      {
                        id: 'orb_with_chat',
                        title: 'Expanded Chat Studio',
                        desc: 'Full in-pill assistant with prompt bar, web-grounded Markdown answers, and quick action chips.',
                      },
                    ] as { id: AstraDisplayMode; title: string; desc: string }[]
                  ).map((m) => {
                    const active = (preferences.astraMode ?? 'orb_with_chat') === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={!preferences.aiEnabled}
                        onClick={() => {
                          playTactilePop('tab');
                          onUpdatePreferences({ astraMode: m.id });
                        }}
                        style={active ? { borderColor: palette.primaryHex } : undefined}
                        className={`p-3.5 rounded-xl border text-left transition-colors disabled:opacity-40 ${
                          active
                            ? 'bg-white/[0.09] text-white'
                            : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="text-xs font-semibold">{m.title}</div>
                        <div className="text-[11px] text-slate-400 mt-1 leading-snug">{m.desc}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer">
                    <div>
                      <div className="text-xs font-semibold text-white">
                        Wake Word: &ldquo;Astra&rdquo; / &ldquo;Astram&rdquo; (అస్త్రం)
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Say &ldquo;Astra&rdquo; or &ldquo;Hey Astram&rdquo; aloud to morph the Pill hands-free
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      disabled={!preferences.aiEnabled}
                      checked={preferences.astraWakeWordEnabled}
                      onChange={(e) =>
                        onUpdatePreferences({ astraWakeWordEnabled: e.target.checked })
                      }
                      className="w-4 h-4 rounded accent-cyan-400 disabled:opacity-40"
                    />
                  </label>

                  <div className="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-400/20 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-emerald-200">
                        Managed Server-Side Secret Integration
                      </div>
                      <div className="text-[11px] text-slate-300/90 leading-snug mt-0.5">
                        All Gemini calls route securely via <span className="font-mono">/api/ai/*</span> using your attached key in <strong>Settings &gt; Secrets</strong>, while Windows NativeAOT uses DPAPI (<span className="font-mono">AstraOrbAndVaultService.cs</span>).
                      </div>
                    </div>
                  </div>
                </div>

                {/* 30 Live Animated Siri Orb, Naruto Shinobi, F1 HUD & Cosmos Avatars */}
                <div className="pt-2 border-t border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-semibold text-white flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>3D Siri Spheres, Naruto Shinobi Jutsu, F1 HUD &amp; Cosmos Pack</span>
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Real-time 60fps canvas shaders with transparent floating alpha and acoustic mic reactivity
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400 capitalize bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                      Active: {String(preferences.astraOrbStyle || 'siri_rainbow').replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {(
                      [
                        { id: 'all', label: 'All Avatars (30)', icon: '✨' },
                        { id: 'naruto', label: 'Naruto Shinobi (6)', icon: '🍥' },
                        { id: 'motorsport', label: 'F1 & Motorsport (7)', icon: '🏎️' },
                        { id: 'cosmos', label: 'Cosmos & Planets (5)', icon: '🪐' },
                        { id: 'style_kits', label: 'Theme Kits (7)', icon: '🎨' },
                        { id: 'siri_orbs', label: 'Siri Spheres (5)', icon: '🔮' },
                      ] as const
                    ).map((cat) => {
                      const active = astraCategoryFilter === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            playTactilePop('tab');
                            setAstraCategoryFilter(cat.id);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                            active
                              ? 'bg-cyan-500/20 border-cyan-400 text-white font-semibold shadow-sm'
                              : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Structured Astra Manifestations Grouped by Family */}
                  <div className="space-y-6 pt-1">
                    {(
                      [
                        {
                          id: 'naruto' as AstraCategory,
                          label: 'Shinobi Jutsu & Dojutsu',
                          icon: '🍥',
                          desc: 'Swirling high-velocity chakra spirals, iconic Dojutsu oculary seals, ethereal Susanoo armor, and Akatsuki crimson clouds.',
                          accent: '#ef4444',
                        },
                        {
                          id: 'motorsport' as AstraCategory,
                          label: 'Formula 1 & Motorsport GT',
                          icon: '🏎️',
                          desc: 'High-rev telemetry rev-match tachometer and authentic official Pirelli compound tyre specifications (Soft, Medium, Hard, Inter, Wet).',
                          accent: '#f59e0b',
                        },
                        {
                          id: 'cosmos' as AstraCategory,
                          label: 'Celestial Planetary Cosmos',
                          icon: '🪐',
                          desc: 'Thermonuclear solar prominence plasma loops, 3D rotating lunar basalt maria with craters, blue marble Earth, Mars, and galactic arms.',
                          accent: '#38bdf8',
                        },
                        {
                          id: 'style_kits' as AstraCategory,
                          label: 'Designer Theme Kits',
                          icon: '🎨',
                          desc: 'Cyberpunk HUDs, 80s CRT retro amber phosphor synths, Japanese sumi-e calligraphy, botanical sakura, and liquid silk.',
                          accent: '#ec4899',
                        },
                        {
                          id: 'siri_orbs' as AstraCategory,
                          label: 'Studio Siri Spheres & Shaders',
                          icon: '🔮',
                          desc: 'Apple Siri rainbow waves, fluid volumetric shaders, plasma arcing, and luminous electric neon aura.',
                          accent: '#a855f7',
                        },
                      ]
                    )
                      .filter((f) => astraCategoryFilter === 'all' || f.id === astraCategoryFilter)
                      .map((family) => {
                        const familyOrbs = ALL_ASTRA_ORB_DEFINITIONS.filter((o) => o.category === family.id);
                        return (
                          <div key={family.id} className="space-y-2.5">
                            {/* Family Section Header */}
                            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 shadow-sm">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-base select-none">{family.icon}</span>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-white flex items-center gap-2">
                                    <span>{family.label}</span>
                                    <span
                                      style={{ color: family.accent, backgroundColor: `${family.accent}18`, borderColor: `${family.accent}40` }}
                                      className="text-[9px] font-mono px-2 py-0.5 rounded-full font-semibold border"
                                    >
                                      {familyOrbs.length} Avatars
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate max-w-xl">
                                    {family.desc}
                                  </div>
                                </div>
                              </div>
                              <span
                                style={{ backgroundColor: family.accent }}
                                className="w-2 h-2 rounded-full shrink-0 shadow-sm opacity-80"
                              />
                            </div>

                            {/* Family Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                              {familyOrbs.map((orb) => {
                                const isSel = (preferences.astraOrbStyle || 'siri_rainbow') === orb.id;
                                return (
                                  <button
                                    key={orb.id}
                                    type="button"
                                    onClick={() => {
                                      playTactilePop('tab');
                                      onUpdatePreferences({ astraOrbStyle: orb.id });
                                    }}
                                    style={isSel ? { borderColor: orb.hex, backgroundColor: `${orb.hex}18` } : undefined}
                                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 relative ${
                                      isSel
                                        ? 'border-cyan-400 text-white shadow-lg ring-1 ring-cyan-400/40'
                                        : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]'
                                    }`}
                                  >
                                    <div className="shrink-0 flex items-center justify-center w-11 h-11">
                                      <AstraSiriOrbCanvas
                                        size={42}
                                        state="listening"
                                        audioLevel={0.46}
                                        style={orb.id}
                                        lowPowerEco={preferences.featureFlags.lowRamEcoMode}
                                      />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="text-xs font-semibold truncate flex items-center gap-1.5">
                                          <span style={{ backgroundColor: orb.hex }} className="w-2 h-2 rounded-full shrink-0" />
                                          <span className="truncate">{orb.name}</span>
                                        </span>
                                        {orb.tag && (
                                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 shrink-0">
                                            {orb.tag}
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[10.5px] text-slate-400 leading-tight mt-1 line-clamp-2">
                                        {orb.desc}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </section>

              {/* OS-Level Screen-Capture Privacy Masking (SetWindowDisplayAffinity WDA_EXCLUDEFROMCAPTURE) */}
              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-emerald-300" />
                      <span>OS-Level Screen-Capture Privacy Masking (Video Calls &amp; Screen Share)</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Applies Win32 <span className="font-mono text-slate-300">SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE)</span> in DWM so Zoom, Teams, Google Meet, Discord, and OBS never capture private Pill views (Assist, Notedown, Clipboard, or Astra).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playTactilePop('tab');
                      onUpdatePreferences({
                        privacySimulateCaptureView: !preferences.privacySimulateCaptureView,
                      });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 transition-colors ${
                      preferences.privacySimulateCaptureView
                        ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                        : 'bg-white/[0.07] hover:bg-white/14 border-white/15 text-slate-200'
                    }`}
                  >
                    {preferences.privacySimulateCaptureView
                      ? 'Exit Caller Screen-Share Preview'
                      : 'Test Caller Screen-Share View'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer">
                    <div>
                      <div className="text-xs font-semibold text-white">Enable OS Capture Mask</div>
                      <div className="text-[11px] text-slate-400">
                        Cloaks Pill from remote screen-share viewers
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.privacyMaskEnabled}
                      onChange={(e) =>
                        onUpdatePreferences({ privacyMaskEnabled: e.target.checked })
                      }
                      className="w-4 h-4 rounded accent-emerald-400 shrink-0"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer">
                    <div>
                      <div className="text-xs font-semibold text-white">Public Compact HUD Passthrough</div>
                      <div className="text-[11px] text-slate-400">
                        Allow callers to see collapsed Now Playing / Timer capsule while cloaking expanded Assist &amp; Notes
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      disabled={!preferences.privacyMaskEnabled}
                      checked={preferences.privacyPublicPassthroughHud}
                      onChange={(e) =>
                        onUpdatePreferences({
                          privacyPublicPassthroughHud: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded accent-emerald-400 shrink-0 disabled:opacity-40"
                    />
                  </label>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-2">
                    <div className="text-xs font-semibold text-white">Animated Battery States</div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <AnimatedBatterySymbol
                          percent={78}
                          isCharging
                          modeOverride="charging"
                          accentHex={palette.primaryHex}
                          size="sm"
                        />
                        <AnimatedBatterySymbol
                          percent={64}
                          isCharging={false}
                          modeOverride="discharging"
                          accentHex={palette.primaryHex}
                          size="sm"
                        />
                        <AnimatedBatterySymbol
                          percent={100}
                          isCharging
                          modeOverride="idle_full"
                          accentHex={palette.primaryHex}
                          size="sm"
                        />
                        <AnimatedBatterySymbol
                          percent={14}
                          isCharging={false}
                          modeOverride="low"
                          accentHex={palette.primaryHex}
                          size="sm"
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">Chg · Drn · Idle · Low</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Assist (Search & AI) & Notedown (Notes) Customization */}
              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Assist (Active Question &amp; Code Listener) &amp; Notedown (Voice-to-Markdown)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure how Assist answers spoken technical questions in Search &amp; AI and how Notedown structures transcripts in Notes.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <label className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer">
                    <div>
                      <div className="font-semibold text-white">Assist Auto-Answer on Pause</div>
                      <div className="text-[11px] text-slate-400">
                        Automatically solve heard questions after 1.2s silence
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      disabled={!preferences.aiEnabled}
                      checked={preferences.assistAutoAnswer}
                      onChange={(e) =>
                        onUpdatePreferences({ assistAutoAnswer: e.target.checked })
                      }
                      className="w-4 h-4 rounded accent-cyan-400 shrink-0 disabled:opacity-40"
                    />
                  </label>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                    <span className="font-semibold text-white block">Assist Code Language</span>
                    <CustomPopdown
                      ariaLabel="Default Assist code solution language"
                      fullWidth
                      size="md"
                      disabled={!preferences.aiEnabled}
                      accentHex={palette.primaryHex}
                      value={preferences.assistCodeLanguage || 'auto'}
                      options={SETTINGS_ASSIST_LANG_OPTIONS}
                      onChange={(lang) => onUpdatePreferences({ assistCodeLanguage: lang })}
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                    <span className="font-semibold text-white block">Notedown Markdown Style</span>
                    <CustomPopdown
                      ariaLabel="Default Notedown Markdown summary style"
                      fullWidth
                      size="md"
                      disabled={!preferences.aiEnabled}
                      accentHex={palette.primaryHex}
                      value={preferences.notedownFormat ?? 'structured_md'}
                      options={SETTINGS_NOTEDOWN_OPTIONS}
                      onChange={(fmt) => onUpdatePreferences({ notedownFormat: fmt })}
                    />
                  </div>
                </div>
              </section>

              {/* Customizable Home Hub Widgets, Multi-Size (S/M/L/V) & Default Lyrics */}
              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Home Playground Widgets &amp; Dynamic Sizes (S / M / L / V)
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Set Small (1×1), Medium (2×1), Large (2×2), or Vertical (1×2) for any widget — or drag and resize live via &ldquo;Edit Home&rdquo;.
                    </p>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-200 bg-white/[0.05] px-3 py-1.5 rounded-xl cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={preferences.musicLyricsVisible}
                      onChange={(e) =>
                        onUpdatePreferences({ musicLyricsVisible: e.target.checked })
                      }
                      className="rounded accent-cyan-400"
                    />
                    <span>Music Lyrics On by Default</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {HOME_WIDGET_CATALOG.map((w) => {
                    const idx = preferences.homeWidgets.indexOf(w.id);
                    const included = idx !== -1;
                    const activeSize: WidgetSizeVariant =
                      preferences.widgetSizes?.[w.id] ?? w.defaultSize;
                    return (
                      <div
                        key={w.id}
                        style={included ? { borderColor: `${palette.primaryHex}55` } : undefined}
                        className={`flex flex-col gap-2 p-3 rounded-xl border ${
                          included
                            ? 'bg-white/[0.05] text-white'
                            : 'bg-white/[0.015] border-white/8 text-slate-500'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <label className="flex items-start gap-2.5 min-w-0 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={included}
                              onChange={() => toggleHomeWidgetIncluded(w.id)}
                              className="w-4 h-4 rounded accent-cyan-400 mt-0.5 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold truncate">{w.label}</div>
                              <div className="text-[11px] text-slate-400 truncate">{w.desc}</div>
                            </div>
                          </label>

                          {included && (
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] font-mono text-slate-400 mr-0.5 tabular-nums">
                                #{idx + 1}
                              </span>
                              <button
                                type="button"
                                disabled={idx === 0}
                                aria-label={`Move ${w.label} up`}
                                onClick={() =>
                                  onUpdatePreferences({
                                    homeWidgets: moveOrderedItem(
                                      preferences.homeWidgets,
                                      idx,
                                      -1
                                    ),
                                  })
                                }
                                className="p-1 rounded bg-white/8 hover:bg-white/15 disabled:opacity-25"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === preferences.homeWidgets.length - 1}
                                aria-label={`Move ${w.label} down`}
                                onClick={() =>
                                  onUpdatePreferences({
                                    homeWidgets: moveOrderedItem(
                                      preferences.homeWidgets,
                                      idx,
                                      1
                                    ),
                                  })
                                }
                                className="p-1 rounded bg-white/8 hover:bg-white/15 disabled:opacity-25"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {included && (
                          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/10">
                            <span className="text-[10px] text-slate-400">Widget Size:</span>
                            <div className="flex items-center gap-1">
                              {(
                                [
                                  { id: 'small', label: 'Small 1×1' },
                                  { id: 'medium', label: 'Medium 2×1' },
                                  { id: 'large', label: 'Large 2×2' },
                                  { id: 'vertical', label: 'Vert 1×2' },
                                ] as { id: WidgetSizeVariant; label: string }[]
                              ).map((sz) => {
                                const selected = activeSize === sz.id;
                                return (
                                  <button
                                    key={sz.id}
                                    type="button"
                                    onClick={() =>
                                      onUpdatePreferences({
                                        widgetSizes: {
                                          ...preferences.widgetSizes,
                                          [w.id]: sz.id,
                                        },
                                      })
                                    }
                                    style={
                                      selected ? { backgroundColor: palette.primaryHex } : undefined
                                    }
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                                      selected
                                        ? palette.onPrimaryTextClass
                                        : 'bg-white/8 hover:bg-white/15 text-slate-300'
                                    }`}
                                  >
                                    {sz.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {/* ================================================================
           * SECTION 7: APP TABS MANAGER & CUSTOM TAB WORKSPACES
           * ============================================================== */}
          {section === 'tabs_manager' && (
            <div className="space-y-6">
              {/* Built-in Tab Order, Visibility & Inline Tab Renaming */}
              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Customize Tab Order, Visibility &amp; Custom Tab Names
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Rename any tab directly (e.g. &ldquo;Search &amp; AI&rdquo;), reorder tabs, or hide unused sections.
                  </p>
                </div>

                <div className="space-y-1.5">
                  {preferences.tabOrder.map((tabId, index) => {
                    const meta = TAB_TITLES[tabId];
                    const isEnabled = preferences.enabledTabs[tabId];
                    const currentLabel = preferences.customTabNames?.[tabId] ?? '';
                    return (
                      <div
                        key={tabId}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl border transition-colors ${
                          isEnabled
                            ? 'bg-white/[0.04] border-white/10 text-white'
                            : 'bg-white/[0.015] border-white/5 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-xs font-mono text-slate-500 w-5 tabular-nums">
                            0{index + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate">{meta.title}</div>
                            <div className="text-[11px] text-slate-400 truncate">{meta.desc}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="text"
                            aria-label={`Custom tab label for ${meta.title}`}
                            placeholder={meta.defaultLabel}
                            value={currentLabel}
                            onChange={(e) =>
                              onUpdatePreferences({
                                customTabNames: {
                                  ...(preferences.customTabNames ?? {}),
                                  [tabId]: e.target.value,
                                },
                              })
                            }
                            className="w-28 bg-black/40 border border-white/15 rounded-lg px-2 py-1 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                          />
                          <button
                            type="button"
                            disabled={index === 0}
                            aria-label={`Move ${meta.title} up`}
                            onClick={() => {
                              playTactilePop('tab');
                              onUpdatePreferences({
                                tabOrder: moveOrderedItem(preferences.tabOrder, index, -1),
                              });
                            }}
                            className="p-1.5 rounded-lg bg-white/8 hover:bg-white/15 disabled:opacity-25 text-slate-200"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === preferences.tabOrder.length - 1}
                            aria-label={`Move ${meta.title} down`}
                            onClick={() => {
                              playTactilePop('tab');
                              onUpdatePreferences({
                                tabOrder: moveOrderedItem(preferences.tabOrder, index, 1),
                              });
                            }}
                            className="p-1.5 rounded-lg bg-white/8 hover:bg-white/15 disabled:opacity-25 text-slate-200"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <label className="ml-1 flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              aria-label={`Enable ${meta.title} tab`}
                              onChange={() => toggleTabEnabled(tabId)}
                              className="w-4 h-4 rounded accent-cyan-400"
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Extra Custom Widget Tabs (Apple Control Center Pages) */}
              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Extra Custom Widget Pages (Apple Control Center Multi-Page Style)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Create dedicated custom tabs in the Pill navigation bar populated with your own mix of resizable S / M / L / V widgets.
                  </p>
                </div>

                <form onSubmit={handleAddCustomWidgetTab} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCustomTabName}
                    onChange={(e) => setNewCustomTabName(e.target.value)}
                    placeholder="New page name (e.g. Focus Deck, Studio Vitals, Media+)..."
                    className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                  />
                  <button
                    type="submit"
                    style={{ backgroundColor: palette.primaryHex }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 ${palette.onPrimaryTextClass}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Tab</span>
                  </button>
                </form>

                {(preferences.customWidgetTabs ?? []).length > 0 && (
                  <div className="space-y-2.5">
                    {(preferences.customWidgetTabs ?? []).map((ct) => (
                      <div
                        key={ct.id}
                        className="p-3.5 rounded-xl bg-white/[0.04] border border-white/12 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={ct.name}
                            aria-label="Custom widget tab name"
                            onChange={(e) =>
                              onUpdatePreferences({
                                customWidgetTabs: (preferences.customWidgetTabs ?? []).map((item) =>
                                  item.id === ct.id ? { ...item, name: e.target.value } : item
                                ),
                              })
                            }
                            className="bg-black/40 border border-white/15 rounded-lg px-2.5 py-1 text-xs font-semibold text-white focus:outline-none focus:border-sky-400"
                          />
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={ct.enabled}
                                onChange={(e) =>
                                  onUpdatePreferences({
                                    customWidgetTabs: (preferences.customWidgetTabs ?? []).map(
                                      (item) =>
                                        item.id === ct.id
                                          ? { ...item, enabled: e.target.checked }
                                          : item
                                    ),
                                  })
                                }
                                className="w-4 h-4 rounded accent-cyan-400"
                              />
                              <span>Visible</span>
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdatePreferences({
                                  customWidgetTabs: (preferences.customWidgetTabs ?? []).filter(
                                    (item) => item.id !== ct.id
                                  ),
                                })
                              }
                              aria-label={`Delete custom tab ${ct.name}`}
                              className="p-1.5 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-500/30"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {HOME_WIDGET_CATALOG.map((w) => {
                            const hasW = ct.widgets.includes(w.id);
                            return (
                              <button
                                key={w.id}
                                type="button"
                                onClick={() => {
                                  const nextW = hasW
                                    ? ct.widgets.filter((id) => id !== w.id)
                                    : [...ct.widgets, w.id];
                                  if (nextW.length === 0) return;
                                  onUpdatePreferences({
                                    customWidgetTabs: (preferences.customWidgetTabs ?? []).map(
                                      (item) =>
                                        item.id === ct.id ? { ...item, widgets: nextW } : item
                                    ),
                                  });
                                }}
                                style={
                                  hasW
                                    ? {
                                        backgroundColor: `${palette.primaryHex}26`,
                                        borderColor: `${palette.primaryHex}66`,
                                      }
                                    : undefined
                                }
                                className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors ${
                                  hasW
                                    ? 'text-white font-semibold'
                                    : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                                }`}
                              >
                                {hasW ? '✓ ' : '+ '}
                                {w.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Default Reasoning Model & Live Voice Persona */}
              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-white block">Default Copilot Model</span>
                  <CustomPopdown
                    ariaLabel="Default Copilot reasoning model"
                    fullWidth
                    size="md"
                    disabled={!preferences.aiEnabled}
                    accentHex={palette.primaryHex}
                    value={preferences.defaultAiModel}
                    options={SETTINGS_MODEL_OPTIONS}
                    onChange={(next) => onUpdatePreferences({ defaultAiModel: next })}
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-white block">Default Live Voice</span>
                  <CustomPopdown
                    ariaLabel="Default Live Voice persona"
                    fullWidth
                    size="md"
                    disabled={!preferences.aiEnabled}
                    accentHex={palette.primaryHex}
                    value={preferences.defaultLiveVoice}
                    options={SETTINGS_VOICE_OPTIONS}
                    onChange={(next) => onUpdatePreferences({ defaultLiveVoice: next })}
                  />
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>NativeAOT RAM Footprint</span>
                    <Cpu className="w-3.5 h-3.5 text-emerald-300" />
                  </div>
                  <div className="text-base font-mono font-bold text-emerald-300 tabular-nums mt-1">
                    {preferences.featureFlags.lowRamEcoMode ? '9.8 MB' : '12.4 MB'} · 0.0% CPU
                  </div>
                </div>
              </section>

              {/* All 16 Individual Feature Switches */}
              <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Every Individual Feature Switch (16 Granular Toggles)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enable or disable any single feature across media, sliders, &gt; submenus, HUDs, voice, and eco efficiency.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {FEATURE_META.map((feat) => (
                    <label
                      key={feat.key}
                      className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer hover:bg-white/[0.05] transition-colors"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">{feat.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {feat.desc}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.featureFlags[feat.key]}
                        onChange={() => toggleFeatureFlag(feat.key)}
                        className="w-4 h-4 rounded accent-cyan-400 mt-0.5 shrink-0"
                      />
                    </label>
                  ))}
                </div>
              </section>
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
};
