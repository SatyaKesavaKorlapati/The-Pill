import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArchitectureAndSourceView } from './components/ArchitectureAndSourceView';
import { DesktopStudioDock } from './components/DesktopStudioDock';
import { PillCapsule } from './components/PillCapsule';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FullSettingsView } from './components/FullSettingsView';
import { PillAppLogo } from './components/PillAppLogo';
import { AstraWakeWordDaemon } from './components/VoiceAgentOverlay';
import {
  CALLER_AVATAR_URL,
  DEFAULT_PREFERENCES,
  DEMO_AGENT_PROMPTS,
  DEMO_TRACKS,
  DESKTOP_WALLPAPER_URL,
  INITIAL_CLIPBOARD_ITEMS,
  INITIAL_REMINDERS,
  INITIAL_SYSTEM_STATE,
  INITIAL_TRAY_FILES,
} from './data/demoData';
import { WINUI_NATIVE_FILES } from './data/winuiProjectFiles';
import {
  AgentApprovalRequest,
  AudioOutputDevice,
  BuiltinLedgeTab,
  ClipboardItem,
  IncomingCallSession,
  LedgePreferences,
  LedgeTab,
  ReminderTask,
  TransientHudKind,
  TrayFileItem,
  VoiceAgentAction,
  WindowsSystemState,
  WorkspacePage,
} from './types/ledge';
import { configureSoundEngine, playTactilePop } from './utils/audioSynth';
import { isTabEnabledInPrefs, matchesShortcutCombo } from './utils/customizationLogic';
import { SPRING_PRESETS } from './utils/springPhysics';
import { COMPLETE_STYLE_KITS } from './utils/themeAndSliders';
import { createZipArchive } from './utils/zipBuilder';

const NOTES_STORAGE_KEY = 'dynamic_ledge_win_notes_v1';
const PREFS_STORAGE_KEY = 'pill_win_prefs_v5';

export default function App() {
  const [activePage, setActivePage] = useState<WorkspacePage>(WorkspacePage.Simulator);
  const [preferences, setPreferences] = useState<LedgePreferences>(() => {
    try {
      const raw = localStorage.getItem(PREFS_STORAGE_KEY);
      if (!raw) return DEFAULT_PREFERENCES;
      const parsed = JSON.parse(raw) as Partial<LedgePreferences>;
      const homeWidgets =
        parsed.homeWidgets && parsed.homeWidgets.length >= 4
          ? parsed.homeWidgets
          : DEFAULT_PREFERENCES.homeWidgets;
      const springPreset = parsed.springPreset ?? DEFAULT_PREFERENCES.springPreset;
      const customSpring = SPRING_PRESETS[springPreset] ?? DEFAULT_PREFERENCES.customSpring;
      return {
        ...DEFAULT_PREFERENCES,
        ...parsed,
        stealthAutoHide: true,
        revealOnEdgeTouch: true,
        homeWidgets,
        springPreset,
        customSpring,
        enabledTabs: { ...DEFAULT_PREFERENCES.enabledTabs, ...(parsed.enabledTabs ?? {}) },
        customTabNames: { ...DEFAULT_PREFERENCES.customTabNames, ...(parsed.customTabNames ?? {}) },
        widgetSizes: { ...DEFAULT_PREFERENCES.widgetSizes, ...(parsed.widgetSizes ?? {}) },
        controlTileSizes: {
          ...DEFAULT_PREFERENCES.controlTileSizes,
          ...(parsed.controlTileSizes ?? {}),
        },
        featureFlags: { ...DEFAULT_PREFERENCES.featureFlags, ...(parsed.featureFlags ?? {}) },
        enabledAgents: { ...DEFAULT_PREFERENCES.enabledAgents, ...(parsed.enabledAgents ?? {}) },
      };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  // Dynamic Island Core State
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<LedgeTab>('home');
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [stealthRevealedByShortcut, setStealthRevealedByShortcut] = useState(false);
  const [isVoiceAgentOpen, setIsVoiceAgentOpen] = useState(false);

  // Media Player State
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [trackProgressSec, setTrackProgressSec] = useState(48);
  const [audioDevice, setAudioDevice] = useState<AudioOutputDevice>('Surface Studio Speakers');

  // Secondary Live Activity: Countdown Timer
  const [timerRemainingSec, setTimerRemainingSec] = useState<number | null>(285);
  const [timerTotalSec, setTimerTotalSec] = useState<number>(300);

  // Windows System & Power Telemetry State
  const [systemState, setSystemState] = useState<WindowsSystemState>(INITIAL_SYSTEM_STATE);

  // Transient System HUD Morphs
  const [transientHud, setTransientHud] = useState<TransientHudKind>('none');
  const [volumeLevel, setVolumeLevel] = useState(72);
  const [brightnessLevel, setBrightnessLevel] = useState(86);
  const [callSession, setCallSession] = useState<IncomingCallSession | null>(null);
  const [agentRequest, setAgentRequest] = useState<AgentApprovalRequest | null>(null);
  const agentPromptCursorRef = useRef(0);
  const hudTimeoutRef = useRef<number | null>(null);

  // Quick Windows Controls
  const [keepAwake, setKeepAwake] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [nightLight, setNightLight] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Productivity Data: Tray, Universal A–Z Clipboard, Notes, Reminders
  const [trayFiles, setTrayFiles] = useState<TrayFileItem[]>(INITIAL_TRAY_FILES);
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>(INITIAL_CLIPBOARD_ITEMS);
  const [reminders, setReminders] = useState<ReminderTask[]>(INITIAL_REMINDERS);
  const [noteContent, setNoteContent] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(NOTES_STORAGE_KEY);
      return (
        saved ??
        '# WinUI 3 Pill Checklist\n\n> Keep idle working set < 13 MB with `SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE)` active.\n\n## Key Points\n- Verify 60fps 3D Siri Silk-Ribbon Sphere inside morphed Pill\n- Test `Notedown` live voice/call Markdown notes & `Assist` live Q&A'
      );
    } catch {
      return '';
    }
  });

  const [wallpaperError, setWallpaperError] = useState(false);

  const currentTrack = DEMO_TRACKS[trackIndex] ?? DEMO_TRACKS[0];

  // Sync sound engine profile & volume + persist preferences
  useEffect(() => {
    configureSoundEngine(preferences.soundProfile, preferences.soundVolume);
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Ignore quota
    }
  }, [preferences]);

  // Ensure activeTab is always an enabled built-in or custom widget tab
  useEffect(() => {
    if (!isTabEnabledInPrefs(activeTab, preferences)) {
      const firstEnabled =
        preferences.tabOrder.find((t) => isTabEnabledInPrefs(t, preferences)) ?? 'home';
      setActiveTab(firstEnabled);
    }
  }, [
    preferences.enabledTabs,
    preferences.tabOrder,
    preferences.customWidgetTabs,
    preferences.aiEnabled,
    activeTab,
  ]);

  const showTransientToast = useCallback((message: string) => {
    setStatusBanner(message);
    window.setTimeout(() => {
      setStatusBanner((curr) => (curr === message ? null : curr));
    }, 2400);
  }, []);

  const updatePreferences = useCallback((patch: Partial<LedgePreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
        import('@tauri-apps/api/core').then(({ invoke }) => {
          const payloadStr = JSON.stringify(next);
          invoke('broadcast_preferences_sync', {
            preferencesJson: payloadStr,
            preferences_json: payloadStr,
            prefs_json: payloadStr,
          }).catch(() => {});
        }).catch(() => {});
      }
      return next;
    });
  }, []);

  // Listen for storage event across browser / Webview tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PREFS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setPreferences((prev) => ({ ...prev, ...parsed }));
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const updateSystemState = useCallback((patch: Partial<WindowsSystemState>) => {
    setSystemState((prev) => ({ ...prev, ...patch }));
  }, []);

  const summonAstraInPill = useCallback(() => {
    if (!preferences.aiEnabled) {
      showTransientToast('Astra & AI features are disabled in Settings');
      return;
    }
    setActivePage(WorkspacePage.Simulator);
    setTransientHud('none');
    setIsExpanded(false);
    setIsVoiceAgentOpen(true);
    playTactilePop('expand');
  }, [preferences.aiEnabled, showTransientToast]);

  const executeVoiceAgentActions = useCallback(
    (actions: VoiceAgentAction[]) => {
      if (!actions || actions.length === 0) return;
      const summaries: string[] = [];

      for (const action of actions) {
        const args = action.args ?? {};
        switch (action.name) {
          case 'setWindowsToggle': {
            const setting = String(args.setting || '').toLowerCase();
            const enabled = Boolean(args.enabled);
            if (setting === 'wifi') {
              setSystemState((p) => ({ ...p, wifiEnabled: enabled }));
            } else if (setting === 'bluetooth') {
              setSystemState((p) => ({ ...p, bluetoothEnabled: enabled }));
            } else if (setting === 'airplane') {
              setSystemState((p) => ({
                ...p,
                airplaneMode: enabled,
                wifiEnabled: enabled ? false : p.wifiEnabled,
                bluetoothEnabled: enabled ? false : p.bluetoothEnabled,
              }));
            } else if (setting === 'nightlight') {
              setNightLight(enabled);
            } else if (setting === 'saver') {
              setSystemState((p) => ({ ...p, batterySaver: enabled }));
            } else if (setting === 'captions') {
              setSystemState((p) => ({ ...p, liveCaptions: enabled }));
            } else if (setting === 'hotspot') {
              setSystemState((p) => ({ ...p, hotspotEnabled: enabled }));
            } else if (setting === 'dnd') {
              setSystemState((p) => ({ ...p, dndEnabled: enabled }));
            } else if (setting === 'mic') {
              setMicMuted(!enabled);
            } else if (setting === 'awake') {
              setKeepAwake(enabled);
            } else if (setting === 'spatial') {
              setSystemState((p) => ({ ...p, spatialAudio: enabled }));
            } else if (setting === 'privacy') {
              setPreferences((p) => ({ ...p, privacyMaskEnabled: enabled }));
            }
            summaries.push(action.summary || `${setting} ${enabled ? 'On' : 'Off'}`);
            break;
          }
          case 'setSystemLevel': {
            const target = String(args.target || '').toLowerCase();
            const level = Math.max(0, Math.min(100, Math.round(Number(args.level ?? 50))));
            if (target === 'volume') setVolumeLevel(level);
            if (target === 'brightness') setBrightnessLevel(level);
            summaries.push(action.summary || `${target} ${level}%`);
            break;
          }
          case 'controlMedia': {
            const cmd = String(args.command || '').toLowerCase();
            if (cmd === 'play') setIsPlaying(true);
            else if (cmd === 'pause') setIsPlaying(false);
            else if (cmd === 'next') {
              setTrackIndex((idx) => (idx + 1) % DEMO_TRACKS.length);
              setTrackProgressSec(0);
            } else if (cmd === 'previous') {
              setTrackIndex((idx) => (idx - 1 + DEMO_TRACKS.length) % DEMO_TRACKS.length);
              setTrackProgressSec(0);
            }
            summaries.push(action.summary || `Media: ${cmd}`);
            break;
          }
          case 'manageTimer': {
            const timerAct = String(args.action || '').toLowerCase();
            if (timerAct === 'cancel') {
              setTimerRemainingSec(null);
            } else {
              const sec = Math.max(10, Math.round(Number(args.seconds ?? 300)));
              setTimerTotalSec(sec);
              setTimerRemainingSec(sec);
            }
            summaries.push(action.summary || `Timer ${timerAct}`);
            break;
          }
          case 'applyStyleKit': {
            const kitId = String(args.kitId || '');
            const kit = COMPLETE_STYLE_KITS.find((k) => k.id === kitId);
            if (kit) {
              setPreferences((prev) => ({
                ...prev,
                themeId: kit.themeId,
                musicSliderStyle: kit.musicSliderStyle,
                controlSliderStyle: kit.controlSliderStyle,
                tileSurfaceStyle: kit.tileSurfaceStyle,
                iconPack: kit.iconPack,
                innerCapsuleRadius: kit.innerCapsuleRadius,
                edgeLightProfile: kit.edgeLightProfile,
                soundProfile: kit.soundProfile,
                featureFlags: {
                  ...prev.featureFlags,
                  edgeLighting: kit.edgeLightProfile !== 'off',
                },
              }));
              summaries.push(action.summary || `Style Kit: ${kit.title}`);
            }
            break;
          }
          case 'openIslandView': {
            const view = String(args.view || 'home') as LedgeTab | 'settings';
            setIsVoiceAgentOpen(false);
            if (view === 'settings') {
              setIsExpanded(false);
              setActivePage(WorkspacePage.Settings);
            } else {
              setActivePage(WorkspacePage.Simulator);
              setIsLauncherOpen(false);
              setActiveTab(view);
              setIsExpanded(true);
            }
            summaries.push(action.summary || `Opened ${view}`);
            break;
          }
          case 'addQuickNoteOrReminder': {
            const kind = String(args.kind || 'note');
            const text = String(args.text || '').trim();
            if (text) {
              if (kind === 'reminder') {
                setReminders((prev) => [
                  { id: `rem-${Date.now()}`, title: text, dueTime: 'Today', completed: false },
                  ...prev,
                ]);
              } else {
                setNoteContent((prev) => (prev ? `${prev}\n- ${text}` : `- ${text}`));
              }
              summaries.push(action.summary || `Saved ${kind}`);
            }
            break;
          }
          default:
            break;
        }
      }

      if (summaries.length > 0) {
        playTactilePop('confirm');
        showTransientToast(`Astra executed: ${summaries.join(' · ')}`);
      }
    },
    [showTransientToast]
  );

  // Global Keyboard Shortcut Listener: Alt+L (Summon Island) & Alt+V (Morph Pill into Astra)
  useEffect(() => {
    const onGlobalKeyDown = (e: KeyboardEvent) => {
      const targetEl = e.target as HTMLElement | null;
      const isTextInput =
        targetEl &&
        (targetEl.tagName === 'INPUT' ||
          targetEl.tagName === 'TEXTAREA' ||
          targetEl.isContentEditable);
      if (isTextInput && !e.altKey && !e.ctrlKey && !e.metaKey) {
        return;
      }

      if (matchesShortcutCombo(e, preferences.voiceAgentShortcut)) {
        e.preventDefault();
        if (!preferences.aiEnabled) {
          showTransientToast('Astra & AI features are disabled in Settings');
          return;
        }
        setActivePage(WorkspacePage.Simulator);
        setIsExpanded(false);
        setIsVoiceAgentOpen((prev) => {
          const next = !prev;
          playTactilePop(next ? 'expand' : 'collapse');
          return next;
        });
        return;
      }

      if (matchesShortcutCombo(e, preferences.toggleShortcut)) {
        e.preventDefault();
        setActivePage(WorkspacePage.Simulator);
        setStealthRevealedByShortcut(true);
        setIsVoiceAgentOpen(false);
        setIsExpanded((prev) => {
          const next = !prev;
          playTactilePop(next ? 'expand' : 'collapse');
          if (!next) {
            window.setTimeout(() => setStealthRevealedByShortcut(false), 1800);
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', onGlobalKeyDown);
    return () => window.removeEventListener('keydown', onGlobalKeyDown);
  }, [
    preferences.toggleShortcut,
    preferences.voiceAgentShortcut,
    preferences.aiEnabled,
    showTransientToast,
  ]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, noteContent);
    } catch {
      // Ignore
    }
  }, [noteContent]);

  // 1Hz Media, Timer, Call & Subtle System Telemetry Ticker
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (isPlaying && preferences.featureFlags.nowPlaying) {
        setTrackProgressSec((prev) => {
          if (prev + 1 >= currentTrack.durationSec) {
            setTrackIndex((idx) => (idx + 1) % DEMO_TRACKS.length);
            return 0;
          }
          return prev + 1;
        });
      }

      setTimerRemainingSec((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          playTactilePop('notification');
          return null;
        }
        return prev - 1;
      });

      setCallSession((prev) => {
        if (!prev || !prev.isAccepted) return prev;
        return { ...prev, elapsedSec: prev.elapsedSec + 1 };
      });

      setSystemState((prev) => {
        const nextDown = prev.wifiEnabled
          ? Number(
              Math.max(18.0, Math.min(480.0, prev.netDownMbps + (Math.random() - 0.48) * 22)).toFixed(1)
            )
          : 0;
        const nextUp = prev.wifiEnabled
          ? Number(
              Math.max(8.0, Math.min(180.0, prev.netUpMbps + (Math.random() - 0.48) * 9)).toFixed(1)
            )
          : 0;
        return {
          ...prev,
          cpuUsagePct: Number(
            Math.max(2.1, Math.min(24.0, prev.cpuUsagePct + (Math.random() - 0.5) * 1.4)).toFixed(1)
          ),
          netDownMbps: nextDown,
          netUpMbps: nextUp,
          netPeakDownMbps: Math.max(prev.netPeakDownMbps, nextDown),
          sessionDownGb: Number((prev.sessionDownGb + nextDown / 8000 / 8).toFixed(2)),
          netHistoryDown: [...prev.netHistoryDown.slice(-23), nextDown],
          netHistoryUp: [...prev.netHistoryUp.slice(-23), nextUp],
        };
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isPlaying, currentTrack.durationSec, preferences.featureFlags.nowPlaying]);

  const clearAutoHudTimer = () => {
    if (hudTimeoutRef.current !== null) {
      window.clearTimeout(hudTimeoutRef.current);
      hudTimeoutRef.current = null;
    }
  };

  const triggerSystemHud = (kind: 'volume' | 'brightness' | 'battery' | 'download') => {
    if (
      (kind === 'volume' || kind === 'brightness') &&
      !preferences.featureFlags.systemHuds
    ) {
      showTransientToast('System HUDs are currently disabled in Settings');
      return;
    }
    if (kind === 'battery' && !preferences.featureFlags.chargingEtaHud) {
      showTransientToast('Charging ETA HUD is disabled in Settings');
      return;
    }
    clearAutoHudTimer();
    setIsExpanded(false);
    setIsVoiceAgentOpen(false);
    setTransientHud(kind);
    playTactilePop('notification');
    hudTimeoutRef.current = window.setTimeout(() => {
      setTransientHud((curr) => (curr === kind ? 'none' : curr));
    }, 3400);
  };

  const triggerIncomingCall = () => {
    clearAutoHudTimer();
    if (transientHud === 'call') {
      setTransientHud('none');
      setCallSession(null);
      return;
    }
    setIsExpanded(false);
    setIsVoiceAgentOpen(false);
    setCallSession({
      callerName: 'Elena Rostova',
      appSource: 'Microsoft Teams',
      avatarUrl: CALLER_AVATAR_URL,
      isAccepted: false,
      isMuted: false,
      elapsedSec: 0,
    });
    setTransientHud('call');
    playTactilePop('notification');
  };

  const triggerAgentApproval = () => {
    if (!preferences.featureFlags.codingAgents) {
      showTransientToast('Coding Assistant Pipe is disabled in Settings');
      return;
    }
    clearAutoHudTimer();
    if (transientHud === 'agent') {
      setTransientHud('none');
      setAgentRequest(null);
      return;
    }
    setIsExpanded(false);
    setIsVoiceAgentOpen(false);
    const nextPrompt =
      DEMO_AGENT_PROMPTS[agentPromptCursorRef.current % DEMO_AGENT_PROMPTS.length];
    agentPromptCursorRef.current += 1;
    setAgentRequest(nextPrompt);
    setTransientHud('agent');
    playTactilePop('notification');
  };

  const handleDownloadWinUIZip = () => {
    const zipBytes = createZipArchive([
      ...WINUI_NATIVE_FILES.map((f) => ({ path: f.path, content: f.content })),
    ]);
    const blob = new Blob([zipBytes], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'Pill-WinUI3-NativeAOT.zip';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    playTactilePop('confirm');
    showTransientToast('Downloaded Pill-WinUI3-NativeAOT.zip (Complete C# WinUI 3 + v3 Delta)');
  };

  // Two-window routing support for Tauri & Web Preview
  const [isSettingsWindow, setIsSettingsWindow] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.search.includes('settings') ||
      window.location.hash.includes('settings')
    );
  });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Tauri hardware bridge integration
  useEffect(() => {
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (isTauri) {
      import('@tauri-apps/api/webviewWindow').then(({ getCurrentWebviewWindow }) => {
        try {
          const current = getCurrentWebviewWindow();
          if (current.label === 'settings-window') {
            setIsSettingsWindow(true);
          }
        } catch {}
      });
    }
    if (!isTauri) return;

    let unlistenList: Array<() => void> = [];
    (async () => {
      try {
        const { listen } = await import('@tauri-apps/api/event');
        const { invoke } = await import('@tauri-apps/api/core');

        // Alt+L: Toggle Island expand/collapse
        const u1 = await listen('pill://hotkey-toggle-pill', () => {
          setIsExpanded((prev) => !prev);
        });
        unlistenList.push(u1);

        // Alt+V: Summon Astra Voice Orb
        const u2 = await listen('pill://hotkey-summon-astra', () => {
          summonAstraInPill();
        });
        unlistenList.push(u2);

        // Bezel hover: drop the smaller compact pill (then click to expand full studio)
        const u3 = await listen('pill://top-edge-hover', () => {
          setStealthRevealedByShortcut(true);
        });
        unlistenList.push(u3);

        // Global outside click: collapse expanded pill when clicking elsewhere on desktop
        const uOutside = await listen('pill://outside-click', () => {
          setIsExpanded((expanded) => {
            if (expanded) {
              playTactilePop('collapse');
              setStealthRevealedByShortcut(false);
            }
            return false;
          });
        });
        unlistenList.push(uOutside);

        // Cross-window preferences sync broadcast
        const uPrefs = await listen<string>('pill://preferences-updated', (event) => {
          try {
            const parsed = JSON.parse(event.payload) as Partial<LedgePreferences>;
            setPreferences((prev) => ({ ...prev, ...parsed }));
          } catch {}
        });
        unlistenList.push(uPrefs);

        // Clipboard Item Added
        const u4 = await listen<any>('pill://clipboard-item-added', (event) => {
          if (event.payload) {
            setClipboardItems((prev) => [
              {
                id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                title: event.payload.text?.slice(0, 48) || 'Clipboard Item',
                content: event.payload.text || '',
                category: event.payload.category || 'text',
                copiedAt: 'Just now',
                pinned: false,
                byteSize: event.payload.file_size_label || `${event.payload.text?.length || 0} B`,
              },
              ...prev,
            ]);
          }
        });
        unlistenList.push(u4);

        // Privacy cloak sync
        await invoke('apply_privacy_cloak', {
          privacyMaskEnabled: preferences.privacyMaskEnabled,
          publicPassthroughHud: preferences.privacyPublicPassthroughHud,
          isCollapsedPublicHudOnly: !isExpanded && !isVoiceAgentOpen,
        }).catch(() => {});
      } catch {}
    })();

    return () => {
      unlistenList.forEach((un) => un());
    };
  }, [preferences.privacyMaskEnabled, preferences.privacyPublicPassthroughHud, isExpanded, isVoiceAgentOpen, summonAstraInPill]);

  // Standalone Settings Window Mode
  if (isSettingsWindow || isSettingsModalOpen) {
    return (
      <div className="w-full h-full min-h-screen bg-[#090b10] text-slate-100 flex flex-col overflow-hidden select-none">
        <ErrorBoundary fallbackTitle="Settings Error" onReset={() => updatePreferences({ ...DEFAULT_PREFERENCES })}>
          <FullSettingsView
            preferences={preferences}
            onUpdatePreferences={updatePreferences}
            onBackToSimulator={() => {
              if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
                import('@tauri-apps/api/core').then(({ invoke }) => {
                  invoke('close_settings_window').catch(() => {});
                });
              } else {
                setIsSettingsModalOpen(false);
              }
            }}
          />
        </ErrorBoundary>
      </div>
    );
  }

  // Production Main Pill Window Mode (Transparent Top-Center Overlay)
  return (
    <div
      onClick={() => {
        if (isVoiceAgentOpen) {
          setIsVoiceAgentOpen(false);
          playTactilePop('collapse');
          window.setTimeout(() => playTactilePop('collapse', preferences.soundProfile), 130);
        } else if (isExpanded) {
          setIsExpanded(false);
          setStealthRevealedByShortcut(false);
          playTactilePop('collapse');
        } else if (stealthRevealedByShortcut) {
          setStealthRevealedByShortcut(false);
          playTactilePop('collapse');
        }
      }}
      className="relative w-screen h-screen flex flex-col items-center justify-start pointer-events-none select-none overflow-hidden bg-transparent pt-0"
    >
      <PillCapsule
        isExpanded={isExpanded}
        onExpand={(tab) => {
          clearAutoHudTimer();
          setTransientHud('none');
          setIsVoiceAgentOpen(false);
          if (tab) {
            setIsLauncherOpen(false);
            if (isTabEnabledInPrefs(tab, preferences)) {
              setActiveTab(tab);
            }
          }
          setIsExpanded(true);
        }}
        onCollapse={() => {
          if (!isExpanded && !isVoiceAgentOpen) return;
          setIsExpanded(false);
          setStealthRevealedByShortcut(false);
          playTactilePop('collapse');
        }}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        isLauncherOpen={isLauncherOpen}
        onToggleLauncher={() => setIsLauncherOpen((v) => !v)}
        onOpenFullSettings={() => {
          setIsExpanded(false);
          setStealthRevealedByShortcut(false);
          playTactilePop('collapse');
          if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
            import('@tauri-apps/api/core').then(({ invoke }) => {
              invoke('open_settings_window').catch(() => {});
            });
          } else {
            setIsSettingsModalOpen(true);
          }
        }}
        isAstraOpen={isVoiceAgentOpen}
        onOpenVoiceAgent={summonAstraInPill}
        onCloseVoiceAgent={() => {
          playTactilePop('collapse');
          window.setTimeout(() => playTactilePop('collapse', preferences.soundProfile), 130);
          setIsVoiceAgentOpen(false);
        }}
        onExecuteAgentActions={executeVoiceAgentActions}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        trackProgressSec={trackProgressSec}
        onTogglePlay={() => setIsPlaying((v) => !v)}
        onPrevTrack={() => {
          setTrackIndex((idx) => (idx - 1 + DEMO_TRACKS.length) % DEMO_TRACKS.length);
          setTrackProgressSec(0);
        }}
        onNextTrack={() => {
          setTrackIndex((idx) => (idx + 1) % DEMO_TRACKS.length);
          setTrackProgressSec(0);
        }}
        onSeekTrack={(sec) => setTrackProgressSec(sec)}
        audioDevice={audioDevice}
        onChangeAudioDevice={(dev) => {
          setAudioDevice(dev);
          showTransientToast(`Audio routed to ${dev}`);
        }}
        timerRemainingSec={timerRemainingSec}
        timerTotalSec={timerTotalSec}
        onStartTimer={(seconds) => {
          setTimerTotalSec(seconds);
          setTimerRemainingSec(seconds);
        }}
        onCancelTimer={() => setTimerRemainingSec(null)}
        systemState={systemState}
        onUpdateSystemState={updateSystemState}
        transientHud={transientHud}
        volumeLevel={volumeLevel}
        onChangeVolume={(val) => setVolumeLevel(val)}
        brightnessLevel={brightnessLevel}
        onChangeBrightness={(val) => setBrightnessLevel(val)}
        callSession={callSession}
        onAcceptCall={() => {
          setCallSession((prev) => (prev ? { ...prev, isAccepted: true } : null));
          playTactilePop('confirm');
        }}
        onToggleCallMute={() => {
          setCallSession((prev) =>
            prev ? { ...prev, isMuted: !prev.isMuted } : null
          );
        }}
        onEndCall={() => {
          setCallSession(null);
          setTransientHud('none');
          playTactilePop('collapse');
        }}
        agentRequest={agentRequest}
        onResolveAgentRequest={(approved) => {
          const agentName = agentRequest?.agentName ?? 'Agent';
          setAgentRequest(null);
          setTransientHud('none');
          playTactilePop(approved ? 'confirm' : 'collapse');
          showTransientToast(
            approved
              ? `Allowed ${agentName} command via local pipe`
              : `Denied ${agentName} command`
          );
        }}
        keepAwake={keepAwake}
        onToggleKeepAwake={() => {
          setKeepAwake((v) => {
            const next = !v;
            showTransientToast(
              next ? 'Keep Awake active (ES_DISPLAY_REQUIRED)' : 'Keep Awake disabled'
            );
            return next;
          });
        }}
        micMuted={micMuted}
        onToggleMicMuted={() => setMicMuted((v) => !v)}
        nightLight={nightLight}
        onToggleNightLight={() => setNightLight((v) => !v)}
        onTriggerQuickActionToast={showTransientToast}
        trayFiles={trayFiles}
        onAddTrayFiles={(incoming) =>
          setTrayFiles((prev) => [...incoming, ...prev].slice(0, 18))
        }
        onTogglePinTrayFile={(id) =>
          setTrayFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, pinned: !f.pinned } : f))
          )
        }
        onRemoveTrayFile={(id) =>
          setTrayFiles((prev) => prev.filter((f) => f.id !== id))
        }
        onClearUnpinnedTray={() =>
          setTrayFiles((prev) => prev.filter((f) => f.pinned))
        }
        onRestoreSampleTray={() => setTrayFiles(INITIAL_TRAY_FILES)}
        clipboardItems={clipboardItems}
        onAddClipboardItem={(item) =>
          setClipboardItems((prev) =>
            [
              {
                ...item,
                id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                copiedAt: 'Just now',
                pinned: false,
              },
              ...prev,
            ].slice(0, 30)
          )
        }
        onTogglePinClip={(id) =>
          setClipboardItems((prev) =>
            prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
          )
        }
        onRemoveClipboardItem={(id) =>
          setClipboardItems((prev) => prev.filter((c) => c.id !== id))
        }
        onClearUnpinnedClips={() =>
          setClipboardItems((prev) => prev.filter((c) => c.pinned))
        }
        noteContent={noteContent}
        onChangeNoteContent={setNoteContent}
        reminders={reminders}
        onToggleReminder={(id) =>
          setReminders((prev) =>
            prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
          )
        }
        onAddReminder={(title) =>
          setReminders((prev) => [
            {
              id: `rem-${Date.now()}`,
              title,
              dueTime: 'Today',
              completed: false,
            },
            ...prev,
          ])
        }
        preferences={preferences}
        onUpdatePreferences={updatePreferences}
        stealthRevealedByShortcut={stealthRevealedByShortcut}
      />

      {/* Transient Status Toast */}
      {statusBanner && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-24 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-white/15 text-xs text-slate-100 shadow-lg pointer-events-none"
        >
          {statusBanner}
        </div>
      )}

      {/* Zero-UI Wake-Word Listener ("Astra" / "Astram" / "అస్త్రం") */}
      <AstraWakeWordDaemon
        isAstraOpen={isVoiceAgentOpen}
        aiEnabled={preferences.aiEnabled}
        wakeWordEnabled={preferences.astraWakeWordEnabled}
        onSummonAstra={summonAstraInPill}
      />
    </div>
  );
}
