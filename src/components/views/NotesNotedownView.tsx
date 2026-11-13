import React, { useState } from 'react';
import { usePillStore } from '../../store/usePillStore';
import { RichMarkdown } from '../RichMarkdown';
import {
  FileText,
  Download,
  Eye,
  Edit3,
  Mic,
  MicOff,
  Sparkles,
  Check,
} from 'lucide-react';

export const NotesNotedownView: React.FC = () => {
  const notesContent = usePillStore((s) => s.notesContent);
  const setNotesContent = usePillStore((s) => s.setNotesContent);

  const [isPreview, setIsPreview] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  const handleExportMarkdown = () => {
    const blob = new Blob([notesContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pill_Meeting_Notes_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2000);
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate/trigger loopback note generation
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setNotesContent(
        notesContent +
          `\n\n### [${timestamp}] Live Audio Transcription Note\n- Real-time discussion captured from system loopback.\n- Agreed on next iteration timeline for the fluid composition island.`
      );
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-1 text-white select-none overflow-hidden">
      {/* Top Header: Controls (Raw/Preview, Record Loopback, Export) */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-zinc-300">Notedown Studio</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-400 font-mono">
            Structured Markdown
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Recording Toggle */}
          <button
            onClick={handleToggleRecording}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              isRecording
                ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
            }`}
            title="Capture meeting loopback audio"
          >
            {isRecording ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            <span>{isRecording ? 'Listening...' : 'Record Audio'}</span>
          </button>

          {/* Raw / Preview Toggle */}
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 font-medium flex items-center gap-1"
          >
            {isPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isPreview ? 'Edit Raw' : 'Preview'}</span>
          </button>

          {/* Export .md */}
          <button
            onClick={handleExportMarkdown}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-medium flex items-center gap-1 transition-all"
            title="Download .md file"
          >
            {exportNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
            <span>{exportNotice ? 'Saved!' : 'Export .md'}</span>
          </button>
        </div>
      </div>

      {/* Editor / Preview Area */}
      <div className="flex-1 min-h-0 overflow-y-auto pill-scroll rounded-2xl bg-zinc-900/80 border border-white/10 p-3">
        {isPreview ? (
          <div className="text-zinc-200 text-xs">
            <RichMarkdown content={notesContent} />
          </div>
        ) : (
          <textarea
            value={notesContent}
            onChange={(e) => setNotesContent(e.target.value)}
            placeholder="Type meeting notes or record audio loopback..."
            className="w-full h-full bg-transparent text-xs font-mono text-zinc-200 placeholder-zinc-500 resize-none outline-none leading-relaxed"
          />
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 shrink-0">
        <span>Automatically saved to local storage</span>
        <span>{notesContent.length} characters · {notesContent.split('\n').length} lines</span>
      </div>
    </div>
  );
};
