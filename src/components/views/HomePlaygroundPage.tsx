import React from 'react';
import { usePillStore } from '../../store/usePillStore';
import { WidgetSizeVariant } from '../../types/preferences';
import { MusicStudioWidget } from '../widgets/MusicStudioWidget';
import { SystemMonitorWidget } from '../widgets/SystemMonitorWidget';
import { WeatherClockWidget } from '../widgets/WeatherClockWidget';
import { QuickNotesWidget } from '../widgets/QuickNotesWidget';
import { Plus, Sliders } from 'lucide-react';

const AVAILABLE_WIDGETS = [
  { id: 'music', name: 'Music Studio', defaultSize: 'Medium' as WidgetSizeVariant },
  { id: 'monitor', name: 'System & Power', defaultSize: 'Small' as WidgetSizeVariant },
  { id: 'weather', name: 'Weather & Clock', defaultSize: 'Small' as WidgetSizeVariant },
  { id: 'notes', name: 'Quick Notes', defaultSize: 'Small' as WidgetSizeVariant },
];

export const HomePlaygroundPage: React.FC = () => {
  const preferences = usePillStore((s) => s.preferences);
  const updatePreferences = usePillStore((s) => s.updatePreferences);

  const homeWidgets = preferences.homeWidgets || ['music', 'monitor', 'weather', 'notes'];
  const widgetSizes = preferences.widgetSizes || {};
  const isEditing = preferences.isPlaygroundEditing;

  const getColRowSpanClass = (size: WidgetSizeVariant) => {
    switch (size) {
      case 'Small':
        return 'col-span-1 row-span-1';
      case 'Medium':
        return 'col-span-2 row-span-1';
      case 'Large':
        return 'col-span-2 row-span-2';
      case 'Vertical':
        return 'col-span-1 row-span-2';
      default:
        return 'col-span-1 row-span-1';
    }
  };

  const handleRemoveWidget = (id: string) => {
    updatePreferences({
      homeWidgets: homeWidgets.filter((w) => w !== id),
    });
  };

  const handleChangeWidgetSize = (id: string, newSize: WidgetSizeVariant) => {
    updatePreferences({
      widgetSizes: {
        ...widgetSizes,
        [id]: newSize,
      },
    });
  };

  const handleAddWidget = (id: string) => {
    if (!homeWidgets.includes(id)) {
      updatePreferences({
        homeWidgets: [...homeWidgets, id],
      });
    }
  };

  const unaddedWidgets = AVAILABLE_WIDGETS.filter((w) => !homeWidgets.includes(w.id));

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-y-auto pill-scroll p-1">
      {/* 4-column Bento Playground Grid */}
      <div className="grid grid-cols-4 auto-rows-[108px] gap-2.5">
        {homeWidgets.map((wId) => {
          const currentSize = widgetSizes[wId] || (wId === 'music' ? 'Medium' : 'Small');
          const spanClass = getColRowSpanClass(currentSize);

          return (
            <div key={wId} className={`${spanClass} h-full transition-all`}>
              {wId === 'music' && (
                <MusicStudioWidget
                  size={currentSize}
                  onRemove={() => handleRemoveWidget('music')}
                  onChangeSize={(s) => handleChangeWidgetSize('music', s)}
                />
              )}
              {wId === 'monitor' && (
                <SystemMonitorWidget
                  size={currentSize}
                  onRemove={() => handleRemoveWidget('monitor')}
                  onChangeSize={(s) => handleChangeWidgetSize('monitor', s)}
                />
              )}
              {wId === 'weather' && (
                <WeatherClockWidget
                  size={currentSize}
                  onRemove={() => handleRemoveWidget('weather')}
                  onChangeSize={(s) => handleChangeWidgetSize('weather', s)}
                />
              )}
              {wId === 'notes' && (
                <QuickNotesWidget
                  size={currentSize}
                  onRemove={() => handleRemoveWidget('notes')}
                  onChangeSize={(s) => handleChangeWidgetSize('notes', s)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Editing Strip: + Add Block */}
      {isEditing && unaddedWidgets.length > 0 && (
        <div className="mt-3 p-2.5 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-zinc-300">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add Blocks to Home Grid:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {unaddedWidgets.map((uw) => (
              <button
                key={uw.id}
                onClick={() => handleAddWidget(uw.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>{uw.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
