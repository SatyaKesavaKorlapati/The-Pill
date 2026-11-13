import React, { useEffect, useRef } from 'react';

export type SiriOrbVisualState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface AstraSiriSphereCanvasProps {
  size?: number;
  audioAmplitude?: number;
  audioLevel?: number;
  state?: SiriOrbVisualState;
  lowPowerEco?: boolean;
  className?: string;
}

interface RibbonLayerSpec {
  r: number;
  g: number;
  b: number;
  tiltX: number;
  tiltZ: number;
  freq1: number;
  freq2: number;
  speed: number;
  widthFactor: number;
  phaseOffset: number;
}

// 5 rotating 3D parametric ribbons: Cyan, Magenta, Royal Indigo, Violet, Coral-Gold
const SIRI_RIBBONS: RibbonLayerSpec[] = [
  // 1. Cyan: rgba(0, 242, 254, 0.85)
  {
    r: 0,
    g: 242,
    b: 254,
    tiltX: 0.24,
    tiltZ: -0.18,
    freq1: 2.0,
    freq2: 3.0,
    speed: 1.25,
    widthFactor: 0.34,
    phaseOffset: 0.0,
  },
  // 2. Magenta: rgba(255, 0, 127, 0.85)
  {
    r: 255,
    g: 0,
    b: 127,
    tiltX: -0.32,
    tiltZ: 0.28,
    freq1: 2.0,
    freq2: 4.0,
    speed: -1.08,
    widthFactor: 0.32,
    phaseOffset: 1.35,
  },
  // 3. Royal Indigo: rgba(99, 102, 241, 0.85)
  {
    r: 99,
    g: 102,
    b: 241,
    tiltX: 0.45,
    tiltZ: 0.42,
    freq1: 1.0,
    freq2: 3.0,
    speed: 0.92,
    widthFactor: 0.38,
    phaseOffset: 2.6,
  },
  // 4. Violet: rgba(168, 85, 247, 0.85)
  {
    r: 168,
    g: 85,
    b: 247,
    tiltX: -0.18,
    tiltZ: -0.46,
    freq1: 3.0,
    freq2: 2.0,
    speed: 1.42,
    widthFactor: 0.28,
    phaseOffset: 4.1,
  },
  // 5. Coral-Gold: rgba(245, 158, 11, 0.80)
  {
    r: 245,
    g: 158,
    b: 11,
    tiltX: 0.12,
    tiltZ: 0.12,
    freq1: 2.0,
    freq2: 5.0,
    speed: -1.35,
    widthFactor: 0.22,
    phaseOffset: 5.2,
  },
];

export const AstraSiriSphereCanvas: React.FC<AstraSiriSphereCanvasProps> = ({
  size = 42,
  audioAmplitude,
  audioLevel = 0,
  state = 'idle',
  lowPowerEco = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const effectiveAmp = audioAmplitude !== undefined ? audioAmplitude : audioLevel;
  const ampRef = useRef(effectiveAmp);
  ampRef.current = effectiveAmp;
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);

    let rafId = 0;
    let smoothEnergy = 0.25;
    let phase = 0;
    let lastTs = performance.now();

    const renderFrame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.004, (now - lastTs) / 1000));
      lastTs = now;

      const curState = stateRef.current;
      const micLvl = Math.max(0, Math.min(1, ampRef.current));

      const targetEnergy =
        curState === 'listening'
          ? 0.48 + micLvl * 0.65
          : curState === 'speaking'
            ? 0.72 + Math.sin(now * 0.012) * 0.22
            : curState === 'thinking'
              ? 0.64
              : 0.28;

      smoothEnergy += (targetEnergy - smoothEnergy) * Math.min(1, dt * 8);

      const speedMult =
        curState === 'thinking'
          ? 2.15
          : curState === 'speaking'
            ? 1.75
            : curState === 'listening'
              ? 1.35 + micLvl * 1.1
              : 0.72;

      phase += dt * speedMult;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w * 0.5;
      const cy = h * 0.5;
      const radius = Math.min(w, h) * 0.46;

      ctx.clearRect(0, 0, w, h);

      // 1. Soft External Siri Aura Halo
      const outerHalo = ctx.createRadialGradient(cx, cy, radius * 0.55, cx, cy, radius * 1.09);
      outerHalo.addColorStop(0, 'rgba(56, 189, 248, 0)');
      outerHalo.addColorStop(0.75, `rgba(139, 92, 246, ${(0.18 + smoothEnergy * 0.18).toFixed(3)})`);
      outerHalo.addColorStop(1, 'rgba(236, 72, 153, 0)');
      ctx.fillStyle = outerHalo;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.09, 0, Math.PI * 2);
      ctx.fill();

      // 2. Hard-Clipped Crystal Sphere Interior
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      // Deep dark refractive sapphire-obsidian sphere base
      const sphereBg = ctx.createRadialGradient(
        cx - radius * 0.22,
        cy - radius * 0.25,
        radius * 0.05,
        cx,
        cy,
        radius
      );
      sphereBg.addColorStop(0, '#121936');
      sphereBg.addColorStop(0.58, '#080c1d');
      sphereBg.addColorStop(1, '#03050c');
      ctx.fillStyle = sphereBg;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      // 3. Additive 3D Parametric Silk Ribbons (`lighter` creates natural white-hot core at intersections!)
      ctx.globalCompositeOperation = 'lighter';

      const steps = lowPowerEco ? 28 : 44;
      for (let i = 0; i < SIRI_RIBBONS.length; i++) {
        const rib = SIRI_RIBBONS[i];
        const tPhase = phase * rib.speed + rib.phaseOffset;
        const amp = radius * (0.28 + smoothEnergy * 0.34);

        const cosZ = Math.cos(rib.tiltZ + Math.sin(tPhase * 0.35) * 0.22);
        const sinZ = Math.sin(rib.tiltZ + Math.sin(tPhase * 0.35) * 0.22);
        const cosX = Math.cos(rib.tiltX + Math.cos(tPhase * 0.28) * 0.2);

        const pts: { x: number; y: number; depth: number }[] = [];
        for (let s = 0; s <= steps; s++) {
          const u = (s / steps) * 2 - 1; // -1 .. 1 across sphere chord
          const env = Math.sqrt(Math.max(0, 1 - u * u)); // spherical envelope tapers cleanly at sphere rim
          const rawX = u * radius * 0.96;
          const waveY =
            (Math.sin(u * Math.PI * rib.freq1 + tPhase) * 0.62 +
              Math.cos(u * Math.PI * rib.freq2 - tPhase * 1.25) * 0.38) *
            amp *
            env;
          const waveZ = Math.cos(u * Math.PI * rib.freq1 + tPhase) * env;

          const rx = rawX * cosZ - waveY * sinZ;
          const ry = (rawX * sinZ + waveY * cosZ) * cosX;

          pts.push({
            x: cx + rx,
            y: cy + ry,
            depth: 0.55 + 0.45 * waveZ,
          });
        }

        // Draw volumetric multi-pass feathered silk ribbon
        const baseThick = radius * rib.widthFactor * (0.8 + smoothEnergy * 0.35);
        const passes = lowPowerEco
          ? [
              { mult: 1.35, alpha: 0.16 },
              { mult: 0.55, alpha: 0.48 },
            ]
          : [
              { mult: 1.75, alpha: 0.1 },
              { mult: 1.05, alpha: 0.22 },
              { mult: 0.52, alpha: 0.44 },
              { mult: 0.2, alpha: 0.62 },
            ];

        for (const p of passes) {
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let k = 1; k < pts.length - 1; k++) {
            const xc = (pts[k].x + pts[k + 1].x) * 0.5;
            const yc = (pts[k].y + pts[k + 1].y) * 0.5;
            ctx.quadraticCurveTo(pts[k].x, pts[k].y, xc, yc);
          }
          if (pts.length > 1) {
            ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
          }

          ctx.lineWidth = Math.max(1.2, baseThick * p.mult);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = `rgba(${rib.r}, ${rib.g}, ${rib.b}, ${p.alpha})`;
          ctx.stroke();
        }
      }

      // 4. White-Hot Incandescent Core Bloom
      const coreR = radius * (0.2 + smoothEnergy * 0.14);
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      coreGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.45)');
      coreGrad.addColorStop(0.75, 'rgba(168, 85, 247, 0.12)');
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 5. Crystal Specular Rim Highlight (Top-Left arc)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 0.75, -Math.PI * 0.85, -Math.PI * 0.15);
      const rimGrad = ctx.createLinearGradient(cx - radius * 0.7, cy - radius, cx + radius * 0.7, cy);
      rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      rimGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
      rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.strokeStyle = rimGrad;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, [size, lowPowerEco]);

  return (
    <canvas
      ref={canvasRef}
      className={`inline-block select-none pointer-events-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};
