import React, { useState, useEffect } from 'react';
import { usePillStore } from '../../store/usePillStore';
import { WidgetSizeVariant } from '../../types/preferences';
import { CloudSun, Clock, MapPin, X } from 'lucide-react';

interface WeatherClockWidgetProps {
  size?: WidgetSizeVariant;
  onRemove?: () => void;
  onChangeSize?: (newSize: WidgetSizeVariant) => void;
}

export const WeatherClockWidget: React.FC<WeatherClockWidgetProps> = ({
  size = 'Small',
  onRemove,
  onChangeSize,
}) => {
  const isPlaygroundEditing = usePillStore((s) => s.preferences.isPlaygroundEditing);
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
      setDateStr(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-zinc-400">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span className="font-medium">{dateStr}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-zinc-400">
          <MapPin className="w-2.5 h-2.5 text-pink-400" />
          <span>Seattle</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex items-center justify-between py-1">
        <div>
          <div className="text-xl font-bold font-mono tracking-tight text-white leading-none">
            {timeStr}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">Partly Cloudy</div>
        </div>

        <div className="flex flex-col items-end">
          <CloudSun className="w-7 h-7 text-amber-300" />
          <span className="text-xs font-bold font-mono text-cyan-300 mt-0.5">68°F</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-[9px] text-zinc-500 border-t border-white/5 pt-1 flex justify-between">
        <span>Humidity: 45%</span>
        <span>Wind: 8mph</span>
      </div>
    </div>
  );
};
