import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Camera,
  Check,
  Clipboard as ClipboardIcon,
  Coffee,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileArchive,
  FileText,
  FlipHorizontal2,
  FolderPlus,
  GripVertical,
  Layers,
  LayoutGrid,
  List,
  Loader2,
  Maximize2,
  MessageSquareQuote,
  Mic,
  MicOff,
  Minimize2,
  MonitorSpeaker,
  Moon,
  Pause,
  PenLine,
  Pin,
  Play,
  Plus,
  Scissors,
  Search,
  Settings,
  Settings2,
  Shield,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Sparkles,
  Speaker,
  Square,
  StickyNote,
  Sun,
  Timer,
  Trash2,
  Upload,
  Wifi,
  X,
} from 'lucide-react';
import {
  AudioOutputDevice,
  BuiltinPillTab,
  ClipboardGroupBy,
  ClipboardItem,
  ClipboardLayoutMode,
  ClipboardSortBy,
  HomeWidgetId,
  PillPreferences,
  PillTab,
  MusicTrack,
  NotedownFormatStyle,
  ReminderTask,
  TrayFileItem,
  VoiceAgentAction,
  WidgetSizeVariant,
  WindowsSystemState,
} from '../types/pill';
import { formatDurationClock, playTactilePop } from '../utils/audioSynth';
import { classifyClipboardPayload, moveOrderedItem } from '../utils/customizationLogic';
import {
  getThemeIconUrl,
  getThemeMotifUrl,
  resolveIconPackMetrics,
  resolveInnerPillMetrics,
  resolveThemePalette,
} from '../utils/themeAndSliders';
import { createZipArchive } from '../utils/zipBuilder';
import { AnimatedBatterySymbol } from './AnimatedBatterySymbol';
import { ThemedIcon } from './ThemedIcon';
import {
  AppMenuGridPanel,
  ControlCenterPanel,
  SystemPowerMonitorPanel,
} from './ControlAndMonitorPanels';
import { CustomPopdown, PopdownOption } from './CustomPopdown';
import { FluidMusicVisualizer } from './FluidMusicVisualizer';
import { AssistantSubMode, IslandAiAssistantPanel } from './IslandAiAssistantPanel';
import { LivingProgressBar } from './LivingProgressBar';
import { RichMarkdown } from './RichMarkdown';

const CLIPBOARD_SORT_OPTIONS: PopdownOption<ClipboardSortBy>[] = [
  { value: 'newest', label: 'Sort: Newest', sublabel: 'Most recent clips first' },
  { value: 'oldest', label: 'Sort: Oldest', sublabel: 'Chronological order' },
  { value: 'pinned', label: 'Sort: Pinned', sublabel: 'Pinned items at top' },
  { value: 'type', label: 'Sort: Format', sublabel: 'Group A–Z by format' },
  { value: 'size', label: 'Sort: Size', sublabel: 'Largest payload first' },
];

const NOTEDOWN_FORMAT_OPTIONS: PopdownOption<NotedownFormatStyle>[] = [
  { value: 'structured_md', label: 'Full Markdown', sublabel: 'Summary, Decisions, Actions & Code' },
  { value: 'executive_brief', label: 'Executive Brief', sublabel: 'Crisp TL;DR & top takeaways' },
  { value: 'action_items', label: 'Action Checklist', sublabel: 'Task owners & clean transcript' },
];
import { ResilientThumb } from './ResilientThumb';

export interface PillExpandedContentProps {
  activeTab: PillTab;
  onSelectTab: (tab: PillTab) => void;
  isLauncherOpen: boolean;
  onToggleLauncher: () => void;
  onCollapse: () => void;
  onOpenFullSettings: () => void;
  onOpenVoiceAgent: () => void;
  onExecuteAgentActions: (actions: VoiceAgentAction[]) => void;

  // Media
  currentTrack: MusicTrack;
  isPlaying: boolean;
  trackProgressSec: number;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onSeekTrack: (sec: number) => void;
  audioDevice: AudioOutputDevice;
  onChangeAudioDevice: (device: AudioOutputDevice) => void;

  // Timer
  timerRemainingSec: number | null;
  timerTotalSec: number;
  onStartTimer: (seconds: number) => void;
  onCancelTimer: () => void;

  // System & Control Center
  systemState: WindowsSystemState;
  onUpdateSystemState: (patch: Partial<WindowsSystemState>) => void;
  volumeLevel: number;
  onChangeVolume: (val: number) => void;
  brightnessLevel: number;
  onChangeBrightness: (val: number) => void;

  // Quick toggles
  keepAwake: boolean;
  onToggleKeepAwake: () => void;
  micMuted: boolean;
  onToggleMicMuted: () => void;
  nightLight: boolean;
  onToggleNightLight: () => void;
  onTriggerQuickActionToast: (label: string) => void;

  // Tray
  trayFiles: TrayFileItem[];
  onAddTrayFiles: (files: TrayFileItem[]) => void;
  onTogglePinTrayFile: (id: string) => void;
  onRemoveTrayFile: (id: string) => void;
  onClearUnpinnedTray: () => void;
  onRestoreSampleTray: () => void;

  // Smart Dynamic Clipboard (Dynamic Bento + Classic Stack + Sort & Group)
  clipboardItems: ClipboardItem[];
  onAddClipboardItem: (item: Omit<ClipboardItem, 'id' | 'copiedAt' | 'pinned'>) => void;
  onTogglePinClip: (id: string) => void;
  onRemoveClipboardItem: (id: string) => void;
  onClearUnpinnedClips: () => void;

  // Notes
  noteContent: string;
  onChangeNoteContent: (val: string) => void;

  // Reminders & Preferences
  reminders: ReminderTask[];
  onToggleReminder: (id: string) => void;
  onAddReminder: (title: string) => void;
  preferences: PillPreferences;
  onUpdatePreferences: (patch: Partial<PillPreferences>) => void;
}

const AUDIO_DEVICES: AudioOutputDevice[] = [
  'Surface Studio Speakers',
  'AirPods Pro (USB-C)',
  'Focusrite Scarlett DAC',
];

export const BUILTIN_TAB_LABELS: Record<BuiltinPillTab, string> = {
  home: 'Home',
  control: 'Controls',
  ai: 'Search & AI',
  tray: 'Tray',
  clipboard: 'Clipboard',
  monitor: 'Monitor',
  notes: 'Notes',
  mirror: 'Mirror',
};

export const HOME_WIDGET_CATALOG: {
  id: HomeWidgetId;
  label: string;
  desc: string;
  defaultSize: WidgetSizeVariant;
}[] = [
  {
    id: 'music',
    label: 'Now Playing Studio',
    desc: 'Multi-size player, inline/expanded lyrics & living scrubber',
    defaultSize: 'medium',
  },
  {
    id: 'voice_search',
    label: 'Search & Astra Orb',
    desc: 'Fast Google web search + Astra (అస్త్రం) voice orb trigger',
    defaultSize: 'medium',
  },
  {
    id: 'timers',
    label: 'Live Countdown Timers',
    desc: '1m / 5m / 15m / 25m focus presets',
    defaultSize: 'small',
  },
  {
    id: 'network_mini',
    label: 'Internet Speed & IP',
    desc: 'Live Mbps throughput, latency & Local IPv4',
    defaultSize: 'small',
  },
  {
    id: 'vitals_mini',
    label: 'Battery PD & CPU Vitals',
    desc: 'USB-C wattage, battery % & NativeAOT RAM',
    defaultSize: 'small',
  },
  {
    id: 'quick_actions',
    label: 'Quick Hardware Strip',
    desc: 'Snip, Mic Mute, Night Light & Keep Awake',
    defaultSize: 'medium',
  },
  {
    id: 'clipboard_peek',
    label: 'Latest Clipboard Peek',
    desc: 'Instant preview & one-click copy of newest clip',
    defaultSize: 'small',
  },
  {
    id: 'notes_peek',
    label: 'Scratchpad Peek',
    desc: 'Live editable mini note block right on your widget page',
    defaultSize: 'medium',
  },
];

const WIDGET_SIZE_OPTIONS: { id: WidgetSizeVariant; short: string; title: string }[] = [
  { id: 'small', short: 'S', title: 'Small Square (1×1)' },
  { id: 'medium', short: 'M', title: 'Medium Wide (2×1)' },
  { id: 'large', short: 'L', title: 'Large Studio (2×2)' },
  { id: 'vertical', short: 'V', title: 'Vertical Pillar (1×2)' },
];

type ClipFilterGroup = 'all' | 'text_code' | 'media' | 'files' | 'colors_links';

function isBuiltinTab(tab: PillTab): tab is BuiltinPillTab {
  return !tab.startsWith('custom_');
}

function resolveGridSpanClass(size: WidgetSizeVariant): string {
  switch (size) {
    case 'small':
      return 'col-span-2 sm:col-span-1 row-span-1';
    case 'medium':
      return 'col-span-4 sm:col-span-2 row-span-1';
    case 'large':
      return 'col-span-4 sm:col-span-2 row-span-2';
    case 'vertical':
      return 'col-span-2 sm:col-span-1 row-span-2';
    default:
      return 'col-span-4 sm:col-span-2 row-span-1';
  }
}

function estimateClipPayloadWeight(clip: ClipboardItem): number {
  if (clip.fileSizeLabel) {
    const num = parseFloat(clip.fileSizeLabel);
    if (!Number.isNaN(num)) {
      if (clip.fileSizeLabel.toUpperCase().includes('MB')) return num * 1024 * 1024;
      if (clip.fileSizeLabel.toUpperCase().includes('KB')) return num * 1024;
    }
  }
  if (clip.previewImageUrl) return 512 * 1024 + clip.text.length;
  return clip.text.length;
}

function categoryGroupHeading(cat: ClipboardItem['category']): string {
  switch (cat) {
    case 'image':
    case 'video':
    case 'audio':
      return 'Images & Media';
    case 'code':
    case 'text':
      return 'Text & Code Snippets';
    case 'color':
    case 'link':
      return 'Colors & Web Links';
    case 'document':
    case 'archive':
    case 'binary':
      return 'Files, Docs & Archives';
    default:
      return 'Other Clips';
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = typeof reader.result === 'string' ? reader.result : '';
      const idx = res.indexOf(',');
      resolve(idx >= 0 ? res.slice(idx + 1) : res);
    };
    reader.onerror = () => reject(new Error('Failed to encode audio'));
    reader.readAsDataURL(blob);
  });
}

export const PillExpandedContent: React.FC<PillExpandedContentProps> = ({
  activeTab,
  onSelectTab,
  isLauncherOpen,
  onToggleLauncher,
  onCollapse,
  onOpenFullSettings,
  onOpenVoiceAgent,
  onExecuteAgentActions,
  currentTrack,
  isPlaying,
  trackProgressSec,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  onSeekTrack,
  audioDevice,
  onChangeAudioDevice,
  timerRemainingSec,
  timerTotalSec,
  onStartTimer,
  onCancelTimer,
  systemState,
  onUpdateSystemState,
  volumeLevel,
  onChangeVolume,
  brightnessLevel,
  onChangeBrightness,
  keepAwake,
  onToggleKeepAwake,
  micMuted,
  onToggleMicMuted,
  nightLight,
  onToggleNightLight,
  onTriggerQuickActionToast,
  trayFiles,
  onAddTrayFiles,
  onTogglePinTrayFile,
  onRemoveTrayFile,
  onClearUnpinnedTray,
  onRestoreSampleTray,
  clipboardItems,
  onAddClipboardItem,
  onTogglePinClip,
  onRemoveClipboardItem,
  onClearUnpinnedClips,
  noteContent,
  onChangeNoteContent,
  reminders,
  onToggleReminder,
  onAddReminder,
  preferences,
  onUpdatePreferences,
}) => {
  const palette = resolveThemePalette(
    preferences.themeId,
    preferences.customPrimaryHex,
    preferences.customSecondaryHex
  );
  const isLight = Boolean(palette.isLightSurface);
  const iconMetrics = resolveIconPackMetrics(preferences.iconPack);
  const innerPillMetrics = resolveInnerPillMetrics(
    preferences.innerPillScale,
    preferences.innerCapsuleRadius
  );

  // Music lyrics & audio menu local state (inline lyrics visibility lives in preferences.musicLyricsVisible, ON by default)
  const [expandedFullLyrics, setExpandedFullLyrics] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);

  // Interactive Building-Block Playground state (works on Home AND any Custom Widget Tab)
  const [playgroundMode, setPlaygroundMode] = useState(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState<HomeWidgetId | null>(null);

  const [aiInitialSubMode, setAiInitialSubMode] = useState<AssistantSubMode>('chat');

  // Smart Dynamic Clipboard local state
  const [clipSearch, setClipSearch] = useState('');
  const [clipFilter, setClipFilter] = useState<ClipFilterGroup>('all');
  const [newClipDraft, setNewClipDraft] = useState('');
  const [clipError, setClipError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [zoomedClipImage, setZoomedClipImage] = useState<{ url: string; title: string } | null>(
    null
  );
  const clipFilePickerRef = useRef<HTMLInputElement | null>(null);

  // Tray state
  const [trayFeedback, setTrayFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Notes, Markdown Preview & Notedown (Mic + System Audio -> Structured Markdown) state
  const [noteCopied, setNoteCopied] = useState(false);
  const [noteViewMode, setNoteViewMode] = useState<'edit' | 'preview'>('edit');
  const [dictatingNote, setDictatingNote] = useState(false);
  const [notedownSystemActive, setNotedownSystemActive] = useState(false);
  const [transcribingNote, setTranscribingNote] = useState(false);
  const [notedownGenerating, setNotedownGenerating] = useState(false);
  const [notedownRawTranscript, setNotedownRawTranscript] = useState('');
  const noteRecorderRef = useRef<MediaRecorder | null>(null);
  const noteChunksRef = useRef<Blob[]>([]);
  const notedownSystemStreamRef = useRef<MediaStream | null>(null);

  // Stopwatch state inside All-Apps Menu
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchMs, setStopwatchMs] = useState(0);

  // Mirror Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'active' | 'unavailable'>('idle');
  const [mirrorFlip, setMirrorFlip] = useState(true);
  const [mirrorRimIndex, setMirrorRimIndex] = useState(0);

  const MIRROR_RIM_PROFILES = [
    { name: 'Neutral', cls: 'border-white/15' },
    { name: 'Warm Gold', cls: 'border-amber-300/85 shadow-[0_0_24px_rgba(252,211,77,0.26)]' },
    { name: 'Studio Ice', cls: 'border-sky-300/85 shadow-[0_0_24px_rgba(56,189,248,0.26)]' },
    { name: 'Rose Soft', cls: 'border-rose-300/85 shadow-[0_0_24px_rgba(251,113,133,0.26)]' },
  ];

  // Reset playground edit mode when switching tabs
  useEffect(() => {
    setPlaygroundMode(false);
    setDraggedWidgetId(null);
  }, [activeTab]);

  useEffect(() => {
    if (!stopwatchRunning) return;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setStopwatchMs((prev) => prev + dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stopwatchRunning]);

  useEffect(() => {
    if (activeTab !== 'mirror' || isLauncherOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
      setCameraStatus('idle');
    }
  }, [activeTab, isLauncherOpen]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (noteRecorderRef.current && noteRecorderRef.current.state !== 'inactive') {
        noteRecorderRef.current.stop();
      }
      if (notedownSystemStreamRef.current) {
        notedownSystemStreamRef.current.getTracks().forEach((t) => t.stop());
        notedownSystemStreamRef.current = null;
      }
    };
  }, []);

  const runNotedownSummarize = async (opts: {
    transcriptOverride?: string;
    audioBase64?: string;
    mimeType?: string;
  }) => {
    if (!preferences.aiEnabled) {
      onTriggerQuickActionToast('Enable Search & AI in Settings to run Notedown');
      return;
    }
    setNotedownGenerating(true);
    playTactilePop('tab');
    try {
      const sourceText =
        opts.transcriptOverride ??
        (notedownRawTranscript.trim() || noteContent.trim());
      const resp = await fetch('/api/ai/notedown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawTranscript: sourceText,
          audioBase64: opts.audioBase64,
          mimeType: opts.mimeType,
          formatStyle: preferences.notedownFormat ?? 'structured_md',
        }),
      });
      const data = (await resp.json()) as {
        markdown?: string;
        transcript?: string;
        error?: string;
      };
      if (!resp.ok || data.error) {
        throw new Error(data.error || 'Notedown summary failed');
      }
      if (data.transcript) {
        setNotedownRawTranscript(data.transcript);
      }
      if (data.markdown) {
        onChangeNoteContent(data.markdown);
        setNoteViewMode('preview');
        onTriggerQuickActionToast('Notedown structured Markdown ready');
        playTactilePop('confirm');
      }
    } catch (err) {
      onTriggerQuickActionToast(
        err instanceof Error ? err.message : 'Notedown could not summarize audio'
      );
    } finally {
      setNotedownGenerating(false);
    }
  };

  const handleToggleNotedownSystemAudio = async () => {
    if (!preferences.aiEnabled) {
      onTriggerQuickActionToast('AI & Notedown are disabled in Settings');
      return;
    }
    if (notedownSystemActive && noteRecorderRef.current) {
      noteRecorderRef.current.stop();
      setNotedownSystemActive(false);
      return;
    }
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        onTriggerQuickActionToast('System audio capture requires a desktop browser');
        return;
      }
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      const audioTracks = displayStream.getAudioTracks();
      displayStream.getVideoTracks().forEach((vt) => vt.stop());

      if (audioTracks.length === 0) {
        displayStream.getTracks().forEach((t) => t.stop());
        onTriggerQuickActionToast('Enable "Share tab/system audio" in the picker for Notedown');
        return;
      }

      const audioStream = new MediaStream(audioTracks);
      notedownSystemStreamRef.current = audioStream;
      const preferredMime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(audioStream, { mimeType: preferredMime });
      noteChunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) noteChunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        audioStream.getTracks().forEach((t) => t.stop());
        notedownSystemStreamRef.current = null;
        setNotedownSystemActive(false);
        const blob = new Blob(noteChunksRef.current, { type: preferredMime });
        if (blob.size > 0) {
          const b64 = await blobToBase64(blob);
          await runNotedownSummarize({ audioBase64: b64, mimeType: preferredMime });
        }
      };
      audioTracks[0].onended = () => {
        if (recorder.state !== 'inactive') recorder.stop();
      };
      noteRecorderRef.current = recorder;
      recorder.start(300);
      setNotedownSystemActive(true);
      playTactilePop('toggleOn');
    } catch {
      onTriggerQuickActionToast('System audio capture cancelled');
    }
  };

  const handleDownloadNoteMarkdown = () => {
    const content = noteContent.trim();
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pill-notedown-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    playTactilePop('confirm');
  };

  const handleToggleNoteDictation = async () => {
    if (!preferences.aiEnabled) {
      onTriggerQuickActionToast('AI & Voice Dictation are disabled in Settings');
      return;
    }
    if (dictatingNote && noteRecorderRef.current) {
      noteRecorderRef.current.stop();
      setDictatingNote(false);
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        onTriggerQuickActionToast('Microphone unavailable in this browser context');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = MediaRecorder.isTypeSupported(preferredMime)
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);
      noteChunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) noteChunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        const actualMime = recorder.mimeType || preferredMime || 'audio/webm';
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(noteChunksRef.current, { type: actualMime });
        if (blob.size === 0) return;
        setTranscribingNote(true);
        try {
          const audioBase64 = await blobToBase64(blob);
          const resp = await fetch('/api/ai/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64, mimeType: actualMime }),
          });
          const data = (await resp.json()) as { transcript?: string; error?: string };
          if (!resp.ok || data.error) {
            throw new Error(data.error || 'Dictation failed');
          }
          if (data.transcript) {
            setNotedownRawTranscript((prev) =>
              prev ? `${prev}\n${data.transcript}` : data.transcript!
            );
            onChangeNoteContent(
              noteContent.trim() ? `${noteContent.trim()}\n${data.transcript}` : data.transcript
            );
            playTactilePop('confirm');
          }
        } catch (err) {
          onTriggerQuickActionToast(
            err instanceof Error ? err.message : 'Voice dictation failed'
          );
        } finally {
          setTranscribingNote(false);
        }
      };
      noteRecorderRef.current = recorder;
      recorder.start(250);
      setDictatingNote(true);
      playTactilePop('toggleOn');
    } catch {
      onTriggerQuickActionToast('Microphone permission denied or unavailable');
    }
  };

  const handleEnableCamera = async () => {
    if (cameraActive && streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCameraActive(false);
      setCameraStatus('idle');
      return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraStatus('unavailable');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 360 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      setCameraStatus('active');
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch {
      setCameraStatus('unavailable');
    }
  };

  const handleExportTrayZip = () => {
    if (trayFiles.length === 0) return;
    const zipBytes = createZipArchive(
      trayFiles.map((f) => ({
        path: f.name,
        content: f.contentPreview || `Pill Tray Reference: ${f.name} (${f.sizeLabel})`,
      }))
    );
    const blob = new Blob([zipBytes], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pill-Tray-${trayFiles.length}-files.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    playTactilePop('confirm');
    setTrayFeedback(`Exported ${trayFiles.length} files as ZIP`);
    setTimeout(() => setTrayFeedback(null), 2400);
  };

  const handleMergeTrayReport = () => {
    if (trayFiles.length === 0) return;
    const mergedText = trayFiles
      .map((f, idx) => `--- [${idx + 1}] ${f.name} (${f.sizeLabel}) ---\n${f.contentPreview}`)
      .join('\n\n');
    const blob = new Blob([mergedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Tray-Merged-Bundle.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    playTactilePop('confirm');
    setTrayFeedback('Merged bundle downloaded');
    setTimeout(() => setTrayFeedback(null), 2400);
  };

  const handleFilePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || list.length === 0) return;
    const incoming: TrayFileItem[] = Array.from(list).map((file, idx) => {
      const ext = file.name.includes('.')
        ? file.name.split('.').pop()!.toUpperCase().slice(0, 5)
        : 'FILE';
      const kb = Math.max(0.4, file.size / 1024);
      return {
        id: `picked-${Date.now()}-${idx}`,
        name: file.name,
        extension: ext,
        sizeLabel: kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(1)} KB`,
        addedAt: 'Just now',
        pinned: false,
        contentPreview: `Local file linked in Tray: ${file.name}`,
      };
    });
    onAddTrayFiles(incoming);
    playTactilePop('drop');
    e.target.value = '';
  };

  const handleUniversalClipboardFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const meta = classifyClipboardPayload(file.name, file.type);
      const kb = Math.max(0.2, file.size / 1024);
      const sizeStr = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(1)} KB`;
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      onAddClipboardItem({
        text: file.name,
        source: 'Universal File Copy',
        category: meta.category,
        badgeCode: meta.badgeCode,
        fileSizeLabel: `${sizeStr} · ${file.type || 'Binary File'}`,
        previewImageUrl: previewUrl,
      });
    });
    playTactilePop('drop');
  };

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard?.writeText(text);
    } catch {
      // Ignore fallback
    }
    setCopiedId(id);
    playTactilePop('confirm');
    setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 1600);
  };

  const handleAddClipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newClipDraft.trim();
    if (!trimmed) {
      setClipError('Enter text, hex color, URL, code, or filename');
      return;
    }
    setClipError('');
    const classified = classifyClipboardPayload(trimmed);
    onAddClipboardItem({
      text: trimmed,
      source: 'Universal Clip',
      category: classified.category,
      badgeCode: classified.badgeCode,
      accentHex: classified.accentHex,
    });
    setNewClipDraft('');
    playTactilePop('confirm');
  };

  // Compute visible tabs (Built-in + Enabled Extra Custom Widget Tabs)
  const visibleBuiltinTabs: PillTab[] = preferences.tabOrder.filter(
    (t) => preferences.enabledTabs[t] && (t !== 'ai' || preferences.aiEnabled)
  );
  const enabledCustomTabs = (preferences.customWidgetTabs ?? []).filter((ct) => ct.enabled);
  const visibleTabs: PillTab[] = [
    ...visibleBuiltinTabs,
    ...enabledCustomTabs.map((ct) => ct.id),
  ];

  const getTabDisplayLabel = (tabId: PillTab): string => {
    if (!isBuiltinTab(tabId)) {
      const found = (preferences.customWidgetTabs ?? []).find((ct) => ct.id === tabId);
      return found?.name || 'Widgets';
    }
    const customName = preferences.customTabNames?.[tabId]?.trim();
    const base = customName || BUILTIN_TAB_LABELS[tabId];
    if (tabId === 'tray' && trayFiles.length > 0) {
      return `${base} (${trayFiles.length})`;
    }
    return base;
  };

  // Filtered + Sorted + Grouped Clipboard items
  const sortedClips = useMemo(() => {
    const filtered = clipboardItems.filter((item) => {
      const matchesQuery =
        item.text.toLowerCase().includes(clipSearch.toLowerCase()) ||
        item.source.toLowerCase().includes(clipSearch.toLowerCase()) ||
        item.badgeCode.toLowerCase().includes(clipSearch.toLowerCase());
      if (!matchesQuery) return false;

      if (clipFilter === 'text_code') return item.category === 'text' || item.category === 'code';
      if (clipFilter === 'media') {
        return item.category === 'image' || item.category === 'video' || item.category === 'audio';
      }
      if (clipFilter === 'files') {
        return (
          item.category === 'document' ||
          item.category === 'archive' ||
          item.category === 'binary'
        );
      }
      if (clipFilter === 'colors_links') {
        return item.category === 'color' || item.category === 'link';
      }
      return true;
    });

    const sortMode: ClipboardSortBy = preferences.clipboardSortBy ?? 'newest';
    const indexed = filtered.map((item, idx) => ({ item, idx }));

    indexed.sort((a, b) => {
      if (sortMode === 'oldest') {
        return b.idx - a.idx;
      }
      if (sortMode === 'pinned') {
        if (a.item.pinned !== b.item.pinned) return a.item.pinned ? -1 : 1;
        return a.idx - b.idx;
      }
      if (sortMode === 'type') {
        const cmp = a.item.badgeCode.localeCompare(b.item.badgeCode);
        return cmp !== 0 ? cmp : a.idx - b.idx;
      }
      if (sortMode === 'size') {
        return estimateClipPayloadWeight(b.item) - estimateClipPayloadWeight(a.item);
      }
      // newest (default)
      return a.idx - b.idx;
    });

    return indexed.map((entry) => entry.item);
  }, [clipboardItems, clipSearch, clipFilter, preferences.clipboardSortBy]);

  const groupedClipSections = useMemo(() => {
    const groupMode: ClipboardGroupBy = preferences.clipboardGroupBy ?? 'none';
    if (groupMode === 'none') {
      return [{ heading: '', items: sortedClips }];
    }
    const map = new Map<string, ClipboardItem[]>();
    for (const item of sortedClips) {
      const h = categoryGroupHeading(item.category);
      const bucket = map.get(h);
      if (bucket) bucket.push(item);
      else map.set(h, [item]);
    }
    return Array.from(map.entries()).map(([heading, items]) => ({ heading, items }));
  }, [sortedClips, preferences.clipboardGroupBy]);

  const lyricIndex =
    currentTrack.lyrics.length > 0
      ? Math.floor(
          (trackProgressSec / Math.max(1, currentTrack.durationSec)) * currentTrack.lyrics.length
        ) % currentTrack.lyrics.length
      : 0;

  const cardSurfaceCls = isLight
    ? 'bg-stone-900/[0.05] border-stone-900/15 text-stone-900'
    : 'bg-white/[0.04] border-white/[0.08] text-slate-100';

  // Active Widget Page Resolver (supports both built-in 'home' AND any 'custom_*' extra widget tab!)
  const activeCustomTabObj = !isBuiltinTab(activeTab)
    ? (preferences.customWidgetTabs ?? []).find((ct) => ct.id === activeTab)
    : undefined;

  const isWidgetCanvasTab = activeTab === 'home' || Boolean(activeCustomTabObj);

  const pageWidgets: HomeWidgetId[] = activeCustomTabObj
    ? activeCustomTabObj.widgets
    : preferences.homeWidgets.length > 0
      ? preferences.homeWidgets
      : (['music', 'voice_search', 'timers', 'network_mini', 'quick_actions'] as HomeWidgetId[]);

  const getWidgetSize = (wid: HomeWidgetId): WidgetSizeVariant => {
    if (activeCustomTabObj) {
      return (
        activeCustomTabObj.widgetSizes?.[wid] ??
        preferences.widgetSizes?.[wid] ??
        HOME_WIDGET_CATALOG.find((c) => c.id === wid)?.defaultSize ??
        'medium'
      );
    }
    return (
      preferences.widgetSizes?.[wid] ??
      HOME_WIDGET_CATALOG.find((c) => c.id === wid)?.defaultSize ??
      'medium'
    );
  };

  const updatePageWidgetsAndSizes = (
    nextWidgets: HomeWidgetId[],
    nextSizePatch?: Partial<Record<HomeWidgetId, WidgetSizeVariant>>
  ) => {
    if (activeCustomTabObj) {
      const nextTabs = (preferences.customWidgetTabs ?? []).map((ct) =>
        ct.id === activeCustomTabObj.id
          ? {
              ...ct,
              widgets: nextWidgets,
              widgetSizes: nextSizePatch
                ? { ...(ct.widgetSizes ?? {}), ...nextSizePatch }
                : ct.widgetSizes,
            }
          : ct
      );
      onUpdatePreferences({ customWidgetTabs: nextTabs });
    } else {
      onUpdatePreferences({
        homeWidgets: nextWidgets,
        ...(nextSizePatch
          ? {
              widgetSizes: {
                ...preferences.widgetSizes,
                ...nextSizePatch,
              },
            }
          : {}),
      });
    }
  };

  const handleSetWidgetSize = (wid: HomeWidgetId, size: WidgetSizeVariant) => {
    playTactilePop('tab');
    updatePageWidgetsAndSizes(pageWidgets, { [wid]: size });
  };

  const handleRemoveWidgetFromPage = (wid: HomeWidgetId) => {
    if (pageWidgets.length <= 1) {
      onTriggerQuickActionToast('Keep at least one widget block on this page');
      return;
    }
    playTactilePop('collapse');
    updatePageWidgetsAndSizes(pageWidgets.filter((w) => w !== wid));
  };

  const handleAddWidgetToPage = (wid: HomeWidgetId) => {
    if (pageWidgets.includes(wid)) return;
    playTactilePop('confirm');
    const defSize = HOME_WIDGET_CATALOG.find((c) => c.id === wid)?.defaultSize ?? 'medium';
    updatePageWidgetsAndSizes([...pageWidgets, wid], { [wid]: getWidgetSize(wid) || defSize });
  };

  const handleHoverSwapWidget = (targetWid: HomeWidgetId) => {
    if (!draggedWidgetId || draggedWidgetId === targetWid) return;
    const fromIdx = pageWidgets.indexOf(draggedWidgetId);
    const toIdx = pageWidgets.indexOf(targetWid);
    if (fromIdx === -1 || toIdx === -1) return;
    const next = [...pageWidgets];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    updatePageWidgetsAndSizes(next);
    playTactilePop('tab');
  };

  const handleDropReorderWidget = (targetWid: HomeWidgetId) => {
    if (draggedWidgetId && draggedWidgetId !== targetWid) {
      handleHoverSwapWidget(targetWid);
    }
    setDraggedWidgetId(null);
  };

  // Multi-Size Music Widget Renderer (Small 1x1, Medium 2x1, Large 2x2, Vertical 1x2)
  const renderMusicWidgetBody = (size: WidgetSizeVariant) => {
    const lyricsOn = preferences.musicLyricsVisible !== false;

    // 1. SMALL (1×1 Compact Square) — Zero wasted space!
    if (size === 'small') {
      return (
        <div className="flex flex-col justify-between h-full gap-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <ResilientThumb
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-8 h-8 rounded-lg shrink-0 ring-1 ring-white/15"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold truncate leading-tight">
                {currentTrack.title}
              </div>
              <div className="text-[10px] opacity-65 truncate">{currentTrack.artist}</div>
            </div>
          </div>

          {lyricsOn && currentTrack.lyrics[lyricIndex] && (
            <div className="text-[10px] italic opacity-80 truncate px-1.5 py-0.5 rounded bg-black/20">
              &ldquo;{currentTrack.lyrics[lyricIndex]}&rdquo;
            </div>
          )}

          <div className="flex items-center justify-between gap-1 pt-0.5">
            <button
              type="button"
              onClick={() => {
                playTactilePop('tab');
                onPrevTrack();
              }}
              aria-label="Previous track"
              className="p-1 rounded-md hover:bg-white/10"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                playTactilePop(isPlaying ? 'toggleOff' : 'toggleOn');
                onTogglePlay();
              }}
              aria-label={isPlaying ? 'Pause music' : 'Play music'}
              style={{ backgroundColor: palette.primaryHex }}
              className={`p-1.5 rounded-full ${palette.onPrimaryTextClass}`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                playTactilePop('tab');
                onNextTrack();
              }}
              aria-label="Next track"
              className="p-1 rounded-md hover:bg-white/10"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      );
    }

    // 2. VERTICAL (1×2 Tall Pillar) — Apple Control Center Vertical Music Column
    if (size === 'vertical') {
      return (
        <div className="flex flex-col justify-between h-full gap-2">
          <div className="flex flex-col items-center text-center gap-1.5 pt-0.5">
            <ResilientThumb
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-14 h-14 rounded-2xl shrink-0 ring-1 ring-white/20 shadow-md"
            />
            <div className="w-full min-w-0">
              <div className="text-xs font-semibold truncate">{currentTrack.title}</div>
              <div className="text-[10px] opacity-70 truncate">{currentTrack.artist}</div>
            </div>
          </div>

          {expandedFullLyrics ? (
            <div className="flex-1 min-h-0 overflow-y-auto pill-scroll rounded-xl bg-black/30 border border-white/10 p-2 space-y-1 text-[10px]">
              {currentTrack.lyrics.map((line, idx) => (
                <button
                  key={`${idx}-${line}`}
                  type="button"
                  onClick={() =>
                    onSeekTrack(
                      Math.floor((idx / Math.max(1, currentTrack.lyrics.length)) * currentTrack.durationSec)
                    )
                  }
                  style={idx === lyricIndex ? { color: palette.primaryHex } : undefined}
                  className={`block w-full text-left leading-snug transition-opacity ${
                    idx === lyricIndex ? 'font-bold opacity-100' : 'opacity-55 hover:opacity-90'
                  }`}
                >
                  {line}
                </button>
              ))}
            </div>
          ) : lyricsOn ? (
            <div className="px-2 py-1.5 rounded-xl bg-black/25 border border-white/[0.07] text-[10px] italic text-center line-clamp-2">
              &ldquo;{currentTrack.lyrics[lyricIndex]}&rdquo;
            </div>
          ) : (
            <FluidMusicVisualizer
              style={preferences.musicVisualizer}
              isPlaying={isPlaying}
              accentHex={palette.primaryHex}
              secondaryHex={palette.secondaryHex}
              compact
              lowPowerEco={preferences.featureFlags.lowRamEcoMode}
            />
          )}

          <div className="space-y-1.5">
            <LivingProgressBar
              currentSec={trackProgressSec}
              durationSec={currentTrack.durationSec}
              isPlaying={isPlaying}
              accentHex={palette.primaryHex}
              secondaryHex={palette.secondaryHex}
              sliderStyle={preferences.musicSliderStyle}
              livingGlowEnabled={preferences.featureFlags.livingProgressBar}
              glowIntensity={preferences.sliderGlowIntensity}
              lowPowerEco={preferences.featureFlags.lowRamEcoMode}
              onSeek={onSeekTrack}
            />
            <div className="flex items-center justify-between gap-1">
              <button
                type="button"
                onClick={() =>
                  onUpdatePreferences({ musicLyricsVisible: !lyricsOn })
                }
                title={lyricsOn ? 'Turn inline lyrics off' : 'Turn inline lyrics on'}
                className={`p-1 rounded-md text-[9px] font-semibold ${
                  lyricsOn ? 'bg-white/20 text-white' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <MessageSquareQuote className="w-3 h-3" />
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onPrevTrack}
                  aria-label="Previous track"
                  className="p-1 rounded-md hover:bg-white/10"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onTogglePlay}
                  aria-label={isPlaying ? 'Pause music' : 'Play music'}
                  style={{ backgroundColor: palette.primaryHex }}
                  className={`p-1.5 rounded-full ${palette.onPrimaryTextClass}`}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={onNextTrack}
                  aria-label="Next track"
                  className="p-1 rounded-md hover:bg-white/10"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setExpandedFullLyrics((v) => !v)}
                title={expandedFullLyrics ? 'Collapse full lyrics' : 'Expand full lyrics'}
                className="p-1 rounded-md opacity-75 hover:opacity-100 hover:bg-white/10"
              >
                {expandedFullLyrics ? (
                  <Minimize2 className="w-3 h-3" />
                ) : (
                  <Maximize2 className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 3. MEDIUM (2×1 Space-Efficient Wide Block — Default!)
    if (size === 'medium') {
      return (
        <div className="flex flex-col justify-between h-full gap-1.5">
          {/* Top Compact Header: Artwork + Track + Lyrics On/Off + Expand + Inline Transport */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <ResilientThumb
                src={currentTrack.coverUrl}
                alt={`${currentTrack.title} album art`}
                className="w-9 h-9 rounded-xl shrink-0 ring-1 ring-white/15"
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate leading-tight">
                  {currentTrack.title}
                </div>
                <div className="text-[11px] opacity-70 truncate">
                  {currentTrack.artist}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  playTactilePop('tab');
                  onUpdatePreferences({ musicLyricsVisible: !lyricsOn });
                  if (lyricsOn) setExpandedFullLyrics(false);
                }}
                aria-pressed={lyricsOn}
                title={lyricsOn ? 'Hide inline lyrics' : 'Show inline lyrics'}
                style={
                  lyricsOn
                    ? {
                        backgroundColor: `${palette.primaryHex}26`,
                        borderColor: `${palette.primaryHex}66`,
                      }
                    : undefined
                }
                className={`px-1.5 py-0.5 text-[10px] font-medium rounded-md border transition-colors ${
                  lyricsOn
                    ? 'text-white font-semibold'
                    : 'border-transparent opacity-65 hover:opacity-100 hover:bg-white/10'
                }`}
              >
                Lyrics
              </button>

              <button
                type="button"
                onClick={() => setExpandedFullLyrics((v) => !v)}
                aria-label={expandedFullLyrics ? 'Collapse full lyrics' : 'Expand full lyrics'}
                title={expandedFullLyrics ? 'Collapse full lyrics' : 'Expand full lyrics'}
                className={`p-1 rounded-md transition-colors ${
                  expandedFullLyrics
                    ? 'bg-white/20 text-white'
                    : 'opacity-70 hover:opacity-100 hover:bg-white/10'
                }`}
              >
                {expandedFullLyrics ? (
                  <Minimize2 className="w-3 h-3" />
                ) : (
                  <Maximize2 className="w-3 h-3" />
                )}
              </button>

              <div className="flex items-center gap-0.5 pl-0.5">
                <button
                  type="button"
                  onClick={() => {
                    playTactilePop('tab');
                    onPrevTrack();
                  }}
                  aria-label="Previous track"
                  className="p-1 rounded-md hover:bg-white/10"
                >
                  <SkipBack className="w-3.5 h-3.5" strokeWidth={iconMetrics.strokeWidth} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTactilePop(isPlaying ? 'toggleOff' : 'toggleOn');
                    onTogglePlay();
                  }}
                  aria-label={isPlaying ? 'Pause music' : 'Play music'}
                  style={{ backgroundColor: palette.primaryHex }}
                  className={`p-1.5 rounded-full transition-transform active:scale-95 ${palette.onPrimaryTextClass}`}
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5" strokeWidth={iconMetrics.strokeWidth} />
                  ) : (
                    <Play className="w-3.5 h-3.5" strokeWidth={iconMetrics.strokeWidth} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTactilePop('tab');
                    onNextTrack();
                  }}
                  aria-label="Next track"
                  className="p-1 rounded-md hover:bg-white/10"
                >
                  <SkipForward className="w-3.5 h-3.5" strokeWidth={iconMetrics.strokeWidth} />
                </button>
              </div>
            </div>
          </div>

          {/* Fused Lyric + Living Scrubber Capsule (or Expandable Full Lyrics View) */}
          {expandedFullLyrics ? (
            <div className="max-h-24 overflow-y-auto pill-scroll px-2.5 py-1.5 rounded-xl bg-black/35 border border-white/10 space-y-1">
              {currentTrack.lyrics.map((line, idx) => (
                <button
                  key={`${idx}-${line}`}
                  type="button"
                  onClick={() =>
                    onSeekTrack(
                      Math.floor(
                        (idx / Math.max(1, currentTrack.lyrics.length)) * currentTrack.durationSec
                      )
                    )
                  }
                  style={idx === lyricIndex ? { color: palette.primaryHex } : undefined}
                  className={`block w-full text-left text-[11px] leading-snug transition-opacity ${
                    idx === lyricIndex ? 'font-semibold opacity-100' : 'opacity-55 hover:opacity-90'
                  }`}
                >
                  &ldquo;{line}&rdquo;
                </button>
              ))}
            </div>
          ) : (
            <div className="px-2.5 py-1.5 rounded-xl bg-black/25 border border-white/[0.07] flex flex-col gap-1">
              {lyricsOn && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] opacity-90 italic truncate select-text">
                    &ldquo;{currentTrack.lyrics[lyricIndex]}&rdquo;
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedFullLyrics(true)}
                    style={{ color: isLight ? '#9a3412' : palette.primaryHex }}
                    className="text-[10px] font-semibold shrink-0 hover:underline"
                  >
                    Full Lyrics
                  </button>
                </div>
              )}
              <LivingProgressBar
                currentSec={trackProgressSec}
                durationSec={currentTrack.durationSec}
                isPlaying={isPlaying}
                accentHex={palette.primaryHex}
                secondaryHex={palette.secondaryHex}
                sliderStyle={preferences.musicSliderStyle}
                livingGlowEnabled={preferences.featureFlags.livingProgressBar}
                glowIntensity={preferences.sliderGlowIntensity}
                lowPowerEco={preferences.featureFlags.lowRamEcoMode}
                onSeek={onSeekTrack}
              />
            </div>
          )}
        </div>
      );
    }

    // 4. LARGE (2×2 Full Studio Player — Zero Wasted Space, Full Synchronized Lyrics or Visualizer + Fused Scrubber)
    return (
      <div className="flex flex-col justify-between h-full gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <ResilientThumb
              src={currentTrack.coverUrl}
              alt={`${currentTrack.title} album art`}
              className="w-11 h-11 rounded-xl shrink-0 ring-1 ring-white/15"
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{currentTrack.title}</div>
              <div className="text-xs opacity-70 truncate">
                {currentTrack.artist} · {currentTrack.album}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                playTactilePop('tab');
                onUpdatePreferences({ musicLyricsVisible: !lyricsOn });
                if (lyricsOn) setExpandedFullLyrics(false);
              }}
              aria-pressed={lyricsOn}
              style={
                lyricsOn
                  ? {
                      backgroundColor: `${palette.primaryHex}26`,
                      borderColor: `${palette.primaryHex}66`,
                    }
                  : undefined
              }
              className={`px-2 py-1 text-[10px] font-semibold rounded-lg border transition-colors ${
                lyricsOn
                  ? 'text-white'
                  : 'border-white/10 opacity-70 hover:opacity-100 hover:bg-white/10'
              }`}
            >
              {lyricsOn ? 'Lyrics On' : 'Lyrics Off'}
            </button>

            <button
              type="button"
              onClick={() => setExpandedFullLyrics((v) => !v)}
              aria-label={expandedFullLyrics ? 'Collapse full lyrics' : 'Expand full lyrics'}
              title={expandedFullLyrics ? 'Collapse full lyrics' : 'Expand full synchronized lyrics'}
              className={`px-2 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-colors ${
                expandedFullLyrics
                  ? 'bg-white/20 text-white font-semibold'
                  : 'bg-white/8 hover:bg-white/15 opacity-85'
              }`}
            >
              {expandedFullLyrics ? (
                <>
                  <Minimize2 className="w-3 h-3" />
                  <span>Compact</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3 h-3" />
                  <span>Expand</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowAudioMenu((v) => !v)}
              aria-label="Choose audio output device"
              className="p-1.5 rounded-lg opacity-75 hover:opacity-100 hover:bg-white/10"
            >
              <Speaker className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Middle Studio Area: Audio Output Picker OR Full Scrollable Lyrics OR Visualizer + Fused Inline Lyric */}
        {showAudioMenu ? (
          <div className="my-0.5 bg-slate-950/90 text-slate-100 border border-white/10 rounded-xl p-1.5 space-y-0.5">
            {AUDIO_DEVICES.map((dev) => (
              <button
                key={dev}
                type="button"
                onClick={() => {
                  onChangeAudioDevice(dev);
                  setShowAudioMenu(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1 text-xs rounded-lg ${
                  audioDevice === dev ? 'bg-white/15 font-medium' : 'hover:bg-white/5'
                }`}
              >
                <span className="truncate">{dev}</span>
                {audioDevice === dev && (
                  <Check className="w-3.5 h-3.5" style={{ color: palette.primaryHex }} />
                )}
              </button>
            ))}
          </div>
        ) : expandedFullLyrics ? (
          <div className="flex-1 min-h-[84px] max-h-32 overflow-y-auto pill-scroll px-3 py-2 rounded-xl bg-black/35 border border-white/10 space-y-1.5 select-text">
            {currentTrack.lyrics.map((line, idx) => (
              <button
                key={`${idx}-${line}`}
                type="button"
                onClick={() =>
                  onSeekTrack(
                    Math.floor(
                      (idx / Math.max(1, currentTrack.lyrics.length)) * currentTrack.durationSec
                    )
                  )
                }
                style={idx === lyricIndex ? { color: palette.primaryHex } : undefined}
                className={`block w-full text-left text-xs leading-relaxed transition-all ${
                  idx === lyricIndex
                    ? 'font-semibold opacity-100 scale-[1.01]'
                    : 'opacity-55 hover:opacity-90'
                }`}
              >
                &ldquo;{line}&rdquo;
              </button>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center gap-1.5">
            <FluidMusicVisualizer
              style={preferences.musicVisualizer}
              isPlaying={isPlaying}
              accentHex={palette.primaryHex}
              secondaryHex={palette.secondaryHex}
              lowPowerEco={preferences.featureFlags.lowRamEcoMode}
            />
          </div>
        )}

        {/* Bottom Fused Lyric + Living Scrubber + Transport Row */}
        <div className="space-y-1.5">
          <div className="px-3 py-2 rounded-xl bg-black/25 border border-white/[0.07] flex flex-col gap-1.5">
            {lyricsOn && !expandedFullLyrics && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] opacity-90 italic truncate select-text">
                  &ldquo;{currentTrack.lyrics[lyricIndex]}&rdquo;
                </span>
                <button
                  type="button"
                  onClick={() => setExpandedFullLyrics(true)}
                  style={{ color: isLight ? '#9a3412' : palette.primaryHex }}
                  className="text-[10px] font-semibold shrink-0 hover:underline"
                >
                  Full Lyrics
                </button>
              </div>
            )}
            <LivingProgressBar
              currentSec={trackProgressSec}
              durationSec={currentTrack.durationSec}
              isPlaying={isPlaying}
              accentHex={palette.primaryHex}
              secondaryHex={palette.secondaryHex}
              sliderStyle={preferences.musicSliderStyle}
              livingGlowEnabled={preferences.featureFlags.livingProgressBar}
              glowIntensity={preferences.sliderGlowIntensity}
              lowPowerEco={preferences.featureFlags.lowRamEcoMode}
              onSeek={onSeekTrack}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAudioMenu((v) => !v)}
              className="text-[11px] opacity-75 hover:opacity-100 truncate max-w-[165px] flex items-center gap-1"
            >
              <Speaker className="w-3 h-3 shrink-0" />
              <span className="truncate">{audioDevice}</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playTactilePop('tab');
                  onPrevTrack();
                }}
                aria-label="Previous track"
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <SkipBack className="w-4 h-4" strokeWidth={iconMetrics.strokeWidth} />
              </button>
              <button
                type="button"
                onClick={() => {
                  playTactilePop(isPlaying ? 'toggleOff' : 'toggleOn');
                  onTogglePlay();
                }}
                aria-label={isPlaying ? 'Pause music' : 'Play music'}
                style={{ backgroundColor: palette.primaryHex }}
                className={`p-2 rounded-full transition-transform active:scale-95 ${palette.onPrimaryTextClass}`}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" strokeWidth={iconMetrics.strokeWidth} />
                ) : (
                  <Play className="w-4 h-4" strokeWidth={iconMetrics.strokeWidth} />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  playTactilePop('tab');
                  onNextTrack();
                }}
                aria-label="Next track"
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <SkipForward className="w-4 h-4" strokeWidth={iconMetrics.strokeWidth} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Multi-Size Building-Block Widget Renderer for All Catalog Widgets
  const renderWidgetBlockContent = (wid: HomeWidgetId, size: WidgetSizeVariant) => {
    if (wid === 'music') {
      if (!preferences.featureFlags.nowPlaying) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center gap-1 opacity-70 text-xs">
            <span>Now Playing disabled in Settings</span>
          </div>
        );
      }
      return renderMusicWidgetBody(size);
    }

    if (wid === 'voice_search') {
      const isCompact = size === 'small' || size === 'vertical';
      return (
        <div className="flex flex-col justify-between h-full gap-2">
          <div className="flex items-center justify-between text-[11px] gap-1">
            <span className="font-semibold flex items-center gap-1 truncate">
              <Search className="w-3 h-3 shrink-0" style={{ color: palette.primaryHex }} />
              <span className="truncate">
                {size === 'small' ? 'Search & Astra' : 'Fast Search & Astra (అస్త్రం)'}
              </span>
            </span>
            {size !== 'small' && (
              <span className="text-[10px] font-mono opacity-65 shrink-0">
                {preferences.voiceAgentShortcut}
              </span>
            )}
          </div>

          {size === 'large' && (
            <p className="text-[11px] opacity-75 leading-snug">
              Launch grounded Google Search inside the Pill or summon the floating{' '}
              <strong>Astra (అస్త్రం)</strong> voice orb to control Windows hands-free.
            </p>
          )}

          <div className={`grid ${isCompact ? 'grid-cols-1' : 'grid-cols-2'} gap-1.5 mt-auto`}>
            <button
              type="button"
              onClick={() => {
                if (!preferences.aiEnabled) {
                  onTriggerQuickActionToast('Search & AI features are disabled in Settings');
                  return;
                }
                playTactilePop('tab');
                setAiInitialSubMode('search');
                onSelectTab('ai');
              }}
              className="py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/18 text-[11px] font-medium flex items-center justify-center gap-1"
            >
              <ThemedIcon name="search" packStyle={preferences.iconPack} size={13} className="shrink-0" />
              <span className="truncate">Google Search</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!preferences.aiEnabled) {
                  onTriggerQuickActionToast('Astra AI Agent is disabled in Settings');
                  return;
                }
                playTactilePop('expand');
                onOpenVoiceAgent();
              }}
              style={{ backgroundColor: palette.primaryHex }}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 ${palette.onPrimaryTextClass}`}
            >
              <ThemedIcon name="sparkles" packStyle={preferences.iconPack} size={13} className="shrink-0" />
              <span className="truncate">Astra Orb</span>
            </button>
          </div>
        </div>
      );
    }

    if (wid === 'timers') {
      const presets =
        size === 'small'
          ? [
              { label: '1m', sec: 60 },
              { label: '5m', sec: 300 },
              { label: '15m', sec: 900 },
              { label: '25m', sec: 1500 },
            ]
          : [
              { label: '1m', sec: 60 },
              { label: '5m', sec: 300 },
              { label: '15m', sec: 900 },
              { label: '25m', sec: 1500 },
              ...(size === 'large' || size === 'vertical'
                ? [
                    { label: '45m', sec: 2700 },
                    { label: '60m', sec: 3600 },
                  ]
                : []),
            ];

      const pct =
        timerRemainingSec !== null && timerTotalSec > 0
          ? Math.max(0, Math.min(100, ((timerTotalSec - timerRemainingSec) / timerTotalSec) * 100))
          : 0;

      return (
        <div className="flex flex-col justify-between h-full gap-1.5">
          <div className="flex items-center justify-between text-[11px] gap-1">
            <span className="flex items-center gap-1 font-semibold truncate">
              <Timer className="w-3 h-3 shrink-0" style={{ color: palette.primaryHex }} />
              <span className="truncate font-mono tabular-nums">
                {timerRemainingSec !== null
                  ? formatDurationClock(timerRemainingSec)
                  : 'Timer'}
              </span>
            </span>
            {timerRemainingSec !== null && (
              <button
                type="button"
                onClick={onCancelTimer}
                className="text-[10px] text-rose-400 hover:underline shrink-0"
              >
                Stop
              </button>
            )}
          </div>

          {(size === 'large' || size === 'vertical') && timerRemainingSec !== null && (
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden my-1">
              <div
                style={{ width: `${pct}%`, backgroundColor: palette.primaryHex }}
                className="h-full rounded-full transition-all duration-300"
              />
            </div>
          )}

          <div
            className={`grid ${
              size === 'small' || size === 'vertical' ? 'grid-cols-2' : 'grid-cols-4'
            } gap-1 mt-auto`}
          >
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  onStartTimer(preset.sec);
                  playTactilePop('toggleOn');
                }}
                className={`py-1 text-[11px] font-mono font-medium tabular-nums bg-white/10 hover:bg-white/18 ${innerPillMetrics.radiusClass}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (wid === 'network_mini' || (wid as string) === 'network') {
      return (
        <button
          type="button"
          onClick={() => onSelectTab('monitor')}
          className="w-full h-full flex flex-col justify-between text-left gap-1"
        >
          <div className="flex items-center justify-between gap-1 text-[10px] opacity-75 w-full">
            <span className="flex items-center gap-1 truncate">
              <ThemedIcon name="wifi" packStyle={preferences.iconPack} size={13} color="#34d399" className="shrink-0" />
              <span className="truncate font-mono">{systemState.localIpv4}</span>
            </span>
            <span className="font-mono shrink-0">{systemState.pingMs}ms</span>
          </div>

          <div className="mt-auto">
            <div className="text-xs font-mono font-bold tabular-nums">
              ↓ {systemState.netDownMbps.toFixed(1)}{' '}
              <span className="opacity-65 font-normal">Mbps</span>
            </div>
            <div className="text-[10px] font-mono opacity-75 tabular-nums">
              ↑ {systemState.netUpMbps.toFixed(1)} Mbps
              {size !== 'small' ? ` · ${systemState.sessionDownGb.toFixed(2)} GB` : ''}
            </div>
          </div>
        </button>
      );
    }

    if (wid === 'vitals_mini' || (wid as string) === 'monitor' || (wid as string) === 'battery') {
      return (
        <button
          type="button"
          onClick={() => onSelectTab('monitor')}
          className="w-full h-full flex flex-col justify-between text-left gap-1"
        >
          <div className="flex items-center justify-between w-full text-[10px] opacity-85">
            <span>Power &amp; CPU</span>
            <AnimatedBatterySymbol
              percent={systemState.batteryPct}
              isCharging={systemState.isCharging}
              accentHex={palette.primaryHex}
              size="sm"
              lowPowerEco={preferences.featureFlags.lowRamEcoMode}
            />
          </div>
          <div className="mt-auto">
            <div className="text-xs font-mono font-bold tabular-nums">
              {systemState.chargingWatts}W PD · {systemState.batteryPct}%
            </div>
            <div className="text-[10px] font-mono text-emerald-400 tabular-nums">
              CPU {systemState.cpuUsagePct.toFixed(0)}% · GPU {systemState.gpuTempC}°C
            </div>
          </div>
        </button>
      );
    }

    if ((wid as string) === 'weather') {
      return (
        <button
          type="button"
          onClick={() => onSelectTab('monitor')}
          className="w-full h-full flex flex-col justify-between text-left gap-1"
        >
          <div className="flex items-center justify-between w-full text-[10px] opacity-85">
            <span className="flex items-center gap-1 font-semibold truncate">
              <ThemedIcon name="sun" packStyle={preferences.iconPack} size={13} color="#fbbf24" className="shrink-0" />
              <span>Bengaluru · Sunny</span>
            </span>
            <span className="font-mono text-emerald-400 font-semibold">24°C</span>
          </div>
          <div className="mt-auto">
            <div className="text-xs font-mono font-bold tabular-nums">
              H: 28° · L: 19°
            </div>
            <div className="text-[10px] opacity-75">
              AQI 42 · Humidity 58%
            </div>
          </div>
        </button>
      );
    }

    if (wid === 'clipboard_peek' || (wid as string) === 'clipboard') {
      const topClip = clipboardItems[0];
      return (
        <div className="flex flex-col justify-between h-full gap-1.5">
          <div className="flex items-center justify-between gap-1 text-[10px]">
            <button
              type="button"
              onClick={() => onSelectTab('clipboard')}
              className="font-semibold opacity-80 hover:opacity-100 flex items-center gap-1 truncate"
            >
              <ClipboardIcon className="w-3 h-3 shrink-0" style={{ color: palette.primaryHex }} />
              <span className="truncate">Clipboard</span>
            </button>
            {topClip && (
              <span className="font-mono px-1.5 py-0.5 rounded bg-white/10 shrink-0">
                {topClip.badgeCode}
              </span>
            )}
          </div>

          {topClip ? (
            <button
              type="button"
              onClick={() => handleCopyText(topClip.id, topClip.text)}
              className="mt-auto text-left group"
            >
              <div className="text-[11px] font-mono line-clamp-2 opacity-90 group-hover:opacity-100">
                {topClip.text}
              </div>
              <div
                style={{ color: palette.primaryHex }}
                className="text-[10px] font-semibold mt-0.5"
              >
                {copiedId === topClip.id ? '✓ Copied' : 'Click to copy'}
              </div>
            </button>
          ) : (
            <div className="text-[11px] opacity-60 mt-auto">Clipboard empty</div>
          )}
        </div>
      );
    }

    if (wid === 'notes_peek' || (wid as string) === 'notes') {
      return (
        <div className="flex flex-col justify-between h-full gap-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-semibold flex items-center gap-1">
              <StickyNote className="w-3 h-3" style={{ color: palette.primaryHex }} />
              <span>Quick Note</span>
            </span>
            <button
              type="button"
              onClick={() => onSelectTab('notes')}
              className="opacity-70 hover:opacity-100 hover:underline"
            >
              Open
            </button>
          </div>
          <textarea
            value={noteContent}
            onChange={(e) => onChangeNoteContent(e.target.value)}
            rows={size === 'large' || size === 'vertical' ? 5 : 2}
            placeholder="Type a quick desktop note..."
            className="flex-1 w-full resize-none bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-sky-400 pill-scroll"
          />
        </div>
      );
    }

    if (wid === 'quick_actions') {
      const gridCols = size === 'small' || size === 'vertical' ? 'grid-cols-2' : 'grid-cols-4';
      return (
        <div className={`grid ${gridCols} gap-1.5 h-full items-stretch`}>
          <button
            type="button"
            onClick={() =>
              onTriggerQuickActionToast('Windows Snipping Rectangular Clip active')
            }
            className={`flex flex-col items-center justify-center py-1.5 ${innerPillMetrics.radiusClass} bg-white/[0.06] hover:bg-white/[0.12] text-[10px] gap-0.5`}
          >
            <ThemedIcon name="snip" packStyle={preferences.iconPack} size={15} strokeWidth={iconMetrics.strokeWidth} />
            <span>Snip</span>
          </button>
          <button
            type="button"
            aria-pressed={micMuted}
            onClick={() => {
              playTactilePop(!micMuted ? 'toggleOn' : 'toggleOff');
              onToggleMicMuted();
            }}
            className={`flex flex-col items-center justify-center py-1.5 ${innerPillMetrics.radiusClass} text-[10px] gap-0.5 ${
              micMuted
                ? 'bg-rose-500/25 border border-rose-400/40 text-rose-200'
                : 'bg-white/[0.06] hover:bg-white/[0.12]'
            }`}
          >
            <ThemedIcon name="mic" packStyle={preferences.iconPack} size={15} color={micMuted ? '#fca5a5' : undefined} />
            <span>{micMuted ? 'Muted' : 'Mic'}</span>
          </button>
          <button
            type="button"
            aria-pressed={nightLight}
            onClick={() => {
              playTactilePop(!nightLight ? 'toggleOn' : 'toggleOff');
              onToggleNightLight();
            }}
            className={`flex flex-col items-center justify-center py-1.5 ${innerPillMetrics.radiusClass} text-[10px] gap-0.5 ${
              nightLight
                ? 'bg-amber-500/25 border border-amber-400/40 text-amber-200'
                : 'bg-white/[0.06] hover:bg-white/[0.12]'
            }`}
          >
            <ThemedIcon name="nightlight" packStyle={preferences.iconPack} size={15} color={nightLight ? '#fcd34d' : undefined} />
            <span>Warm</span>
          </button>
          <button
            type="button"
            aria-pressed={keepAwake}
            onClick={() => {
              playTactilePop(!keepAwake ? 'toggleOn' : 'toggleOff');
              onToggleKeepAwake();
            }}
            className={`flex flex-col items-center justify-center py-1.5 ${innerPillMetrics.radiusClass} text-[10px] gap-0.5 ${
              keepAwake
                ? 'bg-emerald-500/25 border border-emerald-400/40 text-emerald-200'
                : 'bg-white/[0.06] hover:bg-white/[0.12]'
            }`}
          >
            <ThemedIcon name="awake" packStyle={preferences.iconPack} size={15} color={keepAwake ? '#6ee7b7' : undefined} />
            <span>Awake</span>
          </button>
        </div>
      );
    }

    return null;
  };

  // Clipboard Card Renderer supporting BOTH Dynamic Bento (tight image rectangles + square siblings) & Classic Stack
  const renderClipboardCard = (clip: ClipboardItem, layout: ClipboardLayoutMode) => {
    const isDynamic = layout === 'dynamic_bento';

    // Dynamic Bento span rules:
    // - Images use fitted col-span-2 rectangles (zero side black bars!)
    // - Code or long paragraphs (>90 chars) use col-span-2
    // - Colors, Links, Short Text, and File Badges use compact col-span-1 squares right next to them!
    const dynamicSpanCls = !isDynamic
      ? ''
      : clip.previewImageUrl || clip.category === 'code' || clip.text.length > 90
        ? 'col-span-3 sm:col-span-2'
        : 'col-span-3 sm:col-span-1';

    if (isDynamic && clip.previewImageUrl) {
      return (
        <div
          key={clip.id}
          className={`${dynamicSpanCls} group relative rounded-2xl overflow-hidden border transition-all ${cardSurfaceCls}`}
        >
          <button
            type="button"
            onClick={() =>
              setZoomedClipImage({
                url: clip.previewImageUrl!,
                title: clip.text,
              })
            }
            className="w-full block relative overflow-hidden bg-black/40 cursor-zoom-in"
          >
            <img
              src={clip.previewImageUrl}
              alt={clip.text}
              referrerPolicy="no-referrer"
              data-testid="clipboard-image-preview"
              className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </button>

          <div className="px-2.5 py-1.5 flex items-center justify-between gap-2 bg-black/45 backdrop-blur-md">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                style={{ color: isLight ? '#9a3412' : palette.primaryHex }}
                className="px-1.5 py-0.5 rounded bg-white/10 text-[9.5px] font-mono font-semibold shrink-0"
              >
                {clip.badgeCode}
              </span>
              <span className="text-[11px] font-mono truncate">{clip.text}</span>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setZoomedClipImage({ url: clip.previewImageUrl!, title: clip.text })
                }
                aria-label={`View full size ${clip.text}`}
                className="p-1 rounded hover:bg-white/15 opacity-80 hover:opacity-100"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onTogglePinClip(clip.id)}
                aria-label={`${clip.pinned ? 'Unpin' : 'Pin'} clip ${clip.text}`}
                className={`p-1 rounded ${
                  clip.pinned ? 'text-amber-400' : 'opacity-65 hover:opacity-100'
                }`}
              >
                <Pin className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleCopyText(clip.id, clip.text)}
                className="px-1.5 py-0.5 text-[10px] font-semibold bg-white/15 hover:bg-white/25 rounded"
              >
                {copiedId === clip.id ? '✓' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={() => {
                  playTactilePop('collapse');
                  onRemoveClipboardItem(clip.id);
                }}
                aria-label={`Delete clipboard item ${clip.text}`}
                className="p-1 rounded opacity-70 hover:opacity-100 hover:text-rose-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={clip.id}
        className={`${dynamicSpanCls} border rounded-2xl p-2.5 flex flex-col justify-between gap-2 transition-colors ${cardSurfaceCls}`}
      >
        {/* Top Metadata + Pin / Copy / Individual Delete Action Row */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              style={{ color: isLight ? '#9a3412' : palette.primaryHex }}
              className="px-1.5 py-0.5 rounded-md bg-white/10 text-[9.5px] font-mono font-semibold shrink-0"
            >
              {clip.badgeCode}
            </span>
            <span className="text-[10.5px] opacity-70 truncate">
              {isDynamic ? clip.copiedAt : `${clip.source} · ${clip.copiedAt}`}
            </span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0 select-none">
            {clip.previewImageUrl && (
              <button
                type="button"
                onClick={() =>
                  setZoomedClipImage({
                    url: clip.previewImageUrl!,
                    title: clip.text,
                  })
                }
                aria-label={`View full size ${clip.text}`}
                className="p-1 rounded-lg hover:bg-white/12 opacity-80 hover:opacity-100"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onTogglePinClip(clip.id)}
              aria-label={`${clip.pinned ? 'Unpin' : 'Pin'} clip ${clip.text}`}
              className={`p-1 rounded-lg transition-colors ${
                clip.pinned
                  ? 'text-amber-400 bg-amber-500/15'
                  : 'opacity-65 hover:opacity-100 hover:bg-white/10'
              }`}
            >
              <Pin className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => handleCopyText(clip.id, clip.text)}
              aria-label={`Copy ${clip.text}`}
              className="px-1.5 py-0.5 text-[10.5px] font-medium bg-white/12 hover:bg-white/22 rounded-md whitespace-nowrap"
            >
              {copiedId === clip.id ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={() => {
                playTactilePop('collapse');
                onRemoveClipboardItem(clip.id);
              }}
              aria-label={`Delete clipboard item ${clip.text}`}
              title="Delete this clipboard item"
              className="p-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Adaptive Smart Body */}
        {clip.previewImageUrl ? (
          <div className="space-y-1">
            <button
              type="button"
              onClick={() =>
                setZoomedClipImage({
                  url: clip.previewImageUrl!,
                  title: clip.text,
                })
              }
              className="w-full rounded-xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center p-1.5 cursor-zoom-in"
            >
              <img
                src={clip.previewImageUrl}
                alt={clip.text}
                referrerPolicy="no-referrer"
                data-testid="clipboard-image-preview"
                className="max-h-28 w-full object-contain rounded-lg"
              />
            </button>
            <div className="text-xs font-mono opacity-90 cursor-text truncate">{clip.text}</div>
          </div>
        ) : clip.category === 'color' && clip.accentHex ? (
          <div className={`flex ${isDynamic ? 'flex-col' : 'items-center'} gap-2`}>
            <div
              style={{ backgroundColor: clip.accentHex }}
              className={`${isDynamic ? 'h-12 w-full' : 'h-9 flex-1'} rounded-xl border border-white/20 shadow-inner`}
            />
            <span className="text-xs font-mono font-bold cursor-text">{clip.text}</span>
          </div>
        ) : clip.category === 'code' ? (
          <pre className="p-2 rounded-xl bg-black/45 border border-white/10 text-[10.5px] font-mono text-sky-200 whitespace-pre-wrap break-words leading-relaxed max-h-24 overflow-y-auto pill-scroll cursor-text">
            {clip.text}
          </pre>
        ) : clip.category === 'link' ? (
          <a
            href={clip.text}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-sky-400 hover:underline break-all line-clamp-2"
          >
            <ExternalLink className="w-3 h-3 shrink-0" />
            <span>{clip.text}</span>
          </a>
        ) : (
          <div className="space-y-0.5">
            <div
              className={`text-xs leading-snug whitespace-pre-wrap break-words cursor-text ${
                isDynamic ? 'line-clamp-3' : ''
              }`}
            >
              {clip.text}
            </div>
            {clip.fileSizeLabel && (
              <div className="text-[10px] font-mono opacity-60 truncate">{clip.fileSizeLabel}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  const unaddedCatalogWidgets = HOME_WIDGET_CATALOG.filter((w) => !pageWidgets.includes(w.id));

  return (
    <div
      className={`flex flex-col w-full h-full px-4 pt-3 pb-3.5 ${
        isLight ? 'text-stone-900' : 'text-slate-100'
      }`}
      onClick={(e) => e.stopPropagation()}
      onPaste={(e) => {
        if (activeTab === 'clipboard' && e.clipboardData?.files?.length) {
          handleUniversalClipboardFiles(e.clipboardData.files);
        }
      }}
    >
      {/* Top Interior Navigation Bar */}
      <div
        className={`flex items-center justify-between gap-2 pb-2 border-b select-none ${
          isLight ? 'border-stone-900/15' : 'border-white/10'
        }`}
      >
        <div
          className="flex items-center gap-1 overflow-x-auto pill-scroll"
          role="tablist"
          aria-label="Dynamic Island sections"
        >
          <img
            src={getThemeMotifUrl(preferences.themeId)}
            alt="The Pill Motif"
            title="The Pill"
            className="h-5 w-auto max-w-[56px] object-contain shrink-0 mr-2 drop-shadow select-none hover:scale-105 transition-transform"
          />
          {visibleTabs.map((tabId) => {
            const isSelected = !isLauncherOpen && activeTab === tabId;
            const label = getTabDisplayLabel(tabId);
            return (
              <button
                key={tabId}
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  playTactilePop('tab');
                  if (isLauncherOpen) onToggleLauncher();
                  onSelectTab(tabId);
                }}
                style={
                  isSelected
                    ? {
                        backgroundColor: `${palette.primaryHex}28`,
                        borderColor: `${palette.primaryHex}66`,
                      }
                    : undefined
                }
                className={`px-2 py-1 text-xs font-medium ${innerPillMetrics.radiusClass} border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-sky-400 ${
                  isSelected
                    ? isLight
                      ? 'text-stone-950 font-semibold'
                      : 'text-white font-semibold'
                    : isLight
                      ? 'border-transparent text-stone-600 hover:text-stone-950 hover:bg-stone-900/8'
                      : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/6'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Right Controls: OS Privacy Mask + In-Pill Astra Trigger + 4-Blocks All-Apps Menu + Settings + Close */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              const nextMask = !preferences.privacyMaskEnabled;
              playTactilePop(nextMask ? 'toggleOn' : 'toggleOff');
              onUpdatePreferences({ privacyMaskEnabled: nextMask });
              onTriggerQuickActionToast(
                nextMask
                  ? 'OS Privacy Mask ON — Pill cloaked from Zoom/Teams/Meet screen shares'
                  : 'OS Privacy Mask OFF — Pill visible to screen sharing'
              );
            }}
            aria-label="Toggle OS-level screen-share privacy mask"
            aria-pressed={preferences.privacyMaskEnabled}
            title={
              preferences.privacyMaskEnabled
                ? 'OS Privacy Mask Active (WDA_EXCLUDEFROMCAPTURE) — Hidden from video call screen shares'
                : 'OS Privacy Mask Disabled — Click to cloak Pill from screen capture'
            }
            className={`p-1.5 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-sky-400 ${
              preferences.privacyMaskEnabled
                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                : 'opacity-65 hover:opacity-100 hover:bg-white/10'
            }`}
          >
            {preferences.privacyMaskEnabled ? (
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={iconMetrics.strokeWidth} />
            ) : (
              <Shield className="w-3.5 h-3.5" strokeWidth={iconMetrics.strokeWidth} />
            )}
          </button>

          {preferences.aiEnabled && (
            <button
              type="button"
              onClick={() => {
                playTactilePop('expand');
                onOpenVoiceAgent();
              }}
              aria-label={`Morph Pill into Astra (${preferences.voiceAgentShortcut})`}
              title={`Morph Pill into Astra (అస్త్రం) (${preferences.voiceAgentShortcut})`}
              style={{
                backgroundColor: `${palette.primaryHex}24`,
                color: isLight ? '#78350f' : palette.primaryHex,
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10.5px] font-semibold hover:brightness-110 transition-all whitespace-nowrap"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Astra</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              playTactilePop('tab');
              onToggleLauncher();
            }}
            aria-label="Open All Apps Menu"
            aria-pressed={isLauncherOpen}
            title="All Apps Menu"
            style={isLauncherOpen ? { backgroundColor: palette.primaryHex } : undefined}
            className={`p-1.5 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-sky-400 ${
              isLauncherOpen
                ? palette.onPrimaryTextClass
                : 'opacity-75 hover:opacity-100 hover:bg-white/10'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" strokeWidth={iconMetrics.strokeWidth} />
          </button>

          <button
            type="button"
            onClick={() => {
              playTactilePop('tab');
              onOpenFullSettings();
            }}
            aria-label="Open Pill Settings"
            title="Pill Settings & Customization"
            className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-sky-400"
          >
            <ThemedIcon name="settings" packStyle={preferences.iconPack} size={15} strokeWidth={iconMetrics.strokeWidth} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCollapse();
            }}
            aria-label="Collapse Dynamic Island"
            title="Collapse (Esc)"
            className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-sky-400"
          >
            <X className="w-3.5 h-3.5" strokeWidth={iconMetrics.strokeWidth} />
          </button>
        </div>
      </div>

      {/* Main Interior Body */}
      <div className="flex-1 min-h-0 pt-2 overflow-y-auto pill-scroll">
        {isLauncherOpen ? (
          <AppMenuGridPanel
            isLight={Boolean(palette.isLightSurface)}
            onOpenTab={(tab) => {
              onToggleLauncher();
              onSelectTab(tab);
            }}
            onOpenFullSettings={onOpenFullSettings}
            onOpenVoiceAgent={onOpenVoiceAgent}
            reminders={reminders}
            onToggleReminder={onToggleReminder}
            onAddReminder={onAddReminder}
            stopwatchRunning={stopwatchRunning}
            stopwatchMs={stopwatchMs}
            onToggleStopwatch={() => setStopwatchRunning((v) => !v)}
            onResetStopwatch={() => {
              setStopwatchRunning(false);
              setStopwatchMs(0);
            }}
          />
        ) : activeTab === 'control' ? (
          <ControlCenterPanel
            systemState={systemState}
            onUpdateSystemState={onUpdateSystemState}
            volumeLevel={volumeLevel}
            onChangeVolume={onChangeVolume}
            brightnessLevel={brightnessLevel}
            onChangeBrightness={onChangeBrightness}
            audioDevice={audioDevice}
            onChangeAudioDevice={onChangeAudioDevice}
            keepAwake={keepAwake}
            onToggleKeepAwake={onToggleKeepAwake}
            micMuted={micMuted}
            onToggleMicMuted={onToggleMicMuted}
            nightLight={nightLight}
            onToggleNightLight={onToggleNightLight}
            onTriggerToast={onTriggerQuickActionToast}
            preferences={preferences}
            onUpdatePreferences={onUpdatePreferences}
          />
        ) : activeTab === 'ai' ? (
          preferences.aiEnabled ? (
            <IslandAiAssistantPanel
              key={aiInitialSubMode}
              initialSubMode={aiInitialSubMode}
              preferences={preferences}
              onUpdatePreferences={onUpdatePreferences}
              onExecuteAgentActions={onExecuteAgentActions}
              onAppendToNotes={(txt) =>
                onChangeNoteContent(noteContent.trim() ? `${noteContent.trim()}\n${txt}` : txt)
              }
              onCopyToClipboard={(txt, source) => {
                const classified = classifyClipboardPayload(txt);
                onAddClipboardItem({
                  text: txt,
                  source,
                  category: classified.category,
                  badgeCode: classified.badgeCode,
                });
              }}
              onTriggerToast={onTriggerQuickActionToast}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2 p-4">
              <Sparkles className="w-6 h-6 opacity-50" />
              <div className="text-xs font-semibold">Search &amp; AI Disabled</div>
              <p className="text-[11px] opacity-70 max-w-xs">
                Re-enable AI &amp; Astra (అస్త్రం) features anytime inside Pill Settings.
              </p>
              <button
                type="button"
                onClick={onOpenFullSettings}
                style={{ backgroundColor: palette.primaryHex }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${palette.onPrimaryTextClass}`}
              >
                Open AI Settings
              </button>
            </div>
          )
        ) : activeTab === 'monitor' ? (
          <SystemPowerMonitorPanel
            systemState={systemState}
            onUpdateSystemState={onUpdateSystemState}
            preferences={preferences}
            onUpdatePreferences={onUpdatePreferences}
          />
        ) : isWidgetCanvasTab ? (
          /* ============================================================================
           * APPLE-STYLE DYNAMIC MULTI-SIZE WIDGET PLAYGROUND (HOME + EXTRA CUSTOM PAGES)
           * Edit Home / Playground lives on the persistent non-widget header so removing
           * or resizing the Music widget NEVER hides layout customization!
           * ============================================================================ */
          <div className="flex flex-col h-full gap-1.5">
            {/* Persistent Non-Widget Header Bar */}
            <div className="flex items-center justify-between gap-2 select-none shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] font-semibold opacity-80 truncate">
                  {activeCustomTabObj
                    ? activeCustomTabObj.name
                    : getTabDisplayLabel('home')}
                </span>
                {playgroundMode && (
                  <span className="text-[10px] opacity-65 hidden sm:inline">
                    Drag blocks to reorder · Tap S / M / L / V to resize
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    playTactilePop('tab');
                    setPlaygroundMode((v) => !v);
                  }}
                  aria-pressed={playgroundMode}
                  style={
                    playgroundMode
                      ? { backgroundColor: palette.primaryHex }
                      : undefined
                  }
                  className={`px-2.5 py-0.5 rounded-lg text-[10.5px] font-semibold flex items-center gap-1 transition-colors ${
                    playgroundMode
                      ? palette.onPrimaryTextClass
                      : 'bg-white/10 hover:bg-white/18 opacity-85 hover:opacity-100'
                  }`}
                >
                  <Settings2 className="w-3 h-3" />
                  <span>
                    {playgroundMode
                      ? 'Done Editing'
                      : activeCustomTabObj
                        ? 'Edit Page'
                        : 'Edit Home'}
                  </span>
                </button>
              </div>
            </div>

            {/* + Add Widget Drawer when Playground Mode is active */}
            {playgroundMode && unaddedCatalogWidgets.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pill-scroll py-1 px-2 rounded-xl bg-white/[0.04] border border-dashed border-white/15 shrink-0">
                <span className="text-[10px] font-semibold opacity-70 whitespace-nowrap">
                  + Add Block:
                </span>
                {unaddedCatalogWidgets.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => handleAddWidgetToPage(w.id)}
                    className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] font-medium whitespace-nowrap flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>{w.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Dense 4-Column Building-Block Bento Grid */}
            <div className="grid grid-cols-4 auto-rows-[minmax(108px,auto)] grid-flow-dense gap-2 flex-1 min-h-0 overflow-y-auto pill-scroll pr-0.5">
              {pageWidgets.map((wid, idx) => {
                const size = getWidgetSize(wid);
                const spanCls = resolveGridSpanClass(size);
                const isDraggingThis = playgroundMode && draggedWidgetId === wid;
                return (
                  <div
                    key={wid}
                    draggable={playgroundMode}
                    onDragStart={(e) => {
                      if (!playgroundMode) return;
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', wid);
                      setDraggedWidgetId(wid);
                    }}
                    onDragEnter={(e) => {
                      if (!playgroundMode) return;
                      e.preventDefault();
                      handleHoverSwapWidget(wid);
                    }}
                    onDragOver={(e) => {
                      if (!playgroundMode) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      if (!playgroundMode) return;
                      e.preventDefault();
                      handleDropReorderWidget(wid);
                    }}
                    onDragEnd={() => setDraggedWidgetId(null)}
                    style={
                      playgroundMode
                        ? { borderColor: `${palette.primaryHex}88` }
                        : undefined
                    }
                    className={`${spanCls} relative border rounded-2xl p-2.5 flex flex-col justify-between transition-all ${cardSurfaceCls} ${
                      playgroundMode
                        ? `ring-1 ring-white/15 cursor-grab active:cursor-grabbing ${
                            isDraggingThis ? 'opacity-55 scale-[0.98]' : ''
                          }`
                        : ''
                    }`}
                  >
                    {/* Playground Building-Block Resize & Reorder Overlay Bar */}
                    {playgroundMode && (
                      <div className="flex items-center justify-between gap-1 pb-1.5 mb-1 border-b border-white/10 select-none">
                        <div className="flex items-center gap-0.5">
                          <GripVertical className="w-3 h-3 opacity-65" />
                          {WIDGET_SIZE_OPTIONS.map((opt) => {
                            const activeSize = size === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                draggable={false}
                                title={opt.title}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetWidgetSize(wid, opt.id);
                                }}
                                style={
                                  activeSize
                                    ? { backgroundColor: palette.primaryHex }
                                    : undefined
                                }
                                className={`w-5 h-5 rounded text-[9.5px] font-mono font-bold transition-colors ${
                                  activeSize
                                    ? palette.onPrimaryTextClass
                                    : 'bg-white/10 hover:bg-white/20 opacity-80'
                                }`}
                              >
                                {opt.short}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            draggable={false}
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              updatePageWidgetsAndSizes(moveOrderedItem(pageWidgets, idx, -1));
                            }}
                            aria-label="Move widget earlier"
                            className="p-0.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-25"
                          >
                            <ArrowUp className="w-2.5 h-2.5 -rotate-90" />
                          </button>
                          <button
                            type="button"
                            draggable={false}
                            disabled={idx === pageWidgets.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              updatePageWidgetsAndSizes(moveOrderedItem(pageWidgets, idx, 1));
                            }}
                            aria-label="Move widget later"
                            className="p-0.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-25"
                          >
                            <ArrowDown className="w-2.5 h-2.5 -rotate-90" />
                          </button>
                          <button
                            type="button"
                            draggable={false}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveWidgetFromPage(wid);
                            }}
                            aria-label={`Remove ${wid} widget`}
                            title="Remove widget from page"
                            className="p-0.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/35"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div
                      className={`flex-1 min-h-0 flex flex-col justify-between ${
                        playgroundMode ? 'pointer-events-none select-none opacity-90' : ''
                      }`}
                    >
                      {renderWidgetBlockContent(wid, size)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'tray' ? (
          /* FILE TRAY */
          <div className="flex flex-col justify-between h-full gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFilePickerChange}
              className="hidden"
            />
            {trayFiles.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/15 rounded-2xl p-4 text-center">
                <FolderPlus className="w-5 h-5 opacity-60 mb-1.5" />
                <p className="text-xs font-medium">
                  Drop any file onto the Pill to hold it in Tray
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ backgroundColor: palette.primaryHex }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${palette.onPrimaryTextClass}`}
                  >
                    Browse Files
                  </button>
                  <button
                    type="button"
                    onClick={onRestoreSampleTray}
                    className="px-3 py-1.5 text-xs font-medium bg-white/10 rounded-lg hover:bg-white/15"
                  >
                    Load Sample Files
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {trayFiles.slice(0, 6).map((file) => (
                    <div
                      key={file.id}
                      className={`group border rounded-xl p-2.5 flex flex-col justify-between ${cardSurfaceCls}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          style={{ color: isLight ? '#9a3412' : palette.primaryHex }}
                          className="text-[10px] font-mono font-semibold tracking-wide"
                        >
                          {file.extension}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onTogglePinTrayFile(file.id)}
                            aria-label={`${file.pinned ? 'Unpin' : 'Pin'} ${file.name}`}
                            className={`p-1 rounded transition-colors ${
                              file.pinned
                                ? 'text-amber-400 bg-amber-500/15'
                                : 'opacity-60 hover:opacity-100'
                            }`}
                          >
                            <Pin className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveTrayFile(file.id)}
                            aria-label={`Remove ${file.name} from Tray`}
                            className="p-1 rounded opacity-60 hover:text-rose-400 hover:opacity-100"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1.5">
                        <div className="text-xs font-medium truncate" title={file.name}>
                          {file.name}
                        </div>
                        <div className="text-[11px] opacity-65 tabular-nums">
                          {file.sizeLabel} · {file.addedAt}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 text-xs font-medium bg-white/10 hover:bg-white/15 rounded-lg"
                    >
                      + Add Files
                    </button>
                    <button
                      type="button"
                      onClick={onClearUnpinnedTray}
                      className="px-2.5 py-1 text-xs opacity-75 hover:opacity-100"
                    >
                      Clear Unpinned
                    </button>
                    {trayFeedback && (
                      <span className="text-[11px] text-emerald-400 truncate">{trayFeedback}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleMergeTrayReport}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-white/10 hover:bg-white/15 rounded-lg"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Merge</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportTrayZip}
                      style={{ backgroundColor: palette.primaryHex }}
                      className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg ${palette.onPrimaryTextClass}`}
                    >
                      <FileArchive className="w-3.5 h-3.5" />
                      <span>Export ZIP</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : activeTab === 'clipboard' ? (
          /* SMART DYNAMIC CLIPBOARD: Dynamic Bento (Fitted Rectangles + Squares) + Classic Stack + Sort & Group */
          <div className="flex flex-col justify-between h-full gap-1.5">
            <input
              ref={clipFilePickerRef}
              type="file"
              multiple
              onChange={(e) => {
                handleUniversalClipboardFiles(e.target.files);
                e.target.value = '';
              }}
              className="hidden"
            />

            {zoomedClipImage ? (
              <div className="flex-1 flex flex-col justify-between bg-black/70 border border-white/15 rounded-2xl p-3 gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white truncate">
                    {zoomedClipImage.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomedClipImage(null)}
                    className="px-2.5 py-1 rounded-lg bg-white/15 text-xs text-white hover:bg-white/25"
                  >
                    Close Preview
                  </button>
                </div>
                <div className="flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-black/60">
                  <img
                    src={zoomedClipImage.url}
                    alt={zoomedClipImage.title}
                    referrerPolicy="no-referrer"
                    className="max-h-56 w-auto object-contain rounded-lg"
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Top Search + Layout Switcher (Dynamic Bento vs Classic Stack) + Copy File + Clear */}
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1 min-w-0">
                    <Search className="w-3.5 h-3.5 opacity-55 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={clipSearch}
                      onChange={(e) => setClipSearch(e.target.value)}
                      placeholder="Search images, code, colors, links, files..."
                      aria-label="Filter clipboard history"
                      className="w-full bg-slate-950/70 border border-white/15 rounded-lg pl-8 pr-2 py-1 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  {/* Layout Choice: Dynamic Bento vs Classic List */}
                  <div className="flex items-center rounded-lg bg-white/[0.06] border border-white/10 p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        playTactilePop('tab');
                        onUpdatePreferences({ clipboardLayout: 'dynamic_bento' });
                      }}
                      title="Dynamic Bento Layout (Fitted image rectangles + compact square tiles)"
                      style={
                        (preferences.clipboardLayout ?? 'dynamic_bento') === 'dynamic_bento'
                          ? { backgroundColor: palette.primaryHex }
                          : undefined
                      }
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                        (preferences.clipboardLayout ?? 'dynamic_bento') === 'dynamic_bento'
                          ? palette.onPrimaryTextClass
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <LayoutGrid className="w-3 h-3" />
                      <span className="hidden sm:inline">Dynamic</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playTactilePop('tab');
                        onUpdatePreferences({ clipboardLayout: 'classic_list' });
                      }}
                      title="Classic Full-Width Stack"
                      style={
                        preferences.clipboardLayout === 'classic_list'
                          ? { backgroundColor: palette.primaryHex }
                          : undefined
                      }
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                        preferences.clipboardLayout === 'classic_list'
                          ? palette.onPrimaryTextClass
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <List className="w-3 h-3" />
                      <span className="hidden sm:inline">Stack</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => clipFilePickerRef.current?.click()}
                    title="Copy any file format (A–Z) into Smart Clipboard"
                    style={{
                      backgroundColor: `${palette.primaryHex}24`,
                      color: isLight ? '#9a3412' : palette.primaryHex,
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg whitespace-nowrap shrink-0"
                  >
                    <Upload className="w-3 h-3" />
                    <span className="hidden sm:inline">File</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClearUnpinnedClips}
                    className="px-2 py-1 text-[11px] opacity-75 hover:opacity-100 bg-white/[0.06] rounded-lg whitespace-nowrap shrink-0"
                  >
                    Clear
                  </button>
                </div>

                {/* Filter + Sort + Group Bar */}
                <div className="flex items-center justify-between gap-2 text-[10.5px] select-none">
                  <div className="flex items-center gap-1 overflow-x-auto pill-scroll">
                    {(
                      [
                        { id: 'all', label: `All (${clipboardItems.length})` },
                        { id: 'media', label: 'Media' },
                        { id: 'text_code', label: 'Text/Code' },
                        { id: 'files', label: 'Files' },
                        { id: 'colors_links', label: 'Colors/Links' },
                      ] as { id: ClipFilterGroup; label: string }[]
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setClipFilter(f.id)}
                        className={`px-1.5 py-0.5 rounded-md transition-colors whitespace-nowrap ${
                          clipFilter === f.id
                            ? 'bg-white/18 font-semibold'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <CustomPopdown
                      ariaLabel="Sort clipboard items"
                      size="xs"
                      align="right"
                      prefixIcon={<ArrowUpDown className="w-2.5 h-2.5" />}
                      accentHex={palette.primaryHex}
                      isLightSurface={isLight}
                      value={preferences.clipboardSortBy ?? 'newest'}
                      options={CLIPBOARD_SORT_OPTIONS}
                      onChange={(next) => onUpdatePreferences({ clipboardSortBy: next })}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        playTactilePop('tab');
                        onUpdatePreferences({
                          clipboardGroupBy:
                            preferences.clipboardGroupBy === 'category' ? 'none' : 'category',
                        });
                      }}
                      aria-pressed={preferences.clipboardGroupBy === 'category'}
                      className={`px-1.5 py-0.5 rounded-md border flex items-center gap-1 transition-colors ${
                        preferences.clipboardGroupBy === 'category'
                          ? 'bg-white/18 border-white/25 font-semibold'
                          : 'bg-white/[0.05] border-white/10 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <Layers className="w-2.5 h-2.5" />
                      <span>Group</span>
                    </button>
                  </div>
                </div>

                {sortedClips.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-3">
                    <ClipboardIcon className="w-5 h-5 opacity-55 mb-1" />
                    <p className="text-xs">No clipboard items in this filter</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pill-scroll space-y-2.5 pr-1 select-text">
                    {groupedClipSections.map((group) => {
                      const activeLayout: ClipboardLayoutMode =
                        preferences.clipboardLayout ?? 'dynamic_bento';
                      return (
                        <div key={group.heading || 'all'} className="space-y-1.5">
                          {group.heading && (
                            <div className="text-[10px] font-mono uppercase tracking-wider opacity-65 px-1">
                              {group.heading} ({group.items.length})
                            </div>
                          )}
                          <div
                            className={
                              activeLayout === 'dynamic_bento'
                                ? 'grid grid-cols-3 auto-rows-min grid-flow-dense gap-2'
                                : 'space-y-2'
                            }
                          >
                            {group.items.map((clip) => renderClipboardCard(clip, activeLayout))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <form onSubmit={handleAddClipSubmit} className="pt-1 border-t border-white/10">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newClipDraft}
                      onChange={(e) => {
                        setNewClipDraft(e.target.value);
                        if (clipError) setClipError('');
                      }}
                      placeholder="Paste text, #HEX color, URL, multi-line code, or filename.ext..."
                      aria-label="New clipboard snippet"
                      className="flex-1 bg-slate-950/75 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400"
                    />
                    <button
                      type="submit"
                      style={{ backgroundColor: palette.primaryHex }}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 ${palette.onPrimaryTextClass}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save Clip</span>
                    </button>
                  </div>
                  {clipError && <p className="text-[11px] text-amber-400 mt-0.5">{clipError}</p>}
                </form>
              </>
            )}
          </div>
        ) : activeTab === 'notes' ? (
          /* NOTES & NOTEDOWN STUDIO: Voice / System Call Audio -> Structured Markdown + Live MD Preview */
          <div className="flex flex-col justify-between h-full gap-1.5">
            {/* Top Notedown & View Mode Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 select-none shrink-0">
              <div className="flex items-center gap-1 bg-white/[0.06] border border-white/10 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => setNoteViewMode('edit')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-semibold whitespace-nowrap transition-colors ${
                    noteViewMode === 'edit'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  <PenLine className="w-3 h-3" />
                  <span>Edit MD</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNoteViewMode('preview')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-semibold whitespace-nowrap transition-colors ${
                    noteViewMode === 'preview'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Rendered MD</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <CustomPopdown
                  ariaLabel="Notedown Markdown format template"
                  size="xs"
                  align="right"
                  accentHex={palette.primaryHex}
                  isLightSurface={isLight}
                  value={preferences.notedownFormat ?? 'structured_md'}
                  options={NOTEDOWN_FORMAT_OPTIONS}
                  onChange={(fmt) => onUpdatePreferences({ notedownFormat: fmt })}
                />

                {preferences.aiEnabled && (
                  <>
                    <button
                      type="button"
                      onClick={handleToggleNotedownSystemAudio}
                      title="Capture live system / video-call audio and auto-build a structured Markdown note"
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10.5px] font-semibold border whitespace-nowrap transition-colors ${
                        notedownSystemActive
                          ? 'bg-amber-500 text-slate-950 border-amber-300'
                          : 'bg-white/[0.06] hover:bg-white/14 border-white/12'
                      }`}
                    >
                      {notedownSystemActive ? (
                        <>
                          <Square className="w-2.5 h-2.5 fill-current" />
                          <span>Stop Call Audio</span>
                        </>
                      ) : (
                        <>
                          <MonitorSpeaker className="w-3 h-3" />
                          <span>System Audio</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={notedownGenerating || (!noteContent.trim() && !notedownRawTranscript.trim())}
                      onClick={() => runNotedownSummarize({})}
                      style={{ backgroundColor: palette.primaryHex }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-semibold whitespace-nowrap disabled:opacity-40 ${palette.onPrimaryTextClass}`}
                    >
                      {notedownGenerating ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Structuring...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          <span>Notedown MD</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Editor OR Rendered Markdown Surface */}
            {noteViewMode === 'preview' ? (
              <div
                className={`flex-1 w-full overflow-y-auto border rounded-xl p-3 pill-scroll select-text cursor-text ${cardSurfaceCls}`}
              >
                {noteContent.trim() ? (
                  <RichMarkdown
                    content={noteContent}
                    accentHex={palette.primaryHex}
                    isLightSurface={isLight}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-xs opacity-60 text-center px-4">
                    No Markdown notes yet — dictate by voice, capture System Audio, or click &ldquo;Sample Call&rdquo; below to test Notedown.
                  </div>
                )}
              </div>
            ) : (
              <textarea
                value={noteContent}
                onChange={(e) => onChangeNoteContent(e.target.value)}
                aria-label="Notedown Markdown scratchpad"
                placeholder="Type notes, dictate with Mic, or capture System Audio — then click 'Notedown MD' to structure into clean Markdown..."
                className={`flex-1 w-full resize-none border rounded-xl p-2.5 text-xs font-mono leading-relaxed focus:outline-none focus:border-sky-400 pill-scroll select-text ${cardSurfaceCls}`}
              />
            )}

            {/* Footer Action Strip */}
            <div className="flex items-center justify-between text-[11px] opacity-85 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="tabular-nums font-mono truncate">
                  {noteContent.trim() ? noteContent.trim().split(/\s+/).length : 0}w ·{' '}
                  {noteContent.length}c
                </span>
                {preferences.aiEnabled && (
                  <button
                    type="button"
                    disabled={notedownGenerating}
                    onClick={() =>
                      runNotedownSummarize({
                        transcriptOverride:
                          'Sprint architecture sync: Priya confirmed we are shipping SetWindowDisplayAffinity with WDA_EXCLUDEFROMCAPTURE 0x11 so Pill stays invisible during Zoom and Teams screen shares. Rahul will benchmark the 60fps Canvas2D Siri Orb shader under 12MB NativeAOT RAM by Friday, and we agreed to use WASAPI Loopback capture for Notedown meeting transcripts.',
                      })
                    }
                    className="text-[10px] underline underline-offset-2 opacity-75 hover:opacity-100 whitespace-nowrap hidden sm:inline"
                  >
                    Try Sample Call
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {preferences.featureFlags.voiceDictation && preferences.aiEnabled && (
                  <button
                    type="button"
                    disabled={transcribingNote}
                    onClick={handleToggleNoteDictation}
                    className={`flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-lg transition-colors whitespace-nowrap ${
                      dictatingNote
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/10 hover:bg-white/16'
                    }`}
                  >
                    {transcribingNote ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Transcribing...</span>
                      </>
                    ) : dictatingNote ? (
                      <>
                        <Square className="w-2.5 h-2.5 fill-current" />
                        <span>Stop Mic</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3 h-3" />
                        <span>Mic</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  disabled={!noteContent.trim()}
                  onClick={handleDownloadNoteMarkdown}
                  title="Export as .md Markdown file"
                  className="flex items-center gap-1 px-2 py-1 text-[11px] bg-white/10 hover:bg-white/15 disabled:opacity-40 rounded-lg whitespace-nowrap"
                >
                  <Download className="w-3 h-3" />
                  <span>.md</span>
                </button>

                <button
                  type="button"
                  disabled={!noteContent.trim()}
                  onClick={() => {
                    if (!noteContent.trim()) return;
                    const meta = classifyClipboardPayload(noteContent.trim());
                    onAddClipboardItem({
                      text: noteContent.trim(),
                      source: 'Notedown MD',
                      category: meta.category,
                      badgeCode: meta.badgeCode,
                    });
                    playTactilePop('confirm');
                  }}
                  className="px-2 py-1 text-[11px] bg-white/10 hover:bg-white/15 disabled:opacity-40 rounded-lg whitespace-nowrap"
                >
                  To Clip
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(noteContent).catch(() => {});
                    setNoteCopied(true);
                    playTactilePop('confirm');
                    setTimeout(() => setNoteCopied(false), 1500);
                  }}
                  style={{ backgroundColor: palette.primaryHex }}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg whitespace-nowrap ${palette.onPrimaryTextClass}`}
                >
                  <Copy className="w-3 h-3" />
                  <span>{noteCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* MIRROR TAB */
          <div className="grid grid-cols-12 gap-3 h-full items-center">
            <div
              className={`col-span-8 h-full min-h-[180px] rounded-2xl overflow-hidden relative flex items-center justify-center border-2 transition-all ${
                MIRROR_RIM_PROFILES[mirrorRimIndex].cls
              } bg-gradient-to-b from-slate-900 to-black`}
            >
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${mirrorFlip ? '-scale-x-100' : ''}`}
                />
              ) : (
                <div className="text-center px-4 text-slate-200">
                  <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <div className="text-xs font-medium">
                    {cameraStatus === 'unavailable'
                      ? 'Camera preview unavailable in this browser session'
                      : 'Check framing & lighting before joining a call'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Zero recording · Processed strictly in local GPU framebuffers
                  </div>
                </div>
              )}
            </div>

            <div className="col-span-4 flex flex-col justify-between h-full py-1 gap-2">
              <div className="space-y-1">
                <div className="text-xs font-semibold">Studio Mirror</div>
                <p className="text-[11px] opacity-75 leading-relaxed">
                  Verify framing and cycle Studio Rim Lighting profiles.
                </p>
              </div>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setMirrorFlip((v) => !v)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs bg-white/10 hover:bg-white/16 rounded-lg"
                >
                  <span className="flex items-center gap-1.5">
                    <FlipHorizontal2 className="w-3.5 h-3.5" /> Mirror Flip
                  </span>
                  <span className="text-[11px] opacity-75">{mirrorFlip ? 'On' : 'Off'}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setMirrorRimIndex((idx) => (idx + 1) % MIRROR_RIM_PROFILES.length)
                  }
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs bg-white/10 hover:bg-white/16 rounded-lg"
                >
                  <span className="flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5" /> Rim Color
                  </span>
                  <span className="text-[11px] opacity-75">
                    {MIRROR_RIM_PROFILES[mirrorRimIndex].name}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleEnableCamera}
                style={!cameraActive ? { backgroundColor: palette.primaryHex } : undefined}
                className={`w-full py-2 rounded-xl text-xs font-semibold transition-colors ${
                  cameraActive
                    ? 'bg-rose-500 hover:bg-rose-400 text-white'
                    : palette.onPrimaryTextClass
                }`}
              >
                {cameraActive ? 'Turn Off Camera' : 'Enable Camera'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
