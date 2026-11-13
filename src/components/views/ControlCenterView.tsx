import React, { useState } from 'react';
import { usePillStore } from '../../store/usePillStore';
import { useTauriHardwareBridge } from '../../hooks/useTauriHardwareBridge';
import { ControlCenterLayoutMode } from '../../types/preferences';
import {
  Wifi,
  Bluetooth,
  Moon,
  Shield,
  Plane,
  Radio,
  Volume2,
  VolumeX,
  ChevronRight,
  Sliders,
  Check,
  Lock,
  X,
} from 'lucide-react';

export const ControlCenterView: React.FC = () => {
  const preferences = usePillStore((s) => s.preferences);
  const updatePreferences = usePillStore((s) => s.updatePreferences);
  const telemetry = usePillStore((s) => s.systemTelemetry);
  const wifiNetworks = usePillStore((s) => s.wifiNetworks);
  const bluetoothDevices = usePillStore((s) => s.bluetoothDevices);

  const { setVolume, toggleNightLight, scanWifi, scanBluetooth } = useTauriHardwareBridge();

  const [activeSubmenu, setActiveSubmenu] = useState<'none' | 'wifi' | 'bluetooth'>('none');
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [hotspotMode, setHotspotMode] = useState(false);

  const layoutMode = preferences.controlLayoutMode || 'SquarishBlocks';
  const isEditing = preferences.isControlBlocksEditing;
  const tileOrder = preferences.controlTileOrder || [
    'wifi',
    'bluetooth',
    'nightlight',
    'privacy',
    'airplane',
    'hotspot',
  ];
  const tileSizes = preferences.controlTileSizes || {};

  const handleTileClick = (id: string) => {
    if (id === 'nightlight') {
      toggleNightLight();
    } else if (id === 'privacy') {
      updatePreferences({ privacyMaskEnabled: !preferences.privacyMaskEnabled });
    } else if (id === 'airplane') {
      setAirplaneMode(!airplaneMode);
    } else if (id === 'hotspot') {
      setHotspotMode(!hotspotMode);
    } else if (id === 'wifi') {
      scanWifi();
      setActiveSubmenu(activeSubmenu === 'wifi' ? 'none' : 'wifi');
    } else if (id === 'bluetooth') {
      scanBluetooth();
      setActiveSubmenu(activeSubmenu === 'bluetooth' ? 'none' : 'bluetooth');
    }
  };

  const getTileState = (id: string) => {
    switch (id) {
      case 'wifi':
        return { active: !airplaneMode, label: 'Wi-Fi', sublabel: 'Connected' };
      case 'bluetooth':
        return { active: true, label: 'Bluetooth', sublabel: 'On' };
      case 'nightlight':
        return {
          active: telemetry.night_light_enabled,
          label: 'Night Light',
          sublabel: telemetry.night_light_enabled ? 'Warm' : 'Off',
        };
      case 'privacy':
        return {
          active: preferences.privacyMaskEnabled,
          label: 'Privacy Cloak',
          sublabel: preferences.privacyMaskEnabled ? 'Active (0x11)' : 'Disabled',
        };
      case 'airplane':
        return { active: airplaneMode, label: 'Airplane Mode', sublabel: airplaneMode ? 'On' : 'Off' };
      case 'hotspot':
        return { active: hotspotMode, label: 'Mobile Hotspot', sublabel: hotspotMode ? 'Sharing' : 'Off' };
      default:
        return { active: false, label: id, sublabel: 'Off' };
    }
  };

  const getTileIcon = (id: string, active: boolean) => {
    switch (id) {
      case 'wifi':
        return <Wifi className="w-4 h-4" />;
      case 'bluetooth':
        return <Bluetooth className="w-4 h-4" />;
      case 'nightlight':
        return <Moon className="w-4 h-4" />;
      case 'privacy':
        return <Shield className="w-4 h-4" />;
      case 'airplane':
        return <Plane className="w-4 h-4" />;
      case 'hotspot':
        return <Radio className="w-4 h-4" />;
      default:
        return <Sliders className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-1 text-white select-none overflow-y-auto pill-scroll">
      {/* Top Header: Layout Mode Switcher & Edit Blocks Toggle */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-zinc-300">Control Center</span>
          <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10 text-[10px]">
            {(['SquarishBlocks', 'CircularOrbs', 'ClassicGrid'] as ControlCenterLayoutMode[]).map(
              (mode) => (
                <button
                  key={mode}
                  onClick={() => updatePreferences({ controlLayoutMode: mode })}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    layoutMode === mode
                      ? 'bg-cyan-500 text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {mode === 'SquarishBlocks' ? 'Squarish' : mode === 'CircularOrbs' ? 'Orbs' : 'Classic'}
                </button>
              )
            )}
          </div>
        </div>

        <button
          onClick={() =>
            updatePreferences({ isControlBlocksEditing: !preferences.isControlBlocksEditing })
          }
          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
            isEditing
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
          }`}
        >
          <Sliders className="w-3 h-3" />
          <span>{isEditing ? 'Done' : 'Edit Blocks'}</span>
        </button>
      </div>

      {/* Grid of Control Blocks / Orbs */}
      <div
        className={`grid gap-2 py-1 ${
          layoutMode === 'CircularOrbs' ? 'grid-cols-6' : 'grid-cols-6'
        }`}
      >
        {tileOrder.map((id) => {
          const state = getTileState(id);
          const hasSubmenu = id === 'wifi' || id === 'bluetooth';
          const isSpan2 = tileSizes[id] === '2x1';

          if (layoutMode === 'CircularOrbs') {
            return (
              <div
                key={id}
                className="flex flex-col items-center gap-1.5 col-span-1"
                onClick={() => handleTileClick(id)}
              >
                <div
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-md ${
                    state.active
                      ? 'bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-cyan-500/20'
                      : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700/80 border border-white/5'
                  }`}
                >
                  {getTileIcon(id, state.active)}
                  {hasSubmenu && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center text-zinc-300">
                      <ChevronRight className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-zinc-300 font-medium truncate max-w-[56px] text-center">
                  {state.label}
                </span>
              </div>
            );
          }

          // SquarishBlocks (Default!)
          return (
            <div
              key={id}
              onClick={() => handleTileClick(id)}
              className={`relative p-2.5 rounded-2xl flex flex-col justify-between cursor-pointer border transition-all ${
                isSpan2 ? 'col-span-2' : 'col-span-1'
              } h-[76px] ${
                state.active
                  ? 'bg-gradient-to-br from-cyan-500/25 via-indigo-500/20 to-black border-cyan-400/40 text-white shadow-lg shadow-cyan-500/10'
                  : 'bg-zinc-900/80 hover:bg-zinc-800/80 border-white/10 text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-1.5 rounded-xl ${
                    state.active ? 'bg-cyan-400 text-black' : 'bg-white/10 text-zinc-300'
                  }`}
                >
                  {getTileIcon(id, state.active)}
                </div>
                {hasSubmenu && (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 hover:text-white" />
                )}
              </div>

              <div>
                <div className="text-[11px] font-semibold text-white leading-tight truncate">
                  {state.label}
                </div>
                <div className="text-[9px] text-zinc-400 truncate mt-0.5">{state.sublabel}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submenu Popdown: Wi-Fi or Bluetooth */}
      {activeSubmenu !== 'none' && (
        <div className="my-2 p-3 rounded-2xl bg-zinc-950/95 border border-white/20 backdrop-blur-2xl shadow-2xl z-20">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold text-cyan-300">
              {activeSubmenu === 'wifi' ? 'Available Wi-Fi Networks' : 'Bluetooth Audio & Devices'}
            </span>
            <button
              onClick={() => setActiveSubmenu('none')}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-2 max-h-36 overflow-y-auto pill-scroll space-y-1">
            {activeSubmenu === 'wifi'
              ? wifiNetworks.map((net, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-medium text-white">{net.ssid}</span>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        {net.freq_ghz.toFixed(1)} GHz
                      </span>
                    </div>
                    {net.is_secured && <Lock className="w-3 h-3 text-zinc-400" />}
                  </div>
                ))
              : bluetoothDevices.map((dev, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Bluetooth className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-medium text-white">{dev.name}</span>
                    </div>
                    {dev.is_connected && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Connected
                      </span>
                    )}
                  </div>
                ))}
          </div>
        </div>
      )}

      {/* Bottom Volume Slider Card */}
      <div className="mt-2 p-2.5 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center gap-3">
        <button
          onClick={() => setVolume(telemetry.master_volume > 0 ? 0 : 0.65)}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          {telemetry.master_volume === 0 ? (
            <VolumeX className="w-4 h-4 text-red-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          )}
        </button>

        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={telemetry.master_volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        <span className="text-xs font-mono tabular-nums text-zinc-300 w-9 text-right">
          {Math.round(telemetry.master_volume * 100)}%
        </span>
      </div>
    </div>
  );
};
