import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AudioLines,
  Check,
  Code2,
  Copy,
  Ear,
  ExternalLink,
  Globe,
  Loader2,
  MessageSquare,
  Mic,
  MonitorSpeaker,
  PhoneOff,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Square,
  StickyNote,
  Trash2,
  Upload,
  Volume2,
  Zap,
} from 'lucide-react';
import {
  AiAssistantModelId,
  PillPreferences,
  LiveVoiceName,
  VoiceAgentAction,
} from '../types/pill';
import { playTactilePop } from '../utils/audioSynth';
import { resolveThemePalette } from '../utils/themeAndSliders';
import { CustomPopdown, PopdownOption } from './CustomPopdown';
import { FluidMusicVisualizer } from './FluidMusicVisualizer';
import { RichMarkdown } from './RichMarkdown';

interface IslandAiAssistantPanelProps {
  preferences: PillPreferences;
  onUpdatePreferences: (patch: Partial<PillPreferences>) => void;
  onAppendToNotes: (text: string) => void;
  onCopyToClipboard: (text: string, source: string) => void;
  onTriggerToast: (msg: string) => void;
  onExecuteAgentActions?: (actions: VoiceAgentAction[]) => void;
  initialSubMode?: AssistantSubMode;
}

export type AssistantSubMode = 'chat' | 'assist' | 'search' | 'transcribe' | 'live';

interface WebCitation {
  uri: string;
  title: string;
  domain?: string;
}

interface ChatTurn {
  id: string;
  role: 'user' | 'model';
  text: string;
  queryForGoogle?: string;
  modelBadge?: string;
  sources?: WebCitation[];
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

const MODEL_OPTIONS: PopdownOption<AiAssistantModelId>[] = [
  { value: 'gemini-3.1-flash-lite', label: 'Fast · Lite', sublabel: 'Lowest latency' },
  { value: 'gemini-3.8-flash', label: '3.8 Flash', sublabel: 'Balanced speed & depth' },
  { value: 'gemini-4-argon', label: 'Pro · Argon', sublabel: 'Coding & STEM reasoning' },
  { value: 'gemini-4-carbon', label: 'Deep · Carbon', sublabel: 'Deepest architecture reasoning' },
];

const PERSONA_OPTIONS: PopdownOption<
  'windows_architect' | 'code_reasoner' | 'quick_concierge'
>[] = [
  { value: 'windows_architect', label: 'Copilot', sublabel: 'Windows 11 & Productivity' },
  { value: 'code_reasoner', label: 'Code Pro', sublabel: 'Systems, C#, TS & Python' },
  { value: 'quick_concierge', label: 'Concierge', sublabel: 'Crisp short summaries' },
];

const VOICE_OPTIONS: PopdownOption<LiveVoiceName>[] = [
  { value: 'Zephyr', label: 'Voice: Zephyr', sublabel: 'Warm & balanced' },
  { value: 'Kore', label: 'Voice: Kore', sublabel: 'Clear & articulate' },
  { value: 'Puck', label: 'Voice: Puck', sublabel: 'Upbeat & energetic' },
  { value: 'Fenrir', label: 'Voice: Fenrir', sublabel: 'Deep & calm' },
  { value: 'Charon', label: 'Voice: Charon', sublabel: 'Composed studio tone' },
];

const ASSIST_LANG_OPTIONS: PopdownOption<string>[] = [
  { value: 'auto', label: 'Lang: Auto', sublabel: 'Best idiomatic language' },
  { value: 'TypeScript', label: 'TypeScript', sublabel: 'Strict typed TS / Node' },
  { value: 'Python', label: 'Python', sublabel: 'Clean Python 3.12' },
  { value: 'C#', label: 'C# (.NET 8)', sublabel: 'WinUI 3 & NativeAOT' },
  { value: 'C++', label: 'C++20', sublabel: 'Systems & STL' },
  { value: 'SQL', label: 'SQL', sublabel: 'Window functions & CTEs' },
];

function downsampleTo16kPcmBase64(input: Float32Array, inputSampleRate: number): string {
  let samples = input;
  if (inputSampleRate !== 16000 && inputSampleRate > 16000) {
    const ratio = inputSampleRate / 16000;
    const outLen = Math.max(1, Math.round(input.length / ratio));
    const downsampled = new Float32Array(outLen);
    for (let i = 0; i < outLen; i++) {
      const idx = Math.min(input.length - 1, Math.floor(i * ratio));
      downsampled[i] = input[idx];
    }
    samples = downsampled;
  }

  const pcm16 = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(pcm16.buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64Pcm16ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768;
  }
  return float32;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const commaIdx = result.indexOf(',');
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(new Error('Failed to read audio file'));
    reader.readAsDataURL(blob);
  });
}

export const IslandAiAssistantPanel: React.FC<IslandAiAssistantPanelProps> = ({
  preferences,
  onUpdatePreferences,
  onAppendToNotes,
  onCopyToClipboard,
  onTriggerToast,
  onExecuteAgentActions,
  initialSubMode = 'chat',
}) => {
  const palette = resolveThemePalette(
    preferences.themeId,
    preferences.customPrimaryHex,
    preferences.customSecondaryHex
  );
  const isLight = Boolean(palette.isLightSurface);

  const [mode, setMode] = useState<AssistantSubMode>(initialSubMode);

  // 1. Professional Formatted Multi-Turn Chat State
  const [selectedModel, setSelectedModel] = useState<AiAssistantModelId>(
    preferences.defaultAiModel
  );
  const [persona, setPersona] = useState<
    'windows_architect' | 'code_reasoner' | 'quick_concierge'
  >('windows_architect');
  const [useSearch, setUseSearch] = useState<boolean>(
    preferences.featureFlags.webSearchGrounding
  );
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [copiedTurnId, setCopiedTurnId] = useState<string | null>(null);
  const [speakingTurnId, setSpeakingTurnId] = useState<string | null>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: '**Pill Copilot ready.**\n- Switch to **Assist** for live OS-masked active question listening with formatted code solutions.\n- Use **Fast Search** for instant Google-grounded answers, **Transcribe** for voice clips, or **Live Voice** for real-time conversation.',
      modelBadge: 'Studio Ready',
    },
  ]);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  // 2. ASSIST — Active Question Listener & Formatted Code Co-Pilot (OS-Masked)
  const [assistMicListening, setAssistMicListening] = useState(false);
  const [assistSystemListening, setAssistSystemListening] = useState(false);
  const [assistTranscriptWindow, setAssistTranscriptWindow] = useState('');
  const [assistInterimText, setAssistInterimText] = useState('');
  const [assistPromptInput, setAssistPromptInput] = useState('');
  const [assistAnswer, setAssistAnswer] = useState('');
  const [assistLoading, setAssistLoading] = useState(false);
  const [assistError, setAssistError] = useState<string | null>(null);
  const [copiedAssist, setCopiedAssist] = useState(false);

  const assistSpeechRef = useRef<BrowserSpeechRecognition | null>(null);
  const assistAutoTimerRef = useRef<number | null>(null);
  const assistSystemStreamRef = useRef<MediaStream | null>(null);
  const assistSystemRecorderRef = useRef<MediaRecorder | null>(null);
  const assistSystemChunksRef = useRef<Blob[]>([]);
  const assistTranscriptRef = useRef<string>('');

  // 3. Direct Fast Google Search Mode State
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSearchedQuery, setLastSearchedQuery] = useState('');
  const [searchAnswer, setSearchAnswer] = useState('');
  const [searchSources, setSearchSources] = useState<WebCitation[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [copiedSearch, setCopiedSearch] = useState(false);

  // 4. Audio Transcription (gemini-3.5-transcribe) State
  const [isRecordingClip, setIsRecordingClip] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioUploadRef = useRef<HTMLInputElement | null>(null);

  // 5. Real-Time Live Voice Conversation (gemini-3.8-live on v1beta) State
  const [liveConnected, setLiveConnected] = useState(false);
  const [liveConnecting, setLiveConnecting] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveVoice, setLiveVoice] = useState<LiveVoiceName>(preferences.defaultLiveVoice);
  const [liveInputTranscript, setLiveInputTranscript] = useState('');
  const [liveOutputTranscript, setLiveOutputTranscript] = useState('');
  const [liveSpeaking, setLiveSpeaking] = useState(false);
  const [livePromptText, setLivePromptText] = useState('');
  const [liveToolActions, setLiveToolActions] = useState<VoiceAgentAction[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const liveReadyRef = useRef<boolean>(false);
  const micStreamRef = useRef<MediaStream | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  useEffect(() => {
    assistTranscriptRef.current = assistTranscriptWindow;
  }, [assistTranscriptWindow]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const stopAssistListeners = useCallback(() => {
    if (assistAutoTimerRef.current) {
      window.clearTimeout(assistAutoTimerRef.current);
      assistAutoTimerRef.current = null;
    }
    if (assistSpeechRef.current) {
      try {
        assistSpeechRef.current.onend = null;
        assistSpeechRef.current.stop();
      } catch {
        // Ignore
      }
      assistSpeechRef.current = null;
    }
    if (assistSystemRecorderRef.current && assistSystemRecorderRef.current.state !== 'inactive') {
      try {
        assistSystemRecorderRef.current.stop();
      } catch {
        // Ignore
      }
    }
    assistSystemRecorderRef.current = null;
    if (assistSystemStreamRef.current) {
      assistSystemStreamRef.current.getTracks().forEach((t) => t.stop());
      assistSystemStreamRef.current = null;
    }
    setAssistMicListening(false);
    setAssistSystemListening(false);
    setAssistInterimText('');
  }, []);

  const stopLiveSession = () => {
    liveReadyRef.current = false;
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // Ignore
      }
      wsRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    for (const src of activeSourcesRef.current) {
      try {
        src.stop();
      } catch {
        // Ignore
      }
    }
    activeSourcesRef.current = [];
    if (inputCtxRef.current) {
      inputCtxRef.current.close().catch(() => {});
      inputCtxRef.current = null;
    }
    if (outputCtxRef.current) {
      outputCtxRef.current.close().catch(() => {});
      outputCtxRef.current = null;
    }
    nextStartTimeRef.current = 0;
    setLiveConnected(false);
    setLiveConnecting(false);
    setLiveSpeaking(false);
  };

  useEffect(() => {
    return () => {
      stopLiveSession();
      stopAssistListeners();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        ttsAudioRef.current = null;
      }
    };
  }, [stopAssistListeners]);

  const runAssistQuery = useCallback(
    async (opts: {
      explicitQuestion?: string;
      transcriptOverride?: string;
      audioBase64?: string;
      mimeType?: string;
    }) => {
      setAssistError(null);
      setAssistLoading(true);
      playTactilePop('tab');

      try {
        const response = await fetch('/api/ai/assist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcriptWindow: opts.transcriptOverride ?? assistTranscriptRef.current,
            explicitQuestion: opts.explicitQuestion ?? '',
            codeLanguage: preferences.assistCodeLanguage || 'auto',
            audioBase64: opts.audioBase64,
            mimeType: opts.mimeType,
          }),
        });

        const data = (await response.json()) as {
          answerMarkdown?: string;
          detectedTranscript?: string;
          error?: string;
        };

        if (!response.ok || data.error) {
          throw new Error(data.error || 'Assist could not generate an answer.');
        }

        if (data.detectedTranscript) {
          setAssistTranscriptWindow(data.detectedTranscript);
        }
        setAssistAnswer(data.answerMarkdown || 'No answer generated.');
        playTactilePop('confirm');
      } catch (err) {
        setAssistError(err instanceof Error ? err.message : 'Assist request failed.');
      } finally {
        setAssistLoading(false);
      }
    },
    [preferences.assistCodeLanguage]
  );

  const toggleAssistMicListener = async () => {
    if (assistMicListening) {
      stopAssistListeners();
      playTactilePop('toggleOff');
      return;
    }

    stopAssistListeners();
    setAssistError(null);

    const SpeechCtor =
      (window as unknown as { SpeechRecognition?: new () => BrowserSpeechRecognition })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => BrowserSpeechRecognition })
        .webkitSpeechRecognition;

    if (SpeechCtor) {
      try {
        const rec = new SpeechCtor();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (ev) => {
          let interim = '';
          let finalChunk = '';
          for (let i = ev.resultIndex; i < ev.results.length; i++) {
            const res = ev.results[i];
            if (res.isFinal) {
              finalChunk += `${res[0]?.transcript ?? ''} `;
            } else {
              interim += res[0]?.transcript ?? '';
            }
          }
          setAssistInterimText(interim.trim());

          if (finalChunk.trim()) {
            const nextWindow = `${assistTranscriptRef.current} ${finalChunk.trim()}`
              .trim()
              .slice(-900);
            assistTranscriptRef.current = nextWindow;
            setAssistTranscriptWindow(nextWindow);
            setAssistInterimText('');

            if (preferences.assistAutoAnswer) {
              if (assistAutoTimerRef.current) {
                window.clearTimeout(assistAutoTimerRef.current);
              }
              assistAutoTimerRef.current = window.setTimeout(() => {
                runAssistQuery({ transcriptOverride: nextWindow });
              }, 1250);
            }
          }
        };

        rec.onerror = (ev) => {
          if (ev.error && ev.error !== 'no-speech' && ev.error !== 'aborted') {
            setAssistError(`Mic listener notice: ${ev.error}`);
          }
        };

        rec.onend = () => {
          setAssistMicListening(false);
        };

        assistSpeechRef.current = rec;
        rec.start();
        setAssistMicListening(true);
        playTactilePop('toggleOn');
        return;
      } catch {
        // Fall through to MediaRecorder clip fallback
      }
    }

    // Fallback if browser lacks Web Speech API: record mic audio & transcribe+answer on stop
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone API unavailable in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      assistSystemStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      assistSystemChunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) assistSystemChunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        const mime = recorder.mimeType || 'audio/webm';
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(assistSystemChunksRef.current, { type: mime });
        if (blob.size > 0) {
          const b64 = await blobToBase64(blob);
          runAssistQuery({ audioBase64: b64, mimeType: mime });
        }
      };
      assistSystemRecorderRef.current = recorder;
      recorder.start(300);
      setAssistMicListening(true);
      playTactilePop('toggleOn');
    } catch (err) {
      setAssistError(
        err instanceof Error
          ? err.message
          : 'Microphone access denied. Type or click any sample question below.'
      );
    }
  };

  const toggleAssistSystemAudio = async () => {
    if (assistSystemListening) {
      if (
        assistSystemRecorderRef.current &&
        assistSystemRecorderRef.current.state !== 'inactive'
      ) {
        assistSystemRecorderRef.current.stop();
      } else {
        stopAssistListeners();
      }
      setAssistSystemListening(false);
      playTactilePop('toggleOff');
      return;
    }

    stopAssistListeners();
    setAssistError(null);

    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('System/Tab audio capture requires a desktop browser with getDisplayMedia.');
      }
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const audioTracks = displayStream.getAudioTracks();
      // Stop video track immediately — Assist only needs system/call audio (WASAPI Loopback equivalent)
      displayStream.getVideoTracks().forEach((vt) => vt.stop());

      if (audioTracks.length === 0) {
        displayStream.getTracks().forEach((t) => t.stop());
        throw new Error(
          'No audio track shared. Enable "Share tab/system audio" in the picker so Assist can hear the speaker.'
        );
      }

      const audioOnlyStream = new MediaStream(audioTracks);
      assistSystemStreamRef.current = audioOnlyStream;

      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(audioOnlyStream, { mimeType: mime });
      assistSystemChunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) assistSystemChunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        audioOnlyStream.getTracks().forEach((t) => t.stop());
        setAssistSystemListening(false);
        const blob = new Blob(assistSystemChunksRef.current, { type: mime });
        if (blob.size > 0) {
          const b64 = await blobToBase64(blob);
          await runAssistQuery({ audioBase64: b64, mimeType: mime });
        }
      };

      audioTracks[0].onended = () => {
        if (recorder.state !== 'inactive') recorder.stop();
      };

      assistSystemRecorderRef.current = recorder;
      recorder.start(300);
      setAssistSystemListening(true);
      playTactilePop('toggleOn');
    } catch (err) {
      setAssistError(
        err instanceof Error
          ? err.message
          : 'System audio capture cancelled. You can also use Live Mic or type a question.'
      );
    }
  };

  const handleSpeakTurn = async (turnId: string, text: string) => {
    if (speakingTurnId === turnId && ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current = null;
      setSpeakingTurnId(null);
      return;
    }
    try {
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        ttsAudioRef.current = null;
      }
      setSpeakingTurnId(turnId);
      const resp = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceName: preferences.defaultLiveVoice,
        }),
      });
      const data = (await resp.json()) as { audioWavBase64?: string; error?: string };
      if (!resp.ok || !data.audioWavBase64) {
        throw new Error(data.error || 'Speech synthesis unavailable');
      }
      const audio = new Audio(`data:audio/wav;base64,${data.audioWavBase64}`);
      ttsAudioRef.current = audio;
      audio.onended = () => setSpeakingTurnId(null);
      audio.onerror = () => setSpeakingTurnId(null);
      await audio.play();
    } catch (err) {
      setSpeakingTurnId(null);
      onTriggerToast(err instanceof Error ? err.message : 'Unable to play speech');
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || chatLoading) return;

    setChatError(null);
    const userTurn: ChatTurn = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    const updatedHistory = [...messages, userTurn];
    setMessages(updatedHistory);
    setChatInput('');
    setChatLoading(true);
    playTactilePop('tab');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory
            .filter((m) => m.id !== 'welcome-1')
            .map((m) => ({ role: m.role, text: m.text })),
          model: selectedModel,
          persona,
          useSearchGrounding: useSearch && preferences.featureFlags.webSearchGrounding,
        }),
      });
      const data = (await response.json()) as {
        text?: string;
        sources?: WebCitation[];
        modelUsed?: string;
        error?: string;
      };
      if (!response.ok || data.error) {
        throw new Error(data.error || `Request failed (${response.status})`);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: 'model',
          text: data.text || 'No response returned.',
          queryForGoogle: useSearch ? trimmed : undefined,
          modelBadge: useSearch ? `${data.modelUsed} · Google Grounded` : data.modelUsed,
          sources: data.sources,
        },
      ]);
      playTactilePop('confirm');
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Unable to complete request.');
    } finally {
      setChatLoading(false);
    }
  };

  const executeFastGoogleSearch = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || searchLoading) return;

    setSearchError(null);
    setLastSearchedQuery(trimmed);
    setSearchLoading(true);
    playTactilePop('tab');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', text: trimmed }],
          fastSearchOnly: true,
          useSearchGrounding: true,
        }),
      });
      const data = (await response.json()) as {
        text?: string;
        sources?: WebCitation[];
        error?: string;
      };
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Fast search failed.');
      }
      setSearchAnswer(data.text || 'No search summary returned.');
      setSearchSources(data.sources ?? []);
      playTactilePop('confirm');
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Google Search failed.');
    } finally {
      setSearchLoading(false);
    }
  };

  const transcribeBlob = async (blob: Blob, mimeType: string) => {
    setTranscribing(true);
    setTranscribeError(null);
    try {
      const audioBase64 = await blobToBase64(blob);
      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64, mimeType }),
      });
      const data = (await response.json()) as { transcript?: string; error?: string };
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Transcription failed.');
      }
      setTranscriptText(data.transcript || '');
      playTactilePop('confirm');
    } catch (err) {
      setTranscribeError(err instanceof Error ? err.message : 'Audio transcription failed.');
    } finally {
      setTranscribing(false);
    }
  };

  const toggleMicDictation = async () => {
    if (isRecordingClip && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecordingClip(false);
      return;
    }

    setTranscribeError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone capture is unavailable in this browser context.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';
      const recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);
      recordedChunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) recordedChunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        const actualMime = recorder.mimeType || preferredMime || 'audio/webm';
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(recordedChunksRef.current, { type: actualMime });
        if (audioBlob.size > 0) {
          transcribeBlob(audioBlob, actualMime);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setIsRecordingClip(true);
      playTactilePop('toggleOn');
    } catch (err) {
      setTranscribeError(
        err instanceof Error
          ? err.message
          : 'Microphone permission was denied or unavailable. You can also upload an audio file.'
      );
    }
  };

  const startLiveVoiceSession = async () => {
    if (liveConnected || liveConnecting) {
      stopLiveSession();
      playTactilePop('collapse');
      return;
    }

    setLiveError(null);
    setLiveConnecting(true);
    setLiveInputTranscript('');
    setLiveOutputTranscript('');
    setLiveToolActions([]);
    liveReadyRef.current = false;

    try {
      let stream: MediaStream | null = null;
      if (navigator.mediaDevices?.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStreamRef.current = stream;
        } catch {
          stream = null;
        }
      }

      const outputCtx = new AudioContext({ sampleRate: 24000 });
      await outputCtx.resume().catch(() => {});
      outputCtxRef.current = outputCtx;
      nextStartTimeRef.current = 0;

      if (stream) {
        const inputCtx = new AudioContext();
        await inputCtx.resume().catch(() => {});
        inputCtxRef.current = inputCtx;

        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        const silentGain = inputCtx.createGain();
        silentGain.gain.value = 0;
        source.connect(processor);
        processor.connect(silentGain);
        silentGain.connect(inputCtx.destination);

        processor.onaudioprocess = (ev) => {
          if (wsRef.current?.readyState === WebSocket.OPEN && liveReadyRef.current) {
            const channelData = ev.inputBuffer.getChannelData(0);
            const pcmBase64 = downsampleTo16kPcmBase64(channelData, inputCtx.sampleRate);
            wsRef.current.send(JSON.stringify({ audio: pcmBase64 }));
          }
        };
      }

      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(
        `${proto}//${window.location.host}/api/live?voice=${encodeURIComponent(liveVoice)}`
      );
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as {
            ready?: boolean;
            audio?: string;
            inputTranscript?: string;
            outputTranscript?: string;
            toolCalls?: VoiceAgentAction[];
            interrupted?: boolean;
            error?: string;
          };

          if (msg.error) {
            setLiveError(msg.error);
            stopLiveSession();
            return;
          }

          if (msg.ready) {
            liveReadyRef.current = true;
            setLiveConnecting(false);
            setLiveConnected(true);
            playTactilePop('confirm');
          }

          if (msg.toolCalls && msg.toolCalls.length > 0) {
            setLiveToolActions((prev) => [...msg.toolCalls!, ...prev].slice(0, 4));
            onExecuteAgentActions?.(msg.toolCalls);
          }

          if (msg.inputTranscript) {
            setLiveInputTranscript((prev) => `${prev} ${msg.inputTranscript}`.trim().slice(-220));
          }
          if (msg.outputTranscript) {
            setLiveOutputTranscript((prev) =>
              `${prev} ${msg.outputTranscript}`.trim().slice(-280)
            );
          }

          if (msg.interrupted) {
            for (const s of activeSourcesRef.current) {
              try {
                s.stop();
              } catch {
                // Ignore
              }
            }
            activeSourcesRef.current = [];
            if (outputCtxRef.current) {
              nextStartTimeRef.current = outputCtxRef.current.currentTime;
            }
            setLiveSpeaking(false);
          }

          if (msg.audio && outputCtxRef.current) {
            const ctx = outputCtxRef.current;
            const samples = base64Pcm16ToFloat32(msg.audio);
            const buffer = ctx.createBuffer(1, samples.length, 24000);
            buffer.getChannelData(0).set(samples);

            const node = ctx.createBufferSource();
            node.buffer = buffer;
            node.connect(ctx.destination);

            const startAt = Math.max(ctx.currentTime, nextStartTimeRef.current);
            node.start(startAt);
            nextStartTimeRef.current = startAt + buffer.duration;
            activeSourcesRef.current.push(node);
            setLiveSpeaking(true);

            node.onended = () => {
              activeSourcesRef.current = activeSourcesRef.current.filter((n) => n !== node);
              if (activeSourcesRef.current.length === 0) {
                setLiveSpeaking(false);
              }
            };
          }
        } catch {
          // Ignore malformed WS frame
        }
      };

      ws.onerror = () => {
        setLiveError('Live WebSocket connection encountered an error.');
        stopLiveSession();
      };

      ws.onclose = () => {
        liveReadyRef.current = false;
        setLiveConnected(false);
        setLiveConnecting(false);
      };
    } catch (err) {
      setLiveError(err instanceof Error ? err.message : 'Unable to start Live Voice session.');
      stopLiveSession();
    }
  };

  const sendLiveTextTurn = (e: React.FormEvent) => {
    e.preventDefault();
    const txt = livePromptText.trim();
    if (!txt || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    setLiveInputTranscript(txt);
    setLiveOutputTranscript('');
    wsRef.current.send(JSON.stringify({ text: txt }));
    setLivePromptText('');
  };

  const panelCardCls = isLight
    ? 'bg-stone-900/[0.05] border-stone-900/15 text-stone-900'
    : 'bg-black/30 border-white/[0.08] text-slate-100';

  return (
    <div className="flex flex-col justify-between h-full gap-2">
      {/* Mode Switcher Header */}
      <div className="flex items-center justify-between gap-1.5 min-w-0">
        <div
          className={`flex items-center gap-0.5 p-0.5 rounded-xl shrink-0 ${
            isLight ? 'bg-stone-900/10' : 'bg-white/[0.06]'
          }`}
          role="group"
          aria-label="Search and AI modes"
        >
          <button
            type="button"
            onClick={() => setMode('chat')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
              mode === 'chat'
                ? 'bg-white text-slate-950 shadow-sm'
                : isLight
                  ? 'text-stone-700 hover:text-stone-950'
                  : 'text-slate-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3 h-3 shrink-0" />
            <span>Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('assist')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
              mode === 'assist'
                ? 'bg-white text-slate-950 shadow-sm'
                : isLight
                  ? 'text-stone-700 hover:text-stone-950'
                  : 'text-slate-300 hover:text-white'
            }`}
          >
            <Ear className="w-3 h-3 shrink-0" />
            <span>Assist</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('search')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
              mode === 'search'
                ? 'bg-white text-slate-950 shadow-sm'
                : isLight
                  ? 'text-stone-700 hover:text-stone-950'
                  : 'text-slate-300 hover:text-white'
            }`}
          >
            <Search className="w-3 h-3 shrink-0" />
            <span>Fast Search</span>
          </button>

          {preferences.featureFlags.voiceDictation && (
            <button
              type="button"
              onClick={() => setMode('transcribe')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                mode === 'transcribe'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : isLight
                    ? 'text-stone-700 hover:text-stone-950'
                    : 'text-slate-300 hover:text-white'
              }`}
            >
              <Mic className="w-3 h-3 shrink-0" />
              <span>Transcribe</span>
            </button>
          )}

          {preferences.featureFlags.liveVoiceMode && (
            <button
              type="button"
              onClick={() => setMode('live')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                mode === 'live'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : isLight
                    ? 'text-stone-700 hover:text-stone-950'
                    : 'text-slate-300 hover:text-white'
              }`}
            >
              <AudioLines className="w-3 h-3 shrink-0" />
              <span>Live Voice</span>
            </button>
          )}
        </div>

        {mode === 'chat' && (
          <div className="flex items-center gap-1.5 min-w-0 shrink-0">
            {preferences.featureFlags.webSearchGrounding && (
              <button
                type="button"
                aria-pressed={useSearch}
                onClick={() => setUseSearch((v) => !v)}
                title="Ground answers with live Google Search sources"
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border whitespace-nowrap shrink-0 transition-colors ${
                  useSearch
                    ? 'bg-emerald-500/20 border-emerald-400/45 text-emerald-300'
                    : isLight
                      ? 'bg-stone-900/5 border-stone-900/15 text-stone-700'
                      : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3 h-3 shrink-0" />
                <span>Google</span>
              </button>
            )}

            <CustomPopdown
              ariaLabel="Select reasoning model"
              size="xs"
              align="right"
              accentHex={palette.primaryHex}
              isLightSurface={isLight}
              value={selectedModel}
              options={MODEL_OPTIONS}
              onChange={(next) => {
                setSelectedModel(next);
                onUpdatePreferences({ defaultAiModel: next });
              }}
            />

            <div className="hidden sm:block">
              <CustomPopdown
                ariaLabel="Select assistant role"
                size="xs"
                align="right"
                accentHex={palette.primaryHex}
                isLightSurface={isLight}
                value={persona}
                options={PERSONA_OPTIONS}
                onChange={(next) => setPersona(next)}
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setMessages([
                  {
                    id: 'welcome-1',
                    role: 'model',
                    text: '**Conversation cleared.** Ask anything or toggle **Google** for live web citations.',
                    modelBadge: 'Fresh Thread',
                  },
                ])
              }
              title="Clear chat thread"
              aria-label="Clear chat thread"
              className="p-1 rounded-lg bg-white/[0.05] hover:bg-white/12 text-slate-400 hover:text-white shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {mode === 'assist' && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                onUpdatePreferences({ privacyMaskEnabled: !preferences.privacyMaskEnabled })
              }
              title="OS-level screen-capture privacy mask (WDA_EXCLUDEFROMCAPTURE) — hides Assist from Zoom/Teams/Meet screen shares"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10.5px] font-semibold border whitespace-nowrap shrink-0 transition-colors ${
                preferences.privacyMaskEnabled
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                  : 'bg-white/[0.05] border-white/12 text-slate-300 hover:text-white'
              }`}
            >
              {preferences.privacyMaskEnabled ? (
                <ShieldCheck className="w-3 h-3 shrink-0 text-emerald-300" />
              ) : (
                <Shield className="w-3 h-3 shrink-0" />
              )}
              <span>{preferences.privacyMaskEnabled ? 'OS Masked' : 'Mask Off'}</span>
            </button>

            <CustomPopdown
              ariaLabel="Preferred code language for Assist"
              size="xs"
              align="right"
              prefixIcon={<Code2 className="w-3 h-3" />}
              accentHex={palette.primaryHex}
              isLightSurface={isLight}
              value={preferences.assistCodeLanguage || 'auto'}
              options={ASSIST_LANG_OPTIONS}
              onChange={(lang) => onUpdatePreferences({ assistCodeLanguage: lang })}
            />
          </div>
        )}
      </div>

      {/* Sub-Mode 1: ChatGPT / Gemini-Grade Formatted Chat with Selectable & Copyable Text */}
      {mode === 'chat' && (
        <>
          <div
            className={`flex-1 overflow-y-auto pill-scroll space-y-2.5 pr-1 border rounded-xl p-2.5 select-text ${panelCardCls}`}
          >
            {messages.map((turn) => (
              <div
                key={turn.id}
                className={`flex flex-col ${
                  turn.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  style={
                    turn.role === 'user'
                      ? {
                          backgroundColor: `${palette.primaryHex}26`,
                          borderColor: `${palette.primaryHex}55`,
                        }
                      : undefined
                  }
                  className={`max-w-[92%] rounded-xl px-3 py-2 text-xs leading-relaxed border select-text cursor-text ${
                    turn.role === 'user'
                      ? isLight
                        ? 'text-stone-950'
                        : 'text-white'
                      : isLight
                        ? 'bg-white/75 border-stone-900/15 text-stone-900'
                        : 'bg-white/[0.05] border-white/10 text-slate-100'
                  }`}
                >
                  {turn.role === 'model' ? (
                    <RichMarkdown
                      content={turn.text}
                      accentHex={palette.primaryHex}
                      isLightSurface={isLight}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap break-words select-text cursor-text">
                      {turn.text}
                    </div>
                  )}

                  {turn.sources && turn.sources.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-white/10 flex flex-wrap items-center gap-1.5 select-none">
                      {turn.sources.slice(0, 4).map((src, i) => (
                        <a
                          key={`${src.uri}-${i}`}
                          href={src.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/[0.14] text-[10px] text-sky-300 max-w-[180px] truncate"
                        >
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{src.domain || src.title}</span>
                        </a>
                      ))}
                      {turn.queryForGoogle && (
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(
                            turn.queryForGoogle
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-300 hover:underline ml-auto"
                        >
                          <Search className="w-2.5 h-2.5" />
                          <span>Open on Google ↗</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Per-Turn Action Row: Badge + Copy + Speak + Save to Notes */}
                <div className="flex items-center gap-2.5 mt-0.5 px-1 select-none">
                  {turn.modelBadge && (
                    <span className="text-[10px] text-slate-400">{turn.modelBadge}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(turn.text).catch(() => {});
                      onCopyToClipboard(turn.text, 'Island AI Chat');
                      setCopiedTurnId(turn.id);
                      window.setTimeout(() => setCopiedTurnId(null), 1500);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedTurnId === turn.id ? (
                      <>
                        <Check className="w-2.5 h-2.5 text-emerald-300" />
                        <span className="text-emerald-300">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-2.5 h-2.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {turn.role === 'model' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSpeakTurn(turn.id, turn.text)}
                        className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors"
                      >
                        <Volume2 className="w-2.5 h-2.5" />
                        <span>{speakingTurnId === turn.id ? 'Stop Audio' : 'Speak'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onAppendToNotes(turn.text);
                          onTriggerToast('Saved AI response to Notes');
                        }}
                        className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors"
                      >
                        <StickyNote className="w-2.5 h-2.5" />
                        <span>To Notes</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 px-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-300" />
                <span>Formatting response...</span>
              </div>
            )}
            {chatError && (
              <div className="text-xs text-rose-300 bg-rose-500/15 border border-rose-400/30 rounded-lg px-2.5 py-1.5">
                {chatError}
              </div>
            )}
            <div ref={threadEndRef} />
          </div>

          <form onSubmit={handleSendChat} className="flex items-center gap-1.5">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={
                useSearch
                  ? 'Ask anything with live Google Search grounding...'
                  : 'Ask your Pill Copilot...'
              }
              aria-label="Chat prompt"
              className="flex-1 bg-slate-900/75 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              aria-label="Send message"
              style={{ backgroundColor: palette.primaryHex }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 disabled:opacity-40 whitespace-nowrap shrink-0 transition-opacity ${palette.onPrimaryTextClass}`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </>
      )}

      {/* Sub-Mode 2: ASSIST — Active Spoken Question Listener & Code/Formatted Answer Engine */}
      {mode === 'assist' && (
        <div
          className={`flex-1 flex flex-col justify-between border rounded-2xl p-2.5 gap-2 min-h-0 ${panelCardCls}`}
        >
          {/* Capture Bar: Mic Listener + System/Call Audio + Auto-Answer Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={toggleAssistMicListener}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  assistMicListening
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-slate-950 hover:bg-slate-200'
                }`}
              >
                {assistMicListening ? (
                  <>
                    <Square className="w-2.5 h-2.5 fill-current" />
                    <span>Stop Mic Listener</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3 h-3" />
                    <span>Listen Mic</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={toggleAssistSystemAudio}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border whitespace-nowrap shrink-0 transition-colors ${
                  assistSystemListening
                    ? 'bg-amber-500 text-slate-950 border-amber-300'
                    : 'bg-white/[0.07] hover:bg-white/14 border-white/14 text-slate-200'
                }`}
              >
                {assistSystemListening ? (
                  <>
                    <Square className="w-2.5 h-2.5 fill-current" />
                    <span>Stop &amp; Answer Call Audio</span>
                  </>
                ) : (
                  <>
                    <MonitorSpeaker className="w-3 h-3" />
                    <span>Capture Call / System Audio</span>
                  </>
                )}
              </button>

              <button
                type="button"
                aria-pressed={preferences.assistAutoAnswer}
                onClick={() =>
                  onUpdatePreferences({ assistAutoAnswer: !preferences.assistAutoAnswer })
                }
                className={`px-2 py-1 rounded-lg text-[10.5px] font-medium border whitespace-nowrap shrink-0 transition-colors ${
                  preferences.assistAutoAnswer
                    ? 'bg-sky-500/20 border-sky-400/40 text-sky-200'
                    : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                Auto-Answer: {preferences.assistAutoAnswer ? 'On' : 'Manual'}
              </button>
            </div>

            {assistTranscriptWindow && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={assistLoading}
                  onClick={() => runAssistQuery({ transcriptOverride: assistTranscriptWindow })}
                  style={{ backgroundColor: palette.primaryHex }}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold whitespace-nowrap shrink-0 disabled:opacity-40 ${palette.onPrimaryTextClass}`}
                >
                  Answer Heard Question
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAssistTranscriptWindow('');
                    setAssistInterimText('');
                  }}
                  className="text-[10.5px] text-slate-400 hover:text-white px-1.5 py-0.5"
                >
                  Clear Stream
                </button>
              </div>
            )}
          </div>

          {/* Live Heard Question Strip + Instant Test Prompts */}
          <div className="bg-black/35 border border-white/10 rounded-xl px-2.5 py-1.5 text-[11px] flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2 text-slate-300">
              <span className="truncate">
                <span className="text-slate-400 font-medium">Live Audio Stream: </span>
                {assistTranscriptWindow || assistInterimText ? (
                  <span className="text-white">
                    {assistTranscriptWindow}{' '}
                    {assistInterimText && (
                      <span className="text-sky-300 italic">{assistInterimText}</span>
                    )}
                  </span>
                ) : assistMicListening || assistSystemListening ? (
                  <span className="text-emerald-300">
                    Listening actively for spoken questions...
                  </span>
                ) : (
                  <span className="text-slate-400">
                    Start Mic / System Audio or try a 1-click technical prompt:
                  </span>
                )}
              </span>
            </div>

            {!assistMicListening && !assistSystemListening && !assistAnswer && (
              <div className="flex flex-wrap items-center gap-1">
                {[
                  'Implement O(1) LRU Cache with code',
                  'Win32 SetWindowDisplayAffinity screen-share cloak in C#',
                  'Top 3 salaries per department SQL window query',
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setAssistPromptInput(sample);
                      runAssistQuery({ explicitQuestion: sample });
                    }}
                    className="px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/12 text-[10px] text-slate-300 hover:text-white transition-colors whitespace-nowrap"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Formatted Answer + Code Viewport */}
          <div className="flex-1 min-h-[96px] bg-black/40 border border-white/10 rounded-xl p-2.5 overflow-y-auto pill-scroll select-text cursor-text">
            {assistLoading ? (
              <div className="h-full flex items-center justify-center gap-2 text-xs text-slate-300">
                <Loader2 className="w-4 h-4 animate-spin text-sky-300" />
                <span>Synthesizing structured answer &amp; production code...</span>
              </div>
            ) : assistError ? (
              <div className="text-xs text-rose-300">{assistError}</div>
            ) : assistAnswer ? (
              <div className="space-y-2">
                <RichMarkdown
                  content={assistAnswer}
                  accentHex={palette.primaryHex}
                  isLightSurface={false}
                />
                <div className="pt-1.5 border-t border-white/10 flex items-center justify-end gap-2.5 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(assistAnswer).catch(() => {});
                      onCopyToClipboard(assistAnswer, 'Pill Assist');
                      setCopiedAssist(true);
                      window.setTimeout(() => setCopiedAssist(false), 1500);
                    }}
                    className="inline-flex items-center gap-1 text-[10.5px] text-slate-300 hover:text-white"
                  >
                    {copiedAssist ? (
                      <Check className="w-3 h-3 text-emerald-300" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedAssist ? 'Copied' : 'Copy Full Answer'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAppendToNotes(assistAnswer);
                      onTriggerToast('Saved Assist solution to Notes');
                    }}
                    className="inline-flex items-center gap-1 text-[10.5px] text-sky-300 hover:text-sky-200"
                  >
                    <StickyNote className="w-3 h-3" />
                    <span>Send to Notes</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 text-center px-4">
                Assist listens to spoken technical or meeting questions and formats structured answers with copyable code — cloaked from screen sharing when OS Masked is enabled.
              </div>
            )}
          </div>

          {/* Manual Question Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!assistPromptInput.trim() || assistLoading) return;
              const q = assistPromptInput.trim();
              setAssistPromptInput('');
              runAssistQuery({ explicitQuestion: q });
            }}
            className="flex items-center gap-1.5"
          >
            <input
              type="text"
              value={assistPromptInput}
              onChange={(e) => setAssistPromptInput(e.target.value)}
              placeholder="Or type / paste a coding or architecture question for Assist..."
              aria-label="Assist direct question"
              className="flex-1 bg-slate-950/80 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400"
            />
            <button
              type="submit"
              disabled={assistLoading || !assistPromptInput.trim()}
              style={{ backgroundColor: palette.primaryHex }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 disabled:opacity-40 whitespace-nowrap shrink-0 ${palette.onPrimaryTextClass}`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Solve</span>
            </button>
          </form>
        </div>
      )}

      {/* Sub-Mode 3: Direct Fast Google Search inside the Dynamic Island */}
      {mode === 'search' && (
        <div className={`flex-1 flex flex-col justify-between border rounded-2xl p-3 gap-2 ${panelCardCls}`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeFastGoogleSearch(searchQuery);
            }}
            className="flex items-center gap-1.5"
          >
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-sky-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Instant Google Search — news, specs, prices, docs, people..."
                aria-label="Fast Google Search query"
                className="w-full bg-slate-950/80 border border-white/15 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400"
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading || !searchQuery.trim()}
              style={{ backgroundColor: palette.primaryHex }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-40 whitespace-nowrap shrink-0 ${palette.onPrimaryTextClass}`}
            >
              {searchLoading ? 'Searching...' : 'Google Search'}
            </button>
            {searchQuery.trim() && (
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(searchQuery.trim())}`}
                target="_blank"
                rel="noreferrer"
                title="Open directly on google.com in new tab"
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/18 text-slate-100 inline-flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Web ↗</span>
              </a>
            )}
          </form>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              'Latest Windows 11 24H2 features',
              'Chief Minister of Andhra Pradesh',
              'WinUI 3 DirectComposition NativeAOT',
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setSearchQuery(q);
                  executeFastGoogleSearch(q);
                }}
                className="px-2 py-0.5 rounded-lg bg-white/[0.06] hover:bg-white/12 text-[10.5px] text-slate-300 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex-1 bg-black/35 border border-white/10 rounded-xl p-2.5 overflow-y-auto pill-scroll select-text cursor-text">
            {searchLoading ? (
              <div className="h-full flex items-center justify-center gap-2 text-xs text-slate-300">
                <Loader2 className="w-4 h-4 animate-spin text-sky-300" />
                <span>Searching Google &amp; formatting grounded answer...</span>
              </div>
            ) : searchError ? (
              <div className="text-xs text-rose-300">{searchError}</div>
            ) : searchAnswer ? (
              <div className="space-y-2">
                <RichMarkdown content={searchAnswer} accentHex={palette.primaryHex} />
                <div className="pt-1.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 select-none">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {searchSources.slice(0, 5).map((src, idx) => (
                      <a
                        key={`${src.uri}-${idx}`}
                        href={src.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.07] hover:bg-white/15 text-[10px] text-sky-300 max-w-[180px] truncate"
                      >
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{src.domain || src.title}</span>
                      </a>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(searchAnswer).catch(() => {});
                        onCopyToClipboard(searchAnswer, 'Fast Google Search');
                        setCopiedSearch(true);
                        window.setTimeout(() => setCopiedSearch(false), 1500);
                      }}
                      className="inline-flex items-center gap-1 text-[10px] text-slate-300 hover:text-white"
                    >
                      {copiedSearch ? (
                        <Check className="w-3 h-3 text-emerald-300" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedSearch ? 'Copied' : 'Copy'}</span>
                    </button>
                    {lastSearchedQuery && (
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(
                          lastSearchedQuery
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-emerald-300 hover:underline"
                      >
                        <span>Full Google Results ↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 text-center px-4">
                Type any query above for a fast Google-grounded summary with cited sources and one-click Web launch.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-Mode 4: Audio Transcription (gemini-3.5-transcribe on v1beta) */}
      {mode === 'transcribe' && (
        <div className={`flex-1 flex flex-col justify-between border rounded-2xl p-3 gap-2 ${panelCardCls}`}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-semibold">
                Studio Voice Dictation &amp; Audio File Transcribe
              </div>
              <div className="text-[11px] text-slate-400">
                Record from microphone or upload any `.wav`, `.mp3`, `.m4a`, or `.webm` clip
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={toggleMicDictation}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  isRecordingClip
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-slate-950 hover:bg-slate-200'
                }`}
              >
                {isRecordingClip ? (
                  <>
                    <Square className="w-3 h-3 fill-current" />
                    <span>Stop &amp; Transcribe</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>Record Mic</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => audioUploadRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/16 text-slate-200 whitespace-nowrap shrink-0 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Audio</span>
              </button>
              <input
                ref={audioUploadRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    transcribeBlob(file, file.type || 'audio/wav');
                  }
                  e.target.value = '';
                }}
              />
            </div>
          </div>

          <div className="flex-1 bg-black/35 border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 overflow-y-auto pill-scroll select-text cursor-text">
            {transcribing ? (
              <div className="h-full flex items-center justify-center gap-2 text-slate-300">
                <Loader2 className="w-4 h-4 animate-spin text-sky-300" />
                <span>Transcribing audio with gemini-3.5-transcribe...</span>
              </div>
            ) : transcribeError ? (
              <div className="text-rose-300">{transcribeError}</div>
            ) : transcriptText ? (
              <p className="whitespace-pre-wrap leading-relaxed select-text cursor-text">
                {transcriptText}
              </p>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-center px-4">
                {isRecordingClip
                  ? 'Listening to microphone... Click "Stop & Transcribe" when finished.'
                  : 'Click "Record Mic" to dictate hands-free or upload an audio clip to transcribe.'}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={!transcriptText}
              onClick={() => {
                onCopyToClipboard(transcriptText, 'Voice Dictation');
                navigator.clipboard?.writeText(transcriptText).catch(() => {});
                setCopiedTranscript(true);
                setTimeout(() => setCopiedTranscript(false), 1600);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-white/10 hover:bg-white/16 disabled:opacity-35 text-slate-200 whitespace-nowrap"
            >
              {copiedTranscript ? (
                <Check className="w-3 h-3 text-emerald-300" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span>{copiedTranscript ? 'Copied' : 'Copy to Clipboard'}</span>
            </button>
            <button
              type="button"
              disabled={!transcriptText}
              onClick={() => {
                onAppendToNotes(transcriptText);
                onTriggerToast('Added transcript to Notes');
              }}
              style={{ backgroundColor: palette.primaryHex }}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-35 whitespace-nowrap ${palette.onPrimaryTextClass}`}
            >
              <StickyNote className="w-3 h-3" />
              <span>Insert into Notes</span>
            </button>
          </div>
        </div>
      )}

      {/* Sub-Mode 5: Real-Time Live Voice Session + Windows Voice Tool Control */}
      {mode === 'live' && (
        <div className={`flex-1 flex flex-col justify-between border rounded-2xl p-3 gap-2 ${panelCardCls}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                <span className="truncate">Real-Time Live Voice + Windows Voice Control</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                Bidirectional 24kHz audio — speak naturally or ask to toggle Wi-Fi, Privacy Mask, or Volume
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <CustomPopdown
                ariaLabel="Select Live voice persona"
                size="xs"
                align="right"
                disabled={liveConnected || liveConnecting}
                accentHex={palette.primaryHex}
                isLightSurface={isLight}
                value={liveVoice}
                options={VOICE_OPTIONS}
                onChange={(next) => {
                  setLiveVoice(next);
                  onUpdatePreferences({ defaultLiveVoice: next });
                }}
              />

              <button
                type="button"
                onClick={startLiveVoiceSession}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  liveConnected || liveConnecting
                    ? 'bg-rose-500 hover:bg-rose-400 text-white'
                    : 'bg-white text-slate-950 hover:bg-slate-200'
                }`}
              >
                {liveConnecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : liveConnected ? (
                  <>
                    <PhoneOff className="w-3.5 h-3.5" />
                    <span>End Voice</span>
                  </>
                ) : (
                  <>
                    <AudioLines className="w-3.5 h-3.5" />
                    <span>Start Live Voice</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <FluidMusicVisualizer
            style="liquid_ribbon"
            isPlaying={liveConnected || liveSpeaking}
            accentHex={palette.primaryHex}
            secondaryHex={palette.secondaryHex}
          />

          {liveToolActions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {liveToolActions.map((act, idx) => (
                <span
                  key={`${act.name}-${idx}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/35 text-[10px] text-emerald-200"
                >
                  <Zap className="w-2.5 h-2.5" />
                  <span>{act.summary || act.name}</span>
                </span>
              ))}
            </div>
          )}

          <div className="bg-black/40 border border-white/10 rounded-xl p-2 text-xs min-h-[54px] flex flex-col justify-center gap-1 select-text cursor-text">
            {liveError ? (
              <div className="text-rose-300">{liveError}</div>
            ) : liveConnected ? (
              <>
                <div className="text-[11px] text-slate-400 truncate">
                  You:{' '}
                  <span className="text-slate-100">
                    {liveInputTranscript || 'Listening to microphone (or type a prompt below)...'}
                  </span>
                </div>
                <div className="text-[11px] text-sky-300 line-clamp-2">
                  Astra ({liveVoice}):{' '}
                  <span className="text-white">
                    {liveOutputTranscript ||
                      (liveSpeaking ? 'Speaking aloud...' : 'Connected & ready')}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-slate-400 text-center">
                Click &ldquo;Start Live Voice&rdquo; to connect real-time 24kHz voice &amp; Windows tool control.
              </div>
            )}
          </div>

          {liveConnected && (
            <form onSubmit={sendLiveTextTurn} className="flex items-center gap-1.5">
              <input
                type="text"
                value={livePromptText}
                onChange={(e) => setLivePromptText(e.target.value)}
                placeholder='Optional: type to speak to Live session (e.g. "Turn on OS Privacy Mask")...'
                aria-label="Send text prompt into active Live Voice session"
                className="flex-1 bg-slate-950/80 border border-white/15 rounded-xl px-3 py-1 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                disabled={!livePromptText.trim()}
                style={{ backgroundColor: palette.primaryHex }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold disabled:opacity-40 whitespace-nowrap shrink-0 ${palette.onPrimaryTextClass}`}
              >
                Speak Reply
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
