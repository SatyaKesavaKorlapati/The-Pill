import React, { useState } from 'react';
import { usePillStore } from '../../store/usePillStore';
import { RichMarkdown } from '../RichMarkdown';
import { AstraSiriSphereCanvas } from '../shaders/AstraSiriSphereCanvas';
import {
  Sparkles,
  Send,
  Shield,
  Copy,
  Check,
  Terminal,
  Code2,
  Mic,
} from 'lucide-react';

export const AssistCopilotView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: '### Astra Cloaked Copilot (అస్త్రం)\n\nProtected by `WDA_EXCLUDEFROMCAPTURE (0x11)` OS screen cloaking. Everything here is invisible to screen recording, Discord, Zoom, and Teams screen sharing.\n\nAsk me any architecture question, system command, or debug request:',
    },
  ]);

  const privacyMaskEnabled = usePillStore((s) => s.preferences.privacyMaskEnabled);
  const audioAmp = usePillStore((s) => s.audioAmplitude);

  const handleSend = async () => {
    const trimmed = query.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setQuery('');
    setLoading(true);

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
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: '⚠️ **No API Key in DPAPI Vault.**\nPlease click the **Settings (⚙️)** icon in the top right to store your Gemini API Key.',
          },
        ]);
        setLoading(false);
        return;
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are Astra Copilot, a technical assistant for Windows 11 engineers. Answer concisely with markdown and code snippets:\n\n${trimmed}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const json = await res.json();
      const reply =
        json.candidates?.[0]?.content?.parts?.[0]?.text ||
        'I could not generate an answer at this time.';

      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `**Error:** ${e?.message || 'Failed to connect.'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-1 text-white select-none overflow-hidden">
      {/* Top Header: Cloaking status indicator */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <AstraSiriSphereCanvas size={28} audioAmplitude={audioAmp} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-cyan-300">Astra Cloaked Copilot</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                అస్త్రం
              </span>
            </div>
            <div className="text-[10px] text-zinc-400">Meeting & Technical Q&A</div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-zinc-400">
          <Shield
            className={`w-3.5 h-3.5 ${
              privacyMaskEnabled ? 'text-emerald-400' : 'text-zinc-500'
            }`}
          />
          <span className="font-mono">
            {privacyMaskEnabled ? 'WDA_0x11 Cloaked' : 'Capture Visible'}
          </span>
        </div>
      </div>

      {/* Message Chat Feed */}
      <div className="flex-1 min-h-0 overflow-y-auto pill-scroll p-2 space-y-3 rounded-2xl bg-zinc-900/80 border border-white/10">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[90%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none'
                  : 'bg-white/5 border border-white/10 text-zinc-200 rounded-tl-none'
              }`}
            >
              <RichMarkdown content={msg.text} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-cyan-300 animate-pulse pl-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>Astra is analyzing...</span>
          </div>
        )}
      </div>

      {/* Bottom Query Input */}
      <div className="relative flex items-center gap-2 mt-2 pt-1 border-t border-white/10 shrink-0">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask technical question or meeting summary (Invisible to capture)..."
          className="flex-1 bg-white/10 border border-white/15 focus:border-cyan-400/60 rounded-full px-4 py-2 text-xs text-white placeholder-zinc-400 outline-none backdrop-blur-md transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={loading || !query.trim()}
          className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 flex items-center justify-center shadow-md transition-all shrink-0 disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </div>
  );
};
