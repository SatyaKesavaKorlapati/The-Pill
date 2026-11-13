import React, { useEffect, useState, useMemo } from 'react';
import { usePillStore } from '../../store/usePillStore';
import { useTauriHardwareBridge } from '../../hooks/useTauriHardwareBridge';
import { WidgetSizeVariant } from '../../types/preferences';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  MessageSquareQuote,
  Maximize2,
  Minimize2,
  Music,
  X,
} from 'lucide-react';

interface MusicStudioWidgetProps {
  size?: WidgetSizeVariant;
  onRemove?: () => void;
  onChangeSize?: (newSize: WidgetSizeVariant) => void;
}

interface ParsedLrcLine {
  sec: number;
  text: string;
}

export const MusicStudioWidget: React.FC<MusicStudioWidgetProps> = ({
  size = 'Medium',
  onRemove,
  onChangeSize,
}) => {
  const mediaTrack = usePillStore((s) => s.mediaTrack);
  const preferences = usePillStore((s) => s.preferences);
  const updatePreferences = usePillStore((s) => s.updatePreferences);
  const isPlaygroundEditing = preferences.isPlaygroundEditing;

  const { mediaAction } = useTauriHardwareBridge();

  const [expandedLyrics, setExpandedLyrics] = useState(false);
  const [lrcLines, setLrcLines] = useState<ParsedLrcLine[]>([]);
  const [lyricsLoading, setLyricsLoading] = useState(false);

  const title = mediaTrack?.title || 'No Media Playing';
  const artist = mediaTrack?.artist || 'Windows Media';
  const album = mediaTrack?.album || '';
  const isPlaying = mediaTrack?.is_playing ?? false;
  const currentSec = mediaTrack?.position_sec ?? 0;
  const durationSec = Math.max(1, mediaTrack?.duration_sec ?? 180);

  const lyricsOn = preferences.musicLyricsVisible !== false;

  // Query LRCLIB when track title/artist changes
  useEffect(() => {
    if (!mediaTrack?.title || mediaTrack.title === 'No Media Playing') {
      setLrcLines([]);
      return;
    }

    let active = true;
    setLyricsLoading(true);

    const fetchLyrics = async () => {
      try {
        const url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(
          mediaTrack.artist || ''
        )}&track_name=${encodeURIComponent(mediaTrack.title)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Lyrics not found');
        const data = await res.json();
        const rawLrc: string = data.syncedLyrics || data.plainLyrics || '';

        if (active && rawLrc) {
          const lines: ParsedLrcLine[] = [];
          const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
          for (const rawLine of rawLrc.split('\n')) {
            const match = rawLine.match(regex);
            if (match) {
              const min = parseInt(match[1], 10);
              const sec = parseInt(match[2], 10);
              const ms = parseInt(match[3], 10);
              const totalSec = min * 60 + sec + ms / (match[3].length === 2 ? 100 : 1000);
              lines.push({ sec: totalSec, text: match[4].trim() });
            }
          }
          if (lines.length > 0) {
            setLrcLines(lines);
          } else {
            // Plain lyrics fallback
            setLrcLines(
              rawLrc
                .split('\n')
                .filter((l) => l.trim())
                .map((text, idx) => ({ sec: idx * 4, text }))
            );
          }
        }
      } catch {
        if (active) {
          // Fallback ambient lyrics
          setLrcLines([
            { sec: 0, text: '♪ Instrumental resonance ♪' },
            { sec: 15, text: 'Whispers drifting through the glass' },
            { sec: 35, text: 'Reflections dancing on the shoreline' },
            { sec: 60, text: 'Fluid echoes in the midnight silence' },
          ]);
        }
      } finally {
        if (active) setLyricsLoading(false);
      }
    };

    fetchLyrics();
    return () => {
      active = false;
    };
  }, [mediaTrack?.title, mediaTrack?.artist]);

  // Current active synced lyric line
  const activeLineIndex = useMemo(() => {
    if (lrcLines.length === 0) return -1;
    for (let i = lrcLines.length - 1; i >= 0; i--) {
      if (currentSec >= lrcLines[i].sec) {
        return i;
      }
    }
    return 0;
  }, [lrcLines, currentSec]);

  const activeLyricText =
    activeLineIndex >= 0 && lrcLines[activeLineIndex]
      ? lrcLines[activeLineIndex].text
      : lyricsLoading
      ? 'Fetching synced lyrics...'
      : 'Synced lyrics will appear here';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPct = Math.min(100, Math.max(0, (currentSec / durationSec) * 100));

  return (
    <div
      className={`relative w-full h-full p-2.5 rounded-2xl bg-zinc-900/90 border border-white/10 hover:border-white/20 transition-all backdrop-blur-xl flex flex-col justify-between overflow-hidden group select-none text-white`}
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

      {/* 1. SMALL (1x1) */}
      {size === 'Small' && (
        <div className="flex flex-col justify-between h-full gap-1">
          <div className="flex items-center gap-2">
            {mediaTrack?.thumbnail_data_url ? (
              <img
                src={mediaTrack.thumbnail_data_url}
                alt="Album"
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/10 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-cyan-600/30 flex items-center justify-center shrink-0">
                <Music className="w-4 h-4 text-cyan-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold truncate leading-tight">{title}</div>
              <div className="text-[9px] text-zinc-400 truncate">{artist}</div>
            </div>
          </div>

          {lyricsOn && (
            <div className="text-[9px] text-cyan-300 italic truncate px-1 py-0.5 rounded bg-black/30">
              "{activeLyricText}"
            </div>
          )}

          <div className="flex items-center justify-between pt-0.5">
            <button
              onClick={() => mediaAction('previous')}
              className="p-1 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <SkipBack className="w-3 h-3" />
            </button>
            <button
              onClick={() => mediaAction('play_pause')}
              className="p-1.5 rounded-full bg-cyan-400 text-black hover:bg-cyan-300 transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
            </button>
            <button
              onClick={() => mediaAction('next')}
              className="p-1 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <SkipForward className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* 2. MEDIUM (2x1) - Default Layout! Space-Efficient Wide Card */}
      {size === 'Medium' && (
        <div className="flex flex-col justify-between h-full gap-1.5">
          {/* Header Row: Thumbnail + Track info + Lyrics Toggle + Transport */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {mediaTrack?.thumbnail_data_url ? (
                <img
                  src={mediaTrack.thumbnail_data_url}
                  alt="Album"
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/15 shrink-0 shadow-md"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/30 to-indigo-600/30 flex items-center justify-center shrink-0 border border-white/10">
                  <Music className="w-5 h-5 text-cyan-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate leading-tight">{title}</div>
                <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                  {artist} {album ? `· ${album}` : ''}
                </div>
              </div>
            </div>

            {/* Transport controls right-aligned */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => updatePreferences({ musicLyricsVisible: !lyricsOn })}
                className={`p-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                  lyricsOn ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title={lyricsOn ? 'Hide synced lyrics' : 'Show synced lyrics'}
              >
                <MessageSquareQuote className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setExpandedLyrics(!expandedLyrics)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Full lyrics expand"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => mediaAction('previous')}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => mediaAction('play_pause')}
                className="p-1.5 rounded-full bg-cyan-400 text-black hover:bg-cyan-300 transition-all active:scale-95 shadow-md"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <button
                onClick={() => mediaAction('next')}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Fused Synced Lyric Bar */}
          {lyricsOn && (
            <div className="px-2.5 py-1 rounded-xl bg-black/35 border border-white/5 flex items-center justify-between text-[11px] text-zinc-300">
              <span className="truncate italic text-cyan-300 font-medium">
                "{activeLyricText}"
              </span>
              <span className="text-[9px] font-mono tabular-nums text-zinc-500 shrink-0 ml-2">
                {formatTime(currentSec)} / {formatTime(durationSec)}
              </span>
            </div>
          )}

          {/* Living Scrubber Bar */}
          <div
            className="relative w-full h-1.5 bg-white/10 rounded-full cursor-pointer overflow-hidden group/bar"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickRatio = (e.clientX - rect.left) / rect.width;
              mediaAction('seek', clickRatio * durationSec);
            }}
          >
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* 3. LARGE (2x2) & VERTICAL (1x2) */}
      {(size === 'Large' || size === 'Vertical') && (
        <div className="flex flex-col justify-between h-full gap-2">
          <div className="flex items-center gap-3">
            {mediaTrack?.thumbnail_data_url ? (
              <img
                src={mediaTrack.thumbnail_data_url}
                alt="Album"
                className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/15 shrink-0 shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-cyan-600/30 flex items-center justify-center shrink-0">
                <Music className="w-6 h-6 text-cyan-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{title}</div>
              <div className="text-xs text-zinc-400 truncate">{artist}</div>
            </div>
          </div>

          {/* Scrollable Lyric List */}
          <div className="flex-1 min-h-0 overflow-y-auto pill-scroll p-2 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
            {lrcLines.map((line, idx) => (
              <div
                key={idx}
                onClick={() => mediaAction('seek', line.sec)}
                className={`cursor-pointer transition-colors ${
                  idx === activeLineIndex
                    ? 'text-cyan-300 font-bold text-sm scale-102 pl-1 border-l-2 border-cyan-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {line.text}
              </div>
            ))}
          </div>

          {/* Bottom Progress & Transport */}
          <div className="space-y-1.5 pt-1">
            <div
              className="relative w-full h-1.5 bg-white/10 rounded-full cursor-pointer overflow-hidden"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickRatio = (e.clientX - rect.left) / rect.width;
                mediaAction('seek', clickRatio * durationSec);
              }}
            >
              <div
                className="absolute left-0 top-0 h-full bg-cyan-400 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 tabular-nums">
                {formatTime(currentSec)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => mediaAction('previous')}
                  className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={() => mediaAction('play_pause')}
                  className="p-1.5 rounded-full bg-cyan-400 text-black hover:bg-cyan-300"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button
                  onClick={() => mediaAction('next')}
                  className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[10px] text-zinc-400 tabular-nums">
                {formatTime(durationSec)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
