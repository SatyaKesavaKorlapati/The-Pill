import React from 'react';
import {
  BatteryCharging,
  Download,
  Eye,
  EyeOff,
  FileCode2,
  FileText,
  Image as ImageIcon,
  Pause,
  PhoneIncoming,
  Play,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Terminal,
  Timer,
  Volume2,
} from 'lucide-react';
import {
  PillPreferences,
  TransientHudKind,
  TrayFileItem,
} from '../types/pill';
import { playTactilePop } from '../utils/audioSynth';
import { PillAnchorPosition } from '../utils/springPhysics';
import { resolveThemePalette } from '../utils/themeAndSliders';

interface DesktopStudioDockProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  hasActiveTimer: boolean;
  onToggleDemoTimer: () => void;
  activeHud: TransientHudKind;
  onTriggerCall: () => void;
  onTriggerAgentPrompt: () => void;
  onTriggerSystemHud: (kind: 'volume' | 'brightness' | 'battery' | 'download') => void;
  onSendDesktopFileToTray: (file: TrayFileItem) => void;
  preferences: PillPreferences;
  onUpdatePreferences: (patch: Partial<PillPreferences>) => void;
  onOpenFullSettings: () => void;
  isAstraOpen: boolean;
  onToggleVoiceAgent: () => void;
  onDownloadWinUIZip?: () => void;
}

const DESKTOP_DRAGGABLE_FILES: TrayFileItem[] = [
  {
    id: 'desk-1',
    name: 'DirectComp_Spec.pdf',
    extension: 'PDF',
    sizeLabel: '1.4 MB',
    addedAt: 'Desktop',
    pinned: false,
    contentPreview: 'DirectComposition 120Hz Natural Motion & Hit-Testing Specification',
  },
  {
    id: 'desk-2',
    name: 'MetaballSmin.hlsl',
    extension: 'HLSL',
    sizeLabel: '2.8 KB',
    addedAt: 'Desktop',
    pinned: false,
    contentPreview: 'float smin(float a, float b, float k) { ... }',
  },
  {
    id: 'desk-3',
    name: 'BuildNotes_OCR.png',
    extension: 'PNG',
    sizeLabel: '412 KB',
    addedAt: 'Desktop',
    pinned: false,
    contentPreview: 'Extracted text: PublishAot=true reduces working set to 12.4 MB',
  },
];

export const DesktopStudioDock: React.FC<DesktopStudioDockProps> = ({
  isPlaying,
  onTogglePlay,
  hasActiveTimer,
  onToggleDemoTimer,
  activeHud,
  onTriggerCall,
  onTriggerAgentPrompt,
  onTriggerSystemHud,
  onSendDesktopFileToTray,
  preferences,
  onUpdatePreferences,
  onOpenFullSettings,
  isAstraOpen,
  onToggleVoiceAgent,
  onDownloadWinUIZip,
}) => {
  const isBottomPill = preferences.anchorPosition === PillAnchorPosition.BottomTaskbar;
  const palette = resolveThemePalette(
    preferences.themeId,
    preferences.customPrimaryHex,
    preferences.customSecondaryHex
  );

  return (
    <>
      {/* Draggable Desktop Files on Left of Simulated Windows 11 Screen */}
      <aside
        aria-label="Simulated Windows desktop files"
        onClick={(e) => e.stopPropagation()}
        className="hidden xl:flex flex-col gap-2.5 absolute left-6 top-20 z-10 w-44"
      >
        <div className="text-[11px] font-medium text-slate-400 px-1">
          Drag onto Pill or click
        </div>
        {DESKTOP_DRAGGABLE_FILES.map((file, idx) => {
          const Icon = idx === 0 ? FileText : idx === 1 ? FileCode2 : ImageIcon;
          return (
            <button
              key={file.id}
              type="button"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  'application/x-dynamic-ledge-file',
                  JSON.stringify(file)
                );
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => onSendDesktopFileToTray(file)}
              title={`Drag "${file.name}" onto the Dynamic Island or click to send to Tray`}
              className="group flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/45 hover:bg-slate-900/75 backdrop-blur-md border border-white/10 text-left transition-colors focus-visible:outline-2 focus-visible:outline-sky-400"
            >
              <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center text-sky-300 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-100 truncate">{file.name}</div>
                <div className="text-[11px] text-slate-400 tabular-nums">{file.sizeLabel}</div>
              </div>
            </button>
          );
        })}
      </aside>

      {/* Bottom Interactive Event Simulator & Instant QoL Controls */}
      <section
        aria-label="Live Windows event triggers and customization dock"
        onClick={(e) => e.stopPropagation()}
        className={`relative z-20 mt-auto mx-auto w-full max-w-5xl px-4 transition-all duration-300 ${
          isBottomPill ? 'pb-20' : 'pb-5'
        }`}
      >
        <div className="bg-slate-950/80 backdrop-blur-2xl border border-white/12 rounded-2xl p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-2.5">
          {/* Row 1: Live Windows Event Triggers */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
              Live Events
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              {preferences.aiEnabled && (
                <button
                  type="button"
                  aria-pressed={isAstraOpen}
                  onClick={onToggleVoiceAgent}
                  style={{
                    borderColor: `${palette.primaryHex}66`,
                    backgroundColor: isAstraOpen ? palette.primaryHex : `${palette.primaryHex}1f`,
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap shrink-0 ${
                    isAstraOpen ? palette.onPrimaryTextClass : 'text-white hover:opacity-90'
                  }`}
                >
                  <Sparkles
                    className="w-3.5 h-3.5"
                    style={{ color: isAstraOpen ? 'currentColor' : palette.primaryHex }}
                  />
                  <span>
                    {isAstraOpen
                      ? 'Astra Active in Pill'
                      : `Astra in Pill (${preferences.voiceAgentShortcut})`}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  playTactilePop(isPlaying ? 'toggleOff' : 'toggleOn');
                  onTogglePlay();
                }}
                aria-pressed={isPlaying}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                  isPlaying
                    ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                    : 'bg-white/8 hover:bg-white/14 text-slate-200 border border-transparent'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Music Live' : 'Play Music'}</span>
              </button>

              <button
                type="button"
                onClick={onToggleDemoTimer}
                aria-pressed={hasActiveTimer}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                  hasActiveTimer
                    ? 'bg-sky-400/20 text-sky-200 border border-sky-400/30'
                    : 'bg-white/8 hover:bg-white/14 text-slate-200 border border-transparent'
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                <span>{hasActiveTimer ? 'Split Droplet On' : 'Dual Timer Split'}</span>
              </button>

              <button
                type="button"
                onClick={onTriggerCall}
                aria-pressed={activeHud === 'call'}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                  activeHud === 'call'
                    ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/30'
                    : 'bg-white/8 hover:bg-white/14 text-slate-200 border border-transparent'
                }`}
              >
                <PhoneIncoming className="w-3.5 h-3.5" />
                <span>Teams Call</span>
              </button>

              <button
                type="button"
                onClick={onTriggerAgentPrompt}
                aria-pressed={activeHud === 'agent'}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                  activeHud === 'agent'
                    ? 'bg-sky-500/25 text-sky-200 border border-sky-400/30'
                    : 'bg-white/8 hover:bg-white/14 text-slate-200 border border-transparent'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Agent Hook</span>
              </button>

              <button
                type="button"
                onClick={() => onTriggerSystemHud('battery')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-white/8 hover:bg-white/14 text-emerald-200 transition-colors whitespace-nowrap shrink-0"
              >
                <BatteryCharging className="w-3.5 h-3.5" />
                <span>65W Charge ETA</span>
              </button>

              <button
                type="button"
                onClick={() => onTriggerSystemHud('volume')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-white/8 hover:bg-white/14 text-slate-200 transition-colors whitespace-nowrap shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Volume</span>
              </button>

              <button
                type="button"
                onClick={() => onTriggerSystemHud('brightness')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-white/8 hover:bg-white/14 text-slate-200 transition-colors whitespace-nowrap shrink-0"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Brightness</span>
              </button>

              <button
                type="button"
                onClick={() => onTriggerSystemHud('download')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-white/8 hover:bg-white/14 text-slate-200 transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Row 2: OS Privacy Mask Controls, Settings & Native Package */}
          <div className="pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <button
                type="button"
                aria-pressed={preferences.privacyMaskEnabled}
                onClick={() => {
                  playTactilePop(preferences.privacyMaskEnabled ? 'toggleOff' : 'toggleOn');
                  onUpdatePreferences({ privacyMaskEnabled: !preferences.privacyMaskEnabled });
                }}
                title="Toggle OS-level SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE) privacy masking"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors whitespace-nowrap ${
                  preferences.privacyMaskEnabled
                    ? 'bg-emerald-500/16 border-emerald-400/35 text-emerald-200'
                    : 'bg-white/[0.05] border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  OS Privacy Mask: {preferences.privacyMaskEnabled ? 'On' : 'Off'}
                </span>
              </button>

              <button
                type="button"
                aria-pressed={preferences.privacySimulateCaptureView}
                onClick={() => {
                  playTactilePop('tab');
                  onUpdatePreferences({
                    privacySimulateCaptureView: !preferences.privacySimulateCaptureView,
                  });
                }}
                title="Simulate what remote Zoom / Teams / Meet screen-share viewers see"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors whitespace-nowrap ${
                  preferences.privacySimulateCaptureView
                    ? 'bg-sky-500/22 border-sky-400/40 text-sky-100'
                    : 'bg-white/[0.05] border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                {preferences.privacySimulateCaptureView ? (
                  <Eye className="w-3.5 h-3.5 text-sky-300" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>
                  {preferences.privacySimulateCaptureView
                    ? 'Caller View Active'
                    : 'Preview Caller Screen-Share'}
                </span>
              </button>

              <span className="hidden xl:inline text-[11px] text-slate-400 font-mono">
                {palette.name} · {preferences.toggleShortcut} / {preferences.voiceAgentShortcut}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playTactilePop('expand');
                  onOpenFullSettings();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/16 text-white border border-white/15 transition-all shadow-sm focus-visible:outline-2 focus-visible:outline-sky-400 whitespace-nowrap"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Pill Settings</span>
              </button>

              {onDownloadWinUIZip && (
                <button
                  type="button"
                  onClick={() => {
                    playTactilePop('confirm');
                    onDownloadWinUIZip();
                  }}
                  style={{ backgroundColor: palette.primaryHex }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all shadow-sm focus-visible:outline-2 focus-visible:outline-sky-400 whitespace-nowrap ${palette.onPrimaryTextClass}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Pill Native (.zip)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
