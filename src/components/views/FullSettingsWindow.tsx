import React, { useState, useEffect } from 'react';
import { usePillStore } from '../../store/usePillStore';
import { CustomWidgetTab, PillThemeMode } from '../../types/preferences';
import {
  Key,
  Shield,
  Bot,
  Layout,
  Palette,
  Minus,
  Square,
  X,
  Save,
  Trash2,
  Check,
  Plus,
  Lock,
} from 'lucide-react';

export const FullSettingsWindow: React.FC = () => {
  const preferences = usePillStore((s) => s.preferences);
  const updatePreferences = usePillStore((s) => s.updatePreferences);

  const [activeSection, setActiveSection] = useState<
    'ai' | 'privacy' | 'tabs' | 'theme'
  >('ai');

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newTabName, setNewTabName] = useState('');

  // Check DPAPI Vault status on mount
  useEffect(() => {
    (async () => {
      const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
      if (isTauri) {
        try {
          const { invoke } = await import('@tauri-apps/api/core');
          const hasKey = await invoke<boolean>('has_custom_api_key');
          setHasStoredKey(hasKey);
        } catch {}
      } else {
        setHasStoredKey(!!localStorage.getItem('pill_gemini_api_key_fallback'));
      }
    })();
  }, []);

  const handleSaveApiKey = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) return;

    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('save_custom_api_key', { plainApiKey: trimmed });
        setHasStoredKey(true);
        setApiKeyInput('');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      } catch (err) {
        alert(`Failed to save key: ${err}`);
      }
    } else {
      localStorage.setItem('pill_gemini_api_key_fallback', trimmed);
      setHasStoredKey(true);
      setApiKeyInput('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleClearApiKey = async () => {
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('clear_custom_api_key');
        setHasStoredKey(false);
      } catch {}
    } else {
      localStorage.removeItem('pill_gemini_api_key_fallback');
      setHasStoredKey(false);
    }
  };

  const handleAddCustomTab = () => {
    const trimmed = newTabName.trim();
    if (!trimmed) return;
    const newTab: CustomWidgetTab = {
      id: `custom_${Date.now()}`,
      name: trimmed,
      enabled: true,
      widgets: ['weather', 'notes'],
      widgetSizes: { weather: 'Small', notes: 'Small' },
    };
    updatePreferences({
      customWidgetTabs: [...(preferences.customWidgetTabs || []), newTab],
    });
    setNewTabName('');
  };

  const handleDeleteCustomTab = (id: string) => {
    updatePreferences({
      customWidgetTabs: (preferences.customWidgetTabs || []).filter((t) => t.id !== id),
    });
  };

  const handleClose = async () => {
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (isTauri) {
      const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow');
      getCurrentWebviewWindow().hide();
    } else {
      window.close();
    }
  };

  const handleMinimize = async () => {
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (isTauri) {
      const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow');
      getCurrentWebviewWindow().minimize();
    }
  };

  return (
    <div className="w-screen h-screen bg-[#0b0e14] text-white flex flex-col select-none overflow-hidden font-sans border border-white/10 rounded-2xl shadow-2xl">
      {/* Frameless Titlebar (Draggable) */}
      <div
        data-tauri-drag-region
        className="h-10 px-3 bg-zinc-950/80 border-b border-white/10 flex items-center justify-between shrink-0 cursor-default"
      >
        <div className="flex items-center gap-2 pointer-events-none">
          <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500" />
          <span className="text-xs font-bold tracking-wide text-zinc-300">
            Pill for Windows · Settings
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleMinimize}
            className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded hover:bg-red-500/20 flex items-center justify-center text-zinc-400 hover:text-red-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Settings Body */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar Navigation */}
        <div className="w-56 bg-zinc-950/50 border-r border-white/10 p-3 space-y-1 shrink-0">
          {[
            { id: 'ai', label: 'AI & Astra Vault', icon: <Bot className="w-4 h-4 text-cyan-400" /> },
            { id: 'privacy', label: 'Privacy & Cloaking', icon: <Shield className="w-4 h-4 text-emerald-400" /> },
            { id: 'tabs', label: 'Tab Manager', icon: <Layout className="w-4 h-4 text-indigo-400" /> },
            { id: 'theme', label: 'Appearance & Themes', icon: <Palette className="w-4 h-4 text-pink-400" /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Right Section Content */}
        <div className="flex-1 p-6 overflow-y-auto pill-scroll">
          {/* SECTION 1: AI & DPAPI KEY VAULT */}
          {activeSection === 'ai' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-cyan-400" />
                  Master AI & Gemini DPAPI Vault
                </h2>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Configure the master AI kill-switch and store your Gemini API key inside the Windows Data Protection API (DPAPI) vault.
                </p>
              </div>

              {/* Master AI Toggle */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Enable AI & Copilot Features</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Controls Search & AI tab, Alt+V shortcut, and wake-word listener.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.aiEnabled}
                  onChange={(e) => updatePreferences({ aiEnabled: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              {/* Wake Word Toggle */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Astra Voice Wake Word</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Listens for "Astra", "Astram", or "అస్త్రం" to summon the floating orb.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.astraWakeWordEnabled}
                  onChange={(e) => updatePreferences({ astraWakeWordEnabled: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              {/* Astra Display Mode */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Astra Display Mode</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Choose between minimal Orb-Only or expanded interactive Chat.
                  </div>
                </div>
                <select
                  value={preferences.astraMode}
                  onChange={(e) => updatePreferences({ astraMode: e.target.value as any })}
                  className="bg-black/60 border border-white/20 rounded-xl px-2.5 py-1 text-xs text-white outline-none"
                >
                  <option value="OrbWithChat">Orb With Chat (Default)</option>
                  <option value="OrbOnly">Orb Only (Minimal)</option>
                </select>
              </div>

              {/* DPAPI Key Vault Box */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Windows DPAPI Key Vault</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      hasStoredKey
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {hasStoredKey ? '● Key Encrypted' : '○ No Key Saved'}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                  Stored securely via CryptProtectData at:
                  <br />
                  <span className="text-cyan-400 text-[10px]">
                    %LocalAppData%\PillForWindows\astra_gemini_key.dpapi
                  </span>
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={hasStoredKey ? '••••••••••••••••••••••••' : 'Enter Gemini API Key...'}
                    className="flex-1 bg-black/60 border border-white/15 focus:border-cyan-400/60 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                  <button
                    onClick={handleSaveApiKey}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs flex items-center gap-1 transition-all"
                  >
                    {saveSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{saveSuccess ? 'Saved' : 'Save'}</span>
                  </button>
                  {hasStoredKey && (
                    <button
                      onClick={handleClearApiKey}
                      className="p-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
                      title="Clear API Key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: PRIVACY & CLOAKING */}
          {activeSection === 'privacy' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  OS Screen-Capture Privacy Mask
                </h2>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Uses Windows DWM <code className="text-cyan-300">SetWindowDisplayAffinity(0x11)</code> to completely hide Pill from screenshots, OBS, Discord, and Teams.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">
                    Screen-Capture Privacy Mask (WDA_EXCLUDEFROMCAPTURE)
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Renders window completely transparent to screen-recording apps.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.privacyMaskEnabled}
                  onChange={(e) => updatePreferences({ privacyMaskEnabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-400 rounded cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">
                    Public Collapsed HUD Passthrough
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Allow the mini collapsed capsule to be visible in screen recordings while keeping expanded windows cloaked.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.privacyPublicPassthroughHud}
                  onChange={(e) => updatePreferences({ privacyPublicPassthroughHud: e.target.checked })}
                  className="w-4 h-4 accent-emerald-400 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* SECTION 3: TAB MANAGER */}
          {activeSection === 'tabs' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layout className="w-5 h-5 text-indigo-400" />
                  Tab Renaming & Custom Pages
                </h2>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Customize the names of default island tabs and add bespoke Bento widget pages.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-300">Rename Default Tabs</span>
                {['home', 'controls', 'clipboard', 'notes', 'ai'].map((tabKey) => (
                  <div
                    key={tabKey}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10"
                  >
                    <span className="text-xs font-mono uppercase text-zinc-400">{tabKey}</span>
                    <input
                      type="text"
                      value={preferences.customTabNames?.[tabKey] || ''}
                      onChange={(e) =>
                        updatePreferences({
                          customTabNames: {
                            ...preferences.customTabNames,
                            [tabKey]: e.target.value,
                          },
                        })
                      }
                      className="bg-black/50 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white outline-none w-48"
                    />
                  </div>
                ))}
              </div>

              {/* Custom Tabs List */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-zinc-300">Custom Widget Tabs</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTabName}
                    onChange={(e) => setNewTabName(e.target.value)}
                    placeholder="New Tab Name (e.g., Work Studio)..."
                    className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                  <button
                    onClick={handleAddCustomTab}
                    className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Tab
                  </button>
                </div>

                <div className="space-y-2">
                  {(preferences.customWidgetTabs || []).map((ct) => (
                    <div
                      key={ct.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10"
                    >
                      <span className="text-xs font-medium text-white">{ct.name}</span>
                      <button
                        onClick={() => handleDeleteCustomTab(ct.id)}
                        className="p-1 rounded text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: THEMES */}
          {activeSection === 'theme' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-pink-400" />
                  Appearance & Themes
                </h2>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Switch themes seamlessly across all widgets, controls, and flyouts.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'desktop', title: 'Desktop Dark', desc: 'Obsidian & Cyan Fluent Glow' },
                  { id: 'cyberpunk', title: 'Cyberpunk', desc: 'Neon Laser & Yellow Accents' },
                  { id: 'paper', title: 'Paper Editorial', desc: 'Warm Archival Sumi Ink' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => updatePreferences({ theme: th.id as PillThemeMode })}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      preferences.theme === th.id
                        ? 'bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border-cyan-400 text-white shadow-lg'
                        : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{th.title}</div>
                    <div className="text-[10px] text-zinc-400 mt-1">{th.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
