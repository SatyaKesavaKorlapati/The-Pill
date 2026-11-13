import React from 'react';
import { usePillStore } from '../../store/usePillStore';
import { WidgetSizeVariant } from '../../types/preferences';
import { AnimatedBatterySymbol } from '../ui/AnimatedBatterySymbol';
import { Cpu, HardDrive, Zap, Activity, X } from 'lucide-react';

interface SystemMonitorWidgetProps {
  size?: WidgetSizeVariant;
  onRemove?: () => void;
  onChangeSize?: (newSize: WidgetSizeVariant) => void;
}

export const SystemMonitorWidget: React.FC<SystemMonitorWidgetProps> = ({
  size = 'Small',
  onRemove,
  onChangeSize,
}) => {
  const telemetry = usePillStore((s) => s.systemTelemetry);
  const isPlaygroundEditing = usePillStore((s) => s.preferences.isPlaygroundEditing);

  return (
    <div className="relative w-full h-full p-2.5 rounded-2xl bg-zinc-900/90 border border-white/10 hover:border-white/20 transition-all backdrop-blur-xl flex flex-col justify-between overflow-hidden group select-none text-white">
      {/* Playground Edit Badge Overlay */}
      {isPlaygroundEditing && (
        <div className="absolute top-1.5 right-1.5 z-30 flex items-center gap-1 bg-black/80 p-0.5 rounded-lg border border-white/20 backdrop-blur-md">
          {(['Small', 'Medium', 'Large', 'Vertical'] as WidgetSizeVariant[]).map((sv) => (
            <button
              key={sv}
              onClick={(e) => {
                e.stopPropagation();
                onChangeSize?.(sv);
              }}
              className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                size === sv ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {sv[0]}
            </button>
          ))}
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 rounded text-red-400 hover:bg-red-500/20"
              title="Remove widget"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-semibold tracking-wide text-zinc-300">
            System & Power
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>{telemetry.pd_watts}W PD</span>
        </div>
      </div>

      {/* Main Telemetry Body */}
      {size === 'Small' ? (
        <div className="grid grid-cols-2 gap-1.5 py-1">
          <div className="flex flex-col bg-white/5 rounded-xl p-1.5 border border-white/5">
            <div className="flex items-center gap-1 text-[9px] text-zinc-400">
              <Cpu className="w-2.5 h-2.5 text-cyan-400" />
              <span>CPU</span>
            </div>
            <span className="text-xs font-bold font-mono text-cyan-300 mt-0.5">
              {telemetry.cpu_usage_pct.toFixed(0)}%
            </span>
          </div>

          <div className="flex flex-col bg-white/5 rounded-xl p-1.5 border border-white/5">
            <div className="flex items-center gap-1 text-[9px] text-zinc-400">
              <HardDrive className="w-2.5 h-2.5 text-indigo-400" />
              <span>RAM</span>
            </div>
            <span className="text-xs font-bold font-mono text-indigo-300 mt-0.5">
              {telemetry.ram_used_gb.toFixed(1)} GB
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 py-1.5">
          <div className="flex flex-col bg-white/5 rounded-xl p-2 border border-white/5">
            <span className="text-[10px] text-zinc-400">CPU Usage</span>
            <span className="text-base font-bold font-mono text-cyan-300 mt-1">
              {telemetry.cpu_usage_pct.toFixed(1)}%
            </span>
            <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full"
                style={{ width: `${Math.min(100, telemetry.cpu_usage_pct)}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col bg-white/5 rounded-xl p-2 border border-white/5">
            <span className="text-[10px] text-zinc-400">RAM Allocated</span>
            <span className="text-base font-bold font-mono text-indigo-300 mt-1">
              {telemetry.ram_used_gb.toFixed(1)} / {telemetry.ram_total_gb.toFixed(0)}G
            </span>
            <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-indigo-400 h-full rounded-full"
                style={{
                  width: `${Math.min(100, (telemetry.ram_used_gb / telemetry.ram_total_gb) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="flex flex-col bg-white/5 rounded-xl p-2 border border-white/5">
            <span className="text-[10px] text-zinc-400">Battery Status</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-base font-bold font-mono text-emerald-300">
                {telemetry.battery_pct}%
              </span>
              <AnimatedBatterySymbol
                percent={telemetry.battery_pct}
                isCharging={telemetry.is_charging}
                size="sm"
              />
            </div>
            <span className="text-[9px] text-zinc-500 mt-1 font-mono">
              {telemetry.is_charging ? '65W Fast PD' : 'Discharging'}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Footer: Battery State */}
      <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5 border-t border-white/5">
        <span>Power Plan: Balanced High-Perf</span>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-mono">Clean Telemetry</span>
        </div>
      </div>
    </div>
  );
};
