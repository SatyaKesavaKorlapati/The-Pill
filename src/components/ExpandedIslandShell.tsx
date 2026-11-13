import React from 'react';
import { usePillStore } from '../store/usePillStore';
import { useTauriHardwareBridge } from '../hooks/useTauriHardwareBridge';
import { HomePlaygroundPage } from './views/HomePlaygroundPage';
import { ControlCenterView } from './views/ControlCenterView';
import { SmartClipboardView } from './views/SmartClipboardView';
import { NotesNotedownView } from './views/NotesNotedownView';
import { AssistCopilotView } from './views/AssistCopilotView';
import {
  Home,
  Sliders,
  ClipboardList,
  FileText,
  Sparkles,
  Settings,
  ChevronUp,
  LayoutGrid,
} from 'lucide-react';

interface ExpandedIslandShellProps {
  onCollapse: () => void;
}

export const ExpandedIslandShell: React.FC<ExpandedIslandShellProps> = ({ onCollapse }) => {
  const activeTab = usePillStore((s) => s.activeTab);
  const setActiveTab = usePillStore((s) => s.setActiveTab);
  const preferences = usePillStore((s) => s.preferences);
  const updatePreferences = usePillStore((s) => s.updatePreferences);

  const { openSettings } = useTauriHardwareBridge();

  const tabNames = preferences.customTabNames || {};
  const aiEnabled = preferences.aiEnabled !== false;
  const isPlaygroundEditing = preferences.isPlaygroundEditing;

  const tabs = [
    { id: 'home', label: tabNames.home || 'Home', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'controls', label: tabNames.controls || 'Controls', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'clipboard', label: tabNames.clipboard || 'Clipboard', icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { id: 'notes', label: tabNames.notes || 'Notes', icon: <FileText className="w-3.5 h-3.5" /> },
    ...(aiEnabled
      ? [{ id: 'ai', label: tabNames.ai || 'Search & AI', icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> }]
      : []),
    ...(preferences.customWidgetTabs || [])
      .filter((ct) => ct.enabled)
      .map((ct) => ({
        id: ct.id,
        label: ct.name,
        icon: <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />,
      })),
  ];

  return (
    <div className="relative w-[680px] h-[380px] p-3 rounded-[28px] bg-black/95 border border-white/15 text-white shadow-2xl backdrop-blur-3xl flex flex-col justify-between overflow-hidden select-none">
      {/* Top Persistent Navigation Bar */}
      <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-white/10 shrink-0">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Toolbar Controls: Playground Editor Toggle, Settings, Collapse */}
        <div className="flex items-center gap-1.5">
          {activeTab === 'home' && (
            <button
              onClick={() => updatePreferences({ isPlaygroundEditing: !isPlaygroundEditing })}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors ${
                isPlaygroundEditing
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
              }`}
              title="Edit Home Bento Grid Layout"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{isPlaygroundEditing ? 'Done' : 'Playground'}</span>
            </button>
          )}

          <button
            onClick={openSettings}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Open Settings Window"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onCollapse}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Collapse Pill"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Tab Content View */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'home' && <HomePlaygroundPage />}
        {activeTab === 'controls' && <ControlCenterView />}
        {activeTab === 'clipboard' && <SmartClipboardView />}
        {activeTab === 'notes' && <NotesNotedownView />}
        {activeTab === 'ai' && aiEnabled && <AssistCopilotView />}
        {activeTab.startsWith('custom_') && <HomePlaygroundPage />}
      </div>
    </div>
  );
};
