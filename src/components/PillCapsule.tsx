import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Coffee,
  Download,
  Eye,
  EyeOff,
  FolderDown,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  ShieldCheck,
  Sparkles,
  Sun,
  Terminal,
  Timer,
  Volume2,
  Zap,
} from 'lucide-react';
import {
  AgentApprovalRequest,
  AppearanceMaterial,
  AudioOutputDevice,
  ClipboardItem,
  EdgeLightProfile,
  IncomingCallSession,
  LedgePreferences,
  LedgeTab,
  MusicTrack,
  ReminderTask,
  TransientHudKind,
  TrayFileItem,
  VoiceAgentAction,
  WindowsSystemState,
} from '../types/ledge';
import { formatDurationClock, playTactilePop } from '../utils/audioSynth';
import { computeBatteryEta } from '../utils/customizationLogic';
import {
  computeLiquidDeformation,
  isSpringAtRest,
  LedgeAnchorPosition,
  LedgeShapeStyle,
  resolveLedgeGeometry,
  SpringState1D,
  stepSpring1D,
} from '../utils/springPhysics';
import { resolveEdgeGlowCss, resolveThemePalette } from '../utils/themeAndSliders';
import { AnimatedBatterySymbol } from './AnimatedBatterySymbol';
import { FluidEffectSlider } from './FluidEffectSlider';
import { ThemedIcon } from './ThemedIcon';
import { FluidMusicVisualizer } from './FluidMusicVisualizer';
import { PillExpandedContent } from './PillExpandedContent';
import { ResilientThumb } from './ResilientThumb';
import { InPillAstraPanel } from './VoiceAgentOverlay';

export interface PillCapsuleProps {
  isExpanded: boolean;
  onExpand: (tab?: LedgeTab) => void;
  onCollapse: () => void;
  activeTab: LedgeTab;
  onSelectTab: (tab: LedgeTab) => void;
  isLauncherOpen: boolean;
  onToggleLauncher: () => void;
  onOpenFullSettings: () => void;
  isAstraOpen: boolean;
  onOpenVoiceAgent: () => void;
  onCloseVoiceAgent: () => void;
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
  onChangeAudioDevice: (dev: AudioOutputDevice) => void;

  // Secondary Live Activity (Timer / Keep Awake)
  timerRemainingSec: number | null;
  timerTotalSec: number;
  onStartTimer: (sec: number) => void;
  onCancelTimer: () => void;

  // System & Control Center
  systemState: WindowsSystemState;
  onUpdateSystemState: (patch: Partial<WindowsSystemState>) => void;

  // Transient HUDs
  transientHud: TransientHudKind;
  volumeLevel: number;
  onChangeVolume: (val: number) => void;
  brightnessLevel: number;
  onChangeBrightness: (val: number) => void;
  callSession: IncomingCallSession | null;
  onAcceptCall: () => void;
  onToggleCallMute: () => void;
  onEndCall: () => void;
  agentRequest: AgentApprovalRequest | null;
  onResolveAgentRequest: (approved: boolean) => void;

  // Quick Toggles
  keepAwake: boolean;
  onToggleKeepAwake: () => void;
  micMuted: boolean;
  onToggleMicMuted: () => void;
  nightLight: boolean;
  onToggleNightLight: () => void;
  onTriggerQuickActionToast: (msg: string) => void;

  // Tray, Clipboard, Notes, Reminders
  trayFiles: TrayFileItem[];
  onAddTrayFiles: (files: TrayFileItem[]) => void;
  onTogglePinTrayFile: (id: string) => void;
  onRemoveTrayFile: (id: string) => void;
  onClearUnpinnedTray: () => void;
  onRestoreSampleTray: () => void;

  clipboardItems: ClipboardItem[];
  onAddClipboardItem: (item: Omit<ClipboardItem, 'id' | 'copiedAt' | 'pinned'>) => void;
  onTogglePinClip: (id: string) => void;
  onRemoveClipboardItem: (id: string) => void;
  onClearUnpinnedClips: () => void;

  noteContent: string;
  onChangeNoteContent: (val: string) => void;

  reminders: ReminderTask[];
  onToggleReminder: (id: string) => void;
  onAddReminder: (title: string) => void;

  preferences: LedgePreferences;
  onUpdatePreferences: (patch: Partial<LedgePreferences>) => void;
  stealthRevealedByShortcut: boolean;
}

export type DynamicLedgeProps = PillCapsuleProps;

export const PillCapsule: React.FC<PillCapsuleProps> = ({
  isExpanded,
  onExpand,
  onCollapse,
  activeTab,
  onSelectTab,
  isLauncherOpen,
  onToggleLauncher,
  onOpenFullSettings,
  isAstraOpen,
  onOpenVoiceAgent,
  onCloseVoiceAgent,
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
  transientHud,
  volumeLevel,
  onChangeVolume,
  brightnessLevel,
  onChangeBrightness,
  callSession,
  onAcceptCall,
  onToggleCallMute,
  onEndCall,
  agentRequest,
  onResolveAgentRequest,
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
  stealthRevealedByShortcut,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [edgeTouched, setEdgeTouched] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [astraHasResult, setAstraHasResult] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const isExpandedRef = useRef(isExpanded);
  isExpandedRef.current = isExpanded;

  const palette = resolveThemePalette(
    preferences.themeId,
    preferences.customPrimaryHex,
    preferences.customSecondaryHex
  );

  const effectiveAstraActive = Boolean(isAstraOpen && preferences.aiEnabled && !isExpanded);

  const musicVisible = preferences.featureFlags.nowPlaying && isPlaying;
  const timerVisible = preferences.featureFlags.quickTimers && timerRemainingSec !== null;

  const hasPrimaryActivity =
    musicVisible ||
    (!musicVisible && timerVisible) ||
    preferences.showCompactStats ||
    keepAwake;

  const hasSecondaryDroplet =
    !isExpanded &&
    !effectiveAstraActive &&
    transientHud === 'none' &&
    (preferences.shapeStyle === LedgeShapeStyle.SplitDualCapsule || (musicVisible && (timerVisible || keepAwake)));

  const isStealthHidden =
    preferences.stealthAutoHide &&
    !isExpanded &&
    !effectiveAstraActive &&
    transientHud === 'none' &&
    !isHovered &&
    !edgeTouched &&
    !isDragOver &&
    !stealthRevealedByShortcut;

  const targetGeometry = useMemo(
    () =>
      resolveLedgeGeometry({
        isExpanded,
        isLauncherOpen,
        activeTab,
        transientKind: transientHud,
        hasPrimaryActivity,
        hasSecondaryDroplet,
        isHovered,
        isDragOver,
        sizeScale: preferences.sizeScale,
        isElongated: preferences.isElongated,
        shapeStyle: preferences.shapeStyle,
        anchorPosition: preferences.anchorPosition,
        floatingOffsetPx: preferences.floatingOffsetPx,
        isStealthHidden,
        isAstraActive: effectiveAstraActive,
        astraMode: preferences.astraMode,
        astraExpandedResult: astraHasResult,
      }),
    [
      isExpanded,
      isLauncherOpen,
      activeTab,
      transientHud,
      hasPrimaryActivity,
      hasSecondaryDroplet,
      isHovered,
      isDragOver,
      preferences.sizeScale,
      preferences.isElongated,
      preferences.shapeStyle,
      preferences.anchorPosition,
      preferences.floatingOffsetPx,
      isStealthHidden,
      effectiveAstraActive,
      preferences.astraMode,
      astraHasResult,
    ]
  );

  // Refs for 0%-idle-CPU DirectComposition-equivalent rAF spring loop
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const collapseTimerRef = useRef<number | null>(null);
  const lastHitRect = useRef<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const mainSurfaceRef = useRef<HTMLDivElement | null>(null);
  const mainGooPillRef = useRef<HTMLDivElement | null>(null);
  const dropletGooPillRef = useRef<HTMLDivElement | null>(null);
  const dropletInteractiveRef = useRef<HTMLButtonElement | null>(null);

  const preferencesRef = useRef(preferences);
  preferencesRef.current = preferences;

  const contextMenuPosRef = useRef(contextMenuPos);
  contextMenuPosRef.current = contextMenuPos;

  const targetGeoRef = useRef(targetGeometry);
  targetGeoRef.current = targetGeometry;

  const springConfigRef = useRef(preferences.customSpring);
  springConfigRef.current = preferences.customSpring;

  const anchorRef = useRef(preferences.anchorPosition);
  anchorRef.current = preferences.anchorPosition;

  const physicsStateRef = useRef<{
    w: SpringState1D;
    h: SpringState1D;
    r: SpringState1D;
    top: SpringState1D;
    satOffset: SpringState1D;
    satScale: SpringState1D;
  }>({
    w: { position: targetGeometry.width, velocity: 0 },
    h: { position: targetGeometry.height, velocity: 0 },
    r: { position: targetGeometry.borderRadius, velocity: 0 },
    top: { position: targetGeometry.topOffset, velocity: 0 },
    satOffset: {
      position:
        targetGeometry.satelliteSize > 0
          ? targetGeometry.satelliteGap + targetGeometry.satelliteSize
          : -28,
      velocity: 0,
    },
    satScale: { position: targetGeometry.satelliteSize > 0 ? 1 : 0.2, velocity: 0 },
  });

  const kickLoopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const applyFrame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const target = targetGeoRef.current;
      const cfg = springConfigRef.current;
      const s = physicsStateRef.current;
      const isBottom = anchorRef.current === LedgeAnchorPosition.BottomTaskbar;

      const targetSatOffset =
        target.satelliteSize > 0 ? target.satelliteGap + target.satelliteSize : -26;
      const targetSatScale = target.satelliteSize > 0 ? 1 : 0.15;

      s.w = stepSpring1D(s.w, target.width, cfg, dt);
      s.h = stepSpring1D(s.h, target.height, cfg, dt);
      s.r = stepSpring1D(s.r, target.borderRadius, cfg, dt);
      s.top = stepSpring1D(s.top, target.topOffset, cfg, dt);
      s.satOffset = stepSpring1D(s.satOffset, targetSatOffset, cfg, dt);
      s.satScale = stepSpring1D(s.satScale, targetSatScale, cfg, dt);

      const deform = computeLiquidDeformation(s.w.velocity, s.h.velocity);

      const wPx = Math.max(80, s.w.position);
      const hPx = Math.max(6, s.h.position);
      const rPx = Math.max(6, s.r.position);
      const offsetPx = s.top.position;

      if (wrapperRef.current) {
        const yTranslate = isBottom ? -offsetPx : offsetPx;
        wrapperRef.current.style.transform = `translate3d(0, ${yTranslate.toFixed(2)}px, 0)`;

        if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
          const r = wrapperRef.current.getBoundingClientRect();
          const extraH = contextMenuPosRef.current ? 290 : 0;
          if (
            Math.abs(r.x - lastHitRect.current.x) > 1 ||
            Math.abs(r.y - lastHitRect.current.y) > 1 ||
            Math.abs(r.width - lastHitRect.current.width) > 1 ||
            Math.abs(r.height + extraH - lastHitRect.current.height) > 1
          ) {
            lastHitRect.current = { x: r.x, y: r.y, width: r.width, height: r.height + extraH };
            import('@tauri-apps/api/core')
              .then(({ invoke }) => {
                invoke('update_pill_hit_rect', { rect: lastHitRect.current }).catch(() => {});
              })
              .catch(() => {});
          }
        }
      }

      // Enforce true 360-degree semicircular pill curvature when compact (NEVER square)
      // Clamped strictly to target.borderRadius when expanded (NEVER an oval/egg abomination)
      let effectiveRadius = rPx;
      const currentShape = preferencesRef.current.shapeStyle;
      if (!isExpandedRef.current && hPx <= 60) {
        if (
          currentShape === LedgeShapeStyle.DynamicPill ||
          currentShape === LedgeShapeStyle.SplitDualCapsule ||
          currentShape === LedgeShapeStyle.TopBezelLedge
        ) {
          effectiveRadius = Math.max(effectiveRadius, Math.round(hPx / 2));
        }
      } else {
        effectiveRadius = Math.min(rPx, target.borderRadius || 34);
      }

      const borderBottomRadius = `${effectiveRadius.toFixed(1)}px`;
      const borderTopRadius = target.isDockedFlushTop ? '0px' : `${effectiveRadius.toFixed(1)}px`;
      const fullRadius = `${borderTopRadius} ${borderTopRadius} ${borderBottomRadius} ${borderBottomRadius}`;

      if (mainSurfaceRef.current) {
        mainSurfaceRef.current.style.width = `${wPx.toFixed(1)}px`;
        mainSurfaceRef.current.style.height = `${hPx.toFixed(1)}px`;
        mainSurfaceRef.current.style.borderRadius = fullRadius;
      }

      if (mainGooPillRef.current) {
        mainGooPillRef.current.style.width = `${wPx.toFixed(1)}px`;
        mainGooPillRef.current.style.height = `${hPx.toFixed(1)}px`;
        mainGooPillRef.current.style.borderRadius = fullRadius;
      }

      const satSize = Math.max(24, target.satelliteSize || 36);
      const satX = s.satOffset.position;
      const satS = Math.max(0.01, s.satScale.position);

      if (dropletGooPillRef.current) {
        dropletGooPillRef.current.style.width = `${satSize}px`;
        dropletGooPillRef.current.style.height = `${satSize}px`;
        dropletGooPillRef.current.style.transform = `translate3d(${satX.toFixed(1)}px, 0, 0) scale(${satS.toFixed(3)})`;
        dropletGooPillRef.current.style.opacity = satS > 0.18 ? '1' : '0';
      }

      if (dropletInteractiveRef.current) {
        dropletInteractiveRef.current.style.width = `${satSize}px`;
        dropletInteractiveRef.current.style.height = `${satSize}px`;
        dropletInteractiveRef.current.style.transform = `translate3d(${satX.toFixed(1)}px, 0, 0) scale(${satS.toFixed(3)})`;
        dropletInteractiveRef.current.style.opacity = satS > 0.55 ? '1' : '0';
        dropletInteractiveRef.current.style.pointerEvents = satS > 0.7 ? 'auto' : 'none';
      }

      const allSettled =
        isSpringAtRest(s.w, target.width) &&
        isSpringAtRest(s.h, target.height) &&
        isSpringAtRest(s.r, target.borderRadius) &&
        isSpringAtRest(s.top, target.topOffset) &&
        isSpringAtRest(s.satOffset, targetSatOffset) &&
        isSpringAtRest(s.satScale, targetSatScale);

      if (!allSettled) {
        rafId = requestAnimationFrame(applyFrame);
      } else {
        rafId = 0;
      }
    };

    const kick = () => {
      if (rafId === 0) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(applyFrame);
      }
    };

    kickLoopRef.current = kick;
    kick();

    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    kickLoopRef.current?.();
  }, [targetGeometry, preferences.customSpring, preferences.anchorPosition]);

  useEffect(() => {
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      import('@tauri-apps/api/core').then(({ invoke }) => {
        invoke('reposition_pill_window', { anchor: preferences.anchorPosition }).catch(() => {});
      }).catch(() => {});
    }
  }, [preferences.anchorPosition]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenuPos(null);
        if (effectiveAstraActive) onCloseVoiceAgent();
        else if (isExpanded) onCollapse();
      }
    };
    const onWindowClick = () => setContextMenuPos(null);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('click', onWindowClick);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('click', onWindowClick);
    };
  }, [isExpanded, effectiveAstraActive, onCollapse, onCloseVoiceAgent]);

  // Listen to native OS cursor boundary events (120Hz precision from window_manager.rs)
  useEffect(() => {
    if (typeof window === 'undefined' || !('__TAURI_INTERNALS__' in window)) return;
    let unlistenLeft: (() => void) | null = null;
    let unlistenEntered: (() => void) | null = null;
    let unlistenOutside: (() => void) | null = null;
    let leaveToleranceTimer: number | null = null;

    import('@tauri-apps/api/event').then(({ listen }) => {
      listen('pill://cursor-left-pill', () => {
        if (leaveToleranceTimer !== null) window.clearTimeout(leaveToleranceTimer);
        leaveToleranceTimer = window.setTimeout(() => {
          leaveToleranceTimer = null;
          setIsHovered(false);
          setEdgeTouched(false);
        }, 450);
      }).then((u) => {
        unlistenLeft = u;
      });

      listen('pill://cursor-entered-pill', () => {
        if (leaveToleranceTimer !== null) {
          window.clearTimeout(leaveToleranceTimer);
          leaveToleranceTimer = null;
        }
        setIsHovered(true);
      }).then((u) => {
        unlistenEntered = u;
      });

      listen('pill://outside-click', () => {
        if (leaveToleranceTimer !== null) {
          window.clearTimeout(leaveToleranceTimer);
          leaveToleranceTimer = null;
        }
        setIsHovered(false);
        setEdgeTouched(false);
      }).then((u) => {
        unlistenOutside = u;
      });
    });

    return () => {
      if (leaveToleranceTimer !== null) window.clearTimeout(leaveToleranceTimer);
      unlistenLeft?.();
      unlistenEntered?.();
      unlistenOutside?.();
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const customDesktopPayload = e.dataTransfer.getData('application/x-dynamic-ledge-file');
    if (customDesktopPayload) {
      try {
        const parsed = JSON.parse(customDesktopPayload) as TrayFileItem;
        onAddTrayFiles([{ ...parsed, id: `drop-${Date.now()}`, addedAt: 'Just now' }]);
        playTactilePop('drop');
        onExpand('tray');
        return;
      } catch {
        // Ignore
      }
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped: TrayFileItem[] = Array.from(e.dataTransfer.files).map((f, idx) => {
        const ext = f.name.includes('.')
          ? f.name.split('.').pop()!.toUpperCase().slice(0, 5)
          : 'FILE';
        const kb = Math.max(0.5, f.size / 1024);
        return {
          id: `os-drop-${Date.now()}-${idx}`,
          name: f.name,
          extension: ext,
          sizeLabel: kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(1)} KB`,
          addedAt: 'Just now',
          pinned: false,
          contentPreview: `Dropped onto Dynamic Ledge: ${f.name}`,
        };
      });
      onAddTrayFiles(dropped);
      playTactilePop('drop');
      onExpand('tray');
    }
  };

  const isLightPaper = Boolean(palette.isLightSurface && !effectiveAstraActive);
  const isGlass = !isLightPaper && preferences.material === AppearanceMaterial.LiquidGlass;
  const isGraphite = !isLightPaper && preferences.material === AppearanceMaterial.FrostedGraphite;
  const isDockedBezel = targetGeometry.isDockedFlushTop;
  const isBottomAnchor = preferences.anchorPosition === LedgeAnchorPosition.BottomTaskbar;
  const isPureOrbOnly = Boolean(effectiveAstraActive && preferences.astraMode === 'orb_only' && !astraHasResult);

  // Compute Edge Lighting Aura (or Siri Rainbow Aura when Astra is morphed in-Pill)
  const shouldShowEdgeLight =
    preferences.featureFlags.edgeLighting &&
    !preferences.featureFlags.lowRamEcoMode &&
    preferences.edgeLightProfile !== 'off' &&
    (preferences.edgeLightTrigger === 'always' ||
      (preferences.edgeLightTrigger === 'music_only' && isPlaying) ||
      (preferences.edgeLightTrigger === 'alerts_only' && transientHud !== 'none'));

  const edgeShadowCss = effectiveAstraActive
    ? '0 -2px 24px rgba(56,189,248,0.52), -8px 6px 34px rgba(168,85,247,0.42), 8px 6px 34px rgba(244,63,165,0.42)'
    : shouldShowEdgeLight
      ? resolveEdgeGlowCss(
          preferences.edgeLightProfile,
          preferences.edgeLightIntensity,
          palette.primaryHex,
          palette.secondaryHex
        )
      : undefined;

  const anchorFlexClass =
    preferences.anchorPosition === LedgeAnchorPosition.TopLeft
      ? 'justify-start pl-8'
      : preferences.anchorPosition === LedgeAnchorPosition.TopRight
        ? 'justify-end pr-8'
        : 'justify-center';

  const batteryEta = computeBatteryEta(
    systemState.batteryPct,
    systemState.isCharging,
    systemState.chargingWatts
  );

  // OS-Level Privacy Masking (`SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE)`):
  // Determine whether remote screen-share callers are blocked from seeing the current Pill state.
  const isPublicPassthroughAllowed =
    preferences.privacyPublicPassthroughHud &&
    !isExpanded &&
    !effectiveAstraActive &&
    transientHud === 'none' &&
    (musicVisible || timerVisible);

  const isCloakedFromScreenCapture =
    preferences.privacyMaskEnabled &&
    preferences.privacySimulateCaptureView &&
    !isPublicPassthroughAllowed;

  return (
    <>
      {/* Caller Screen-Share Simulator Banner when previewing WDA_EXCLUDEFROMCAPTURE */}
      {preferences.privacySimulateCaptureView && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed top-16 right-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-emerald-950/92 backdrop-blur-xl border border-emerald-400/35 shadow-2xl text-xs text-emerald-100"
        >
          <EyeOff className="w-4 h-4 text-emerald-300 shrink-0" />
          <div>
            <div className="font-semibold text-white">
              Caller Screen-Share View ({preferences.privacyMaskEnabled ? 'Mask Active' : 'Unmasked'})
            </div>
            <div className="text-[10.5px] text-emerald-200/85">
              {isCloakedFromScreenCapture
                ? 'Zoom/Teams/Meet viewers only see your desktop — Pill is excluded from capture'
                : preferences.privacyMaskEnabled
                  ? 'Public Now Playing HUD visible to callers · Assist/Notes/Clipboard remain hidden'
                  : 'Privacy Mask is Off — callers can see Pill'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onUpdatePreferences({ privacySimulateCaptureView: false })}
            className="px-2.5 py-1 rounded-xl bg-emerald-400 text-slate-950 font-semibold hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0"
          >
            Exit Caller View
          </button>
        </div>
      )}

      {/* Hidden Zero-Cost SVG Metaball Filter for Liquid Meniscus Coalescence */}
      <svg className="sr-only" aria-hidden="true">
        <defs>
          <filter
            id="ledge-liquid-goo"
            x="-35%"
            y="-35%"
            width="190%"
            height="190%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="7.2" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11"
              result="goo"
            />
            <feDropShadow
              in="goo"
              dx="0"
              dy="1"
              stdDeviation="0.6"
              floodColor="#94a3b8"
              floodOpacity="0.22"
              result="rimmed"
            />
          </filter>
        </defs>
      </svg>

      {/* Screen-Edge Touch Sensor Strip when Stealth Auto-Hide is active */}
      {preferences.stealthAutoHide && preferences.revealOnEdgeTouch && (
        <button
          type="button"
          data-testid="screen-edge-sensor"
          aria-label="Touch screen edge to reveal Dynamic Island"
          onMouseEnter={() => {
            setEdgeTouched(true);
          }}
          onMouseLeave={() => {
            setEdgeTouched(false);
          }}
          className={`fixed left-0 right-0 z-40 h-4 ${
            isBottomAnchor ? 'bottom-0' : 'top-0'
          } flex items-center justify-center group cursor-pointer bg-transparent border-0`}
          onClick={() => {
            setEdgeTouched(true);
            onExpand();
          }}
        />
      )}

      {/* Hardware Anchor Container (supports TopCenter, TopLeft, TopRight, and BottomTaskbar) */}
      <div
        className={`${
          isBottomAnchor ? 'fixed bottom-3 left-0 right-0 z-30' : 'relative z-30'
        } flex ${anchorFlexClass} pointer-events-none transition-opacity duration-200 ${
          isStealthHidden ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div
          ref={wrapperRef}
          id="pill-capsule-root"
          onMouseEnter={() => {
            setIsHovered(true);
            if (collapseTimerRef.current !== null) {
              window.clearTimeout(collapseTimerRef.current);
              collapseTimerRef.current = null;
            }
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            if (edgeTouched) {
              window.setTimeout(() => setEdgeTouched(false), 380);
            }
            const activeEl = document.activeElement;
            const isInputFocused =
              activeEl &&
              (activeEl.tagName === 'INPUT' ||
                activeEl.tagName === 'TEXTAREA' ||
                activeEl.hasAttribute('contenteditable'));
            if (!isInputFocused) {
              if (collapseTimerRef.current !== null) window.clearTimeout(collapseTimerRef.current);
              collapseTimerRef.current = window.setTimeout(() => {
                collapseTimerRef.current = null;
                if (isExpandedRef.current) {
                  onCollapse();
                }
              }, 420);
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setContextMenuPos({ x: e.clientX, y: e.clientY });
          }}
          style={{
            transformOrigin: isBottomAnchor ? '50% 100%' : '50% 0%',
          }}
          className="relative flex items-center pointer-events-auto will-change-transform max-w-[calc(100vw-16px)] before:absolute before:-top-4 before:left-0 before:right-0 before:h-6 before:content-['']"
          data-testid="dynamic-ledge-root"
        >
          {/* Concave Top-Bezel Meniscus Fillets (only when shape is TopBezelLedge) */}
          {isDockedBezel && !isCloakedFromScreenCapture && !isPureOrbOnly && (
            <>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                aria-hidden="true"
                className={`absolute -left-[11.5px] top-0 pointer-events-none transition-colors duration-200 ${
                  isLightPaper
                    ? 'text-[#f4efe4]'
                    : isGlass
                      ? 'text-slate-950/72'
                      : isGraphite
                        ? 'text-[#151924]'
                        : 'text-[#050609]'
                }`}
              >
                <path d="M12 0H0C6.627 0 12 5.373 12 12V0Z" fill="currentColor" />
              </svg>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                aria-hidden="true"
                className={`absolute -right-[11.5px] top-0 pointer-events-none transition-colors duration-200 ${
                  isLightPaper
                    ? 'text-[#f4efe4]'
                    : isGlass
                      ? 'text-slate-950/72'
                      : isGraphite
                        ? 'text-[#151924]'
                        : 'text-[#050609]'
                }`}
              >
                <path d="M0 0H12C5.373 0 0 5.373 0 12V0Z" fill="currentColor" />
              </svg>
            </>
          )}

          {/* Layer 1: Liquid Metaball Silhouette Layer */}
          <div
            aria-hidden="true"
            style={{
              filter:
                !isGlass && !isExpanded && !isCloakedFromScreenCapture && !isPureOrbOnly
                  ? 'url(#ledge-liquid-goo)'
                  : undefined,
            }}
            className={`absolute inset-0 pointer-events-none flex items-center transition-opacity duration-200 ${
              isCloakedFromScreenCapture ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div
              ref={mainGooPillRef}
              style={{
                width: `${targetGeometry.width}px`,
                height: `${targetGeometry.height}px`,
              }}
              className={
                isPureOrbOnly
                  ? 'bg-transparent'
                  : isLightPaper
                    ? 'bg-[#f4efe4]'
                    : isGlass
                      ? 'bg-slate-950/72 backdrop-blur-2xl'
                      : isGraphite
                        ? 'bg-[#151924]'
                        : 'bg-[#050609]'
              }
            />
            <div
              ref={dropletGooPillRef}
              style={{
                width: '36px',
                height: '36px',
                right: 0,
              }}
              className={`absolute right-0 top-0 rounded-full ${
                isPureOrbOnly
                  ? 'bg-transparent ring-0'
                  : isLightPaper
                    ? 'bg-[#f4efe4]'
                    : isGlass
                      ? 'bg-slate-950/72 backdrop-blur-2xl ring-1 ring-white/20'
                      : isGraphite
                        ? 'bg-[#151924]'
                        : 'bg-[#050609]'
              }`}
            />
          </div>

          {/* Layer 2: Crisp Specular Rim, Edge Lighting Aura & Interactive Foreground Surface */}
          <div
            ref={mainSurfaceRef}
            style={{
              width: `${targetGeometry.width}px`,
              height: `${targetGeometry.height}px`,
              boxShadow:
                isCloakedFromScreenCapture || isPureOrbOnly
                  ? 'none'
                  : edgeShadowCss
                    ? `${edgeShadowCss}, 0 20px 46px rgba(0,0,0,0.68)`
                    : undefined,
            }}
            className={`relative overflow-hidden transition-[background-color,border-color,box-shadow] duration-150 ${
              isPureOrbOnly
                ? 'bg-transparent border-0 ring-0 shadow-none'
                : isCloakedFromScreenCapture
                  ? 'bg-emerald-950/[0.14] border border-dashed border-emerald-400/40 backdrop-blur-[1px]'
                  : isLightPaper
                    ? 'bg-[#f4efe4] text-stone-900 ring-1 ring-stone-900/20 shadow-[0_20px_48px_rgba(28,25,23,0.42),inset_0_1px_0_rgba(255,255,255,0.8)]'
                    : isGlass
                      ? 'backdrop-blur-2xl bg-gradient-to-b from-white/[0.12] to-white/[0.02] ring-1 ring-white/25 shadow-[0_22px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.32)]'
                      : isGraphite
                        ? 'ring-1 ring-white/18 shadow-[0_18px_44px_rgba(0,0,0,0.68),inset_0_1px_0_rgba(255,255,255,0.14)]'
                        : 'ring-1 ring-white/[0.15] shadow-[0_18px_44px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.11)]'
            }`}
          >
            {/* Minimalist Razor Specular Horizon Highlight */}
            {!isPureOrbOnly && preferences.shapeStyle === LedgeShapeStyle.MinimalistBar && (
              <span className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent pointer-events-none z-50" />
            )}

            {isCloakedFromScreenCapture ? (
              /* OS-Level Screen-Capture Privacy Mask Preview (`WDA_EXCLUDEFROMCAPTURE`) */
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdatePreferences({ privacySimulateCaptureView: false });
                }}
                title="Click to return to your private local view"
                className="w-full h-full flex items-center justify-center gap-2 px-4 cursor-pointer text-emerald-200/90 select-none"
              >
                <EyeOff className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span className="text-[11px] font-mono truncate">
                  WDA_EXCLUDEFROMCAPTURE · Invisible on Zoom / Teams / Meet
                </span>
              </div>
            ) : isDragOver && !isExpanded ? (
              /* 1. Drag-Over Magnetic Drop Pocket */
              <div className="w-full h-full flex items-center justify-center gap-3 px-5 bg-sky-500/10 text-sky-200">
                <FolderDown className="w-5 h-5 text-sky-300 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-semibold text-white">Drop into Island Tray</div>
                  <div className="text-[11px] text-sky-200/80">
                    Release to hold file link, merge, or export ZIP
                  </div>
                </div>
              </div>
            ) : effectiveAstraActive ? (
              /* 1.5 In-Pill Astra (`అస్త్రం`) Morph — Uses the existing Pill directly! */
              <InPillAstraPanel
                onClose={onCloseVoiceAgent}
                preferences={preferences}
                onUpdatePreferences={onUpdatePreferences}
                systemState={systemState}
                volumeLevel={volumeLevel}
                brightnessLevel={brightnessLevel}
                isPlaying={isPlaying}
                nightLight={nightLight}
                keepAwake={keepAwake}
                micMuted={micMuted}
                onExecuteActions={onExecuteAgentActions}
                onResultStateChange={setAstraHasResult}
              />
            ) : isExpanded ? (
              /* 2. Full Expanded Multi-Tab Studio */
              <div
                style={{
                  width: `${targetGeometry.width}px`,
                  height: `${targetGeometry.height}px`,
                }}
                className="mx-auto max-w-full transition-opacity duration-150"
              >
                <PillExpandedContent
                  activeTab={activeTab}
                  onSelectTab={onSelectTab}
                  isLauncherOpen={isLauncherOpen}
                  onToggleLauncher={onToggleLauncher}
                  onCollapse={onCollapse}
                  onOpenFullSettings={onOpenFullSettings}
                  onOpenVoiceAgent={onOpenVoiceAgent}
                  onExecuteAgentActions={onExecuteAgentActions}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  trackProgressSec={trackProgressSec}
                  onTogglePlay={onTogglePlay}
                  onPrevTrack={onPrevTrack}
                  onNextTrack={onNextTrack}
                  onSeekTrack={onSeekTrack}
                  audioDevice={audioDevice}
                  onChangeAudioDevice={onChangeAudioDevice}
                  timerRemainingSec={timerRemainingSec}
                  timerTotalSec={timerTotalSec}
                  onStartTimer={onStartTimer}
                  onCancelTimer={onCancelTimer}
                  systemState={systemState}
                  onUpdateSystemState={onUpdateSystemState}
                  volumeLevel={volumeLevel}
                  onChangeVolume={onChangeVolume}
                  brightnessLevel={brightnessLevel}
                  onChangeBrightness={onChangeBrightness}
                  keepAwake={keepAwake}
                  onToggleKeepAwake={onToggleKeepAwake}
                  micMuted={micMuted}
                  onToggleMicMuted={onToggleMicMuted}
                  nightLight={nightLight}
                  onToggleNightLight={onToggleNightLight}
                  onTriggerQuickActionToast={onTriggerQuickActionToast}
                  trayFiles={trayFiles}
                  onAddTrayFiles={onAddTrayFiles}
                  onTogglePinTrayFile={onTogglePinTrayFile}
                  onRemoveTrayFile={onRemoveTrayFile}
                  onClearUnpinnedTray={onClearUnpinnedTray}
                  onRestoreSampleTray={onRestoreSampleTray}
                  clipboardItems={clipboardItems}
                  onAddClipboardItem={onAddClipboardItem}
                  onTogglePinClip={onTogglePinClip}
                  onRemoveClipboardItem={onRemoveClipboardItem}
                  onClearUnpinnedClips={onClearUnpinnedClips}
                  noteContent={noteContent}
                  onChangeNoteContent={onChangeNoteContent}
                  reminders={reminders}
                  onToggleReminder={onToggleReminder}
                  onAddReminder={onAddReminder}
                  preferences={preferences}
                  onUpdatePreferences={onUpdatePreferences}
                />
              </div>
            ) : transientHud === 'call' && callSession ? (
              /* 3A. Incoming / Active Call Liquid Morph */
              <div className="w-full h-full flex items-center justify-between gap-3 px-3.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <ResilientThumb
                    src={callSession.avatarUrl}
                    alt={callSession.callerName}
                    className="w-10 h-10 rounded-full shrink-0 ring-1 ring-white/20"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      {callSession.callerName}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate tabular-nums">
                      {callSession.appSource} ·{' '}
                      {callSession.isAccepted
                        ? formatDurationClock(callSession.elapsedSec)
                        : 'Incoming Audio'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={onToggleCallMute}
                    aria-label={callSession.isMuted ? 'Unmute call' : 'Mute call'}
                    className={`p-2 rounded-full transition-colors ${
                      callSession.isMuted
                        ? 'bg-white text-slate-950'
                        : 'bg-white/12 text-slate-200 hover:bg-white/20'
                    }`}
                  >
                    <ThemedIcon
                      name="mic"
                      packStyle={preferences.iconPack}
                      size={14}
                      color={callSession.isMuted ? '#f87171' : undefined}
                    />
                  </button>
                  {!callSession.isAccepted && (
                    <button
                      type="button"
                      onClick={onAcceptCall}
                      aria-label="Accept call"
                      className="p-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onEndCall}
                    aria-label="Hang up call"
                    className="p-2 rounded-full bg-rose-500 hover:bg-rose-400 text-white transition-colors"
                  >
                    <PhoneOff className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : transientHud === 'agent' && agentRequest ? (
              /* 3B. Coding Assistant Approval Hook */
              <div className="w-full h-full flex items-center justify-between gap-3 px-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-400/25 flex items-center justify-center text-sky-300 shrink-0">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      {agentRequest.agentName} · Permission Request
                    </div>
                    <div className="text-[11px] font-mono text-slate-300 truncate">
                      {agentRequest.commandSummary}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onResolveAgentRequest(false)}
                    aria-label="Deny coding assistant command"
                    className="px-2.5 py-1.5 text-xs font-medium bg-white/10 hover:bg-rose-500/25 text-slate-200 hover:text-rose-200 rounded-xl transition-colors whitespace-nowrap"
                  >
                    Deny
                  </button>
                  <button
                    type="button"
                    onClick={() => onResolveAgentRequest(true)}
                    aria-label="Allow coding assistant command"
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Allow</span>
                  </button>
                </div>
              </div>
            ) : transientHud === 'volume' || transientHud === 'brightness' ? (
              /* 3C. Native System Volume / Brightness Fluid Pill with Fused Slider Effect */
              <div className="w-full h-full flex items-center justify-between gap-3 px-3.5">
                <div
                  className={`flex items-center gap-2 shrink-0 ${
                    isLightPaper ? 'text-stone-800' : 'text-slate-200'
                  }`}
                >
                  {transientHud === 'volume' ? (
                    <ThemedIcon name="volume" packStyle={preferences.iconPack} size={16} color={palette.primaryHex} />
                  ) : (
                    <ThemedIcon name="sun" packStyle={preferences.iconPack} size={16} color="#f59e0b" />
                  )}
                  <span className="text-xs font-medium">
                    {transientHud === 'volume' ? 'Volume' : 'Brightness'}
                  </span>
                </div>
                <FluidEffectSlider
                  value={transientHud === 'volume' ? volumeLevel : brightnessLevel}
                  min={0}
                  max={100}
                  onChange={(val) =>
                    transientHud === 'volume' ? onChangeVolume(val) : onChangeBrightness(val)
                  }
                  styleVariant={preferences.controlSliderStyle}
                  primaryHex={palette.primaryHex}
                  secondaryHex={palette.secondaryHex}
                  animateWave={transientHud === 'volume' && isPlaying}
                  glowIntensity={preferences.sliderGlowIntensity}
                  ariaLabel={transientHud === 'volume' ? 'System volume' : 'Display brightness'}
                  lowPowerEco={preferences.featureFlags.lowRamEcoMode}
                  isLightSurface={isLightPaper}
                />
                <span
                  className={`text-xs font-mono tabular-nums w-8 text-right ${
                    isLightPaper ? 'text-stone-700' : 'text-slate-300'
                  }`}
                >
                  {transientHud === 'volume' ? volumeLevel : brightnessLevel}%
                </span>
              </div>
            ) : transientHud === 'battery' ? (
              /* 3D. Charging Speed (Watts) & Exact Time-to-Full ETA HUD with Animated Battery Symbol */
              <button
                type="button"
                onClick={() => {
                  playTactilePop('expand');
                  onExpand('monitor');
                }}
                aria-label="Open Power and System Monitor"
                className="w-full h-full flex items-center justify-between gap-2 px-4 text-left focus-visible:outline-2 focus-visible:outline-sky-400"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Zap className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span className="text-xs font-semibold text-white truncate">
                    {systemState.isCharging
                      ? `${systemState.chargingWatts}W SuperFast PD`
                      : 'Battery Power'}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate">
                    · {batteryEta.formattedEta}
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-300 tabular-nums shrink-0">
                  <span>{systemState.batteryPct}%</span>
                  <AnimatedBatterySymbol
                    percent={systemState.batteryPct}
                    isCharging={systemState.isCharging}
                    accentHex={palette.primaryHex}
                    size="md"
                    lowPowerEco={preferences.featureFlags.lowRamEcoMode}
                  />
                </span>
              </button>
            ) : transientHud === 'download' ? (
              /* 3E. Download Finished HUD */
              <button
                type="button"
                onClick={() => {
                  playTactilePop('expand');
                  onExpand('tray');
                }}
                aria-label="Open File Tray"
                className="w-full h-full flex items-center justify-between px-4 text-left focus-visible:outline-2 focus-visible:outline-sky-400"
              >
                <span className="flex items-center gap-2 text-xs font-medium text-slate-100 truncate">
                  <Download className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                  <span className="truncate">Pill-WinUI3-NativeAOT.zip</span>
                </span>
                <span className="text-[11px] text-emerald-300 font-medium shrink-0">Complete</span>
              </button>
            ) : (
              /* 4. Collapsed Dynamic Island Pill / Ledge */
              <button
                type="button"
                onClick={() => {
                  playTactilePop('expand');
                  onExpand();
                }}
                aria-label="Expand Dynamic Ledge"
                className="w-full h-full flex items-center justify-between px-3 text-left focus-visible:outline-2 focus-visible:outline-sky-400"
              >
                {musicVisible ? (
                  <>
                    <div className="flex items-center gap-2 min-w-0">
                      <ResilientThumb
                        src={currentTrack.coverUrl}
                        alt={currentTrack.title}
                        className="w-5 h-5 rounded-full shrink-0 ring-1 ring-white/20"
                      />
                      <span
                        className={`text-xs font-medium truncate max-w-[130px] ${
                          isLightPaper ? 'text-stone-900 font-semibold' : 'text-slate-100'
                        }`}
                      >
                        {currentTrack.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {preferences.privacyMaskEnabled && (
                        <ShieldCheck
                          className="w-3 h-3 text-emerald-400/85 shrink-0"
                          aria-label="OS Privacy Mask enabled"
                        />
                      )}
                      <span
                        aria-hidden="true"
                        className={`w-2.5 h-2.5 rounded-full ${
                          isLightPaper
                            ? 'bg-stone-800/80 ring-1 ring-stone-900/20'
                            : 'bg-[#0c1018] ring-1 ring-white/10'
                        }`}
                      />
                      {preferences.liveMusicBars && (
                        <FluidMusicVisualizer
                          style={preferences.musicVisualizer}
                          isPlaying={isPlaying}
                          accentHex={palette.primaryHex}
                          secondaryHex={palette.secondaryHex}
                          compact
                          lowPowerEco={preferences.featureFlags.lowRamEcoMode}
                        />
                      )}
                    </div>
                  </>
                ) : timerVisible ? (
                  <>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-amber-300">
                      <Timer className="w-3.5 h-3.5" />
                      <span>Timer</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="w-2.5 h-2.5 rounded-full bg-[#0c1018] ring-1 ring-white/10"
                    />
                    <span className="text-xs font-mono font-semibold text-amber-200 tabular-nums">
                      {formatDurationClock(timerRemainingSec ?? 0)}
                    </span>
                  </>
                ) : preferences.showCompactStats ? (
                  <>
                    <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-300 tabular-nums">
                      <AnimatedBatterySymbol
                        percent={systemState.batteryPct}
                        isCharging={systemState.isCharging}
                        accentHex={palette.primaryHex}
                        size="sm"
                        lowPowerEco={preferences.featureFlags.lowRamEcoMode}
                      />
                      <span>{systemState.batteryPct}%</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="w-2 h-2 rounded-full bg-[#0c1018] ring-1 ring-white/10"
                    />
                    <span className="text-[11px] font-mono text-sky-300 tabular-nums">
                      CPU {systemState.cpuUsagePct.toFixed(0)}%
                    </span>
                  </>
                ) : keepAwake ? (
                  <>
                    <span className="text-[11px] font-medium text-emerald-300">Awake</span>
                    <span
                      aria-hidden="true"
                      className="w-2.5 h-2.5 rounded-full bg-[#0c1018] ring-1 ring-white/10"
                    />
                    <Coffee className="w-3.5 h-3.5 text-emerald-300" />
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between px-1">
                    <span className="text-[11px] text-slate-400 transition-opacity duration-150">
                      {isHovered ? 'Open Island' : ''}
                    </span>
                    <span
                      aria-hidden="true"
                      className="w-2.5 h-2.5 rounded-full bg-[#0c1018] ring-1 ring-white/15 mx-auto"
                    />
                    <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                      {isHovered ? preferences.toggleShortcut : ''}
                    </span>
                  </div>
                )}
              </button>
            )}
          </div>

          {/* Layer 3: Detached Secondary Live-Activity Satellite Droplet */}
          <button
            ref={dropletInteractiveRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playTactilePop('expand');
              onExpand('home');
            }}
            aria-label={
              timerRemainingSec !== null
                ? `Active timer ${formatDurationClock(timerRemainingSec)} — click to open`
                : 'Secondary island status — click to open'
            }
            style={{
              right: 0,
              top: 0,
            }}
            className={`absolute right-0 top-0 rounded-full flex items-center justify-center focus-visible:outline-2 focus-visible:outline-sky-400 ${
              isCloakedFromScreenCapture ? 'invisible' : ''
            } ${isLightPaper ? 'ring-1 ring-stone-900/20' : 'ring-1 ring-white/14'}`}
          >
            {timerRemainingSec !== null ? (
              <span
                className={`text-[10px] font-mono font-semibold tabular-nums ${
                  isLightPaper ? 'text-amber-800' : 'text-amber-300'
                }`}
              >
                {timerRemainingSec >= 60
                  ? `${Math.ceil(timerRemainingSec / 60)}m`
                  : `${timerRemainingSec}s`}
              </span>
            ) : keepAwake ? (
              <Coffee
                className={`w-3.5 h-3.5 ${isLightPaper ? 'text-emerald-800' : 'text-emerald-300'}`}
              />
            ) : (
              <Zap
                className={`w-3.5 h-3.5 ${isLightPaper ? 'text-amber-800' : 'text-sky-300'}`}
              />
            )}
          </button>
        </div>
      </div>

      {/* Right-Click Quick Context Menu */}
      {contextMenuPos && (
        <div
          role="menu"
          aria-label="Dynamic Island quick controls"
          style={{
            left: `${Math.min(contextMenuPos.x, window.innerWidth - 236)}px`,
            top: `${Math.min(contextMenuPos.y, window.innerHeight - 290)}px`,
          }}
          onClick={(e) => e.stopPropagation()}
          className="fixed z-50 w-60 bg-slate-950/95 backdrop-blur-xl border border-white/15 rounded-xl p-1.5 shadow-2xl text-xs text-slate-200 space-y-0.5"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setContextMenuPos(null);
              if (isExpanded) onCollapse();
              else onExpand('home');
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isExpanded ? 'Collapse Island' : 'Expand Home Hub'}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setContextMenuPos(null);
              onExpand('control');
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            Open Windows Control Center
          </button>
          {preferences.aiEnabled && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setContextMenuPos(null);
                if (effectiveAstraActive) onCloseVoiceAgent();
                else onOpenVoiceAgent();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" style={{ color: palette.primaryHex }} />
                <span>{effectiveAstraActive ? 'Exit Astra Pill Mode' : 'Morph Pill into Astra'}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {preferences.voiceAgentShortcut}
              </span>
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setContextMenuPos(null);
              onUpdatePreferences({ privacyMaskEnabled: !preferences.privacyMaskEnabled });
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>OS Privacy Mask</span>
            </span>
            <span className="text-emerald-300 font-mono text-[11px]">
              {preferences.privacyMaskEnabled ? 'On' : 'Off'}
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setContextMenuPos(null);
              onUpdatePreferences({
                privacySimulateCaptureView: !preferences.privacySimulateCaptureView,
              });
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              {preferences.privacySimulateCaptureView ? (
                <Eye className="w-3.5 h-3.5 text-sky-300" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Preview Caller View</span>
            </span>
            <span className="text-slate-400 text-[11px]">
              {preferences.privacySimulateCaptureView ? 'Active' : 'Test'}
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setContextMenuPos(null);
              onUpdatePreferences({
                shapeStyle:
                  preferences.shapeStyle === LedgeShapeStyle.DynamicPill
                    ? LedgeShapeStyle.TopBezelLedge
                    : LedgeShapeStyle.DynamicPill,
              });
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            Switch to{' '}
            {preferences.shapeStyle === LedgeShapeStyle.DynamicPill
              ? 'Top-Bezel Ledge'
              : 'Dynamic Island Pill'}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setContextMenuPos(null);
              onUpdatePreferences({ stealthAutoHide: !preferences.stealthAutoHide });
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span>Stealth Edge-Hide</span>
            <span className="text-slate-400">{preferences.stealthAutoHide ? 'On' : 'Off'}</span>
          </button>
          <div className="border-t border-white/10 my-1" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setContextMenuPos(null);
              onOpenFullSettings();
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-sky-300 transition-colors"
          >
            Full Studio Settings…
          </button>
        </div>
      )}
    </>
  );
};

export const DynamicLedge = PillCapsule;
