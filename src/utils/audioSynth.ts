import { SoundActionKind, SoundProfileId } from '../types/ledge';

let sharedAudioCtx: AudioContext | null = null;
let lastSoundTimestamp = 0;
let lastCollapseTimestamp = 0;

let currentProfile: SoundProfileId = 'wooden_marimba';
let currentVolume = 0.55;

export function configureSoundEngine(profile: SoundProfileId, volume: number): void {
  currentProfile = profile;
  currentVolume = Math.max(0, Math.min(1, volume));
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new Ctx({ latencyHint: 'interactive' });
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

if (typeof window !== 'undefined') {
  const warmUp = () => {
    try {
      const ctx = getAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        // Play 1-frame silent buffer to fully unpause hardware audio pipeline with zero latency
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
      }
    } catch {}
    window.removeEventListener('pointerdown', warmUp);
    window.removeEventListener('keydown', warmUp);
    window.removeEventListener('pointerenter', warmUp);
    window.removeEventListener('mousemove', warmUp);
  };
  window.addEventListener('pointerdown', warmUp, { passive: true, capture: true });
  window.addEventListener('keydown', warmUp, { passive: true, capture: true });
  window.addEventListener('pointerenter', warmUp, { passive: true, capture: true });
  window.addEventListener('mousemove', warmUp, { passive: true, capture: true });
}

/**
 * Studio acoustic feedback synthesizer with warm low-pass filtering,
 * distinct action articulations, 9 themed sound profiles (including Cyber Synth,
 * Retro Cassette, Motorsport GT Paddle, and Zen Garden), and anti-fatigue rate limiting.
 */
export function playTactilePop(
  kind: SoundActionKind = 'expand',
  overrideProfile?: SoundProfileId
): void {
  const profile = overrideProfile ?? currentProfile;
  if (profile === 'silent' || currentVolume <= 0.01) return;

  const nowPerf = typeof performance !== 'undefined' ? performance.now() : Date.now();
  // Enforce crisp single collapse sound (reject duplicate collapse triggers within 420ms unless overrideProfile provided)
  if (!overrideProfile && kind === 'collapse' && nowPerf - lastCollapseTimestamp < 420) return;
  if (kind === 'collapse') lastCollapseTimestamp = nowPerf;
  if (!overrideProfile && nowPerf - lastSoundTimestamp < 15) return;
  lastSoundTimestamp = nowPerf;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t0 = ctx.currentTime + 0.001;
    const masterGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';

    const baseAmp = 0.022 * currentVolume;

    if (profile === 'wooden_marimba') {
      filter.frequency.setValueAtTime(920, t0);
      const osc = ctx.createOscillator();
      osc.type = 'triangle';

      const freqMap: Record<SoundActionKind, [number, number, number]> = {
        expand: [293.66, 369.99, 0.055],
        collapse: [329.63, 246.94, 0.05],
        tab: [392.0, 440.0, 0.032],
        toggleOn: [349.23, 440.0, 0.042],
        toggleOff: [349.23, 293.66, 0.04],
        drop: [261.63, 523.25, 0.075],
        notification: [440.0, 554.37, 0.09],
        confirm: [392.0, 587.33, 0.07],
      };

      const [fStart, fEnd, dur] = freqMap[kind];
      osc.frequency.setValueAtTime(fStart, t0);
      osc.frequency.exponentialRampToValueAtTime(fEnd, t0 + dur);

      masterGain.gain.setValueAtTime(0.0005, t0);
      masterGain.gain.linearRampToValueAtTime(baseAmp, t0 + 0.006);
      masterGain.gain.exponentialRampToValueAtTime(0.0004, t0 + dur + 0.015);

      osc.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } else if (profile === 'velvet_droplet') {
      filter.frequency.setValueAtTime(680, t0);
      const osc = ctx.createOscillator();
      osc.type = 'sine';

      const [fStart, fEnd, dur]: [number, number, number] =
        kind === 'collapse' || kind === 'toggleOff'
          ? [280, 175, 0.055]
          : kind === 'tab'
            ? [310, 360, 0.03]
            : kind === 'drop' || kind === 'confirm'
              ? [230, 460, 0.08]
              : [210, 340, 0.06];

      osc.frequency.setValueAtTime(fStart, t0);
      osc.frequency.exponentialRampToValueAtTime(fEnd, t0 + dur);

      masterGain.gain.setValueAtTime(0.0005, t0);
      masterGain.gain.linearRampToValueAtTime(baseAmp * 1.1, t0 + 0.008);
      masterGain.gain.exponentialRampToValueAtTime(0.0004, t0 + dur + 0.02);

      osc.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.025);
    } else if (profile === 'brushed_glass') {
      filter.frequency.setValueAtTime(1450, t0);
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';

      const root =
        kind === 'collapse' || kind === 'toggleOff'
          ? 440
          : kind === 'tab'
            ? 523.25
            : kind === 'confirm' || kind === 'notification'
              ? 587.33
              : 493.88;

      const dur = kind === 'tab' ? 0.038 : 0.075;
      osc1.frequency.setValueAtTime(root, t0);
      osc2.frequency.setValueAtTime(root * 1.498, t0);

      masterGain.gain.setValueAtTime(0.0004, t0);
      masterGain.gain.linearRampToValueAtTime(baseAmp * 0.68, t0 + 0.008);
      masterGain.gain.exponentialRampToValueAtTime(0.0003, t0 + dur + 0.025);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      osc1.start(t0);
      osc2.start(t0);
      osc1.stop(t0 + dur + 0.03);
      osc2.stop(t0 + dur + 0.03);
    } else if (profile === 'cyber_synth') {
      // Crisp filtered synth chirp for Cyberpunk HUD
      filter.frequency.setValueAtTime(1850, t0);
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      const [f0, f1, dur]: [number, number, number] =
        kind === 'collapse' || kind === 'toggleOff'
          ? [520, 240, 0.048]
          : kind === 'tab'
            ? [660, 880, 0.028]
            : kind === 'confirm'
              ? [440, 880, 0.065]
              : [360, 720, 0.055];
      osc.frequency.setValueAtTime(f0, t0);
      osc.frequency.exponentialRampToValueAtTime(f1, t0 + dur);

      masterGain.gain.setValueAtTime(0.0004, t0);
      masterGain.gain.linearRampToValueAtTime(baseAmp * 0.6, t0 + 0.004);
      masterGain.gain.exponentialRampToValueAtTime(0.0003, t0 + dur + 0.015);

      osc.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } else if (profile === 'retro_cassette') {
      // Warm analog cassette deck latch & phosphor pip
      filter.frequency.setValueAtTime(760, t0);
      const osc = ctx.createOscillator();
      osc.type = 'square';
      const startHz = kind === 'collapse' || kind === 'toggleOff' ? 196 : 246.94;
      const endHz = kind === 'tab' ? 329.63 : 164.81;
      osc.frequency.setValueAtTime(startHz, t0);
      osc.frequency.exponentialRampToValueAtTime(endHz, t0 + 0.034);

      masterGain.gain.setValueAtTime(baseAmp * 0.55, t0);
      masterGain.gain.exponentialRampToValueAtTime(0.0003, t0 + 0.038);

      osc.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.042);
    } else if (profile === 'mechanical_gt') {
      // Carbon paddle-shift micro detent click
      filter.frequency.setValueAtTime(1200, t0);
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(kind === 'toggleOff' ? 150 : 210, t0);
      osc.frequency.exponentialRampToValueAtTime(68, t0 + 0.022);

      masterGain.gain.setValueAtTime(baseAmp * 1.25, t0);
      masterGain.gain.exponentialRampToValueAtTime(0.0004, t0 + 0.026);

      osc.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.03);
    } else if (profile === 'zen_garden') {
      // Soft bamboo & ceramic wind-bell harmonic for Paper & Sakura kits
      filter.frequency.setValueAtTime(1600, t0);
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'triangle';
      const baseHz = kind === 'collapse' || kind === 'toggleOff' ? 392 : 523.25;
      osc1.frequency.setValueAtTime(baseHz, t0);
      osc2.frequency.setValueAtTime(baseHz * 2.0, t0);

      masterGain.gain.setValueAtTime(0.0004, t0);
      masterGain.gain.linearRampToValueAtTime(baseAmp * 0.65, t0 + 0.01);
      masterGain.gain.exponentialRampToValueAtTime(0.0003, t0 + 0.095);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);
      osc1.start(t0);
      osc2.start(t0);
      osc1.stop(t0 + 0.1);
      osc2.stop(t0 + 0.1);
    } else if (profile === 'taptic_thump') {
      filter.frequency.setValueAtTime(220, t0);
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      const startHz = kind === 'collapse' || kind === 'toggleOff' ? 92 : 118;
      osc.frequency.setValueAtTime(startHz, t0);
      osc.frequency.exponentialRampToValueAtTime(48, t0 + 0.028);

      masterGain.gain.setValueAtTime(baseAmp * 1.4, t0);
      masterGain.gain.exponentialRampToValueAtTime(0.0004, t0 + 0.032);

      osc.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.036);
    }
  } catch {
    // Gracefully ignore in restricted headless audio contexts
  }
}

export function formatDurationClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatStopwatchClock(elapsedMs: number): string {
  const totalCs = Math.max(0, Math.floor(elapsedMs / 10));
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const sec = totalSec % 60;
  const min = Math.floor(totalSec / 60);
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${cs
    .toString()
    .padStart(2, '0')}`;
}
