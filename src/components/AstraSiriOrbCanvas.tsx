import React, { useEffect, useRef } from 'react';
import { AstraOrbStyle } from '../types/ledge';

export type SiriOrbVisualState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface AstraSiriOrbCanvasProps {
  state: SiriOrbVisualState;
  audioLevel?: number;
  size?: number;
  lowPowerEco?: boolean;
  style?: AstraOrbStyle;
  className?: string;
}

export interface RibbonLayerSpec {
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

export function resolveRibbonSpecs(style: AstraOrbStyle = 'siri_rainbow'): RibbonLayerSpec[] {
  if (style === 'celestial_nebula') {
    return [
      { r: 99, g: 102, b: 241, tiltX: 0.24, tiltZ: -0.18, freq1: 2.0, freq2: 3.0, speed: 1.25, widthFactor: 0.35, phaseOffset: 0.0 },
      { r: 217, g: 70, b: 239, tiltX: -0.32, tiltZ: 0.28, freq1: 2.0, freq2: 4.0, speed: -1.08, widthFactor: 0.32, phaseOffset: 1.35 },
      { r: 34, g: 211, b: 238, tiltX: 0.45, tiltZ: 0.42, freq1: 1.0, freq2: 3.0, speed: 0.92, widthFactor: 0.38, phaseOffset: 2.6 },
      { r: 168, g: 85, b: 247, tiltX: -0.18, tiltZ: -0.46, freq1: 3.0, freq2: 2.0, speed: 1.42, widthFactor: 0.28, phaseOffset: 4.1 },
      { r: 251, g: 191, b: 36, tiltX: 0.12, tiltZ: 0.12, freq1: 2.0, freq2: 5.0, speed: -1.35, widthFactor: 0.22, phaseOffset: 5.2 },
    ];
  }
  if (style === 'cyber_plasma') {
    return [
      { r: 6, g: 182, b: 212, tiltX: 0.24, tiltZ: -0.18, freq1: 2.0, freq2: 3.0, speed: 1.45, widthFactor: 0.34, phaseOffset: 0.0 },
      { r: 236, g: 72, b: 153, tiltX: -0.32, tiltZ: 0.28, freq1: 2.0, freq2: 4.0, speed: -1.28, widthFactor: 0.32, phaseOffset: 1.35 },
      { r: 245, g: 158, b: 11, tiltX: 0.45, tiltZ: 0.42, freq1: 1.0, freq2: 3.0, speed: 1.02, widthFactor: 0.38, phaseOffset: 2.6 },
      { r: 139, g: 92, b: 246, tiltX: -0.18, tiltZ: -0.46, freq1: 3.0, freq2: 2.0, speed: 1.52, widthFactor: 0.28, phaseOffset: 4.1 },
      { r: 132, g: 204, b: 22, tiltX: 0.12, tiltZ: 0.12, freq1: 2.0, freq2: 5.0, speed: -1.45, widthFactor: 0.22, phaseOffset: 5.2 },
    ];
  }
  if (style === 'neon_pulse') {
    return [
      { r: 163, g: 230, b: 53, tiltX: 0.24, tiltZ: -0.18, freq1: 2.0, freq2: 3.0, speed: 1.35, widthFactor: 0.36, phaseOffset: 0.0 },
      { r: 34, g: 197, b: 94, tiltX: -0.32, tiltZ: 0.28, freq1: 2.0, freq2: 4.0, speed: -1.18, widthFactor: 0.32, phaseOffset: 1.35 },
      { r: 20, g: 184, b: 166, tiltX: 0.45, tiltZ: 0.42, freq1: 1.0, freq2: 3.0, speed: 0.98, widthFactor: 0.38, phaseOffset: 2.6 },
      { r: 52, g: 211, b: 153, tiltX: -0.18, tiltZ: -0.46, freq1: 3.0, freq2: 2.0, speed: 1.45, widthFactor: 0.28, phaseOffset: 4.1 },
      { r: 234, g: 179, b: 8, tiltX: 0.12, tiltZ: 0.12, freq1: 2.0, freq2: 5.0, speed: -1.35, widthFactor: 0.22, phaseOffset: 5.2 },
    ];
  }
  if (style === 'emerald_solar') {
    return [
      { r: 16, g: 185, b: 129, tiltX: 0.24, tiltZ: -0.18, freq1: 2.0, freq2: 3.0, speed: 1.25, widthFactor: 0.35, phaseOffset: 0.0 },
      { r: 245, g: 158, b: 11, tiltX: -0.32, tiltZ: 0.28, freq1: 2.0, freq2: 4.0, speed: -1.08, widthFactor: 0.32, phaseOffset: 1.35 },
      { r: 110, g: 231, b: 183, tiltX: 0.45, tiltZ: 0.42, freq1: 1.0, freq2: 3.0, speed: 0.92, widthFactor: 0.38, phaseOffset: 2.6 },
      { r: 251, g: 191, b: 36, tiltX: -0.18, tiltZ: -0.46, freq1: 3.0, freq2: 2.0, speed: 1.42, widthFactor: 0.28, phaseOffset: 4.1 },
      { r: 217, g: 119, b: 6, tiltX: 0.12, tiltZ: 0.12, freq1: 2.0, freq2: 5.0, speed: -1.35, widthFactor: 0.22, phaseOffset: 5.2 },
    ];
  }
  if (style === 'minimal_pearl') {
    return [
      { r: 226, g: 232, b: 240, tiltX: 0.24, tiltZ: -0.18, freq1: 2.0, freq2: 3.0, speed: 1.15, widthFactor: 0.35, phaseOffset: 0.0 },
      { r: 186, g: 230, b: 253, tiltX: -0.32, tiltZ: 0.28, freq1: 2.0, freq2: 4.0, speed: -0.98, widthFactor: 0.32, phaseOffset: 1.35 },
      { r: 241, g: 245, b: 249, tiltX: 0.45, tiltZ: 0.42, freq1: 1.0, freq2: 3.0, speed: 0.88, widthFactor: 0.38, phaseOffset: 2.6 },
      { r: 203, g: 213, b: 225, tiltX: -0.18, tiltZ: -0.46, freq1: 3.0, freq2: 2.0, speed: 1.32, widthFactor: 0.28, phaseOffset: 4.1 },
      { r: 216, g: 180, b: 254, tiltX: 0.12, tiltZ: 0.12, freq1: 2.0, freq2: 5.0, speed: -1.25, widthFactor: 0.22, phaseOffset: 5.2 },
    ];
  }
  // Default: siri_rainbow
  return [
    { r: 0, g: 238, b: 255, tiltX: 0.24, tiltZ: -0.18, freq1: 2.0, freq2: 3.0, speed: 1.25, widthFactor: 0.34, phaseOffset: 0.0 },
    { r: 244, g: 63, b: 165, tiltX: -0.32, tiltZ: 0.28, freq1: 2.0, freq2: 4.0, speed: -1.08, widthFactor: 0.32, phaseOffset: 1.35 },
    { r: 79, g: 112, b: 255, tiltX: 0.45, tiltZ: 0.42, freq1: 1.0, freq2: 3.0, speed: 0.92, widthFactor: 0.38, phaseOffset: 2.6 },
    { r: 168, g: 85, b: 247, tiltX: -0.18, tiltZ: -0.46, freq1: 3.0, freq2: 2.0, speed: 1.42, widthFactor: 0.28, phaseOffset: 4.1 },
    { r: 255, g: 138, b: 101, tiltX: 0.12, tiltZ: 0.12, freq1: 2.0, freq2: 5.0, speed: -1.35, widthFactor: 0.22, phaseOffset: 5.2 },
  ];
}

export function resolveOrbThemeColors(style: AstraOrbStyle = 'siri_rainbow') {
  if (style === 'celestial_nebula') {
    return {
      haloMid: 'rgba(217, 70, 239, ',
      haloEnd: 'rgba(99, 102, 241, 0)',
      rimMid: 'rgba(217, 70, 239, 0.45)',
      rimEnd: 'rgba(99, 102, 241, 0.55)',
      sphereBase0: '#1e1035',
      sphereBase1: '#0e0820',
      sphereBase2: '#060310',
      coreMid: 'rgba(232, 121, 249, 0.28)',
      coreEnd: 'rgba(168, 85, 247, 0)',
      innerGlow: 'rgba(192, 132, 252, 0.38)',
    };
  }
  if (style === 'cyber_plasma') {
    return {
      haloMid: 'rgba(244, 63, 94, ',
      haloEnd: 'rgba(245, 158, 11, 0)',
      rimMid: 'rgba(6, 182, 212, 0.5)',
      rimEnd: 'rgba(244, 63, 94, 0.55)',
      sphereBase0: '#260a1c',
      sphereBase1: '#140510',
      sphereBase2: '#080208',
      coreMid: 'rgba(251, 113, 133, 0.32)',
      coreEnd: 'rgba(244, 63, 94, 0)',
      innerGlow: 'rgba(251, 146, 60, 0.38)',
    };
  }
  if (style === 'neon_pulse') {
    return {
      haloMid: 'rgba(34, 197, 94, ',
      haloEnd: 'rgba(163, 230, 53, 0)',
      rimMid: 'rgba(163, 230, 53, 0.5)',
      rimEnd: 'rgba(20, 184, 166, 0.55)',
      sphereBase0: '#0a2215',
      sphereBase1: '#04130b',
      sphereBase2: '#020905',
      coreMid: 'rgba(134, 239, 172, 0.28)',
      coreEnd: 'rgba(34, 197, 94, 0)',
      innerGlow: 'rgba(74, 222, 128, 0.38)',
    };
  }
  if (style === 'emerald_solar') {
    return {
      haloMid: 'rgba(245, 158, 11, ',
      haloEnd: 'rgba(16, 185, 129, 0)',
      rimMid: 'rgba(16, 185, 129, 0.5)',
      rimEnd: 'rgba(251, 191, 36, 0.55)',
      sphereBase0: '#0c221a',
      sphereBase1: '#05140e',
      sphereBase2: '#020906',
      coreMid: 'rgba(253, 224, 71, 0.28)',
      coreEnd: 'rgba(245, 158, 11, 0)',
      innerGlow: 'rgba(52, 211, 153, 0.38)',
    };
  }
  if (style === 'minimal_pearl') {
    return {
      haloMid: 'rgba(186, 230, 253, ',
      haloEnd: 'rgba(226, 232, 240, 0)',
      rimMid: 'rgba(255, 255, 255, 0.65)',
      rimEnd: 'rgba(186, 230, 253, 0.45)',
      sphereBase0: '#1a1f2e',
      sphereBase1: '#0f121a',
      sphereBase2: '#07080d',
      coreMid: 'rgba(241, 245, 249, 0.35)',
      coreEnd: 'rgba(148, 163, 184, 0)',
      innerGlow: 'rgba(226, 232, 240, 0.34)',
    };
  }
  // Default: siri_rainbow
  return {
    haloMid: 'rgba(139, 92, 246, ',
    haloEnd: 'rgba(236, 72, 153, 0)',
    rimMid: 'rgba(56, 189, 248, 0.34)',
    rimEnd: 'rgba(236, 72, 153, 0.48)',
    sphereBase0: '#121936',
    sphereBase1: '#080c1d',
    sphereBase2: '#03050c',
    coreMid: 'rgba(165, 243, 252, 0.22)',
    coreEnd: 'rgba(56, 189, 248, 0)',
    innerGlow: 'rgba(125, 211, 252, 0.36)',
  };
}

/**
 * Authentic 60fps Canvas2D 3D Refractive Apple Siri Fluid Sphere.
 * Renders 5 volumetric 3D parametric silk ribbons inside a crystal glass sphere
 * using additive blending (`lighter`) so overlapping ribbons naturally bloom
 * into a pure burning-white hot-spot core, topped with Fresnel specular glass arcs.
 */
export const AstraSiriOrbCanvas: React.FC<AstraSiriOrbCanvasProps> = ({
  state,
  audioLevel = 0,
  size = 48,
  lowPowerEco = false,
  style = 'siri_rainbow',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const audioRef = useRef(audioLevel);
  audioRef.current = audioLevel;
  const styleRef = useRef(style);
  styleRef.current = style;

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
      const curStyle = styleRef.current;
      const ribbons = resolveRibbonSpecs(curStyle);
      const orbColors = resolveOrbThemeColors(curStyle);
      const micLvl = Math.max(0, Math.min(1, audioRef.current));

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
      outerHalo.addColorStop(0, 'rgba(255, 255, 255, 0)');
      outerHalo.addColorStop(0.75, `${orbColors.haloMid}${(0.22 + smoothEnergy * 0.22).toFixed(3)})`);
      outerHalo.addColorStop(1, orbColors.haloEnd);
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
      sphereBg.addColorStop(0, orbColors.sphereBase0);
      sphereBg.addColorStop(0.58, orbColors.sphereBase1);
      sphereBg.addColorStop(1, orbColors.sphereBase2);
      ctx.fillStyle = sphereBg;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      // 3. Additive 3D Parametric Silk Ribbons (`lighter` creates natural white-hot core at intersections!)
      ctx.globalCompositeOperation = 'lighter';

      const steps = lowPowerEco ? 28 : 44;
      for (let i = 0; i < ribbons.length; i++) {
        const rib = ribbons[i];
        const tPhase = phase * rib.speed + rib.phaseOffset;
        const amp = radius * (0.28 + smoothEnergy * 0.34);

        const cosZ = Math.cos(rib.tiltZ + Math.sin(tPhase * 0.35) * 0.22);
        const sinZ = Math.sin(rib.tiltZ + Math.sin(tPhase * 0.35) * 0.22);
        const cosX = Math.cos(rib.tiltX + Math.cos(tPhase * 0.28) * 0.2);

        const pts: { x: number; y: number; depth: number }[] = [];
        for (let s = 0; s <= steps; s++) {
          const u = (s / steps) * 2 - 1; // -1 .. 1 across sphere chord
          const env = Math.sqrt(Math.max(0, 1 - u * u)); // spherical envelope tapers cleanly at sphere rim!
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
          const last = pts[pts.length - 1];
          ctx.lineTo(last.x, last.y);

          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.lineWidth = Math.max(1, baseThick * p.mult);
          ctx.strokeStyle = `rgba(${rib.r}, ${rib.g}, ${rib.b}, ${p.alpha})`;
          ctx.stroke();
        }
      }

      // 4. Central Luminous Caustic Bloom (intensifies white core during speech)
      const coreRadius = radius * (0.44 + smoothEnergy * 0.22);
      const coreGlow = ctx.createRadialGradient(
        cx + Math.sin(phase * 1.3) * radius * 0.08,
        cy + Math.cos(phase * 1.1) * radius * 0.08,
        0,
        cx,
        cy,
        coreRadius
      );
      coreGlow.addColorStop(0, `rgba(255, 255, 255, ${(0.42 + smoothEnergy * 0.38).toFixed(3)})`);
      coreGlow.addColorStop(0.38, orbColors.coreMid);
      coreGlow.addColorStop(1, orbColors.coreEnd);
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // 5. Switch back to normal compositing for Glass Fresnel Rim & Specular Highlights
      ctx.globalCompositeOperation = 'source-over';

      // Inner spherical vignette for 3D depth curvature
      const innerShadow = ctx.createRadialGradient(cx, cy, radius * 0.62, cx, cy, radius);
      innerShadow.addColorStop(0, 'rgba(2, 6, 23, 0)');
      innerShadow.addColorStop(0.84, 'rgba(2, 6, 23, 0.18)');
      innerShadow.addColorStop(1, orbColors.innerGlow);
      ctx.fillStyle = innerShadow;
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      // Top-left curved crystal specular reflection arc
      const specGrad = ctx.createLinearGradient(
        cx - radius * 0.5,
        cy - radius * 0.92,
        cx + radius * 0.2,
        cy - radius * 0.15
      );
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.52)');
      specGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.12)');
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = specGrad;
      ctx.beginPath();
      ctx.ellipse(
        cx - radius * 0.14,
        cy - radius * 0.52,
        radius * 0.56,
        radius * 0.28,
        -0.24,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Crisp Glass Sphere Perimeter Rim
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 0.6 * dpr, 0, Math.PI * 2);
      ctx.lineWidth = 1.15 * dpr;
      const rimGrad = ctx.createLinearGradient(0, cy - radius, w, cy + radius);
      rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.62)');
      rimGrad.addColorStop(0.5, orbColors.rimMid);
      rimGrad.addColorStop(1, orbColors.rimEnd);
      ctx.strokeStyle = rimGrad;
      ctx.stroke();

      ctx.restore();

      if (!lowPowerEco || curState !== 'idle') {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [size, lowPowerEco, style]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-hidden="true"
      className={`block shrink-0 select-none pointer-events-none ${className}`}
    />
  );
};
