import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Loader2,
  MessageSquare,
  Mic,
  Minimize2,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import {
  AstraDisplayMode,
  LedgePreferences,
  VoiceAgentAction,
  WindowsSystemState,
} from '../types/ledge';
import { playTactilePop } from '../utils/audioSynth';
import { resolveThemePalette } from '../utils/themeAndSliders';
import { AstraSiriOrbCanvas, SiriOrbVisualState } from './AstraSiriOrbCanvas';
import { RichMarkdown } from './RichMarkdown';

interface AgentSource {
  uri: string;
  title: string;
  domain?: string;
}

interface BrowserSpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [altIndex: number]: { transcript: string };
    };
  };
}

interface BrowserSpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function getSpeechRecognitionCtor(): (new () => BrowserSpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition || w.webkitSpeechRecognition || null) as
    | (new () => BrowserSpeechRecognitionInstance)
    | null;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = typeof reader.result === 'string' ? reader.result : '';
      const comma = res.indexOf(',');
      resolve(comma >= 0 ? res.slice(comma + 1) : res);
    };
    reader.onerror = () => reject(new Error('Failed to encode audio'));
    reader.readAsDataURL(blob);
  });
}

// Shared module queue so a spoken wake phrase ("Astra turn on Night Light") immediately runs inside the morphed Pill
let pendingWakePhraseCommand: string | null = null;

const QUICK_ASTRA_PROMPTS = [
  'Turn off Wi-Fi & enable Night Light',
  'Set volume to 80% & start 5m timer',
  'Enable OS Privacy Mask for screen share',
  'Switch style kit to Cyberpunk',
];

/**
 * Reusable wrapper around the 60fps 3D Refractive Apple Siri Silk-Ribbon Sphere (`AstraSiriOrbCanvas`)
 * for Settings previews and header badges.
 */
export const AstraLiquidOrbVisual: React.FC<{
  active: boolean;
  processing: boolean;
  speaking: boolean;
  audioLevel?: number;
  size?: number;
  lowPowerEco?: boolean;
  style?: AstraOrbStyle;
  primaryHex?: string;
  secondaryHex?: string;
}> = ({
  active,
  processing,
  speaking,
  audioLevel = 0,
  size = 48,
  lowPowerEco = false,
  style = 'siri_rainbow',
}) => {
  const orbState: SiriOrbVisualState = processing
    ? 'thinking'
    : speaking
      ? 'speaking'
      : active
        ? 'listening'
        : 'idle';

  return (
    <AstraSiriOrbCanvas
      state={orbState}
      audioLevel={audioLevel}
      size={size}
      lowPowerEco={lowPowerEco}
      style={style}
    />
  );
};

/**
 * Headless zero-UI Wake-Word Daemon listening for "Astra" / "Astram" / "అస్త్రం"
 * when Astra is not currently morphed open in the Pill.
 */
export const AstraWakeWordDaemon: React.FC<{
  isAstraOpen: boolean;
  aiEnabled: boolean;
  wakeWordEnabled: boolean;
  onSummonAstra: () => void;
}> = ({ isAstraOpen, aiEnabled, wakeWordEnabled, onSummonAstra }) => {
  const isOpenRef = useRef(isAstraOpen);
  isOpenRef.current = isAstraOpen;

  useEffect(() => {
    if (isAstraOpen || !aiEnabled || !wakeWordEnabled) {
      return;
    }

    const SpeechCtor = getSpeechRecognitionCtor();
    if (!SpeechCtor) return;

    let cancelled = false;
    let rec: BrowserSpeechRecognitionInstance | null = null;

    const launchWakeDetector = () => {
      if (cancelled || isOpenRef.current) return;
      try {
        rec = new SpeechCtor();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (ev: BrowserSpeechRecognitionEvent) => {
          let latest = '';
          for (let i = ev.resultIndex; i < ev.results.length; i++) {
            latest += ev.results[i][0].transcript + ' ';
          }
          const lower = latest.toLowerCase().trim();
          const wakeMatch = lower.match(/\b(?:hey\s+)?(?:astra|astram|అస్త్రం)\b(.*)$/i);
          if (wakeMatch) {
            const trailingCmd = (wakeMatch[1] || '').trim();
            if (trailingCmd.length > 3) {
              pendingWakePhraseCommand = trailingCmd;
            }
            try {
              rec?.abort();
            } catch {
              // Ignore
            }
            playTactilePop('expand');
            onSummonAstra();
          }
        };

        rec.onerror = () => {
          // Quietly wait if microphone permission is not yet granted
        };

        rec.onend = () => {
          if (!cancelled && !isOpenRef.current && wakeWordEnabled) {
            window.setTimeout(() => {
              if (!cancelled && !isOpenRef.current) launchWakeDetector();
            }, 950);
          }
        };

        rec.start();
      } catch {
        // Browser may require gesture before mic auto-start
      }
    };

    launchWakeDetector();

    return () => {
      cancelled = true;
      if (rec) {
        try {
          rec.onend = null;
          rec.abort();
        } catch {
          // Ignore
        }
      }
    };
  }, [isAstraOpen, aiEnabled, wakeWordEnabled, onSummonAstra]);

  return null;
};

export interface InPillAstraPanelProps {
  onClose: () => void;
  preferences: LedgePreferences;
  onUpdatePreferences: (patch: Partial<LedgePreferences>) => void;
  systemState: WindowsSystemState;
  volumeLevel: number;
  brightnessLevel: number;
  isPlaying: boolean;
  nightLight: boolean;
  keepAwake: boolean;
  micMuted: boolean;
  onExecuteActions: (actions: VoiceAgentAction[]) => void;
  onResultStateChange?: (hasResult: boolean) => void;
}

/**
 * In-Pill Astra (`అస్త్రం` / `Astram`) Morph Surface.
 * Renders directly inside the existing DynamicLedge Pill — never spawning a second separate window!
 */
export const InPillAstraPanel: React.FC<InPillAstraPanelProps> = ({
  onClose,
  preferences,
  onUpdatePreferences,
  systemState,
  volumeLevel,
  brightnessLevel,
  isPlaying,
  nightLight,
  keepAwake,
  micMuted,
  onExecuteActions,
  onResultStateChange,
}) => {
  const palette = resolveThemePalette(
    preferences.themeId,
    preferences.customPrimaryHex,
    preferences.customSecondaryHex
  );

  const [typedInput, setTypedInput] = useState('');
  const [liveInterimText, setLiveInterimText] = useState('');
  const [lastPrompt, setLastPrompt] = useState('');
  const [isListeningLive, setIsListeningLive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeakingReply, setIsSpeakingReply] = useState(false);
  const [micAudioLevel, setMicAudioLevel] = useState(0);
  const [replyMarkdown, setReplyMarkdown] = useState<string>('');
  const [executedActions, setExecutedActions] = useState<VoiceAgentAction[]>([]);
  const [sources, setSources] = useState<AgentSource[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedReply, setCopiedReply] = useState(false);
  const [showQuickChips, setShowQuickChips] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const activeRecRef = useRef<BrowserSpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const fallbackRecorderRef = useRef<MediaRecorder | null>(null);
  const fallbackChunksRef = useRef<Blob[]>([]);
  const replyAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAbortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const meterStreamRef = useRef<MediaStream | null>(null);
  const meterCtxRef = useRef<AudioContext | null>(null);
  const meterRafRef = useRef<number>(0);

  const isProcessingRef = useRef(isProcessing);
  isProcessingRef.current = isProcessing;

  const hasResult = Boolean(
    (replyMarkdown || executedActions.length > 0 || errorMsg) && !isProcessing
  );

  useEffect(() => {
    onResultStateChange?.(hasResult || showQuickChips);
  }, [hasResult, showQuickChips, onResultStateChange]);

  const stopAudioMeter = useCallback(() => {
    if (meterRafRef.current) {
      cancelAnimationFrame(meterRafRef.current);
      meterRafRef.current = 0;
    }
    if (meterStreamRef.current) {
      meterStreamRef.current.getTracks().forEach((t) => t.stop());
      meterStreamRef.current = null;
    }
    if (meterCtxRef.current) {
      meterCtxRef.current.close().catch(() => {});
      meterCtxRef.current = null;
    }
    setMicAudioLevel(0);
  }, []);

  const startAudioMeter = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      meterStreamRef.current = stream;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      meterCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      const sample = () => {
        if (!mountedRef.current || !meterCtxRef.current) return;
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / (data.length * 255);
        setMicAudioLevel(Math.min(1, avg * 3.4));
        meterRafRef.current = requestAnimationFrame(sample);
      };
      meterRafRef.current = requestAnimationFrame(sample);
    } catch {
      // Optional visual amplitude meter; speech still works cleanly without it
    }
  }, []);

  const speakAssistantReply = useCallback(
    async (textToSpeak: string) => {
      if (!preferences.voiceAgentSpeakReplies || !mountedRef.current) return;
      try {
        ttsAbortRef.current?.abort();
        const abortCtrl = new AbortController();
        ttsAbortRef.current = abortCtrl;
        if (replyAudioRef.current) {
          replyAudioRef.current.pause();
          replyAudioRef.current = null;
        }
        setIsSpeakingReply(true);
        const resp = await fetch('/api/ai/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textToSpeak,
            voiceName: preferences.defaultLiveVoice,
          }),
          signal: abortCtrl.signal,
        });
        const data = (await resp.json()) as { audioWavBase64?: string };
        if (!mountedRef.current || abortCtrl.signal.aborted) {
          setIsSpeakingReply(false);
          return;
        }
        if (resp.ok && data.audioWavBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioWavBase64}`);
          replyAudioRef.current = audio;
          audio.onended = () => setIsSpeakingReply(false);
          audio.onerror = () => setIsSpeakingReply(false);
          await audio.play().catch(() => setIsSpeakingReply(false));
        } else {
          setIsSpeakingReply(false);
        }
      } catch {
        setIsSpeakingReply(false);
      }
    },
    [preferences.defaultLiveVoice, preferences.voiceAgentSpeakReplies]
  );

  const runAgentCommand = useCallback(
    async (commandText: string) => {
      const trimmed = commandText.trim();
      if (!trimmed || isProcessingRef.current || !preferences.aiEnabled) return;

      setErrorMsg(null);
      setLiveInterimText('');
      setLastPrompt(trimmed);
      setIsProcessing(true);
      playTactilePop('tab');

      try {
        const response = await fetch('/api/ai/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            command: trimmed,
            stateSnapshot: {
              wifiEnabled: systemState.wifiEnabled,
              bluetoothEnabled: systemState.bluetoothEnabled,
              airplaneMode: systemState.airplaneMode,
              nightLight,
              batterySaver: systemState.batterySaver,
              dndEnabled: systemState.dndEnabled,
              keepAwake,
              micMuted,
              privacyMaskEnabled: preferences.privacyMaskEnabled,
              volumeLevel,
              brightnessLevel,
              isPlaying,
              themeId: preferences.themeId,
            },
          }),
        });

        const data = (await response.json()) as {
          reply?: string;
          actions?: VoiceAgentAction[];
          sources?: AgentSource[];
          error?: string;
        };

        if (!response.ok || data.error) {
          throw new Error(data.error || `Astra error (${response.status})`);
        }

        if (!mountedRef.current) return;

        const nextActions = data.actions ?? [];
        if (nextActions.length > 0) {
          onExecuteActions(nextActions);
        }
        setExecutedActions(nextActions);
        setSources(data.sources ?? []);
        const reply = data.reply || 'Done.';
        setReplyMarkdown(reply);
        setTypedInput('');
        playTactilePop('confirm');
        speakAssistantReply(reply);
      } catch (err) {
        if (mountedRef.current) {
          setErrorMsg(err instanceof Error ? err.message : 'Unable to run Astra command.');
        }
      } finally {
        if (mountedRef.current) {
          setIsProcessing(false);
        }
      }
    },
    [
      brightnessLevel,
      isPlaying,
      keepAwake,
      micMuted,
      nightLight,
      onExecuteActions,
      preferences.aiEnabled,
      preferences.privacyMaskEnabled,
      preferences.themeId,
      speakAssistantReply,
      systemState.airplaneMode,
      systemState.batterySaver,
      systemState.bluetoothEnabled,
      systemState.dndEnabled,
      systemState.wifiEnabled,
      volumeLevel,
    ]
  );

  const stopActiveListening = useCallback(() => {
    if (silenceTimerRef.current !== null) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (activeRecRef.current) {
      try {
        activeRecRef.current.onend = null;
        activeRecRef.current.stop();
      } catch {
        // Ignore
      }
      activeRecRef.current = null;
    }
    if (fallbackRecorderRef.current && fallbackRecorderRef.current.state !== 'inactive') {
      fallbackRecorderRef.current.stop();
    }
    stopAudioMeter();
    setIsListeningLive(false);
  }, [stopAudioMeter]);

  const startStreamingListen = useCallback(async () => {
    if (!preferences.aiEnabled || isListeningLive) return;
    setErrorMsg(null);

    const SpeechCtor = getSpeechRecognitionCtor();
    if (SpeechCtor) {
      try {
        const rec = new SpeechCtor();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        let rollingTranscript = '';

        rec.onresult = (event: BrowserSpeechRecognitionEvent) => {
          let combined = '';
          for (let i = 0; i < event.results.length; i++) {
            combined += event.results[i][0].transcript;
          }
          rollingTranscript = combined.trim();
          setLiveInterimText(rollingTranscript);

          if (silenceTimerRef.current !== null) {
            window.clearTimeout(silenceTimerRef.current);
          }
          if (rollingTranscript.length > 1) {
            silenceTimerRef.current = window.setTimeout(() => {
              const toRun = rollingTranscript.trim();
              stopActiveListening();
              if (toRun) {
                runAgentCommand(toRun);
              }
            }, 1150);
          }
        };

        rec.onerror = () => {
          stopAudioMeter();
          setIsListeningLive(false);
        };

        rec.onend = () => {
          stopAudioMeter();
          setIsListeningLive(false);
          const finalSpoken = rollingTranscript.trim();
          if (finalSpoken && !isProcessingRef.current) {
            if (silenceTimerRef.current !== null) {
              window.clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }
            runAgentCommand(finalSpoken);
          }
        };

        activeRecRef.current = rec;
        rec.start();
        setIsListeningLive(true);
        startAudioMeter();
        playTactilePop('toggleOn');
        return;
      } catch {
        // Fall through to MediaRecorder fallback
      }
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = MediaRecorder.isTypeSupported(preferredMime)
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);

      fallbackChunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) fallbackChunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        const actualMime = recorder.mimeType || preferredMime || 'audio/webm';
        stream.getTracks().forEach((t) => t.stop());
        stopAudioMeter();
        setIsListeningLive(false);
        const blob = new Blob(fallbackChunksRef.current, { type: actualMime });
        if (blob.size === 0 || !mountedRef.current) return;
        setIsProcessing(true);
        try {
          const audioBase64 = await blobToBase64(blob);
          const trResp = await fetch('/api/ai/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64, mimeType: actualMime }),
          });
          const trData = (await trResp.json()) as { transcript?: string };
          const spoken = (trData.transcript ?? '').trim();
          setIsProcessing(false);
          if (spoken && mountedRef.current) {
            await runAgentCommand(spoken);
          }
        } catch {
          if (mountedRef.current) setIsProcessing(false);
        }
      };
      fallbackRecorderRef.current = recorder;
      recorder.start(250);
      setIsListeningLive(true);
      playTactilePop('toggleOn');
    } catch {
      // User can still type seamlessly
    }
  }, [
    isListeningLive,
    preferences.aiEnabled,
    runAgentCommand,
    startAudioMeter,
    stopActiveListening,
    stopAudioMeter,
  ]);

  useEffect(() => {
    mountedRef.current = true;
    if (preferences.aiEnabled) {
      if (pendingWakePhraseCommand) {
        const cmd = pendingWakePhraseCommand;
        pendingWakePhraseCommand = null;
        runAgentCommand(cmd);
      } else {
        startStreamingListen();
      }
      if (preferences.astraMode === 'orb_with_chat') {
        window.setTimeout(() => inputRef.current?.focus(), 70);
      }
    }

    return () => {
      mountedRef.current = false;
      onResultStateChange?.(false);
      stopActiveListening();
      ttsAbortRef.current?.abort();
      if (replyAudioRef.current) {
        replyAudioRef.current.pause();
        replyAudioRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAstraMode = (nextMode: AstraDisplayMode) => {
    playTactilePop('tab');
    onUpdatePreferences({ astraMode: nextMode });
    if (nextMode === 'orb_with_chat') {
      window.setTimeout(() => inputRef.current?.focus(), 70);
    }
  };

  const pressTimerRef = useRef<number | null>(null);
  const isLongPressRef = useRef(false);

  const handleOrbPointerDown = () => {
    isLongPressRef.current = false;
    pressTimerRef.current = window.setTimeout(() => {
      isLongPressRef.current = true;
      playTactilePop('expand');
      setAstraMode('orb_with_chat');
    }, 450);
  };

  const handleOrbPointerUp = () => {
    if (pressTimerRef.current !== null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (!isLongPressRef.current) {
      // Single click: toggle voice listening
      if (isListeningLive) stopActiveListening();
      else startStreamingListen();
    }
  };

  const handleOrbPointerCancel = () => {
    if (pressTimerRef.current !== null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const orbVisualState: SiriOrbVisualState = isProcessing
    ? 'thinking'
    : isSpeakingReply
      ? 'speaking'
      : isListeningLive
        ? 'listening'
        : 'idle';

  const activeTranscriptBubble = liveInterimText || lastPrompt;

  /* ==========================================================================
   * IN-PILL MODE 1: `orb_only` — Sleek, Clean Big Astra Orb (Only Orb, Zero Overhead)
   * Single tap: Speak / Listen · Long press (>450ms): Open Chat Studio
   * ======================================================================== */
  if (preferences.astraMode === 'orb_only') {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full h-full flex flex-col items-center justify-center p-0 text-slate-100 select-none relative"
      >
        <button
          type="button"
          onPointerDown={handleOrbPointerDown}
          onPointerUp={handleOrbPointerUp}
          onPointerCancel={handleOrbPointerCancel}
          onContextMenu={(e) => {
            e.preventDefault();
            setAstraMode('orb_with_chat');
          }}
          title={
            isListeningLive
              ? 'Astra listening (Tap to stop · Long press for Chat)'
              : 'Tap to speak to Astra · Long press for Chat'
          }
          aria-label="Astra Voice Orb (Tap to speak, Long press for Chat)"
          className="rounded-full transition-transform active:scale-95 hover:scale-105 focus-visible:outline-2 focus-visible:outline-sky-400 flex items-center justify-center cursor-pointer"
        >
          <AstraSiriOrbCanvas
            state={orbVisualState}
            audioLevel={micAudioLevel}
            size={56}
            style={preferences.astraOrbStyle}
            lowPowerEco={preferences.featureFlags.lowRamEcoMode}
          />
        </button>

        {/* Inline Expanded Result if Astra answers while in compact mode */}
        {hasResult && (
          <div className="pt-1 mt-1 border-t border-white/10 max-h-[80px] overflow-y-auto ledge-scroll space-y-1 w-full px-2 text-left">
            <div className="text-[11px] text-slate-200">
              <RichMarkdown content={replyMarkdown} />
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ==========================================================================
   * IN-PILL MODE 2: `orb_with_captions` — Compact Orb + Live Streaming Subtitles
   * Frosted acrylic background matching the exact design language of the Pill
   * ======================================================================== */
  if (preferences.astraMode === 'orb_with_captions') {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full h-full flex items-center justify-between px-3 py-1.5 gap-2.5 text-slate-100 select-text"
      >
        {/* Compact Orb on the left */}
        <button
          type="button"
          onPointerDown={handleOrbPointerDown}
          onPointerUp={handleOrbPointerUp}
          onPointerCancel={handleOrbPointerCancel}
          title={
            isListeningLive
              ? 'Astra listening (Tap to stop · Long press for Chat)'
              : 'Tap to speak · Long press for Chat'
          }
          aria-label="Astra Voice Orb (Tap to speak, Long press for Chat)"
          className="shrink-0 rounded-full transition-transform active:scale-95 hover:scale-105 focus-visible:outline-2 focus-visible:outline-sky-400 cursor-pointer"
        >
          <AstraSiriOrbCanvas
            state={orbVisualState}
            audioLevel={micAudioLevel}
            size={40}
            style={preferences.astraOrbStyle}
            lowPowerEco={preferences.featureFlags.lowRamEcoMode}
          />
        </button>

        {/* Dynamic Glassmorphism Live Captions Stream matching Pill Design Language */}
        <div className="flex-1 min-w-0 flex items-center">
          <div className="w-full px-3 py-1.5 rounded-xl bg-[#05070c]/85 border border-white/15 backdrop-blur-xl flex items-center gap-2 overflow-hidden shadow-2xl">
            {isProcessing ? (
              <div className="flex items-center gap-2 text-xs font-medium text-sky-200 truncate">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400 shrink-0" />
                <span className="truncate">Thinking…</span>
              </div>
            ) : liveInterimText ? (
              <div className="text-xs font-medium text-white truncate flex items-center gap-1.5">
                <span style={{ color: palette.primaryHex }} className="text-[10px] uppercase font-mono font-bold shrink-0">You:</span>
                <span className="truncate">&ldquo;{liveInterimText}&rdquo;</span>
              </div>
            ) : replyMarkdown ? (
              <div className="text-xs text-slate-200 truncate flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-mono font-bold text-purple-400 shrink-0">Astra:</span>
                <span className="truncate">{String(replyMarkdown || '').replace(/[#*_`]/g, '')}</span>
              </div>
            ) : lastPrompt ? (
              <div className="text-xs text-slate-300 truncate flex items-center gap-1.5">
                <span style={{ color: palette.primaryHex }} className="text-[10px] uppercase font-mono font-bold shrink-0">You:</span>
                <span className="truncate">{lastPrompt}</span>
              </div>
            ) : (
              <div className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                <span style={{ color: palette.primaryHex }} className="font-semibold text-[11px]">Astra</span>
                <span className="text-[10px] text-slate-400">· Speak or tap orb…</span>
              </div>
            )}
          </div>
        </div>

        {/* Mini quick controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setAstraMode('orb_with_chat')}
            title="Expand Full Chat (or long press orb)"
            aria-label="Expand Full Chat"
            className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/16 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Return to Pill"
            aria-label="Close Astra"
            className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/16 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  /* ==========================================================================
   * IN-PILL MODE 2: `orb_with_chat` — Morphs the existing Pill into Siri Orb + Chat Studio
   * ======================================================================== */
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative w-full h-full flex flex-col justify-between px-4 py-3 text-slate-100 select-text"
    >
      {/* Top In-Pill Header */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => {
              if (isListeningLive) stopActiveListening();
              else startStreamingListen();
            }}
            aria-label="Toggle Astra live voice"
            className="rounded-full shrink-0 transition-transform active:scale-95"
          >
            <AstraSiriOrbCanvas
              state={orbVisualState}
              audioLevel={micAudioLevel}
              size={38}
              lowPowerEco={preferences.featureFlags.lowRamEcoMode}
            />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white">Astra</span>
              <span className="text-[10.5px] text-cyan-300 font-medium">అస్త్రం</span>
              {preferences.privacyMaskEnabled && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300/90 ml-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Mask On</span>
                </span>
              )}
            </div>
            <div className="text-[10.5px] text-slate-400 truncate">
              {isListeningLive
                ? 'Listening live inside Pill — pause speaking to execute'
                : 'In-Pill Siri Agent · Windows Controls & Grounded Web'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            aria-pressed={preferences.voiceAgentSpeakReplies}
            onClick={() =>
              onUpdatePreferences({
                voiceAgentSpeakReplies: !preferences.voiceAgentSpeakReplies,
              })
            }
            title={preferences.voiceAgentSpeakReplies ? 'Spoken replies On' : 'Spoken replies Muted'}
            className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/16 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            {preferences.voiceAgentSpeakReplies ? (
              <Volume2 className="w-3.5 h-3.5" style={{ color: palette.primaryHex }} />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setAstraMode('orb_only')}
            title="Switch to Compact In-Pill Siri Orb"
            aria-label="Switch to Compact In-Pill Siri Orb"
            className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/16 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close Astra and return Pill"
            aria-label="Close Astra"
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/18 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center Scrollable Conversation & Action Area */}
      <div className="flex-1 min-h-0 overflow-y-auto ledge-scroll my-2 pr-1 space-y-2">
        {activeTranscriptBubble ? (
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl bg-white/[0.1] border border-white/12 px-3 py-1.5 text-xs text-white leading-relaxed">
              {activeTranscriptBubble}
            </div>
          </div>
        ) : (
          <div className="py-2 text-center">
            <div className="text-xs font-medium text-slate-200">
              Speak naturally or type below — the Pill itself is now Astra
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Controls Wi-Fi, Bluetooth, Privacy Mask, Volume, Brightness, Timers &amp; Live Web Search
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-sky-200 py-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-300" />
            <span>Running command…</span>
          </div>
        )}

        {executedActions.length > 0 && !isProcessing && (
          <div className="flex flex-wrap items-center gap-1.5">
            {executedActions.map((act, idx) => (
              <span
                key={`${act.name}-${idx}`}
                style={{
                  backgroundColor: `${palette.primaryHex}22`,
                  borderColor: `${palette.primaryHex}66`,
                }}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold text-white"
              >
                <Zap className="w-3 h-3" style={{ color: palette.primaryHex }} />
                <span>{act.summary || act.name}</span>
              </span>
            ))}
          </div>
        )}

        {errorMsg && <div className="text-xs text-rose-300">{errorMsg}</div>}

        {replyMarkdown && !isProcessing && (
          <div className="space-y-1.5">
            <RichMarkdown content={replyMarkdown} accentHex={palette.primaryHex} />
            <div className="flex items-center justify-between pt-1 border-t border-white/10 select-none">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(replyMarkdown).catch(() => {});
                  setCopiedReply(true);
                  window.setTimeout(() => setCopiedReply(false), 1500);
                }}
                className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
              >
                {copiedReply ? (
                  <Check className="w-3 h-3 text-emerald-300" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiedReply ? 'Copied' : 'Copy'}</span>
              </button>

              <div className="flex items-center gap-2">
                {sources.slice(0, 2).map((src, idx) => (
                  <a
                    key={`${src.uri}-${idx}`}
                    href={src.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10.5px] text-sky-300 hover:underline max-w-[130px] truncate"
                  >
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{src.domain || src.title}</span>
                  </a>
                ))}
                {lastPrompt && (
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(lastPrompt)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-sky-300 hover:underline"
                  >
                    <Search className="w-3 h-3" />
                    <span>Google</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {showQuickChips && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {QUICK_ASTRA_PROMPTS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setShowQuickChips(false);
                  runAgentCommand(chip);
                }}
                className="px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 text-[11px] text-slate-200 text-left transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom In-Pill Input Bar with Siri Iridescent Horizon Glow */}
      <div className="relative shrink-0 pt-1">
        <div
          style={{
            background:
              'linear-gradient(90deg, #38bdf8 0%, #a855f7 35%, #ec4899 68%, #fbbf24 100%)',
          }}
          className={`pointer-events-none absolute inset-x-8 -bottom-1 h-2 rounded-full blur-md transition-opacity duration-300 ${
            isListeningLive || isProcessing || isSpeakingReply ? 'opacity-85' : 'opacity-25'
          }`}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!typedInput.trim()) return;
            stopActiveListening();
            runAgentCommand(typedInput);
          }}
          className="relative flex items-center gap-1.5 bg-white/[0.08] border border-white/15 rounded-full px-2 py-1"
        >
          <button
            type="button"
            onClick={() => setShowQuickChips((v) => !v)}
            aria-label="Toggle suggested Astra commands"
            title="Quick command suggestions"
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/18 flex items-center justify-center text-slate-200 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={typedInput}
            onChange={(e) => {
              setTypedInput(e.target.value);
              if (isListeningLive && e.target.value.length > 0) {
                stopActiveListening();
              }
            }}
            placeholder="Ask Astra (అస్త్రం)..."
            aria-label="Ask Astra input"
            className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-400 focus:outline-none px-1"
          />

          <button
            type="button"
            onClick={() => {
              if (isListeningLive) stopActiveListening();
              else startStreamingListen();
            }}
            aria-label={isListeningLive ? 'Pause live microphone' : 'Start live microphone'}
            style={isListeningLive ? { backgroundColor: palette.primaryHex } : undefined}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shrink-0 ${
              isListeningLive
                ? palette.onPrimaryTextClass
                : 'bg-white/10 hover:bg-white/18 text-slate-200'
            }`}
          >
            {isListeningLive ? (
              <Sparkles className="w-3.5 h-3.5" />
            ) : (
              <Mic className="w-3.5 h-3.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
