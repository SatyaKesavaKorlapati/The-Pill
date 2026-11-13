import React from 'react';
import { usePillStore } from '../store/usePillStore';
import { AnimatedBatterySymbol } from './ui/AnimatedBatterySymbol';
import { Music, Sparkles } from 'lucide-react';

interface CollapsedCapsuleHudProps {
  onExpand: () => void;
  onSummonAstra: (e: React.MouseEvent) => void;
}

export const CollapsedCapsuleHud: React.FC<CollapsedCapsuleHudProps> = ({
  onExpand,
  onSummonAstra,
}) => {
  const mediaTrack = usePillStore((s) => s.mediaTrack);
  const telemetry = usePillStore((s) => s.systemTelemetry);
  const isPlaying = mediaTrack?.is_playing ?? false;

  return (
    <div
      onClick={onExpand}
      className="relative flex items-center justify-between w-[210px] h-[36px] px-2.5 rounded-full bg-black/95 text-white shadow-2xl border border-white/10 select-none cursor-pointer hover:border-white/20 transition-colors backdrop-blur-2xl"
      title="Click to expand Pill (or Alt+L)"
    >
      {/* Left: Album Thumbnail or Astra Sparkle */}
      <div className="flex items-center gap-1.5 shrink-0">
        {mediaTrack?.thumbnail_data_url ? (
          <img
            src={mediaTrack.thumbnail_data_url}
            alt="Album Art"
            className={`w-[22px] h-[22px] rounded-full object-cover shadow-sm ${
              isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''
            }`}
          />
        ) : (
          <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Music className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Live Audio Equalizer Waveform */}
        {isPlaying ? (
          <div className="flex items-end gap-[1.5px] h-3.5 pl-0.5">
            <span className="w-[2.5px] bg-cyan-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-3" />
            <span className="w-[2.5px] bg-indigo-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite_0.15s] h-2" />
            <span className="w-[2.5px] bg-purple-400 rounded-full animate-[pulse_0.9s_ease-in-out_infinite_0.3s] h-3.5" />
            <span className="w-[2.5px] bg-cyan-300 rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.1s] h-2.5" />
          </div>
        ) : (
          <span className="text-[11px] font-medium text-zinc-400 tracking-tight pl-0.5 max-w-[70px] truncate">
            {mediaTrack?.title || 'Pill'}
          </span>
        )}
      </div>

      {/* Center/Right: Quick Astra summon button */}
      <button
        onClick={onSummonAstra}
        className="w-5 h-5 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center transition-all group"
        title="Summon Astra AI (Alt+V)"
      >
        <Sparkles className="w-3 h-3 text-cyan-400 group-hover:scale-110 transition-transform" />
      </button>

      {/* Right: Animated Battery Symbol */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[10px] font-mono tabular-nums text-zinc-400">
          {telemetry.battery_pct}%
        </span>
        <AnimatedBatterySymbol
          percent={telemetry.battery_pct}
          isCharging={telemetry.is_charging}
          size="sm"
        />
      </div>
    </div>
  );
};
