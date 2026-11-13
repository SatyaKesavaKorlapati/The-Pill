import React, { useEffect, useRef } from 'react';
import { MusicVisualizerStyle } from '../types/ledge';

interface FluidMusicVisualizerProps {
  style: MusicVisualizerStyle;
  isPlaying: boolean;
  accentHex: string;
  secondaryHex?: string;
  compact?: boolean;
  lowPowerEco?: boolean;
  onCycleStyle?: () => void;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = (hex || '#38bdf8').replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(full || '38bdf8', 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Zero-React-re-render 60fps HTML5 Canvas fluid music illustrator.
 * Automatically parks its rAF loop when paused to maintain 0.0% idle CPU usage.
 */
export const FluidMusicVisualizer: React.FC<FluidMusicVisualizerProps> = ({
  style,
  isPlaying,
  accentHex,
  secondaryHex = '#38bdf8',
  compact = false,
  lowPowerEco = false,
  onCycleStyle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const propsRef = useRef({ style, isPlaying, accentHex, secondaryHex, compact, lowPowerEco });
  propsRef.current = { style, isPlaying, accentHex, secondaryHex, compact, lowPowerEco };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let phase = 0;
    let smoothEnergy = isPlaying ? 1 : 0.14;
    let lastTs = performance.now();

    const drawFrame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;

      const {
        style: mode,
        isPlaying: playing,
        accentHex: c1,
        secondaryHex: c2,
        compact: isCompact,
        lowPowerEco: eco,
      } = propsRef.current;

      const targetEnergy = playing ? 1.0 : 0.12;
      smoothEnergy += (targetEnergy - smoothEnergy) * Math.min(1, dt * 8);
      if (playing) {
        phase += dt * (eco ? 2.1 : 3.4);
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth || (isCompact ? 22 : 240);
      const cssH = canvas.clientHeight || (isCompact ? 14 : 46);
      const targetW = Math.round(cssW * dpr);
      const targetH = Math.round(cssH * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      if (isCompact) {
        // 5-bar silky 60fps Dynamic Island mini-spectrum
        const barCount = 5;
        const barW = 2.5;
        const gap = 2;
        const totalW = barCount * barW + (barCount - 1) * gap;
        const startX = (cssW - totalW) / 2;

        for (let i = 0; i < barCount; i++) {
          const wave1 = Math.sin(phase * 2.1 + i * 1.15);
          const wave2 = Math.cos(phase * 1.35 - i * 0.85);
          const raw = 0.25 + 0.75 * Math.abs(wave1 * 0.65 + wave2 * 0.35);
          const h = Math.max(3, raw * smoothEnergy * (cssH - 1));
          const x = startX + i * (barW + gap);
          const y = (cssH - h) / 2;

          const grad = ctx.createLinearGradient(0, y, 0, y + h);
          grad.addColorStop(0, c1);
          grad.addColorStop(1, c2);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barW, h, 99);
          ctx.fill();
        }
      } else if (mode === 'liquid_ribbon') {
        // Multi-layered translucent harmonic silk ribbons (Apple Music / Siri fluid aesthetic)
        const layers = [
          { color: c1, alpha: 0.55, freq: 0.026, speed: 1.25, amp: 0.38, offset: 0 },
          { color: c2, alpha: 0.45, freq: 0.034, speed: -0.95, amp: 0.32, offset: 1.7 },
          { color: '#ffffff', alpha: 0.24, freq: 0.045, speed: 1.65, amp: 0.22, offset: 3.1 },
        ];
        const midY = cssH * 0.52;

        for (const layer of layers) {
          ctx.beginPath();
          ctx.moveTo(0, midY);
          for (let x = 0; x <= cssW; x += 4) {
            const norm = x / cssW;
            const envelope = Math.sin(norm * Math.PI); // Taper cleanly at both ends
            const yOffset =
              (Math.sin(x * layer.freq + phase * layer.speed + layer.offset) * 0.68 +
                Math.cos(x * layer.freq * 1.6 - phase * 0.8 + layer.offset) * 0.32) *
              cssH *
              layer.amp *
              envelope *
              smoothEnergy;
            ctx.lineTo(x, midY + yOffset);
          }
          for (let x = cssW; x >= 0; x -= 4) {
            const norm = x / cssW;
            const envelope = Math.sin(norm * Math.PI);
            const yOffset =
              (Math.sin(x * layer.freq + phase * layer.speed + layer.offset + 0.9) * 0.55) *
              cssH *
              layer.amp *
              0.55 *
              envelope *
              smoothEnergy;
            ctx.lineTo(x, midY - yOffset);
          }
          ctx.closePath();
          ctx.fillStyle = hexToRgba(layer.color, layer.alpha);
          ctx.fill();
        }
      } else if (mode === 'harmonic_bars') {
        // 28-bar rounded fluid spectrum with continuous sub-pixel interpolation
        const count = 28;
        const gap = 3;
        const barW = Math.max(2.5, (cssW - (count - 1) * gap - 8) / count);
        const startX = 4;

        for (let i = 0; i < count; i++) {
          const norm = i / (count - 1);
          const bell = 0.35 + 0.65 * Math.sin(norm * Math.PI);
          const harmonic =
            Math.abs(
              Math.sin(phase * 1.85 + i * 0.42) * 0.6 +
                Math.cos(phase * 1.15 - i * 0.28) * 0.4
            ) * bell;
          const barH = Math.max(4, (4 + harmonic * (cssH - 10)) * smoothEnergy + 3 * (1 - smoothEnergy));
          const x = startX + i * (barW + gap);
          const y = (cssH - barH) / 2;

          const grad = ctx.createLinearGradient(0, y, 0, y + barH);
          grad.addColorStop(0, c1);
          grad.addColorStop(1, hexToRgba(c2, 0.78));
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barW, barH, 99);
          ctx.fill();
        }
      } else if (mode === 'orbital_aura') {
        // Breathing concentric plasma rings + bilateral pulse waves
        const cx = cssW / 2;
        const cy = cssH / 2;

        for (let rIdx = 0; rIdx < 3; rIdx++) {
          const pulse = 1 + 0.28 * Math.sin(phase * 1.9 - rIdx * 0.9) * smoothEnergy;
          const rx = (28 + rIdx * 26) * pulse;
          const ry = (9 + rIdx * 4.5) * pulse;

          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, Math.min(cssH * 0.46, ry), 0, 0, Math.PI * 2);
          ctx.strokeStyle = hexToRgba(rIdx % 2 === 0 ? c1 : c2, (0.62 - rIdx * 0.16) * (0.4 + 0.6 * smoothEnergy));
          ctx.lineWidth = 2.2 - rIdx * 0.4;
          ctx.stroke();
        }

        const coreGrad = ctx.createRadialGradient(cx, cy, 1, cx, cy, 24);
        coreGrad.addColorStop(0, hexToRgba(c1, 0.75 * smoothEnergy + 0.15));
        coreGrad.addColorStop(1, hexToRgba(c2, 0));
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 24, 0, Math.PI * 2);
        ctx.fill();
      } else if (mode === 'mirrored_wave') {
        // Studio symmetric spline waveform
        const midY = cssH / 2;
        const grad = ctx.createLinearGradient(0, 0, cssW, 0);
        grad.addColorStop(0, hexToRgba(c2, 0.2));
        grad.addColorStop(0.5, c1);
        grad.addColorStop(1, hexToRgba(c2, 0.2));

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x <= cssW; x += 3) {
          const env = Math.pow(Math.sin((x / cssW) * Math.PI), 1.4);
          const y =
            midY +
            Math.sin(x * 0.08 - phase * 2.6) *
              Math.cos(x * 0.025 + phase * 1.1) *
              (cssH * 0.42) *
              env *
              smoothEnergy;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (mode === 'particle_field') {
        // Luminous acoustic stardust drifting smoothly
        const count = 26;
        for (let i = 0; i < count; i++) {
          const seed = i * 17.37;
          const x = ((seed * 13 + phase * (18 + (i % 5) * 6)) % (cssW - 12)) + 6;
          const yBase = cssH * 0.5;
          const y =
            yBase +
            Math.sin(phase * 1.4 + seed) * (cssH * 0.34) * smoothEnergy;
          const radius = 1.4 + (i % 3) * 0.85 * (0.5 + 0.5 * smoothEnergy);
          ctx.fillStyle = hexToRgba(i % 2 === 0 ? c1 : c2, 0.45 + 0.4 * Math.sin(phase + i));
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Minimal Pulse: Ultra-light dual stereo filament
        const midY = cssH / 2;
        const spanL = (0.2 + 0.72 * Math.abs(Math.sin(phase * 1.5))) * (cssW * 0.44) * smoothEnergy;
        const spanR = (0.2 + 0.72 * Math.abs(Math.cos(phase * 1.35 + 0.6))) * (cssW * 0.44) * smoothEnergy;

        ctx.fillStyle = hexToRgba('#ffffff', 0.08);
        ctx.beginPath();
        ctx.roundRect(8, midY - 5, cssW - 16, 3, 99);
        ctx.roundRect(8, midY + 2, cssW - 16, 3, 99);
        ctx.fill();

        const g = ctx.createLinearGradient(cssW / 2 - spanL, 0, cssW / 2 + spanR, 0);
        g.addColorStop(0, c2);
        g.addColorStop(0.5, c1);
        g.addColorStop(1, c2);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.roundRect(cssW / 2 - spanL, midY - 5, spanL * 2, 3, 99);
        ctx.roundRect(cssW / 2 - spanR, midY + 2, spanR * 2, 3, 99);
        ctx.fill();
      }

      // Park rAF loop completely once energy settles when paused -> 0.0% idle CPU
      if (playing || Math.abs(smoothEnergy - targetEnergy) > 0.01) {
        rafId = requestAnimationFrame(drawFrame);
      } else {
        rafId = 0;
      }
    };

    lastTs = performance.now();
    rafId = requestAnimationFrame(drawFrame);
    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId);
    };
  }, [isPlaying, style, accentHex, secondaryHex, compact, lowPowerEco]);

  if (compact) {
    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="w-[22px] h-[14px] block shrink-0"
      />
    );
  }

  if (onCycleStyle) {
    return (
      <button
        type="button"
        onClick={onCycleStyle}
        title="Click to switch fluid music illustrator animation"
        aria-label={`Music visualizer (${(style || 'bars').replace(/_/g, ' ')}) — click to switch style`}
        className="w-full my-1.5 px-2 py-1 rounded-xl bg-white/[0.03] hover:bg-white/[0.055] border border-white/[0.05] relative overflow-hidden h-11 flex items-center cursor-pointer transition-colors group focus-visible:outline-2 focus-visible:outline-sky-400"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
        <span className="absolute right-2 bottom-1 text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none capitalize">
          {(style || 'bars').replace(/_/g, ' ')} · Next
        </span>
      </button>
    );
  }

  return (
    <div className="my-1.5 px-2 py-1 rounded-xl bg-white/[0.03] border border-white/[0.05] relative overflow-hidden h-11 flex items-center">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
