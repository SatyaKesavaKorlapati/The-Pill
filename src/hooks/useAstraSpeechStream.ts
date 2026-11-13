import { useEffect, useRef } from 'react';
import { usePillStore } from '../store/usePillStore';

const SILENCE_COMMIT_MS = 1100;
const WAKE_WORDS = ['astra', 'astram', 'hey astra', 'hi astra', 'ok astra', 'అస్త్రం', 'అస్త్ర'];

export function useAstraSpeechStream() {
  const astraVisible = usePillStore((s) => s.astraVisible);
  const setAstraVisible = usePillStore((s) => s.setAstraVisible);
  const astraWakeWordEnabled = usePillStore((s) => s.preferences.astraWakeWordEnabled);
  const aiEnabled = usePillStore((s) => s.preferences.aiEnabled);

  const setAstraInterimSpeech = usePillStore((s) => s.setAstraInterimSpeech);
  const setAstraAnswerMarkdown = usePillStore((s) => s.setAstraAnswerMarkdown);
  const setAstraState = usePillStore((s) => s.setAstraState);
  const setAudioAmplitude = usePillStore((s) => s.setAudioAmplitude);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Audio level analyser loop
  const startAudioMeter = async () => {
    try {
      if (!micStreamRef.current) {
        micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64;
        const source = audioContextRef.current.createMediaStreamSource(micStreamRef.current);
        source.connect(analyserRef.current);
      }

      const analyser = analyserRef.current;
      if (!analyser) return;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateMeter = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(1, avg / 128);
        setAudioAmplitude(normalized);
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();
    } catch {
      // Microphone permissions not granted or unavailable
    }
  };

  const stopAudioMeter = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setAudioAmplitude(0);
  };

  // Commit query to Gemini API
  const commitQueryToGemini = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    setAstraState('thinking');

    try {
      let apiKey = '';
      const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/core');
        const customKey = await invoke<string | null>('load_custom_api_key');
        if (customKey) apiKey = customKey;
      }

      if (!apiKey) {
        apiKey = localStorage.getItem('pill_gemini_api_key_fallback') || '';
      }

      if (!apiKey) {
        setAstraState('speaking');
        setAstraAnswerMarkdown(
          `**Astra Voice Assistant (అస్త్రం)**\n\nNo Gemini API Key found in your DPAPI Vault.\n\nOpen **Settings** (⚙️) to save your Gemini API key securely.`
        );
        return;
      }

      // Call Gemini 2.5 Flash via REST API
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are Astra (అస్త్రం), an intelligent native Windows 11 AI companion. Answer concisely in clean markdown with technical accuracy:\n\n${trimmed}`,
              },
            ],
          },
        ],
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `HTTP ${res.status}`);
      }

      const json = await res.json();
      const answer =
        json.candidates?.[0]?.content?.parts?.[0]?.text ||
        'I received your request, but no answer could be generated.';

      setAstraState('speaking');
      setAstraAnswerMarkdown(answer);
    } catch (err: any) {
      setAstraState('idle');
      setAstraAnswerMarkdown(`**Error:** ${err?.message || 'Failed to connect to Gemini API.'}`);
    }
  };

  // Continuous speech recognition setup
  useEffect(() => {
    if (!aiEnabled) return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      startAudioMeter();
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        interim += event.results[i][0].transcript;
      }

      const lower = interim.toLowerCase();

      // Check Wake Word if Astra is not currently visible
      if (!usePillStore.getState().astraVisible && astraWakeWordEnabled) {
        for (const w of WAKE_WORDS) {
          if (lower.includes(w)) {
            setAstraVisible(true);
            setAstraState('listening');
            setAstraInterimSpeech('');
            return;
          }
        }
      }

      if (usePillStore.getState().astraVisible) {
        setAstraState('listening');
        setAstraInterimSpeech(interim);

        // Reset 1.1s silence commit timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = setTimeout(() => {
          commitQueryToGemini(interim);
        }, SILENCE_COMMIT_MS);
      }
    };

    recognition.onerror = () => {
      // Re-arm recognition smoothly
    };

    recognition.onend = () => {
      // Keep listening continuously if wake word or astra is active
      try {
        if (usePillStore.getState().preferences.aiEnabled) {
          recognition.start();
        }
      } catch {}
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch {}

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      try {
        recognition.stop();
      } catch {}
      stopAudioMeter();
    };
  }, [aiEnabled, astraWakeWordEnabled, setAstraVisible, setAstraState, setAstraInterimSpeech]);

  const submitManualQuery = (query: string) => {
    setAstraInterimSpeech(query);
    commitQueryToGemini(query);
  };

  return { submitManualQuery };
}
