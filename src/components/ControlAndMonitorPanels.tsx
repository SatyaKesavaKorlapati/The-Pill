import React, { useState } from 'react';
import {
  Accessibility,
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BatteryCharging,
  Bluetooth,
  Calculator,
  Camera,
  Cast,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clipboard as ClipboardIcon,
  Coffee,
  Copy,
  Cpu,
  Eye,
  EyeOff,
  FolderOpen,
  Globe,
  HardDrive,
  Headphones,
  Home,
  Lock,
  MicOff,
  MonitorUp,
  Moon,
  Plane,
  Radio,
  Scissors,
  Server,
  Settings,
  Share2,
  Sliders,
  Sparkles,
  StickyNote,
  Subtitles,
  Sun,
  Timer,
  Volume2,
  VolumeX,
  Wifi,
  Zap,
} from 'lucide-react';
import {
  AVAILABLE_CAST_DISPLAYS,
  AVAILABLE_WIFI_NETWORKS,
  INITIAL_BLUETOOTH_DEVICES,
} from '../data/demoData';
import {
  AudioOutputDevice,
  BluetoothDeviceEntry,
  ControlTileId,
  LedgePreferences,
  LedgeTab,
  ProjectDisplayMode,
  ReminderTask,
  WindowsSystemState,
} from '../types/ledge';
import { formatStopwatchClock, playTactilePop } from '../utils/audioSynth';
import { computeBatteryEta, moveOrderedItem } from '../utils/customizationLogic';
import {
  ControlCenterLayoutMode,
  paginateControlTiles,
  resolveIconPackMetrics,
  resolveInnerPillMetrics,
  resolveThemePalette,
  resolveTileSurfaceClasses,
} from '../utils/themeAndSliders';
import { AnimatedBatterySymbol, BatteryOperationalMode } from './AnimatedBatterySymbol';
import { FluidEffectSlider } from './FluidEffectSlider';
import { ThemedIcon, ThemedIconName } from './ThemedIcon';

/* ============================================================================
 * 1. WINDOWS 11 QUICK SETTINGS + VERTICAL/HORIZONTAL BLOCKS & `>` SUBMENUS
 * ========================================================================== */
export interface ControlTileDefinition {
  id: ControlTileId;
  label: string;
  hasSubmenu?: boolean;
  Icon: React.ComponentType<{
    className?: string;
    strokeWidth?: string | number;
    style?: React.CSSProperties;
  }>;
}

export const ALL_CONTROL_TILES: ControlTileDefinition[] = [
  { id: 'wifi', label: 'Wi-Fi', hasSubmenu: true, Icon: Wifi },
  { id: 'bluetooth', label: 'Bluetooth', hasSubmenu: true, Icon: Bluetooth },
  { id: 'airplane', label: 'Airplane mode', Icon: Plane },
  { id: 'accessibility', label: 'Accessibility', hasSubmenu: true, Icon: Accessibility },
  { id: 'saver', label: 'Energy saver', Icon: BatteryCharging },
  { id: 'captions', label: 'Live captions', Icon: Subtitles },
  { id: 'nightlight', label: 'Night light', Icon: Sun },
  { id: 'hotspot', label: 'Mobile hotspot', Icon: Radio },
  { id: 'nearby', label: 'Nearby sharing', Icon: Share2 },
  { id: 'cast', label: 'Cast', hasSubmenu: true, Icon: Cast },
  { id: 'project', label: 'Project', hasSubmenu: true, Icon: MonitorUp },
  { id: 'dnd', label: 'Focus DND', Icon: Moon },
  { id: 'spatial', label: 'Spatial 3D', Icon: Headphones },
  { id: 'mic', label: 'Mic Mute', Icon: MicOff },
  { id: 'awake', label: 'Keep Awake', Icon: Coffee },
  { id: 'snip', label: 'Screen Snip', Icon: Scissors },
];

type ControlSubmenuView =
  | 'none'
  | 'wifi'
  | 'bluetooth'
  | 'accessibility'
  | 'cast'
  | 'project'
  | 'sound_mixer';

interface ControlCenterPanelProps {
  systemState: WindowsSystemState;
  onUpdateSystemState: (patch: Partial<WindowsSystemState>) => void;
  volumeLevel: number;
  onChangeVolume: (val: number) => void;
  brightnessLevel: number;
  onChangeBrightness: (val: number) => void;
  audioDevice: AudioOutputDevice;
  onChangeAudioDevice: (dev: AudioOutputDevice) => void;
  keepAwake: boolean;
  onToggleKeepAwake: () => void;
  micMuted: boolean;
  onToggleMicMuted: () => void;
  nightLight: boolean;
  onToggleNightLight: () => void;
  onTriggerToast: (msg: string) => void;
  preferences: LedgePreferences;
  onUpdatePreferences: (patch: Partial<LedgePreferences>) => void;
}

const AUDIO_OUTPUT_LIST: AudioOutputDevice[] = [
  'Surface Studio Speakers',
  'AirPods Pro (USB-C)',
  'Focusrite Scarlett DAC',
];

const LAYOUT_LABELS: Record<ControlCenterLayoutMode, string> = {
  squarish_blocks: 'Squarish Blocks',
  circular_orbs: 'Circular Orbs',
  win11_split: 'Win11 Split',
  bento_mixed: 'Mixed Vert+Horiz',
  vertical_pillars: 'Vertical Blocks',
  horizontal_strips: 'Horizontal Strips',
  inline_pills: 'Inline Pills',
  minimal_grid: 'Minimal Grid',
};

export const ControlCenterPanel: React.FC<ControlCenterPanelProps> = ({
  systemState,
  onUpdateSystemState,
  volumeLevel,
  onChangeVolume,
  brightnessLevel,
  onChangeBrightness,
  audioDevice,
  onChangeAudioDevice,
  keepAwake,
  onToggleKeepAwake,
  micMuted,
  onToggleMicMuted,
  nightLight,
  onToggleNightLight,
  onTriggerToast,
  preferences,
  onUpdatePreferences,
}) => {
  const [submenu, setSubmenu] = useState<ControlSubmenuView>('none');
  const [pageIndex, setPageIndex] = useState(0);
  const [btDevices, setBtDevices] = useState<BluetoothDeviceEntry[]>(INITIAL_BLUETOOTH_DEVICES);
  const [playgroundMode, setPlaygroundMode] = useState(false);
  const [draggedTileId, setDraggedTileId] = useState<ControlTileId | null>(null);

  const palette = resolveThemePalette(
    preferences.themeId,
    preferences.customPrimaryHex,
    preferences.customSecondaryHex
  );
  const isLight = Boolean(palette.isLightSurface);
  const iconMetrics = resolveIconPackMetrics(preferences.iconPack);
  const pillMetrics = resolveInnerPillMetrics(
    preferences.innerPillScale,
    preferences.innerCapsuleRadius
  );

  const isCompactTileMode =
    preferences.controlLayoutMode === 'squarish_blocks' ||
    preferences.controlLayoutMode === 'circular_orbs';

  const effectiveCols: 3 | 4 | 5 | 6 = isCompactTileMode
    ? 6
    : preferences.controlLayoutMode === 'bento_mixed' ||
        preferences.controlLayoutMode === 'horizontal_strips'
      ? 3
      : preferences.controlGridColumns;

  const pages = paginateControlTiles(preferences.controlTiles, effectiveCols, 2);
  const safePage = Math.min(pageIndex, Math.max(0, pages.length - 1));
  const currentTiles = pages[safePage] ?? [];

  const handleHoverSwapTile = (targetId: ControlTileId) => {
    if (!draggedTileId || draggedTileId === targetId) return;
    const list = [...preferences.controlTiles];
    const fromIdx = list.indexOf(draggedTileId);
    const toIdx = list.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    list.splice(fromIdx, 1);
    list.splice(toIdx, 0, draggedTileId);
    onUpdatePreferences({ controlTiles: list });
    playTactilePop('tab');
  };

  const handleDropReorderTile = (targetId: ControlTileId) => {
    if (draggedTileId && draggedTileId !== targetId) {
      handleHoverSwapTile(targetId);
    }
    setDraggedTileId(null);
  };

  const toggleTileSpan = (id: ControlTileId) => {
    const current = preferences.controlTileSizes?.[id] ?? '1x1';
    const next = current === '1x1' ? '2x1' : '1x1';
    onUpdatePreferences({
      controlTileSizes: { ...(preferences.controlTileSizes ?? {}), [id]: next },
    });
    playTactilePop('tab');
  };

  const isTileActive = (id: ControlTileId): boolean => {
    switch (id) {
      case 'wifi':
        return systemState.wifiEnabled && !systemState.airplaneMode;
      case 'bluetooth':
        return systemState.bluetoothEnabled && !systemState.airplaneMode;
      case 'airplane':
        return systemState.airplaneMode;
      case 'accessibility':
        return (
          systemState.liveCaptions ||
          systemState.accessibilityMonoAudio ||
          systemState.accessibilityStickyKeys ||
          systemState.accessibilityColorFilter
        );
      case 'saver':
        return systemState.batterySaver;
      case 'captions':
        return systemState.liveCaptions;
      case 'nightlight':
        return nightLight;
      case 'hotspot':
        return systemState.hotspotEnabled;
      case 'nearby':
        return systemState.nearbyShare !== 'off';
      case 'cast':
        return Boolean(systemState.castDevice);
      case 'project':
        return systemState.projectMode !== 'pc_only';
      case 'dnd':
        return systemState.dndEnabled;
      case 'spatial':
        return systemState.spatialAudio;
      case 'mic':
        return micMuted;
      case 'awake':
        return keepAwake;
      case 'snip':
        return false;
    }
  };

  const getTileCaption = (id: ControlTileId): string => {
    switch (id) {
      case 'wifi':
        return systemState.wifiEnabled && !systemState.airplaneMode
          ? systemState.wifiSsid
          : 'Wi-Fi Off';
      case 'bluetooth':
        if (!systemState.bluetoothEnabled || systemState.airplaneMode) return 'Bluetooth Off';
        return systemState.bluetoothDevice || 'Not connected';
      case 'airplane':
        return systemState.airplaneMode ? 'Radios Off' : 'Off';
      case 'accessibility':
        return systemState.liveCaptions || systemState.accessibilityColorFilter ? 'Active' : 'Menu';
      case 'saver':
        return systemState.batterySaver ? 'Saving power' : 'Balanced';
      case 'captions':
        return systemState.liveCaptions ? 'Captions On' : 'Off';
      case 'nightlight':
        return nightLight ? 'Warm 3400K' : 'Off';
      case 'hotspot':
        return systemState.hotspotEnabled ? 'Sharing 5GHz' : 'Off';
      case 'nearby':
        return systemState.nearbyShare === 'everyone'
          ? 'Everyone'
          : systemState.nearbyShare === 'my_devices'
            ? 'My devices'
            : 'Off';
      case 'cast':
        return systemState.castDevice ? systemState.castDevice.split(' ')[0] : 'Displays';
      case 'project':
        return systemState.projectMode === 'extend'
          ? 'Extend'
          : systemState.projectMode === 'duplicate'
            ? 'Duplicate'
            : 'PC only';
      case 'dnd':
        return systemState.dndEnabled ? 'Quiet On' : 'Off';
      case 'spatial':
        return systemState.spatialAudio ? 'Dolby 3D' : 'Stereo';
      case 'mic':
        return micMuted ? 'Muted' : 'Live';
      case 'awake':
        return keepAwake ? 'Awake On' : 'Auto sleep';
      case 'snip':
        return 'Win+Shift+S';
    }
  };

  const handleTileToggle = (id: ControlTileId) => {
    if (id === 'accessibility' && preferences.featureFlags.controlSubmenuChevrons) {
      playTactilePop('tab');
      setSubmenu('accessibility');
      return;
    }
    if (id === 'cast' && preferences.featureFlags.controlSubmenuChevrons) {
      playTactilePop('tab');
      setSubmenu('cast');
      return;
    }
    if (id === 'project' && preferences.featureFlags.controlSubmenuChevrons) {
      playTactilePop('tab');
      setSubmenu('project');
      return;
    }

    const nextActive = !isTileActive(id);
    playTactilePop(nextActive ? 'toggleOn' : 'toggleOff');

    switch (id) {
      case 'wifi':
        onUpdateSystemState({ wifiEnabled: !systemState.wifiEnabled, airplaneMode: false });
        break;
      case 'bluetooth':
        onUpdateSystemState({ bluetoothEnabled: !systemState.bluetoothEnabled });
        break;
      case 'airplane':
        onUpdateSystemState({
          airplaneMode: !systemState.airplaneMode,
          wifiEnabled: systemState.airplaneMode,
        });
        break;
      case 'accessibility':
        onUpdateSystemState({ liveCaptions: !systemState.liveCaptions });
        break;
      case 'saver':
        onUpdateSystemState({
          batterySaver: !systemState.batterySaver,
          powerMode: !systemState.batterySaver ? 'efficiency' : 'balanced',
        });
        break;
      case 'captions':
        onUpdateSystemState({ liveCaptions: !systemState.liveCaptions });
        break;
      case 'nightlight':
        onToggleNightLight();
        break;
      case 'hotspot':
        onUpdateSystemState({ hotspotEnabled: !systemState.hotspotEnabled });
        break;
      case 'nearby':
        onUpdateSystemState({
          nearbyShare:
            systemState.nearbyShare === 'off'
              ? 'my_devices'
              : systemState.nearbyShare === 'my_devices'
                ? 'everyone'
                : 'off',
        });
        break;
      case 'cast':
        onUpdateSystemState({
          castDevice: systemState.castDevice ? null : AVAILABLE_CAST_DISPLAYS[0].name,
        });
        break;
      case 'project':
        onUpdateSystemState({
          projectMode: systemState.projectMode === 'extend' ? 'pc_only' : 'extend',
        });
        break;
      case 'dnd':
        onUpdateSystemState({ dndEnabled: !systemState.dndEnabled });
        break;
      case 'spatial':
        onUpdateSystemState({ spatialAudio: !systemState.spatialAudio });
        break;
      case 'mic':
        onToggleMicMuted();
        break;
      case 'awake':
        onToggleKeepAwake();
        break;
      case 'snip':
        onTriggerToast('Windows Rectangular Snipping Overlay launched');
        break;
    }
  };

  const openTileSubmenu = (id: ControlTileId) => {
    playTactilePop('tab');
    if (id === 'wifi') setSubmenu('wifi');
    else if (id === 'bluetooth') setSubmenu('bluetooth');
    else if (id === 'accessibility') setSubmenu('accessibility');
    else if (id === 'cast') setSubmenu('cast');
    else if (id === 'project') setSubmenu('project');
  };

  const toggleIncludeTile = (id: ControlTileId) => {
    const exists = preferences.controlTiles.includes(id);
    const updated = exists
      ? preferences.controlTiles.filter((t) => t !== id)
      : [...preferences.controlTiles, id];
    if (updated.length > 0) {
      onUpdatePreferences({ controlTiles: updated });
    }
  };

  /* ------------------------------------------------------------------------
   * DRILL-DOWN SUBMENUS (`>` Wi-Fi, Bluetooth, Accessibility, Cast, Project, Sound Mixer)
   * ---------------------------------------------------------------------- */
  if (submenu !== 'none') {
    return (
      <div className="flex flex-col justify-between h-full gap-2">
        <div
          className={`flex items-center justify-between pb-1.5 border-b ${
            isLight ? 'border-stone-900/15' : 'border-white/10'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              playTactilePop('tab');
              setSubmenu('none');
            }}
            className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              {submenu === 'wifi'
                ? 'Wi-Fi Networks'
                : submenu === 'bluetooth'
                  ? 'Bluetooth Devices'
                  : submenu === 'accessibility'
                    ? 'Accessibility Quick Controls'
                    : submenu === 'cast'
                      ? 'Cast to Wireless Display'
                      : submenu === 'project'
                        ? 'Project Screen Mode (Win+P)'
                        : 'Sound Output & Per-App Volume Mixer'}
            </span>
          </button>

          {(submenu === 'wifi' || submenu === 'bluetooth') && (
            <button
              type="button"
              onClick={() => {
                playTactilePop('toggleOn');
                if (submenu === 'wifi') {
                  onUpdateSystemState({
                    wifiEnabled: !systemState.wifiEnabled,
                    airplaneMode: false,
                  });
                } else {
                  onUpdateSystemState({ bluetoothEnabled: !systemState.bluetoothEnabled });
                }
              }}
              style={
                (submenu === 'wifi' ? systemState.wifiEnabled : systemState.bluetoothEnabled)
                  ? { backgroundColor: palette.primaryHex }
                  : undefined
              }
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                (submenu === 'wifi' ? systemState.wifiEnabled : systemState.bluetoothEnabled)
                  ? palette.onPrimaryTextClass
                  : 'bg-white/10 text-slate-300'
              }`}
            >
              {(submenu === 'wifi' ? systemState.wifiEnabled : systemState.bluetoothEnabled)
                ? 'On'
                : 'Off'}
            </button>
          )}
        </div>

        {submenu === 'wifi' && (
          <div className="flex-1 overflow-y-auto ledge-scroll space-y-1.5 pr-1">
            {AVAILABLE_WIFI_NETWORKS.map((net) => {
              const connected = systemState.wifiEnabled && systemState.wifiSsid === net.ssid;
              return (
                <div
                  key={net.ssid}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-colors ${
                    connected
                      ? 'bg-white/[0.09] border-white/25'
                      : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.07]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Wifi
                      className="w-4 h-4 shrink-0"
                      style={{ color: connected ? palette.primaryHex : '#94a3b8' }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                        <span>{net.ssid}</span>
                        {net.secured && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                        {connected ? 'Connected, secured' : 'Available'} · {net.band} ·{' '}
                        {net.signalPct}%
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playTactilePop('confirm');
                      onUpdateSystemState({
                        wifiEnabled: true,
                        airplaneMode: false,
                        wifiSsid: net.ssid,
                      });
                      onTriggerToast(`Connected to ${net.ssid}`);
                    }}
                    style={connected ? { backgroundColor: palette.primaryHex } : undefined}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
                      connected
                        ? palette.onPrimaryTextClass
                        : 'bg-white/10 hover:bg-white/18 text-slate-200'
                    }`}
                  >
                    {connected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {submenu === 'bluetooth' && (
          <div className="flex-1 overflow-y-auto ledge-scroll space-y-1.5 pr-1">
            {btDevices.map((dev) => (
              <div
                key={dev.name}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-colors ${
                  dev.connected && systemState.bluetoothEnabled
                    ? 'bg-white/[0.09] border-white/25'
                    : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.07]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Bluetooth
                    className="w-4 h-4 shrink-0"
                    style={{
                      color:
                        dev.connected && systemState.bluetoothEnabled
                          ? palette.primaryHex
                          : '#94a3b8',
                    }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{dev.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                      {dev.category}
                      {dev.batteryPct !== undefined ? ` · Battery ${dev.batteryPct}%` : ''}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextConn = !dev.connected;
                    playTactilePop(nextConn ? 'toggleOn' : 'toggleOff');
                    const nextList = btDevices.map((d) =>
                      d.name === dev.name ? { ...d, connected: nextConn } : d
                    );
                    setBtDevices(nextList);
                    const primaryConnected =
                      nextList.find((d) => d.connected)?.name ?? 'Not connected';
                    onUpdateSystemState({
                      bluetoothEnabled: true,
                      bluetoothDevice: primaryConnected,
                    });
                  }}
                  style={
                    dev.connected && systemState.bluetoothEnabled
                      ? { backgroundColor: palette.primaryHex }
                      : undefined
                  }
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
                    dev.connected && systemState.bluetoothEnabled
                      ? palette.onPrimaryTextClass
                      : 'bg-white/10 hover:bg-white/18 text-slate-200'
                  }`}
                >
                  {dev.connected && systemState.bluetoothEnabled ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        )}

        {submenu === 'accessibility' && (
          <div className="grid grid-cols-2 gap-2 flex-1 content-start pt-1">
            {[
              {
                key: 'liveCaptions' as const,
                label: 'Live Captions',
                desc: 'Real-time system audio captions',
                val: systemState.liveCaptions,
              },
              {
                key: 'accessibilityMonoAudio' as const,
                label: 'Mono Audio',
                desc: 'Combine left & right channels',
                val: systemState.accessibilityMonoAudio,
              },
              {
                key: 'accessibilityStickyKeys' as const,
                label: 'Sticky Keys',
                desc: 'Press modifier shortcuts one key at a time',
                val: systemState.accessibilityStickyKeys,
              },
              {
                key: 'accessibilityColorFilter' as const,
                label: 'Color Filters',
                desc: 'High-contrast deuteranopia filter',
                val: systemState.accessibilityColorFilter,
              },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={item.val}
                onClick={() => {
                  playTactilePop(!item.val ? 'toggleOn' : 'toggleOff');
                  onUpdateSystemState({ [item.key]: !item.val });
                }}
                style={
                  item.val
                    ? { backgroundColor: `${palette.primaryHex}24`, borderColor: palette.primaryHex }
                    : undefined
                }
                className={`p-3 rounded-xl border text-left transition-colors ${
                  item.val
                    ? ''
                    : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.07]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{item.label}</span>
                  <span className="text-[10px] font-mono">{item.val ? 'ON' : 'OFF'}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
              </button>
            ))}
          </div>
        )}

        {submenu === 'cast' && (
          <div className="flex-1 overflow-y-auto ledge-scroll space-y-1.5 pr-1">
            {AVAILABLE_CAST_DISPLAYS.map((disp) => {
              const active = systemState.castDevice === disp.name;
              return (
                <div
                  key={disp.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10"
                >
                  <div>
                    <div className="text-xs font-semibold">{disp.name}</div>
                    <div className="text-[10px] text-slate-400">{disp.protocol}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playTactilePop('confirm');
                      onUpdateSystemState({ castDevice: active ? null : disp.name });
                    }}
                    style={active ? { backgroundColor: palette.primaryHex } : undefined}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                      active
                        ? palette.onPrimaryTextClass
                        : 'bg-white/10 hover:bg-white/18 text-slate-200'
                    }`}
                  >
                    {active ? 'Disconnect' : 'Cast'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {submenu === 'project' && (
          <div className="grid grid-cols-2 gap-2 flex-1 content-start pt-1">
            {(
              [
                { id: 'pc_only', label: 'PC screen only', desc: 'Primary built-in display only' },
                { id: 'duplicate', label: 'Duplicate', desc: 'Mirror across both displays' },
                { id: 'extend', label: 'Extend', desc: 'Span desktop across displays' },
                { id: 'second_only', label: 'Second screen only', desc: 'External monitor only' },
              ] as { id: ProjectDisplayMode; label: string; desc: string }[]
            ).map((modeOpt) => {
              const selected = systemState.projectMode === modeOpt.id;
              return (
                <button
                  key={modeOpt.id}
                  type="button"
                  onClick={() => {
                    playTactilePop('tab');
                    onUpdateSystemState({ projectMode: modeOpt.id });
                    onTriggerToast(`Display mode: ${modeOpt.label}`);
                  }}
                  style={
                    selected
                      ? { backgroundColor: `${palette.primaryHex}24`, borderColor: palette.primaryHex }
                      : undefined
                  }
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    selected
                      ? ''
                      : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.07]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{modeOpt.label}</span>
                    {selected && (
                      <Check className="w-3.5 h-3.5" style={{ color: palette.primaryHex }} />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{modeOpt.desc}</p>
                </button>
              );
            })}
          </div>
        )}

        {submenu === 'sound_mixer' && (
          <div className="flex-1 overflow-y-auto ledge-scroll space-y-2.5 pr-1">
            <div>
              <div className="text-[11px] text-slate-400 mb-1">Output Device</div>
              <div className="grid grid-cols-3 gap-1.5">
                {AUDIO_OUTPUT_LIST.map((dev) => {
                  const active = audioDevice === dev;
                  return (
                    <button
                      key={dev}
                      type="button"
                      onClick={() => {
                        playTactilePop('tab');
                        onChangeAudioDevice(dev);
                      }}
                      style={active ? { backgroundColor: palette.primaryHex } : undefined}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium truncate transition-colors ${
                        active
                          ? `${palette.onPrimaryTextClass} font-semibold`
                          : 'bg-white/[0.05] hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      {dev}
                    </button>
                  );
                })}
              </div>
            </div>

            {preferences.featureFlags.perAppVolumeMixer && (
              <div className="space-y-1.5 pt-1 border-t border-white/10">
                <div className="text-[11px] text-slate-400">Per-App Volume Mixer</div>
                {systemState.appMixer.map((ch) => (
                  <div
                    key={ch.id}
                    className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.07] rounded-xl px-2.5 py-1.5"
                  >
                    <button
                      type="button"
                      aria-label={`Mute ${ch.appName}`}
                      onClick={() => {
                        const updated = systemState.appMixer.map((item) =>
                          item.id === ch.id ? { ...item, muted: !item.muted } : item
                        );
                        onUpdateSystemState({ appMixer: updated });
                      }}
                      className="text-slate-300 hover:text-white shrink-0"
                    >
                      {ch.muted ? (
                        <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" style={{ color: palette.primaryHex }} />
                      )}
                    </button>
                    <span className="text-xs w-36 truncate shrink-0">{ch.appName}</span>
                    <FluidEffectSlider
                      value={ch.muted ? 0 : ch.volumePct}
                      min={0}
                      max={100}
                      onChange={(val) => {
                        const updated = systemState.appMixer.map((item) =>
                          item.id === ch.id ? { ...item, volumePct: val, muted: val === 0 } : item
                        );
                        onUpdateSystemState({ appMixer: updated });
                      }}
                      styleVariant={preferences.controlSliderStyle}
                      primaryHex={palette.primaryHex}
                      secondaryHex={palette.secondaryHex}
                      glowIntensity={preferences.sliderGlowIntensity}
                      ariaLabel={`${ch.appName} volume`}
                      lowPowerEco={preferences.featureFlags.lowRamEcoMode}
                      isLightSurface={isLight}
                    />
                    <span className="text-[11px] font-mono tabular-nums w-8 text-right shrink-0">
                      {ch.muted ? '0%' : `${ch.volumePct}%`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const isVerticalSliders = preferences.controlSliderOrientation === 'vertical';

  /* ------------------------------------------------------------------------
   * MAIN QUICK SETTINGS VIEW (6 Block Layouts + Vertical/Horizontal Sliders)
   * ---------------------------------------------------------------------- */
  return (
    <div className="flex flex-col justify-between h-full gap-2">
      {/* Clean Quick Settings Header + Apple Control Center Playground Builder Toggle */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold flex items-center gap-2">
          <span>Quick Settings</span>
          {pages.length > 1 && !playgroundMode && (
            <span className={`text-[11px] font-normal ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
              Page {safePage + 1}/{pages.length}
            </span>
          )}
          {playgroundMode && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
              Playground: Drag blocks or tap 1×1/2×1
            </span>
          )}
        </span>

        <div className="flex items-center gap-2 select-none">
          {pages.length > 1 && !playgroundMode && (
            <div className="flex items-center gap-1.5">
              {pages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to Quick Settings page ${i + 1}`}
                  onClick={() => {
                    playTactilePop('tab');
                    setPageIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    safePage === i
                      ? 'w-4 bg-sky-400'
                      : isLight
                        ? 'w-1.5 bg-stone-900/25 hover:bg-stone-900/50'
                        : 'w-1.5 bg-white/25 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              playTactilePop('tab');
              setPlaygroundMode((v) => !v);
            }}
            style={playgroundMode ? { backgroundColor: palette.primaryHex } : undefined}
            className={`px-2 py-0.5 rounded-lg text-[10.5px] font-semibold transition-colors ${
              playgroundMode
                ? palette.onPrimaryTextClass
                : 'bg-white/[0.07] hover:bg-white/14 opacity-80 hover:opacity-100'
            }`}
          >
            {playgroundMode ? 'Done' : '+ Edit Blocks'}
          </button>
        </div>
      </div>

      {/* Interactive Control Center Playground Add-Controls Bar */}
      {playgroundMode && (
        <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-[10.5px] overflow-x-auto ledge-scroll">
          <div className="flex items-center gap-1 shrink-0">
            {(
              [
                { id: 'squarish_blocks', label: 'Squarish' },
                { id: 'circular_orbs', label: 'Circles' },
                { id: 'win11_split', label: 'Rectangles' },
              ] as { id: ControlCenterLayoutMode; label: string }[]
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onUpdatePreferences({ controlLayoutMode: m.id })}
                style={
                  preferences.controlLayoutMode === m.id
                    ? { backgroundColor: palette.primaryHex }
                    : undefined
                }
                className={`px-2 py-0.5 rounded-md font-semibold ${
                  preferences.controlLayoutMode === m.id
                    ? palette.onPrimaryTextClass
                    : 'bg-white/10 opacity-80 hover:opacity-100'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {ALL_CONTROL_TILES.filter((t) => !preferences.controlTiles.includes(t.id))
              .slice(0, 5)
              .map((missing) => (
                <button
                  key={missing.id}
                  type="button"
                  onClick={() => toggleIncludeTile(missing.id)}
                  className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/30 whitespace-nowrap"
                >
                  + {missing.label}
                </button>
              ))}
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col justify-between">
        {/* Main Controls Body: Supports Horizontal Bottom Sliders OR Side-by-Side Vertical Pillar Sliders */}
        <div className={`flex ${isVerticalSliders ? 'flex-row items-stretch gap-3' : 'flex-col gap-2'} flex-1 min-h-0`}>
          {/* Tiles + Pagination Strip */}
          <div className="flex items-center gap-2 flex-1 min-h-0">
            {preferences.controlLayoutMode === 'squarish_blocks' ||
            preferences.controlLayoutMode === 'circular_orbs' ? (
              /* COMPACT SPACE-EFFICIENT SQUARISH BLOCKS & CIRCULAR ORBS (6 cols, resizable 1×1 or 2×1 in Playground) */
              <div className="flex-1 grid grid-cols-6 gap-2 content-center">
                {(playgroundMode ? preferences.controlTiles.slice(0, 12) : currentTiles).map((id) => {
                  const meta = ALL_CONTROL_TILES.find((t) => t.id === id) ?? ALL_CONTROL_TILES[0];
                  const active = isTileActive(id);
                  const caption = getTileCaption(id);
                  const showChevron =
                    Boolean(meta.hasSubmenu) && preferences.featureFlags.controlSubmenuChevrons;
                  const Icon = meta.Icon;
                  const isCircle = preferences.controlLayoutMode === 'circular_orbs';
                  const span = preferences.controlTileSizes?.[id] ?? '1x1';
                  const isWide = span === '2x1';
                  const surfaceCls = resolveTileSurfaceClasses(
                    preferences.tileSurfaceStyle,
                    active,
                    isLight
                  );

                  return (
                    <div
                      key={id}
                      draggable={playgroundMode}
                      onDragStart={(e) => {
                        if (!playgroundMode) return;
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', id);
                        setDraggedTileId(id);
                      }}
                      onDragEnter={(e) => {
                        if (!playgroundMode) return;
                        e.preventDefault();
                        handleHoverSwapTile(id);
                      }}
                      onDragOver={(e) => {
                        if (!playgroundMode) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={(e) => {
                        if (!playgroundMode) return;
                        e.preventDefault();
                        handleDropReorderTile(id);
                      }}
                      onDragEnd={() => setDraggedTileId(null)}
                      className={`${isWide ? 'col-span-2' : 'col-span-1'} relative flex flex-col items-center justify-center gap-1 min-w-0 transition-transform ${
                        playgroundMode
                          ? `ring-1 ring-dashed ring-amber-400/50 rounded-2xl p-0.5 cursor-grab active:cursor-grabbing ${
                              draggedTileId === id ? 'opacity-55 scale-95' : ''
                            }`
                          : ''
                      }`}
                    >
                      {playgroundMode && (
                        <div className="absolute -top-1.5 inset-x-0 z-10 flex items-center justify-between px-1 pointer-events-auto">
                          <button
                            type="button"
                            draggable={false}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleIncludeTile(id);
                            }}
                            title={`Remove ${meta.label}`}
                            className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow"
                          >
                            −
                          </button>
                          <button
                            type="button"
                            draggable={false}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTileSpan(id);
                            }}
                            title="Resize block between 1×1 Square/Circle and 2×1 Pill"
                            className="px-1 rounded bg-slate-900/95 border border-white/25 text-[8.5px] font-mono text-amber-300 shadow"
                          >
                            {span}
                          </button>
                        </div>
                      )}

                      {isCircle && !isWide ? (
                        /* Apple Control Center Circular Orb */
                        <div
                          className={`relative flex items-center justify-center ${
                            playgroundMode ? 'pointer-events-none select-none' : ''
                          }`}
                        >
                          <button
                            type="button"
                            aria-pressed={active}
                            aria-label={`Toggle ${meta.label}`}
                            onClick={() => !playgroundMode && handleTileToggle(id)}
                            style={
                              active
                                ? {
                                    backgroundColor: palette.primaryHex,
                                    boxShadow: iconMetrics.showHalo
                                      ? `0 0 14px ${palette.primaryHex}45`
                                      : undefined,
                                  }
                                : undefined
                            }
                            className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all active:scale-95 ${surfaceCls} ${
                              active ? `border-transparent ${palette.onPrimaryTextClass}` : ''
                            }`}
                          >
                            <ThemedIcon
                              name={id as ThemedIconName}
                              packStyle={preferences.iconPack}
                              size={16}
                              strokeWidth={iconMetrics.strokeWidth}
                            />
                          </button>
                          {showChevron && !playgroundMode && (
                            <button
                              type="button"
                              aria-label={`Open ${meta.label} list`}
                              onClick={() => openTileSubmenu(id)}
                              className="absolute -right-1 -bottom-0.5 w-4 h-4 rounded-full bg-slate-900 border border-white/25 text-white flex items-center justify-center hover:scale-110 transition-transform shadow"
                            >
                              <ChevronRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        /* Space-Efficient Squarish Block (or 2×1 Compact Pill when resized) */
                        <div
                          style={
                            active
                              ? {
                                  backgroundColor: palette.primaryHex,
                                  boxShadow: iconMetrics.showHalo
                                    ? `0 0 14px ${palette.primaryHex}40`
                                    : undefined,
                                }
                              : undefined
                          }
                          className={`w-full h-12 ${
                            isCircle ? 'rounded-full' : 'rounded-2xl'
                          } border flex items-center justify-between overflow-hidden transition-all ${surfaceCls} ${
                            active ? `border-transparent ${palette.onPrimaryTextClass}` : ''
                          } ${playgroundMode ? 'pointer-events-none select-none' : ''}`}
                        >
                          <button
                            type="button"
                            aria-pressed={active}
                            aria-label={`Toggle ${meta.label}`}
                            onClick={() => !playgroundMode && handleTileToggle(id)}
                            className={`flex-1 h-full flex ${
                              isWide
                                ? 'items-center justify-start gap-2 px-3 text-left'
                                : 'flex-col items-center justify-center gap-0.5 px-1'
                            } min-w-0 hover:brightness-95 active:scale-[0.97] transition-transform`}
                          >
                            <ThemedIcon
                              name={id as ThemedIconName}
                              packStyle={preferences.iconPack}
                              size={16}
                              className="shrink-0"
                              strokeWidth={iconMetrics.strokeWidth}
                            />
                            {isWide ? (
                              <div className="min-w-0">
                                <div className="text-[10.5px] font-semibold leading-tight truncate">
                                  {meta.label}
                                </div>
                                <div className="text-[9.5px] opacity-80 leading-tight truncate">
                                  {caption}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[9.5px] font-semibold leading-none truncate max-w-full">
                                {meta.label.split(' ')[0]}
                              </span>
                            )}
                          </button>

                          {showChevron && !playgroundMode && (
                            <button
                              type="button"
                              aria-label={`Open ${meta.label} list`}
                              onClick={() => openTileSubmenu(id)}
                              className={`h-full px-1.5 flex items-center justify-center border-l ${
                                active ? 'border-slate-950/15' : 'border-white/10'
                              } hover:bg-black/10`}
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}

                      {isCircle && !isWide && (
                        <span
                          className="text-[10px] font-medium truncate max-w-full text-center leading-tight opacity-90"
                          title={`${meta.label}: ${caption}`}
                        >
                          {meta.label.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : preferences.controlLayoutMode === 'bento_mixed' ? (
              /* Layout: Mixed Vertical + Horizontal Bento Blocks */
              <div className="flex-1 grid grid-cols-4 grid-rows-2 gap-2 h-full min-h-[126px]">
                {currentTiles.slice(0, 6).map((id, idx) => {
                  const meta = ALL_CONTROL_TILES.find((t) => t.id === id) ?? ALL_CONTROL_TILES[0];
                  const active = isTileActive(id);
                  const caption = getTileCaption(id);
                  const showChevron =
                    Boolean(meta.hasSubmenu) && preferences.featureFlags.controlSubmenuChevrons;
                  const Icon = meta.Icon;
                  const surfaceCls = resolveTileSurfaceClasses(
                    preferences.tileSurfaceStyle,
                    active,
                    isLight
                  );
                  const isVerticalHero = idx < 2;

                  if (isVerticalHero) {
                    return (
                      <div
                        key={id}
                        style={active ? { backgroundColor: palette.primaryHex } : undefined}
                        className={`row-span-2 ${pillMetrics.radiusClass} border p-2.5 flex flex-col justify-between transition-all ${surfaceCls} ${
                          active ? `border-transparent ${palette.onPrimaryTextClass}` : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <button
                            type="button"
                            aria-pressed={active}
                            aria-label={`Toggle ${meta.label}`}
                            onClick={() => handleTileToggle(id)}
                            className="w-8 h-8 rounded-xl bg-black/15 flex items-center justify-center"
                          >
                            <ThemedIcon
                              name={id as ThemedIconName}
                              packStyle={preferences.iconPack}
                              size={16}
                              strokeWidth={iconMetrics.strokeWidth}
                            />
                          </button>
                          {showChevron && (
                            <button
                              type="button"
                              aria-label={`Open ${meta.label} list`}
                              onClick={() => openTileSubmenu(id)}
                              className="p-1 rounded-lg hover:bg-black/15"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTileToggle(id)}
                          className="text-left min-w-0"
                        >
                          <div className="text-xs font-semibold truncate">{meta.label}</div>
                          <div className="text-[10px] opacity-80 truncate">{caption}</div>
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={id}
                      style={active ? { backgroundColor: palette.primaryHex } : undefined}
                      className={`${pillMetrics.radiusClass} border px-2 py-1.5 flex items-center justify-between gap-1 transition-all ${surfaceCls} ${
                        active ? `border-transparent ${palette.onPrimaryTextClass}` : ''
                      }`}
                    >
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => handleTileToggle(id)}
                        className="flex items-center gap-1.5 min-w-0 flex-1 text-left"
                      >
                        <ThemedIcon
                          name={id as ThemedIconName}
                          packStyle={preferences.iconPack}
                          size={14}
                          className="shrink-0"
                          strokeWidth={iconMetrics.strokeWidth}
                        />
                        <div className="min-w-0">
                          <div className="text-[10.5px] font-semibold leading-tight truncate">{meta.label}</div>
                          <div className="text-[9.5px] opacity-75 leading-tight truncate">{caption}</div>
                        </div>
                      </button>
                      {showChevron && (
                        <button
                          type="button"
                          aria-label={`Open ${meta.label} list`}
                          onClick={() => openTileSubmenu(id)}
                          className="p-0.5 rounded hover:bg-black/15 shrink-0"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : preferences.controlLayoutMode === 'vertical_pillars' ? (
              /* Layout: Vertical Pillar Blocks */
              <div className="flex-1 grid grid-cols-6 gap-2 h-full min-h-[126px]">
                {currentTiles.slice(0, 6).map((id) => {
                  const meta = ALL_CONTROL_TILES.find((t) => t.id === id) ?? ALL_CONTROL_TILES[0];
                  const active = isTileActive(id);
                  const caption = getTileCaption(id);
                  const showChevron =
                    Boolean(meta.hasSubmenu) && preferences.featureFlags.controlSubmenuChevrons;
                  const Icon = meta.Icon;
                  const surfaceCls = resolveTileSurfaceClasses(
                    preferences.tileSurfaceStyle,
                    active,
                    isLight
                  );
                  return (
                    <div
                      key={id}
                      style={active ? { backgroundColor: palette.primaryHex } : undefined}
                      className={`${pillMetrics.radiusClass} border p-2 flex flex-col items-center justify-between text-center transition-all ${surfaceCls} ${
                        active ? `border-transparent ${palette.onPrimaryTextClass}` : ''
                      }`}
                    >
                      <div className="w-full flex items-center justify-between">
                        <span className="text-[9px] font-mono opacity-75">
                          {active ? 'ON' : 'OFF'}
                        </span>
                        {showChevron && (
                          <button
                            type="button"
                            aria-label={`Open ${meta.label} list`}
                            onClick={() => openTileSubmenu(id)}
                            className="p-0.5 rounded hover:bg-black/15"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        aria-pressed={active}
                        aria-label={`Toggle ${meta.label}`}
                        onClick={() => handleTileToggle(id)}
                        className="my-1 p-2 rounded-xl bg-black/15"
                      >
                        <ThemedIcon
                          name={id as ThemedIconName}
                          packStyle={preferences.iconPack}
                          size={16}
                          strokeWidth={iconMetrics.strokeWidth}
                        />
                      </button>
                      <div className="w-full min-w-0">
                        <div className="text-[10.5px] font-semibold truncate">{meta.label}</div>
                        <div className="text-[9.5px] opacity-75 truncate">{caption}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : preferences.controlLayoutMode === 'horizontal_strips' ? (
              /* Layout: 2-Column Wide Horizontal Strips */
              <div className="flex-1 grid grid-cols-2 gap-2">
                {currentTiles.slice(0, 6).map((id) => {
                  const meta = ALL_CONTROL_TILES.find((t) => t.id === id) ?? ALL_CONTROL_TILES[0];
                  const active = isTileActive(id);
                  const caption = getTileCaption(id);
                  const showChevron =
                    Boolean(meta.hasSubmenu) && preferences.featureFlags.controlSubmenuChevrons;
                  const Icon = meta.Icon;
                  const surfaceCls = resolveTileSurfaceClasses(
                    preferences.tileSurfaceStyle,
                    active,
                    isLight
                  );
                  return (
                    <div
                      key={id}
                      style={active ? { backgroundColor: palette.primaryHex } : undefined}
                      className={`${pillMetrics.radiusClass} border px-3 py-1.5 flex items-center justify-between gap-2 ${surfaceCls} ${
                        active ? `border-transparent ${palette.onPrimaryTextClass}` : ''
                      }`}
                    >
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => handleTileToggle(id)}
                        className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                      >
                        <ThemedIcon
                          name={id as ThemedIconName}
                          packStyle={preferences.iconPack}
                          size={16}
                          className="shrink-0"
                          strokeWidth={iconMetrics.strokeWidth}
                        />
                        <span className="text-xs font-semibold truncate">{meta.label}</span>
                        <span className="text-[10px] opacity-75 truncate ml-auto">{caption}</span>
                      </button>
                      {showChevron && (
                        <button
                          type="button"
                          aria-label={`Open ${meta.label} list`}
                          onClick={() => openTileSubmenu(id)}
                          className="p-0.5 rounded hover:bg-black/15 shrink-0"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Standard Grid Layouts: win11_split, inline_pills, minimal_grid */
              <div
                className={`flex-1 grid ${
                  effectiveCols === 4 ? 'grid-cols-4' : 'grid-cols-3'
                } gap-x-2.5 gap-y-2`}
              >
                {currentTiles.map((id) => {
                  const meta = ALL_CONTROL_TILES.find((t) => t.id === id) ?? ALL_CONTROL_TILES[0];
                  const active = isTileActive(id);
                  const caption = getTileCaption(id);
                  const showChevron =
                    Boolean(meta.hasSubmenu) && preferences.featureFlags.controlSubmenuChevrons;
                  const Icon = meta.Icon;
                  const surfaceCls = resolveTileSurfaceClasses(
                    preferences.tileSurfaceStyle,
                    active,
                    isLight
                  );

                  if (preferences.controlLayoutMode === 'win11_split') {
                    const isSplitToggleAndMenu =
                      showChevron && (id === 'wifi' || id === 'bluetooth');

                    return (
                      <div key={id} className="flex flex-col items-center gap-1 min-w-0">
                        <div
                          style={
                            active
                              ? {
                                  backgroundColor: palette.primaryHex,
                                  boxShadow: iconMetrics.showHalo
                                    ? `0 0 16px ${palette.primaryHex}45`
                                    : undefined,
                                }
                              : undefined
                          }
                          className={`w-full ${pillMetrics.tileHeightClass} ${pillMetrics.radiusClass} flex items-stretch overflow-hidden border transition-all duration-150 ${surfaceCls} ${
                            active ? `border-transparent ${palette.onPrimaryTextClass}` : ''
                          }`}
                        >
                          {isSplitToggleAndMenu ? (
                            <>
                              <button
                                type="button"
                                aria-pressed={active}
                                aria-label={`Toggle ${meta.label}`}
                                onClick={() => handleTileToggle(id)}
                                className="flex-1 flex items-center justify-center hover:brightness-95 active:scale-[0.98] transition-transform focus-visible:outline-2 focus-visible:outline-white"
                              >
                                <ThemedIcon
                                  name={id as ThemedIconName}
                                  packStyle={preferences.iconPack}
                                  size={16}
                                  strokeWidth={iconMetrics.strokeWidth}
                                />
                              </button>
                              <span
                                aria-hidden="true"
                                className={`w-px my-2 ${
                                  active ? 'bg-slate-950/20' : 'bg-white/12'
                                }`}
                              />
                              <button
                                type="button"
                                aria-label={`Open ${meta.label} list`}
                                onClick={() => openTileSubmenu(id)}
                                className="w-9 flex items-center justify-center hover:brightness-95 active:scale-[0.98] transition-transform focus-visible:outline-2 focus-visible:outline-white"
                              >
                                <ChevronRight
                                  className="w-4 h-4"
                                  strokeWidth={iconMetrics.strokeWidth}
                                />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              aria-pressed={active}
                              aria-label={showChevron ? `Open ${meta.label} menu` : meta.label}
                              onClick={() =>
                                showChevron ? openTileSubmenu(id) : handleTileToggle(id)
                              }
                              className="w-full h-full flex items-center justify-center gap-2 hover:brightness-95 active:scale-[0.98] transition-transform focus-visible:outline-2 focus-visible:outline-sky-400"
                            >
                              <ThemedIcon
                                name={id as ThemedIconName}
                                packStyle={preferences.iconPack}
                                size={16}
                                strokeWidth={iconMetrics.strokeWidth}
                              />
                              {showChevron && (
                                <ChevronRight
                                  className="w-3.5 h-3.5 opacity-85"
                                  strokeWidth={iconMetrics.strokeWidth}
                                />
                              )}
                            </button>
                          )}
                        </div>
                        <span
                          className={`${pillMetrics.labelSizeClass} ${
                            isLight ? 'text-stone-800' : 'text-slate-200'
                          } font-medium truncate max-w-full text-center leading-tight`}
                          title={caption}
                        >
                          {caption}
                        </span>
                      </div>
                    );
                  }

                  if (preferences.controlLayoutMode === 'inline_pills') {
                    return (
                      <div
                        key={id}
                        style={
                          active
                            ? {
                                backgroundColor: `${palette.primaryHex}24`,
                                borderColor: `${palette.primaryHex}66`,
                              }
                            : undefined
                        }
                        className={`flex items-center justify-between ${pillMetrics.tilePaddingClass} ${pillMetrics.radiusClass} border transition-colors ${surfaceCls}`}
                      >
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={() => handleTileToggle(id)}
                          className="flex items-center gap-2 min-w-0 flex-1 text-left"
                        >
                          <span
                            style={active ? { backgroundColor: palette.primaryHex } : undefined}
                            className={`${pillMetrics.iconBoxClass} ${iconMetrics.badgeRadiusClass} flex items-center justify-center shrink-0 ${
                              active ? palette.onPrimaryTextClass : 'bg-white/10 text-slate-200'
                            }`}
                          >
                            <ThemedIcon
                              name={id as ThemedIconName}
                              packStyle={preferences.iconPack}
                              size={14}
                              strokeWidth={iconMetrics.strokeWidth}
                            />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[11px] font-semibold truncate">
                              {meta.label}
                            </span>
                            <span className="block text-[10px] opacity-75 truncate">{caption}</span>
                          </span>
                        </button>
                        {showChevron && (
                          <button
                            type="button"
                            aria-label={`Open ${meta.label} list`}
                            onClick={() => openTileSubmenu(id)}
                            className="p-1 rounded-lg hover:bg-white/12 shrink-0 ml-1"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={id}
                      className={`flex items-center justify-between border rounded-xl px-2.5 py-2 ${surfaceCls}`}
                    >
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => handleTileToggle(id)}
                        className="flex items-center gap-2 min-w-0 flex-1 text-left"
                      >
                        <ThemedIcon
                          name={id as ThemedIconName}
                          packStyle={preferences.iconPack}
                          size={16}
                          color={active ? palette.primaryHex : undefined}
                          strokeWidth={iconMetrics.strokeWidth}
                        />
                        <span className="text-xs font-medium truncate">{caption}</span>
                      </button>
                      {showChevron && (
                        <button
                          type="button"
                          aria-label={`Open ${meta.label} list`}
                          onClick={() => openTileSubmenu(id)}
                          className="p-0.5 opacity-75 hover:opacity-100"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Right-Side Vertical Pagination Dots & Arrows */}
            {pages.length > 1 && (
              <div className="flex flex-col items-center justify-center gap-1.5 pl-0.5 shrink-0">
                <button
                  type="button"
                  disabled={safePage === 0}
                  aria-label="Previous quick settings page"
                  onClick={() => {
                    playTactilePop('tab');
                    setPageIndex((p) => Math.max(0, p - 1));
                  }}
                  className="p-0.5 text-slate-400 hover:text-white disabled:opacity-25"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <div className="flex flex-col items-center gap-1.5">
                  {pages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      aria-label={`Quick settings page ${idx + 1}`}
                      onClick={() => {
                        playTactilePop('tab');
                        setPageIndex(idx);
                      }}
                      style={idx === safePage ? { backgroundColor: palette.primaryHex } : undefined}
                      className={`rounded-full transition-all ${
                        idx === safePage ? 'w-2 h-2' : 'w-1.5 h-1.5 bg-white/30'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  disabled={safePage >= pages.length - 1}
                  aria-label="Next quick settings page"
                  onClick={() => {
                    playTactilePop('tab');
                    setPageIndex((p) => Math.min(pages.length - 1, p + 1));
                  }}
                  className="p-0.5 text-slate-400 hover:text-white disabled:opacity-25"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Hardware Sliders: Either Vertical Pillars beside Blocks OR Horizontal Bars below Blocks */}
          {(preferences.showControlBrightnessSlider || preferences.showControlVolumeSlider) &&
            (isVerticalSliders ? (
              <div className="flex items-stretch gap-2 pl-2 border-l border-white/10 shrink-0">
                {preferences.showControlBrightnessSlider && (
                  <div className="flex flex-col items-center justify-between gap-1">
                    <span className="text-[10px] font-mono tabular-nums">{brightnessLevel}%</span>
                    <FluidEffectSlider
                      value={brightnessLevel}
                      min={0}
                      max={100}
                      onChange={onChangeBrightness}
                      styleVariant={preferences.controlSliderStyle}
                      primaryHex={palette.primaryHex}
                      secondaryHex={palette.secondaryHex}
                      glowIntensity={preferences.sliderGlowIntensity}
                      ariaLabel="Control Center Brightness"
                      orientation="vertical"
                      isLightSurface={isLight}
                    />
                    <ThemedIcon
                      name="sun"
                      packStyle={preferences.iconPack}
                      size={14}
                      className="opacity-80"
                      strokeWidth={iconMetrics.strokeWidth}
                    />
                  </div>
                )}
                {preferences.showControlVolumeSlider && (
                  <div className="flex flex-col items-center justify-between gap-1">
                    <span className="text-[10px] font-mono tabular-nums">{volumeLevel}%</span>
                    <FluidEffectSlider
                      value={volumeLevel}
                      min={0}
                      max={100}
                      onChange={onChangeVolume}
                      styleVariant={preferences.controlSliderStyle}
                      primaryHex={palette.primaryHex}
                      secondaryHex={palette.secondaryHex}
                      glowIntensity={preferences.sliderGlowIntensity}
                      ariaLabel="Control Center Volume"
                      orientation="vertical"
                      isLightSurface={isLight}
                    />
                    <button
                      type="button"
                      aria-label="Open Sound Output and Volume Mixer"
                      onClick={() => {
                        playTactilePop('tab');
                        setSubmenu('sound_mixer');
                      }}
                      className="p-1 rounded-lg bg-white/10 hover:bg-white/20"
                    >
                      <ThemedIcon
                        name="volume"
                        packStyle={preferences.iconPack}
                        size={14}
                        strokeWidth={iconMetrics.strokeWidth}
                      />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`pt-2 border-t space-y-1.5 ${
                  isLight ? 'border-stone-900/15' : 'border-white/10'
                }`}
              >
                {preferences.showControlBrightnessSlider && (
                  <div className="flex items-center gap-3 px-1">
                    <ThemedIcon
                      name="sun"
                      packStyle={preferences.iconPack}
                      size={16}
                      className="shrink-0"
                      strokeWidth={iconMetrics.strokeWidth}
                    />
                    <FluidEffectSlider
                      value={brightnessLevel}
                      min={0}
                      max={100}
                      onChange={onChangeBrightness}
                      styleVariant={preferences.controlSliderStyle}
                      primaryHex={palette.primaryHex}
                      secondaryHex={palette.secondaryHex}
                      glowIntensity={preferences.sliderGlowIntensity}
                      ariaLabel="Control Center Brightness"
                      formatTooltip={(v) => `${v}%`}
                      lowPowerEco={preferences.featureFlags.lowRamEcoMode}
                      isLightSurface={isLight}
                    />
                    <span className="text-[11px] font-mono tabular-nums w-8 text-right shrink-0">
                      {brightnessLevel}%
                    </span>
                  </div>
                )}

                {preferences.showControlVolumeSlider && (
                  <div className="flex items-center gap-3 px-1">
                    <ThemedIcon
                      name="volume"
                      packStyle={preferences.iconPack}
                      size={16}
                      className="shrink-0"
                      strokeWidth={iconMetrics.strokeWidth}
                    />
                    <FluidEffectSlider
                      value={volumeLevel}
                      min={0}
                      max={100}
                      onChange={onChangeVolume}
                      styleVariant={preferences.controlSliderStyle}
                      primaryHex={palette.primaryHex}
                      secondaryHex={palette.secondaryHex}
                      glowIntensity={preferences.sliderGlowIntensity}
                      ariaLabel="Control Center Volume"
                      formatTooltip={(v) => `${v}%`}
                      lowPowerEco={preferences.featureFlags.lowRamEcoMode}
                      isLightSurface={isLight}
                    />
                    <button
                      type="button"
                      aria-label="Open Sound Output and Volume Mixer"
                      title="Sound Output & Per-App Volume Mixer"
                      onClick={() => {
                        playTactilePop('tab');
                        setSubmenu('sound_mixer');
                      }}
                      className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/14 transition-colors shrink-0"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 2. EXPANDED NETWORK SPEED SPARKLINE, IP/DATA TELEMETRY & POWER MONITOR
 * ========================================================================== */
interface SystemPowerMonitorPanelProps {
  systemState: WindowsSystemState;
  onUpdateSystemState: (patch: Partial<WindowsSystemState>) => void;
  preferences: LedgePreferences;
  onUpdatePreferences: (patch: Partial<LedgePreferences>) => void;
}

function buildSparklinePoints(series: number[], width: number, height: number, maxVal: number): string {
  if (series.length === 0) return '';
  const stepX = width / Math.max(1, series.length - 1);
  return series
    .map((val, idx) => {
      const x = idx * stepX;
      const y = height - Math.min(1, Math.max(0, val / Math.max(1, maxVal))) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export const SystemPowerMonitorPanel: React.FC<SystemPowerMonitorPanelProps> = ({
  systemState,
  onUpdateSystemState,
  preferences,
  onUpdatePreferences,
}) => {
  const [revealPublicIp, setRevealPublicIp] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [testingSpeed, setTestingSpeed] = useState(false);
  const [batteryPreviewMode, setBatteryPreviewMode] = useState<
    BatteryOperationalMode | undefined
  >(undefined);

  const palette = resolveThemePalette(
    preferences.themeId,
    preferences.customPrimaryHex,
    preferences.customSecondaryHex
  );
  const isLight = Boolean(palette.isLightSurface);
  const eta = computeBatteryEta(
    systemState.batteryPct,
    systemState.isCharging,
    systemState.chargingWatts
  );

  const copyValue = (key: string, val: string) => {
    navigator.clipboard?.writeText(val).catch(() => {});
    setCopiedField(key);
    playTactilePop('confirm');
    window.setTimeout(() => setCopiedField(null), 1400);
  };

  const runBurstSpeedTest = () => {
    if (testingSpeed) return;
    setTestingSpeed(true);
    playTactilePop('toggleOn');
    let ticks = 0;
    const timer = window.setInterval(() => {
      ticks++;
      const simulatedDown = Number((340 + Math.random() * 145).toFixed(1));
      const simulatedUp = Number((108 + Math.random() * 44).toFixed(1));
      onUpdateSystemState({
        netDownMbps: simulatedDown,
        netUpMbps: simulatedUp,
        netPeakDownMbps: Math.max(systemState.netPeakDownMbps, simulatedDown),
        pingMs: Math.max(7, Math.round(9 + Math.random() * 4)),
        netHistoryDown: [...systemState.netHistoryDown.slice(1), simulatedDown],
        netHistoryUp: [...systemState.netHistoryUp.slice(1), simulatedUp],
      });
      if (ticks >= 5) {
        window.clearInterval(timer);
        setTestingSpeed(false);
        playTactilePop('confirm');
      }
    }, 260);
  };

  const cardSurface = isLight
    ? 'bg-stone-900/[0.05] border-stone-900/15 text-stone-900'
    : 'bg-white/[0.04] border-white/[0.09] text-slate-100';

  const maxGraphScale = Math.max(400, systemState.netPeakDownMbps, ...systemState.netHistoryDown);
  const downPoly = buildSparklinePoints(systemState.netHistoryDown, 280, 52, maxGraphScale);
  const upPoly = buildSparklinePoints(systemState.netHistoryUp, 280, 52, maxGraphScale);

  const maskedPublicIp = (systemState.publicIp || '127.0.0.1').replace(/\.\d+\.\d+$/, '.•••.••');

  return (
    <div className="flex flex-col justify-between h-full gap-2 select-text">
      {/* TOP HERO ROW: Large Internet Speed + Dual-Sparkline Tile (7 cols) & Power/PD ETA (5 cols) */}
      <div className="grid grid-cols-12 gap-2.5 flex-1 min-h-0">
        {/* Big Live Internet Throughput & Latency Card */}
        <div className={`col-span-7 border rounded-2xl p-3 flex flex-col justify-between ${cardSurface}`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[11px] opacity-75 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" style={{ color: palette.primaryHex }} />
                <span>Live Internet Speed · {systemState.wifiSsid}</span>
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="flex items-baseline gap-1">
                  <ArrowDown className="w-3.5 h-3.5 text-emerald-400 self-center" />
                  <span className="text-xl font-mono font-bold tabular-nums">
                    {systemState.netDownMbps.toFixed(1)}
                  </span>
                  <span className="text-[10px] font-mono opacity-70">Mbps</span>
                </span>
                <span className="flex items-baseline gap-1">
                  <ArrowUp className="w-3.5 h-3.5 text-sky-400 self-center" />
                  <span className="text-base font-mono font-semibold tabular-nums">
                    {systemState.netUpMbps.toFixed(1)}
                  </span>
                  <span className="text-[10px] font-mono opacity-70">Mbps</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 select-none">
              <button
                type="button"
                onClick={runBurstSpeedTest}
                style={{ backgroundColor: palette.primaryHex }}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold transition-opacity ${palette.onPrimaryTextClass}`}
              >
                {testingSpeed ? 'Testing...' : 'Speed Test'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdatePreferences({ showCompactStats: !preferences.showCompactStats });
                  playTactilePop('toggleOn');
                }}
                className="px-2 py-1 rounded-lg text-[10.5px] bg-white/10 hover:bg-white/16"
              >
                {preferences.showCompactStats ? 'Pinned' : 'Pin'}
              </button>
            </div>
          </div>

          {/* Live Dual SVG Sparkline (Download + Upload) */}
          <div className="my-1.5 rounded-xl bg-black/30 border border-white/[0.07] px-2.5 py-1.5">
            <svg
              viewBox="0 0 280 52"
              preserveAspectRatio="none"
              className="w-full h-12 overflow-visible block"
              aria-label="Live download and upload throughput sparkline"
            >
              <line x1="0" y1="16" x2="280" y2="16" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
              <line x1="0" y1="34" x2="280" y2="34" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
              <polygon
                points={`0,52 ${downPoly} 280,52`}
                fill={palette.primaryHex}
                fillOpacity="0.14"
              />
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeOpacity="0.7"
                strokeWidth="1.6"
                vectorEffect="non-scaling-stroke"
                points={upPoly}
              />
              <polyline
                fill="none"
                stroke={palette.primaryHex}
                strokeWidth="2.2"
                vectorEffect="non-scaling-stroke"
                points={downPoly}
              />
            </svg>
          </div>

          {/* Ping, Jitter, Packet Loss, Peak & Session Data Usage */}
          <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono tabular-nums pt-1 border-t border-white/10">
            <div>
              <span className="opacity-65 block">Ping / Jitter</span>
              <span className="font-semibold">
                {systemState.pingMs}ms / {systemState.jitterMs}ms
              </span>
            </div>
            <div>
              <span className="opacity-65 block">Packet Loss</span>
              <span className="font-semibold text-emerald-400">
                {systemState.packetLossPct.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="opacity-65 block">Peak Down</span>
              <span className="font-semibold">{systemState.netPeakDownMbps.toFixed(0)} Mbps</span>
            </div>
            <div>
              <span className="opacity-65 block">Session Data</span>
              <span className="font-semibold">
                {systemState.sessionDownGb}G ↓ · {systemState.sessionUpGb}G ↑
              </span>
            </div>
          </div>
        </div>

        {/* Right 5 cols: USB-C PD Charging Speed, Animated Battery Symbol & Time-to-Full ETA */}
        <div className={`col-span-5 border rounded-2xl p-3 flex flex-col justify-between ${cardSurface}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[11px] opacity-75">Power &amp; Battery PD</div>
              <div className="flex items-center gap-2 mt-0.5">
                <AnimatedBatterySymbol
                  percent={
                    batteryPreviewMode === 'idle_full'
                      ? 100
                      : batteryPreviewMode === 'low'
                        ? 14
                        : systemState.batteryPct
                  }
                  isCharging={
                    batteryPreviewMode
                      ? batteryPreviewMode === 'charging' || batteryPreviewMode === 'idle_full'
                      : systemState.isCharging
                  }
                  modeOverride={batteryPreviewMode}
                  accentHex={palette.primaryHex}
                  size="lg"
                  lowPowerEco={preferences.featureFlags.lowRamEcoMode}
                />
                <div className="min-w-0">
                  <div className="text-lg font-mono font-bold tabular-nums leading-none">
                    {batteryPreviewMode === 'idle_full'
                      ? 100
                      : batteryPreviewMode === 'low'
                        ? 14
                        : systemState.batteryPct}
                    %
                  </div>
                  <div
                    className={`text-[10.5px] font-medium truncate mt-0.5 ${
                      (batteryPreviewMode ?? (systemState.isCharging ? 'charging' : 'discharging')) ===
                        'charging' ||
                      batteryPreviewMode === 'idle_full'
                        ? 'text-emerald-400'
                        : batteryPreviewMode === 'low'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                    }`}
                  >
                    {batteryPreviewMode === 'idle_full'
                      ? 'Idle · Full AC'
                      : batteryPreviewMode === 'low'
                        ? 'Low · Saver Ready'
                        : batteryPreviewMode === 'discharging'
                          ? 'On Battery Drain'
                          : batteryPreviewMode === 'charging'
                            ? 'SuperFast PD'
                            : eta.formattedEta}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setBatteryPreviewMode(undefined);
                const nextCharging = !systemState.isCharging;
                onUpdateSystemState({
                  isCharging: nextCharging,
                  chargingWatts: nextCharging ? 65 : 11,
                });
                playTactilePop('toggleOn');
              }}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg transition-colors whitespace-nowrap select-none shrink-0 ${
                systemState.isCharging
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-white/10 opacity-85'
              }`}
            >
              {systemState.isCharging ? 'USB-C PD' : 'Battery'}
            </button>
          </div>

          <div className="my-1.5">
            <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
              <div
                style={{
                  width: `${
                    batteryPreviewMode === 'idle_full'
                      ? 100
                      : batteryPreviewMode === 'low'
                        ? 14
                        : systemState.batteryPct
                  }%`,
                  background:
                    batteryPreviewMode === 'low'
                      ? '#fb7185'
                      : systemState.isCharging || batteryPreviewMode === 'charging' || batteryPreviewMode === 'idle_full'
                        ? `linear-gradient(90deg, #34d399 0%, ${palette.primaryHex} 100%)`
                        : '#fbbf24',
                }}
                className="h-full rounded-full transition-all duration-300"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono opacity-75 tabular-nums mt-1">
              <span>
                {batteryPreviewMode === 'idle_full'
                  ? '0W Trickle · Charged'
                  : batteryPreviewMode === 'low'
                    ? '-14W Low Cell'
                    : systemState.isCharging && batteryPreviewMode !== 'discharging'
                      ? `+${systemState.chargingWatts}W SuperFast`
                      : `-${systemState.chargingWatts}W Drain`}
              </span>
              <span>{systemState.batteryTempC.toFixed(1)}°C</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/10 select-none">
            <div className="flex items-center gap-0.5">
              {(
                [
                  { id: undefined, label: 'Auto' },
                  { id: 'charging', label: 'Chg' },
                  { id: 'discharging', label: 'Drn' },
                  { id: 'idle_full', label: 'Idle' },
                  { id: 'low', label: 'Low' },
                ] as { id: BatteryOperationalMode | undefined; label: string }[]
              ).map((st) => {
                const active = batteryPreviewMode === st.id;
                return (
                  <button
                    key={st.label}
                    type="button"
                    onClick={() => {
                      setBatteryPreviewMode(st.id);
                      playTactilePop('tab');
                    }}
                    title={`Preview animated battery state: ${st.label}`}
                    style={active ? { backgroundColor: palette.primaryHex } : undefined}
                    className={`px-1.5 py-0.5 text-[9.5px] font-mono rounded transition-colors ${
                      active
                        ? `${palette.onPrimaryTextClass} font-semibold`
                        : 'bg-white/[0.08] hover:bg-white/16 opacity-80'
                    }`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-0.5">
              {[65, 100].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => {
                    setBatteryPreviewMode(undefined);
                    onUpdateSystemState({ isCharging: true, chargingWatts: w });
                    playTactilePop('tab');
                  }}
                  style={
                    !batteryPreviewMode &&
                    systemState.isCharging &&
                    systemState.chargingWatts === w
                      ? { backgroundColor: palette.primaryHex }
                      : undefined
                  }
                  className={`px-1.5 py-0.5 text-[9.5px] font-mono rounded transition-colors tabular-nums ${
                    !batteryPreviewMode &&
                    systemState.isCharging &&
                    systemState.chargingWatts === w
                      ? `${palette.onPrimaryTextClass} font-semibold`
                      : 'bg-white/10 hover:bg-white/18'
                  }`}
                >
                  {w}W
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM DENSE TELEMETRY ROW: Copyable IP / DNS / Wi-Fi 6E + CPU / GPU / Native RAM */}
      <div className="grid grid-cols-12 gap-2">
        {/* Local IPv4 + Gateway */}
        <div className={`col-span-3 border rounded-xl px-2.5 py-2 flex flex-col justify-between ${cardSurface}`}>
          <div className="flex items-center justify-between text-[10px] opacity-75">
            <span className="flex items-center gap-1">
              <Server className="w-3 h-3" style={{ color: palette.primaryHex }} />
              <span>Local IPv4</span>
            </span>
            <button
              type="button"
              aria-label="Copy Local IPv4 address"
              onClick={() => copyValue('lan', systemState.localIpv4)}
              className="hover:opacity-100 opacity-75 select-none"
            >
              {copiedField === 'lan' ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
          <div className="text-xs font-mono font-semibold tabular-nums cursor-text mt-0.5">
            {systemState.localIpv4}
          </div>
          <div className="text-[10px] font-mono opacity-70 truncate">
            GW {systemState.gatewayIp}
          </div>
        </div>

        {/* Public WAN IP + ISP (with privacy reveal + copy) */}
        <div className={`col-span-4 border rounded-xl px-2.5 py-2 flex flex-col justify-between ${cardSurface}`}>
          <div className="flex items-center justify-between text-[10px] opacity-75">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-sky-400" />
              <span>Public IP · ISP</span>
            </span>
            <div className="flex items-center gap-1.5 select-none">
              <button
                type="button"
                aria-label={revealPublicIp ? 'Mask Public IP' : 'Reveal Public IP'}
                onClick={() => setRevealPublicIp((v) => !v)}
                className="opacity-75 hover:opacity-100"
              >
                {revealPublicIp ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
              <button
                type="button"
                aria-label="Copy Public IP"
                onClick={() => copyValue('wan', systemState.publicIp)}
                className="opacity-75 hover:opacity-100"
              >
                {copiedField === 'wan' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
          <div className="text-xs font-mono font-semibold tabular-nums cursor-text mt-0.5">
            {revealPublicIp ? systemState.publicIp : maskedPublicIp}
          </div>
          <div className="text-[10px] opacity-70 truncate">
            {systemState.ispName} · DNS {systemState.dnsServer.split(' ')[0]}
          </div>
        </div>

        {/* Wi-Fi 6E PHY Link & Signal */}
        <div className={`col-span-2 border rounded-xl px-2.5 py-2 flex flex-col justify-between ${cardSurface}`}>
          <div className="flex items-center justify-between text-[10px] opacity-75">
            <span>PHY Link</span>
            <Wifi className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-xs font-mono font-semibold tabular-nums mt-0.5">
            {systemState.wifiLinkMbps}M
          </div>
          <div className="text-[10px] font-mono opacity-70 truncate">
            {systemState.wifiRssiDbm} dBm
          </div>
        </div>

        {/* CPU / GPU / NativeAOT RAM */}
        <div className={`col-span-3 border rounded-xl px-2.5 py-2 flex flex-col justify-between ${cardSurface}`}>
          <div className="flex items-center justify-between text-[10px] opacity-75">
            <span>CPU · GPU · RAM</span>
            <Cpu className="w-3 h-3" style={{ color: palette.primaryHex }} />
          </div>
          <div className="text-xs font-mono font-semibold tabular-nums mt-0.5">
            {systemState.cpuUsagePct.toFixed(0)}% · {systemState.gpuUsagePct}% ·{' '}
            {preferences.featureFlags.lowRamEcoMode ? '9.8' : systemState.ledgeNativeRamMb}MB
          </div>
          <div className="text-[10px] font-mono opacity-70 truncate">
            NVMe {systemState.nvmeReadMb} MB/s · {systemState.gpuTempC}°C
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 3. THE 4-BLOCKS ALL-APPS LAUNCHER MENU PAGE
 * ========================================================================== */
interface AppMenuGridPanelProps {
  onOpenTab: (tab: LedgeTab) => void;
  onOpenFullSettings: () => void;
  onOpenVoiceAgent?: () => void;
  reminders: ReminderTask[];
  onToggleReminder: (id: string) => void;
  onAddReminder: (title: string) => void;
  stopwatchRunning: boolean;
  stopwatchMs: number;
  onToggleStopwatch: () => void;
  onResetStopwatch: () => void;
}

type MiniSubTool = 'apps' | 'reminders' | 'stopwatch' | 'calc';

export const AppMenuGridPanel: React.FC<AppMenuGridPanelProps> = ({
  onOpenTab,
  onOpenFullSettings,
  onOpenVoiceAgent,
  reminders,
  onToggleReminder,
  onAddReminder,
  stopwatchRunning,
  stopwatchMs,
  onToggleStopwatch,
  onResetStopwatch,
}) => {
  const [subView, setSubView] = useState<MiniSubTool>('apps');
  const [newTask, setNewTask] = useState('');
  const [calcExpr, setCalcExpr] = useState('65 * 0.88');
  const [calcResult, setCalcResult] = useState('57.2');

  const evaluateQuickMath = (input: string) => {
    setCalcExpr(input);
    const sanitized = input.replace(/[^0-9+\-*/().\s%]/g, '');
    if (!sanitized.trim()) {
      setCalcResult('—');
      return;
    }
    try {
      const val = Function(`"use strict"; return (${sanitized});`)();
      if (typeof val === 'number' && Number.isFinite(val)) {
        setCalcResult(Number(val.toFixed(4)).toString());
      }
    } catch {
      // Wait until expression is complete
    }
  };

  if (subView === 'reminders') {
    return (
      <div className="flex flex-col justify-between h-full gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold">Reminders &amp; Tasks</span>
          <button
            type="button"
            onClick={() => setSubView('apps')}
            className="text-xs text-sky-400 hover:underline"
          >
            ← Back to All Apps
          </button>
        </div>
        <div className="flex-1 overflow-y-auto ledge-scroll space-y-1 pr-1">
          {reminders.map((r) => (
            <label
              key={r.id}
              className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] cursor-pointer text-xs"
            >
              <span className="flex items-center gap-2 min-w-0">
                <input
                  type="checkbox"
                  checked={r.completed}
                  onChange={() => onToggleReminder(r.id)}
                  className="rounded accent-sky-400"
                />
                <span className={r.completed ? 'line-through opacity-50 truncate' : 'truncate'}>
                  {r.title}
                </span>
              </span>
              <span className="text-[11px] font-mono opacity-60 tabular-nums shrink-0">
                {r.dueTime}
              </span>
            </label>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newTask.trim()) return;
            onAddReminder(newTask.trim());
            setNewTask('');
            playTactilePop('confirm');
          }}
          className="flex items-center gap-1.5"
        >
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add reminder..."
            aria-label="New reminder title"
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-sky-400"
          />
          <button
            type="submit"
            className="px-3 py-1 text-xs font-semibold bg-white text-slate-950 rounded-lg"
          >
            Add
          </button>
        </form>
      </div>
    );
  }

  if (subView === 'stopwatch') {
    return (
      <div className="flex flex-col items-center justify-between h-full py-2">
        <div className="w-full flex items-center justify-between">
          <span className="text-xs font-semibold">Precision Centisecond Stopwatch</span>
          <button
            type="button"
            onClick={() => setSubView('apps')}
            className="text-xs text-sky-400 hover:underline"
          >
            ← Back to All Apps
          </button>
        </div>
        <div className="text-3xl font-mono font-bold tabular-nums tracking-tight">
          {formatStopwatchClock(stopwatchMs)}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleStopwatch}
            className="px-5 py-1.5 text-xs font-semibold bg-white text-slate-950 rounded-xl"
          >
            {stopwatchRunning ? 'Pause' : 'Start'}
          </button>
          <button
            type="button"
            onClick={onResetStopwatch}
            className="px-4 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/16 rounded-xl"
          >
            Reset
          </button>
        </div>
      </div>
    );
  }

  if (subView === 'calc') {
    return (
      <div className="flex flex-col justify-between h-full py-1 gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold">Instant Math &amp; Unit Scratch</span>
          <button
            type="button"
            onClick={() => setSubView('apps')}
            className="text-xs text-sky-400 hover:underline"
          >
            ← Back to All Apps
          </button>
        </div>
        <input
          type="text"
          value={calcExpr}
          aria-label="Math expression"
          onChange={(e) => evaluateQuickMath(e.target.value)}
          placeholder="Type math e.g. (1920 * 1080) / 1024..."
          className="w-full bg-slate-950/75 border border-white/15 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-sky-400"
        />
        <div className="flex items-center justify-between bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5">
          <span className="text-xs opacity-75">Result</span>
          <span className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
            = {calcResult}
          </span>
        </div>
      </div>
    );
  }

  const APP_ITEMS = [
    { id: 'home', label: 'Home Hub', desc: 'Custom Widgets', Icon: Home, color: 'text-sky-300 bg-sky-500/15', action: () => onOpenTab('home') },
    { id: 'control', label: 'Controls', desc: 'Vert & Horiz', Icon: Sliders, color: 'text-cyan-300 bg-cyan-500/15', action: () => onOpenTab('control') },
    { id: 'ai', label: 'Copilot & Web', desc: 'Chat & Search', Icon: Sparkles, color: 'text-indigo-300 bg-indigo-500/15', action: () => onOpenTab('ai') },
    { id: 'agent', label: 'Voice Agent', desc: 'Alt+V Siri/OS', Icon: HardDrive, color: 'text-fuchsia-300 bg-fuchsia-500/15', action: () => (onOpenVoiceAgent ? onOpenVoiceAgent() : onOpenTab('ai')) },
    { id: 'tray', label: 'File Tray', desc: 'Drop & ZIP', Icon: FolderOpen, color: 'text-amber-300 bg-amber-500/15', action: () => onOpenTab('tray') },
    { id: 'clipboard', label: 'Smart Clips', desc: 'Full Previews', Icon: ClipboardIcon, color: 'text-emerald-300 bg-emerald-500/15', action: () => onOpenTab('clipboard') },
    { id: 'monitor', label: 'Net & IP Pro', desc: 'Mbps & WAN IP', Icon: Zap, color: 'text-teal-300 bg-teal-500/15', action: () => onOpenTab('monitor') },
    { id: 'notes', label: 'Scratchpad', desc: 'Notes & Mic', Icon: StickyNote, color: 'text-yellow-200 bg-yellow-500/15', action: () => onOpenTab('notes') },
    { id: 'mirror', label: 'Mirror', desc: 'Cam & Rim', Icon: Camera, color: 'text-rose-300 bg-rose-500/15', action: () => onOpenTab('mirror') },
    { id: 'reminders', label: 'Reminders', desc: `${reminders.filter((r) => !r.completed).length} due today`, Icon: CheckSquare, color: 'text-purple-300 bg-purple-500/15', action: () => setSubView('reminders') },
    { id: 'stopwatch', label: 'Stopwatch', desc: '100Hz Laps', Icon: Timer, color: 'text-orange-300 bg-orange-500/15', action: () => setSubView('stopwatch') },
    { id: 'settings', label: 'A–Z Kits', desc: 'Customize All', Icon: Settings, color: 'text-slate-200 bg-white/15', action: onOpenFullSettings },
  ];

  return (
    <div className="flex flex-col justify-between h-full gap-1.5">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-xs font-semibold">All Dynamic Island Apps</span>
        <button
          type="button"
          onClick={() => setSubView('calc')}
          className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
        >
          <Calculator className="w-3 h-3" />
          <span>Open Quick Math</span>
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2 flex-1">
        {APP_ITEMS.map((app) => {
          const Icon = app.Icon;
          return (
            <button
              key={app.id}
              type="button"
              onClick={() => {
                playTactilePop('tab');
                app.action();
              }}
              className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.07] text-left transition-colors group focus-visible:outline-2 focus-visible:outline-sky-400"
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${app.color}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">{app.label}</div>
                <div className="text-[10px] opacity-70 truncate">{app.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
