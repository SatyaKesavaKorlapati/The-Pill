import React, { useState } from 'react';
import { usePillStore } from '../store/usePillStore';
import { AstraSiriSphereCanvas } from './shaders/AstraSiriSphereCanvas';
import { RichMarkdown } from './RichMarkdown';
import { X, Send, Sparkles, Mic } from 'lucide-react';

interface AstraInPillMorphViewProps {
  onClose: () => void;
  onSubmitQuery: (text: string) => void;
}

export const AstraInPillMorphView: React.FC<AstraInPillMorphViewProps> = ({
  onClose,
  onSubmitQuery,
}) => {
  const [inputText, setInputText] = useState('');
  const astraMode = usePillStore((s) => s.preferences.astraMode);
  const astraState = usePillStore((s) => s.astraState);
  const interimSpeech = usePillStore((s) => s.astraInterimSpeech);
  const answerMarkdown = usePillStore((s) => s.astraAnswerMarkdown);
  const audioAmp = usePillStore((s) => s.audioAmplitude);

  const isOrbOnly = astraMode === 'OrbOnly';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputText.trim()) {
      onSubmitQuery(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 text-white overflow-hidden select-none">
      {/* Background Soft Siri Aurora Glow */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-t from-cyan-500/20 via-purple-500/15 to-transparent blur-2xl pointer-events-none" />

      {/* Header bar / Top row */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <AstraSiriSphereCanvas
            size={isOrbOnly ? 36 : 42}
            audioAmplitude={audioAmp}
            state={astraState}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold tracking-wide bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                Astra · అస్త్రం
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-zinc-300">
                {astraState}
              </span>
            </div>
            {isOrbOnly && (
              <p className="text-[11px] text-zinc-300 truncate max-w-[280px]">
                {interimSpeech || answerMarkdown || 'Listening for your command...'}
              </p>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-zinc-400 hover:text-white"
          title="Close Astra"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content Area (For OrbWithChat) */}
      {!isOrbOnly && (
        <div className="flex-1 my-2 overflow-y-auto pill-scroll z-10 flex flex-col gap-2 max-h-[140px]">
          {interimSpeech && (
            <div className="self-end max-w-[85%] bg-indigo-600/30 border border-indigo-400/30 px-3 py-1.5 rounded-2xl rounded-tr-none text-xs text-indigo-100 flex items-center gap-1.5">
              <Mic className="w-3 h-3 text-cyan-300 animate-pulse" />
              <span>{interimSpeech}</span>
            </div>
          )}

          {answerMarkdown ? (
            <div className="self-start max-w-[95%] bg-white/5 border border-white/10 px-3.5 py-2 rounded-2xl rounded-tl-none text-xs text-zinc-200">
              <RichMarkdown content={answerMarkdown} />
            </div>
          ) : !interimSpeech ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-2 text-zinc-400">
              <Sparkles className="w-5 h-5 text-cyan-400 mb-1 animate-pulse" />
              <p className="text-xs">Ask anything, search files, or dictate meeting notes.</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Say "Astra" or speak into your mic</p>
            </div>
          ) : null}
        </div>
      )}

      {/* Bottom Input Box (For OrbWithChat) */}
      {!isOrbOnly && (
        <div className="relative flex items-center gap-1.5 z-10 mt-auto">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Astra (అస్త్రం)..."
            className="flex-1 bg-white/10 border border-white/15 focus:border-cyan-400/60 rounded-full px-3.5 py-1.5 text-xs text-white placeholder-zinc-400 outline-none backdrop-blur-md transition-colors"
          />
          <button
            onClick={() => {
              if (inputText.trim()) {
                onSubmitQuery(inputText.trim());
                setInputText('');
              }
            }}
            className="w-7 h-7 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 flex items-center justify-center shadow-md transition-all shrink-0"
          >
            <Send className="w-3 h-3 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};
