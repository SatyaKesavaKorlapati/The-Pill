import React, { useMemo } from 'react';
import { usePillStore } from '../../store/usePillStore';
import { ClipboardRecord, ClipboardSortBy, ClipboardGroupBy, ClipboardLayoutMode } from '../../types/preferences';
import { CustomPopdown } from '../ui/CustomPopdown';
import {
  Copy,
  Pin,
  Trash2,
  ExternalLink,
  Code2,
  Palette,
  FileText,
  Image as ImageIcon,
  Check,
  Sparkles,
} from 'lucide-react';

export const SmartClipboardView: React.FC = () => {
  const preferences = usePillStore((s) => s.preferences);
  const updatePreferences = usePillStore((s) => s.updatePreferences);
  const clipboardHistory = usePillStore((s) => s.clipboardHistory);
  const removeRecord = usePillStore((s) => s.removeClipboardRecord);
  const togglePin = usePillStore((s) => s.togglePinClipboardRecord);
  const clearHistory = usePillStore((s) => s.clearClipboardHistory);

  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const layoutMode = preferences.clipboardLayoutMode || 'DynamicBento';
  const sortBy = preferences.clipboardSortBy || 'Newest';
  const groupBy = preferences.clipboardGroupBy || 'None';

  const handleCopy = (item: ClipboardRecord) => {
    navigator.clipboard.writeText(item.text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const sortedItems = useMemo(() => {
    const list = [...clipboardHistory];
    switch (sortBy) {
      case 'Pinned':
        return list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      case 'Oldest':
        return list.sort((a, b) => a.timestamp_ms - b.timestamp_ms);
      case 'Type':
        return list.sort((a, b) => a.category.localeCompare(b.category));
      case 'Size':
        return list.sort((a, b) => (b.text?.length || 0) - (a.text?.length || 0));
      case 'Newest':
      default:
        return list.sort((a, b) => b.timestamp_ms - a.timestamp_ms);
    }
  }, [clipboardHistory, sortBy]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'color':
        return <Palette className="w-3.5 h-3.5 text-pink-400" />;
      case 'link':
        return <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />;
      case 'code':
        return <Code2 className="w-3.5 h-3.5 text-indigo-400" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-1 text-white select-none overflow-y-auto pill-scroll">
      {/* Top Header: Filters & Sort popdown */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-300">Smart Clipboard</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 font-mono">
            {clipboardHistory.length} items
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Layout switcher */}
          <button
            onClick={() =>
              updatePreferences({
                clipboardLayoutMode:
                  layoutMode === 'DynamicBento' ? 'ClassicList' : 'DynamicBento',
              })
            }
            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-zinc-300 font-medium"
          >
            {layoutMode === 'DynamicBento' ? 'Bento' : 'List'}
          </button>

          {/* Sort Popdown */}
          <CustomPopdown<ClipboardSortBy>
            value={sortBy}
            options={[
              { value: 'Newest', label: 'Newest First' },
              { value: 'Oldest', label: 'Oldest First' },
              { value: 'Pinned', label: 'Pinned on Top' },
              { value: 'Type', label: 'Group by Type' },
              { value: 'Size', label: 'Sort by Size' },
            ]}
            onChange={(val) => updatePreferences({ clipboardSortBy: val })}
            ariaLabel="Sort Clipboard By"
            size="xs"
          />

          {/* Clear unpinned */}
          <button
            onClick={clearHistory}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/10"
            title="Clear unpinned items"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Dynamic Bento (or Classic List) */}
      {clipboardHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-zinc-500">
          <Sparkles className="w-8 h-8 text-cyan-400 mb-2 opacity-50" />
          <p className="text-xs">Clipboard is empty</p>
          <p className="text-[10px] text-zinc-600 mt-1">Copy text, links, colors, or snip images</p>
        </div>
      ) : layoutMode === 'ClassicList' ? (
        <div className="flex-1 space-y-1.5 overflow-y-auto pill-scroll pr-1">
          {sortedItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCopy(item)}
              className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/80 border border-white/10 hover:border-cyan-400/30 cursor-pointer group transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="p-1.5 rounded-lg bg-white/5">{getCategoryIcon(item.category)}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-white truncate">{item.text}</div>
                  <div className="text-[9px] text-zinc-500 mt-0.5">
                    {item.badge_code} · {item.source}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(item.id);
                  }}
                  className={`p-1.5 rounded-md ${
                    item.pinned ? 'text-cyan-400 bg-cyan-400/20' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecord(item.id);
                  }}
                  className="p-1.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Dynamic Bento: 3-column auto-rows-[96px] */
        <div className="flex-1 grid grid-cols-3 auto-rows-[96px] gap-2.5 overflow-y-auto pill-scroll pr-1 [grid-auto-flow:dense]">
          {sortedItems.map((item) => {
            const isImage = item.category === 'image';
            const spanClass = isImage ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1';

            return (
              <div
                key={item.id}
                onClick={() => handleCopy(item)}
                className={`relative ${spanClass} p-2 rounded-2xl bg-zinc-900/90 border ${
                  item.pinned ? 'border-cyan-400/40' : 'border-white/10'
                } hover:border-cyan-400/60 transition-all cursor-pointer group flex flex-col justify-between overflow-hidden shadow-md`}
              >
                {/* Image Snip preview: aspect-fitted full frame */}
                {isImage && item.preview_image_data_url ? (
                  <div className="absolute inset-0 z-0">
                    <img
                      src={item.preview_image_data_url}
                      alt="Snip"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                  </div>
                ) : null}

                {/* Card Top: Badge & Actions */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-black/40 backdrop-blur-md">
                      {getCategoryIcon(item.category)}
                    </div>
                    <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/50 text-cyan-300 font-mono">
                      {item.badge_code}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(item.id);
                      }}
                      className={`p-1 rounded-md transition-colors ${
                        item.pinned
                          ? 'text-cyan-400 bg-cyan-400/30'
                          : 'text-zinc-400 hover:text-white bg-black/40'
                      }`}
                      title={item.pinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecord(item.id);
                      }}
                      className="p-1 rounded-md text-zinc-400 hover:text-red-400 bg-black/40 hover:bg-red-500/20 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Card Center: Content / Color swatch / Preview text */}
                <div className="z-10 my-1 min-w-0">
                  {item.category === 'color' ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-md border border-white/20 shadow-sm shrink-0"
                        style={{ backgroundColor: item.text }}
                      />
                      <span className="text-xs font-mono font-bold text-white truncate">
                        {item.text}
                      </span>
                    </div>
                  ) : item.category === 'code' ? (
                    <pre className="text-[10px] font-mono text-cyan-200 line-clamp-2 overflow-hidden leading-tight bg-black/30 p-1 rounded">
                      {item.text}
                    </pre>
                  ) : (
                    <p className="text-xs text-zinc-200 line-clamp-2 leading-tight font-medium">
                      {item.text}
                    </p>
                  )}
                </div>

                {/* Card Bottom: Copied confirmation or Timestamp */}
                <div className="flex items-center justify-between text-[9px] text-zinc-400 z-10">
                  <span>{item.file_size_label || item.source}</span>
                  {copiedId === item.id ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Copied!
                    </span>
                  ) : (
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-300 flex items-center gap-0.5">
                      <Copy className="w-2.5 h-2.5" /> Tap to copy
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
