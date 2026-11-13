import React from 'react';
import { usePillStore } from '../../store/usePillStore';
import { WidgetSizeVariant } from '../../types/preferences';
import { StickyNote, ChevronRight, X } from 'lucide-react';

interface QuickNotesWidgetProps {
  size?: WidgetSizeVariant;
  onRemove?: () => void;
  onChangeSize?: (newSize: WidgetSizeVariant) => void;
}

export const QuickNotesWidget: React.FC<QuickNotesWidgetProps> = ({
  size = 'Small',
  onRemove,
  onChangeSize,
}) => {
  const notesContent = usePillStore((s) => s.notesContent);
  const setActiveTab = usePillStore((s) => s.setActiveTab);
  const isPlaygroundEditing = usePillStore((s) => s.preferences.isPlaygroundEditing);

  const firstFewLines = notesContent
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .slice(0, size === 'Small' ? 2 : 4)
    .join('\n');

  return (
    <div
      onClick={() => setActiveTab('notes')}
      className="relative w-full h-full p-2.5 rounded-2xl bg-zinc-900/90 border border-white/10 hover:border-white/20 transition-all backdrop-blur-xl flex flex-col justify-between overflow-hidden group select-none text-white cursor-pointer"
    >
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
        <div className="flex items-center gap-1.5">
          <StickyNote className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-semibold text-zinc-300">Quick Notes</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
      </div>

      {/* Note preview body */}
      <div className="flex-1 my-1 overflow-hidden text-[10px] text-zinc-300 font-mono leading-relaxed line-clamp-3 opacity-80">
        {firstFewLines || 'No notes taken yet. Tap to start writing.'}
      </div>

      {/* Footer */}
      <div className="text-[9px] text-zinc-500 border-t border-white/5 pt-1 flex justify-between">
        <span>Markdown Synced</span>
        <span>Tap to edit</span>
      </div>
    </div>
  );
};
