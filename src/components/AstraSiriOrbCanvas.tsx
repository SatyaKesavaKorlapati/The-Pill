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
    coreMid: 'rgba(165, 243, 252, 0.22)',
    coreEnd: 'rgba(56, 189, 248, 0)',
    innerGlow: 'rgba(125, 211, 252, 0.36)',
  };
}

/* ==========================================================================
 * NARUTO SHINOBI & JUTSU PACK
 * ======================================================================== */

/**
 * N1. NARUTO RASENGAN (螺旋丸)
 * Swirling concentrated sphere of high-velocity chakra streams with brilliant white core.
 */
function drawNarutoRasengan(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();

  // Chakra Blue Aura
  const aura = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.15);
  aura.addColorStop(0, `rgba(103, 232, 249, ${(0.45 + smoothEnergy * 0.3).toFixed(3)})`);
  aura.addColorStop(0.55, `rgba(6, 182, 212, ${(0.3 + smoothEnergy * 0.25).toFixed(3)})`);
  aura.addColorStop(0.85, `rgba(37, 99, 235, ${(0.15 + smoothEnergy * 0.2).toFixed(3)})`);
  aura.addColorStop(1, 'rgba(6, 182, 212, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = 'lighter';

  // 8 High-Velocity Logarithmic Chakra Stream Loops
  const streams = 8;
  for (let s = 0; s < streams; s++) {
    const streamPhase = phase * 8.5 * (s % 2 === 0 ? 1 : -1) + (s * Math.PI * 2) / streams;
    ctx.beginPath();
    const steps = 36;
    for (let st = 0; st <= steps; st++) {
      const u = (st / steps) * 2 - 1;
      const angle = u * Math.PI * 2 + streamPhase;
      const rVal = radius * (0.35 + (1 - Math.abs(u)) * 0.45 * (0.8 + smoothEnergy * 0.4));
      const x = cx + Math.cos(angle) * rVal;
      const y = cy + Math.sin(angle) * rVal * 0.75;
      if (st === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = s % 2 === 0 ? 'rgba(255, 255, 255, 0.75)' : 'rgba(34, 211, 238, 0.85)';
    ctx.lineWidth = 1.6 + smoothEnergy * 1.5;
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 10;
    ctx.stroke();
  }

  // Brilliant White-Hot Concentrated Chakra Core Sphere
  const coreR = radius * (0.32 + smoothEnergy * 0.15);
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
  core.addColorStop(0, '#ffffff');
  core.addColorStop(0.4, 'rgba(224, 242, 254, 0.95)');
  core.addColorStop(0.8, 'rgba(56, 189, 248, 0.6)');
  core.addColorStop(1, 'rgba(6, 182, 212, 0)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * N2. NARUTO RASENSHURIKEN (風遁・螺旋手裏剣)
 * Concentrated Rasengan core enveloped by 4 gigantic razor-sharp rotating wind shuriken blades.
 */
function drawNarutoRasenshuriken(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // 4 Giant Spinning Aerodynamic Shuriken Wind Blades
  const bladeRot = phase * 12;
  const bladeR = radius * (0.92 + smoothEnergy * 0.22);

  for (let b = 0; b < 4; b++) {
    const bAngle = bladeRot + (b * Math.PI) / 2;
    const cosA = Math.cos(bAngle);
    const sinA = Math.sin(bAngle);
    const perpCos = -sinA;
    const perpSin = cosA;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);

    // Outer razor-sharp sweeping curve
    const tipX = cx + cosA * bladeR;
    const tipY = cy + sinA * bladeR;
    const wingX = cx + cosA * (bladeR * 0.65) + perpCos * (bladeR * 0.45);
    const wingY = cy + sinA * (bladeR * 0.65) + perpSin * (bladeR * 0.45);

    ctx.quadraticCurveTo(cx + perpCos * (bladeR * 0.2), cy + perpSin * (bladeR * 0.2), wingX, wingY);
    ctx.quadraticCurveTo(cx + cosA * (bladeR * 0.85) + perpCos * (bladeR * 0.15), cy + sinA * (bladeR * 0.85) + perpSin * (bladeR * 0.15), tipX, tipY);
    ctx.quadraticCurveTo(cx + cosA * (bladeR * 0.5), cy + sinA * (bladeR * 0.5), cx, cy);

    ctx.fillStyle = 'rgba(165, 243, 252, 0.45)';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Central Spinning Rasengan Sphere
  drawNarutoRasengan(ctx, cx, cy, radius * 0.48, phase * 1.5, smoothEnergy);

  ctx.restore();
}

/**
 * N3. NARUTO SHARINGAN (写輪眼)
 * Crimson red Uchiha iris, black pupil, concentric ring, and 3 rotating curved tomoe commas.
 */
function drawNarutoSharingan(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();

  // Crimson Red Iris Outer Glow
  const irisR = radius * 0.86;
  const iris = ctx.createRadialGradient(cx, cy, 0, cx, cy, irisR);
  iris.addColorStop(0, '#ef4444');
  iris.addColorStop(0.75, '#dc2626');
  iris.addColorStop(1, '#7f1d1d');
  ctx.fillStyle = iris;
  ctx.beginPath();
  ctx.arc(cx, cy, irisR, 0, Math.PI * 2);
  ctx.fill();

  // Dark Outer Iris Perimeter Rim
  ctx.beginPath();
  ctx.arc(cx, cy, irisR, 0, Math.PI * 2);
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Inner Black Concentric Ring where Tomoe reside
  const tomoeTrackR = irisR * 0.54;
  ctx.beginPath();
  ctx.arc(cx, cy, tomoeTrackR, 0, Math.PI * 2);
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Black Pupil in center
  const pupilR = irisR * 0.22;
  ctx.beginPath();
  ctx.arc(cx, cy, pupilR, 0, Math.PI * 2);
  ctx.fillStyle = '#09090b';
  ctx.fill();

  // 3 Curved Tomoe (巴) spaced at 120°
  const tomoeRot = phase * 2.2;
  for (let t = 0; t < 3; t++) {
    const angle = tomoeRot + (t * Math.PI * 2) / 3;
    const tx = cx + Math.cos(angle) * tomoeTrackR;
    const ty = cy + Math.sin(angle) * tomoeTrackR;

    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(angle + Math.PI / 2);

    // Tomoe round head
    ctx.beginPath();
    ctx.arc(0, 0, irisR * 0.11, 0, Math.PI * 2);
    ctx.fillStyle = '#09090b';
    ctx.fill();

    // Curved tapering comma tail
    ctx.beginPath();
    ctx.moveTo(irisR * 0.08, 0);
    ctx.quadraticCurveTo(irisR * 0.18, -irisR * 0.12, 0, -irisR * 0.26);
    ctx.quadraticCurveTo(0, -irisR * 0.1, -irisR * 0.08, 0);
    ctx.closePath();
    ctx.fillStyle = '#09090b';
    ctx.fill();

    ctx.restore();
  }

  // Specular Reflection Arc
  ctx.beginPath();
  ctx.ellipse(cx - irisR * 0.28, cy - irisR * 0.32, irisR * 0.28, irisR * 0.14, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fill();

  ctx.restore();
}

/**
 * N4. NARUTO MANGEKYO SHARINGAN & SUSANOO (万華鏡写輪眼・須佐能乎)
 * Geometric Mangekyo pinwheel iris framed by ethereal spectral violet Susanoo ribcage flames.
 */
function drawNarutoMangekyoSusano(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();

  // Ethereal Purple Susanoo Chakra Aura & Flames
  ctx.globalCompositeOperation = 'lighter';
  const susanooAura = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius * 1.15);
  susanooAura.addColorStop(0, `rgba(192, 132, 252, ${(0.45 + smoothEnergy * 0.35).toFixed(3)})`);
  susanooAura.addColorStop(0.6, `rgba(147, 51, 234, ${(0.3 + smoothEnergy * 0.25).toFixed(3)})`);
  susanooAura.addColorStop(1, 'rgba(126, 34, 206, 0)');
  ctx.fillStyle = susanooAura;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
  ctx.fill();

  // 4 Spectral Susanoo Rib Bones
  for (let r = 0; r < 4; r++) {
    const rAngle = (r * Math.PI) / 2 + Math.sin(phase * 2 + r) * 0.1;
    const ribR = radius * (0.88 + smoothEnergy * 0.2);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rAngle);
    ctx.beginPath();
    ctx.moveTo(ribR * 0.3, -ribR * 0.7);
    ctx.quadraticCurveTo(ribR * 0.85, -ribR * 0.5, ribR * 0.65, ribR * 0.65);
    ctx.strokeStyle = 'rgba(216, 180, 254, 0.75)';
    ctx.lineWidth = 2.8;
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();
  }

  ctx.globalCompositeOperation = 'source-over';

  // Central Crimson Iris
  const irisR = radius * 0.58;
  ctx.beginPath();
  ctx.arc(cx, cy, irisR, 0, Math.PI * 2);
  ctx.fillStyle = '#dc2626';
  ctx.fill();
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 3 Mangekyo Curved Pinwheel Blades (Sasuke / Itachi geometric pattern)
  const pinRot = phase * 2.8;
  for (let b = 0; b < 3; b++) {
    const pAngle = pinRot + (b * Math.PI * 2) / 3;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(pAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(irisR * 0.7, -irisR * 0.3, 0, -irisR * 0.95);
    ctx.quadraticCurveTo(-irisR * 0.2, -irisR * 0.4, 0, 0);
    ctx.fillStyle = '#09090b';
    ctx.fill();
    ctx.restore();
  }

  // Central Black Core
  ctx.beginPath();
  ctx.arc(cx, cy, irisR * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = '#09090b';
  ctx.fill();

  ctx.restore();
}

/**
 * N5. NARUTO AKATSUKI RED CLOUD (暁の雲)
 * Iconic crimson cloud with crisp white border, dark blood-chakra swirls, and drifting red embers.
 */
function drawNarutoAkatsukiCloud(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();

  // Crimson Aura
  const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.15);
  aura.addColorStop(0, `rgba(220, 38, 38, ${(0.32 + smoothEnergy * 0.25).toFixed(3)})`);
  aura.addColorStop(0.7, 'rgba(153, 27, 27, 0.15)');
  aura.addColorStop(1, 'rgba(220, 38, 38, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
  ctx.fill();

  // Scale and translate for centered cloud
  ctx.save();
  ctx.translate(cx, cy);
  const sc = (radius * 0.85 * (1 + Math.sin(phase * 1.5) * 0.04)) / 36;
  ctx.scale(sc, sc);

  // Path of the classic Akatsuki cloud
  ctx.beginPath();
  ctx.moveTo(-18, 8);
  ctx.bezierCurveTo(-26, 8, -26, -4, -14, -6);
  ctx.bezierCurveTo(-14, -16, 2, -18, 10, -8);
  ctx.bezierCurveTo(22, -10, 24, 4, 16, 10);
  ctx.bezierCurveTo(14, 16, -2, 16, -6, 12);
  ctx.bezierCurveTo(-10, 16, -16, 14, -18, 8);
  ctx.closePath();

  // Crimson Red Fill with Gradient
  const cloudGrad = ctx.createLinearGradient(0, -18, 0, 16);
  cloudGrad.addColorStop(0, '#ef4444');
  cloudGrad.addColorStop(0.5, '#dc2626');
  cloudGrad.addColorStop(1, '#991b1b');
  ctx.fillStyle = cloudGrad;
  ctx.fill();

  // Crisp White Outer Outline
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.4 / sc;
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 8;
  ctx.stroke();

  // Internal Stylized Cloud Swirl
  ctx.beginPath();
  ctx.arc(-2, 2, 5, 0.4, Math.PI * 1.6);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.8 / sc;
  ctx.stroke();

  ctx.restore();

  // Drifting Crimson Embers
  for (let e = 0; e < 5; e++) {
    const ePhase = phase * 2 + e * 1.4;
    const ex = cx + Math.sin(ePhase) * radius * 0.65;
    const ey = cy + radius * 0.5 - ((ePhase * 18) % (radius * 1.2));
    ctx.beginPath();
    ctx.arc(ex, ey, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#f87171';
    ctx.shadowBlur = 6;
    ctx.fill();
  }

  ctx.restore();
}

/**
 * N6. NARUTO SHINOBI WHITE SMOKE CLOUD (変わり身の術・白煙)
 * Stylized billowing white summon smoke with expanding swirls and curling wisps.
 */
function drawNarutoWhiteCloud(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();

  // Soft Silver-White Mist Aura
  const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.1);
  aura.addColorStop(0, `rgba(248, 250, 252, ${(0.35 + smoothEnergy * 0.3).toFixed(3)})`);
  aura.addColorStop(0.7, 'rgba(203, 213, 225, 0.15)');
  aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
  ctx.fill();

  // 5 Billowing Overlapping Smoke Lobes
  const lobes = [
    { x: 0, y: -0.25, r: 0.42 },
    { x: -0.32, y: 0.05, r: 0.38 },
    { x: 0.32, y: 0.08, r: 0.36 },
    { x: -0.15, y: 0.28, r: 0.34 },
    { x: 0.18, y: 0.26, r: 0.32 },
  ];

  for (let i = 0; i < lobes.length; i++) {
    const l = lobes[i];
    const osc = Math.sin(phase * 1.8 + i) * radius * 0.05 * (1 + smoothEnergy);
    const lx = cx + l.x * radius + osc;
    const ly = cy + l.y * radius - osc;
    const lr = l.r * radius * (1 + smoothEnergy * 0.15);

    const grad = ctx.createRadialGradient(lx - lr * 0.2, ly - lr * 0.25, 0, lx, ly, lr);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.65, '#e2e8f0');
    grad.addColorStop(1, '#94a3b8');

    ctx.beginPath();
    ctx.arc(lx, ly, lr, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  // Curling Dissipation Smoke Spirals
  ctx.beginPath();
  ctx.arc(cx + radius * 0.35, cy - radius * 0.3, radius * 0.16, 0.2, Math.PI * 1.5);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.restore();
}

/* ==========================================================================
 * MOTORSPORT & FORMULA 1 PACK
 * ======================================================================== */

/**
 * F1. FORMULA 1 STEERING WHEEL TELEMETRY DASHBOARD
 * Multi-segment LED rev shift lights (Green -> Amber -> Red -> Blue), digital gear readout [8], DRS indicator.
 */
function drawF1TelemetryHud(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();

  // Carbon-Fiber Bezel Plate
  const boxW = radius * 1.65;
  const boxH = radius * 1.35;
  ctx.beginPath();
  ctx.roundRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH, 12);
  ctx.fillStyle = '#09090b';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Top Shift Rev Lights: 15 LEDs (5 Green, 5 Amber, 5 Red)
  const numLeds = 15;
  const ledSpacing = (boxW - 24) / numLeds;
  const activeCount = Math.round(smoothEnergy * (numLeds + 2));

  for (let i = 0; i < numLeds; i++) {
    const lx = cx - boxW / 2 + 12 + i * ledSpacing + ledSpacing / 2;
    const ly = cy - boxH / 2 + 14;
    const lit = i < activeCount;

    let col = '#22c55e'; // Green 0..4
    if (i >= 5 && i < 10) col = '#f59e0b'; // Amber 5..9
    if (i >= 10) col = '#ef4444'; // Red 10..14

    ctx.beginPath();
    ctx.arc(lx, ly, 3, 0, Math.PI * 2);
    ctx.fillStyle = lit ? col : 'rgba(255, 255, 255, 0.12)';
    if (lit) {
      ctx.shadowColor = col;
      ctx.shadowBlur = 8;
    } else {
      ctx.shadowBlur = 0;
    }
    ctx.fill();
  }

  // Central Big Digital Gear Readout [8]
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(radius * 0.52)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('8', cx, cy + 4);

  // Speed Counter "335 KM/H"
  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${Math.round(radius * 0.18)}px monospace`;
  const speed = 320 + Math.round(smoothEnergy * 28);
  ctx.fillText(`${speed} KM/H`, cx, cy + boxH * 0.32);

  // DRS Status Indicator
  ctx.fillStyle = smoothEnergy > 0.4 ? '#22c55e' : 'rgba(255, 255, 255, 0.25)';
  ctx.font = `bold ${Math.round(radius * 0.15)}px sans-serif`;
  ctx.fillText('DRS ACTIVE', cx, cy - boxH * 0.14);

  ctx.restore();
}

/**
 * F2-F6. FORMULA 1 PIRELLI TYRE (Hard, Medium, Soft, Inter, Wet)
 * Authentic rotating tyre sidewall ring with bold compound lettering (H, M, S, I, W).
 */
function drawF1Tyre(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number,
  compound: 'H' | 'M' | 'S' | 'I' | 'W'
) {
  ctx.save();

  const colors: Record<'H' | 'M' | 'S' | 'I' | 'W', { hex: string; name: string }> = {
    H: { hex: '#ffffff', name: 'HARD' },
    M: { hex: '#facc15', name: 'MEDIUM' },
    S: { hex: '#ef4444', name: 'SOFT' },
    I: { hex: '#22c55e', name: 'INTER' },
    W: { hex: '#3b82f6', name: 'WET' },
  };

  const { hex, name } = colors[compound];

  // Outer Black Tyre Tread
  const tyreR = radius * 0.88;
  ctx.beginPath();
  ctx.arc(cx, cy, tyreR, 0, Math.PI * 2);
  ctx.fillStyle = '#18181b';
  ctx.fill();

  // If Intermediate or Wet, draw grooved water dispersion tread marks
  if (compound === 'I' || compound === 'W') {
    const grooves = 16;
    for (let g = 0; g < grooves; g++) {
      const gAngle = phase * 3 + (g * Math.PI * 2) / grooves;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(gAngle) * (tyreR - 8), cy + Math.sin(gAngle) * (tyreR - 8));
      ctx.lineTo(cx + Math.cos(gAngle) * tyreR, cy + Math.sin(gAngle) * tyreR);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Colored Pirelli Compound Sidewall Ring
  const sidewallR = tyreR * 0.72;
  ctx.beginPath();
  ctx.arc(cx, cy, sidewallR, 0, Math.PI * 2);
  ctx.strokeStyle = hex;
  ctx.shadowColor = hex;
  ctx.shadowBlur = 10;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Rotating Wheel Rim in Center
  const rimR = sidewallR * 0.58;
  ctx.beginPath();
  ctx.arc(cx, cy, rimR, 0, Math.PI * 2);
  ctx.fillStyle = '#09090b';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 5 Wheel Spokes
  for (let sp = 0; sp < 5; sp++) {
    const sAngle = phase * 4 + (sp * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sAngle) * rimR, cy + Math.sin(sAngle) * rimR);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Bold Compound Letter in Center
  ctx.fillStyle = hex;
  ctx.font = `bold ${Math.round(radius * 0.32)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(compound, cx, cy);

  ctx.restore();
}

/* ==========================================================================
 * CELESTIAL PLANETS & SPACE PACK
 * ======================================================================== */

/**
 * S1. SUN: Blazing Solar Sphere with Coronal Flares and Magnetic Loops
 */
function drawSpaceSun(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();

  // Solar Corona Glow
  const corona = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius * 1.2);
  corona.addColorStop(0, `rgba(254, 240, 138, ${(0.5 + smoothEnergy * 0.3).toFixed(3)})`);
  corona.addColorStop(0.55, `rgba(249, 115, 22, ${(0.35 + smoothEnergy * 0.25).toFixed(3)})`);
  corona.addColorStop(1, 'rgba(239, 68, 68, 0)');
  ctx.fillStyle = corona;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Coronal Prominence Flares pulsing outwards
  const flares = 8;
  for (let f = 0; f < flares; f++) {
    const fAngle = phase * 1.2 + (f * Math.PI * 2) / flares;
    const fLen = radius * (0.8 + Math.sin(phase * 4 + f) * 0.25 * (1 + smoothEnergy));
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(fAngle) * (radius * 0.6), cy + Math.sin(fAngle) * (radius * 0.6));
    ctx.lineTo(cx + Math.cos(fAngle) * fLen, cy + Math.sin(fAngle) * fLen);
    ctx.strokeStyle = f % 2 === 0 ? '#facc15' : '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 10;
    ctx.stroke();
  }

  // Brilliant Yellow Solar Core
  const sunR = radius * 0.62;
  const sunGrad = ctx.createRadialGradient(cx - sunR * 0.2, cy - sunR * 0.25, 0, cx, cy, sunR);
  sunGrad.addColorStop(0, '#ffffff');
  sunGrad.addColorStop(0.4, '#fde047');
  sunGrad.addColorStop(0.8, '#f59e0b');
  sunGrad.addColorStop(1, '#ea580c');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * S2. EARTH: Blue Marble with Atmospheric Limb and Weather Clouds
 */
function drawSpaceEarth(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();

  const earthR = radius * 0.72;

  // Atmospheric Blue Limb Ring
  const atmo = ctx.createRadialGradient(cx, cy, earthR * 0.85, cx, cy, earthR * 1.15);
  atmo.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
  atmo.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = atmo;
  ctx.beginPath();
  ctx.arc(cx, cy, earthR * 1.15, 0, Math.PI * 2);
  ctx.fill();

  // Azure Ocean Sphere
  const ocean = ctx.createRadialGradient(cx - earthR * 0.25, cy - earthR * 0.25, 0, cx, cy, earthR);
  ocean.addColorStop(0, '#38bdf8');
  ocean.addColorStop(0.5, '#1d4ed8');
  ocean.addColorStop(1, '#0f172a');
  ctx.fillStyle = ocean;
  ctx.beginPath();
  ctx.arc(cx, cy, earthR, 0, Math.PI * 2);
  ctx.fill();

  // Continents (Green/Amber landmasses moving slowly)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, earthR, 0, Math.PI * 2);
  ctx.clip();

  const rotX = (phase * 8) % (earthR * 2);
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  // Landmass 1
  ctx.ellipse(cx - earthR + rotX, cy, earthR * 0.45, earthR * 0.28, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Landmass 2
  ctx.beginPath();
  ctx.ellipse(cx - earthR * 2 + rotX, cy + earthR * 0.15, earthR * 0.35, earthR * 0.22, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Weather Cloud Swirls
  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.beginPath();
  ctx.ellipse(cx - earthR * 0.8 + rotX * 1.2, cy - earthR * 0.3, earthR * 0.5, earthR * 0.12, 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

/**
 * S3. MOON: Silver Pearl Orb with Crater Mare Topography
 */
function drawSpaceMoon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();
  const moonR = radius * 0.72;

  // Silver Moonlight Glow
  const glow = ctx.createRadialGradient(cx, cy, moonR * 0.8, cx, cy, moonR * 1.15);
  glow.addColorStop(0, 'rgba(241, 245, 249, 0.35)');
  glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, moonR * 1.15, 0, Math.PI * 2);
  ctx.fill();

  // Lunar Surface Sphere
  const surface = ctx.createRadialGradient(cx - moonR * 0.25, cy - moonR * 0.25, 0, cx, cy, moonR);
  surface.addColorStop(0, '#ffffff');
  surface.addColorStop(0.5, '#cbd5e1');
  surface.addColorStop(1, '#64748b');
  ctx.fillStyle = surface;
  ctx.beginPath();
  ctx.arc(cx, cy, moonR, 0, Math.PI * 2);
  ctx.fill();

  // Shaded Craters
  const craters = [
    { x: -0.2, y: -0.25, r: 0.16 },
    { x: 0.25, y: -0.1, r: 0.12 },
    { x: -0.1, y: 0.25, r: 0.14 },
    { x: 0.2, y: 0.28, r: 0.1 },
  ];

  for (const c of craters) {
    const cxP = cx + c.x * moonR;
    const cyP = cy + c.y * moonR;
    const cR = c.r * moonR;
    ctx.beginPath();
    ctx.arc(cxP, cyP, cR, 0, Math.PI * 2);
    ctx.fillStyle = '#94a3b8';
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * S4. MARS: Crimson Red Planet with Dusty Surface and Polar Ice Cap
 */
function drawSpaceMars(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();
  const marsR = radius * 0.72;

  // Rust-Orange Atmosphere Haze
  const haze = ctx.createRadialGradient(cx, cy, marsR * 0.8, cx, cy, marsR * 1.15);
  haze.addColorStop(0, 'rgba(234, 88, 12, 0.35)');
  haze.addColorStop(1, 'rgba(234, 88, 12, 0)');
  ctx.fillStyle = haze;
  ctx.beginPath();
  ctx.arc(cx, cy, marsR * 1.15, 0, Math.PI * 2);
  ctx.fill();

  // Mars Red Surface
  const surface = ctx.createRadialGradient(cx - marsR * 0.25, cy - marsR * 0.25, 0, cx, cy, marsR);
  surface.addColorStop(0, '#f97316');
  surface.addColorStop(0.5, '#c2410c');
  surface.addColorStop(1, '#7c2d12');
  ctx.fillStyle = surface;
  ctx.beginPath();
  ctx.arc(cx, cy, marsR, 0, Math.PI * 2);
  ctx.fill();

  // Dark Canyon Surface Features
  ctx.beginPath();
  ctx.ellipse(cx, cy + marsR * 0.1, marsR * 0.55, marsR * 0.15, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(67, 20, 7, 0.45)';
  ctx.fill();

  // White Polar Ice Cap
  ctx.beginPath();
  ctx.ellipse(cx, cy - marsR * 0.88, marsR * 0.28, marsR * 0.1, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.restore();
}

/**
 * S5. MILKY WAY: Deep Space Rotating Spiral Galaxy
 */
function drawSpaceMilkyway(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // Cosmic Dust Glow
  const dust = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.15);
  dust.addColorStop(0, `rgba(255, 255, 255, ${(0.6 + smoothEnergy * 0.3).toFixed(3)})`);
  dust.addColorStop(0.35, 'rgba(192, 132, 252, 0.4)');
  dust.addColorStop(0.7, 'rgba(56, 189, 248, 0.25)');
  dust.addColorStop(1, 'rgba(99, 102, 241, 0)');
  ctx.fillStyle = dust;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
  ctx.fill();

  // 2 Majestic Logarithmic Spiral Galaxy Arms
  const galRot = phase * 0.8;
  const numArms = 2;
  const starsPerArm = 24;

  for (let a = 0; a < numArms; a++) {
    const armBase = galRot + a * Math.PI;
    for (let s = 1; s <= starsPerArm; s++) {
      const frac = s / starsPerArm;
      const angle = armBase + frac * Math.PI * 2.8;
      const dist = frac * radius * 0.95;
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist * 0.65; // tilted perspective!

      const starR = (1 - frac * 0.5) * (1.5 + Math.sin(phase * 3 + s) * 0.6);
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(1, starR), 0, Math.PI * 2);
      ctx.fillStyle = frac < 0.3 ? '#ffffff' : frac < 0.7 ? '#c084fc' : '#38bdf8';
      ctx.fill();
    }
  }

  // Brilliant Galactic Center Core
  const coreR = radius * (0.2 + smoothEnergy * 0.12);
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
  core.addColorStop(0, '#ffffff');
  core.addColorStop(0.5, '#fef08a');
  core.addColorStop(1, 'rgba(253, 224, 71, 0)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* ==========================================================================
 * THEME STYLE KIT AVATARS
 * ======================================================================== */

function drawBotanicalSakura(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.15);
  aura.addColorStop(0, `rgba(244, 114, 182, ${(0.32 + smoothEnergy * 0.25).toFixed(3)})`);
  aura.addColorStop(0.65, `rgba(251, 113, 133, ${(0.15 + smoothEnergy * 0.15).toFixed(3)})`);
  aura.addColorStop(1, 'rgba(244, 114, 182, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
  ctx.fill();

  const petalRadius = radius * (0.62 + smoothEnergy * 0.22);
  const rotation = phase * 0.45;

  for (let i = 0; i < 5; i++) {
    const angle = (i * (Math.PI * 2)) / 5 + rotation;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const perpCos = -sinA;
    const perpSin = cosA;

    const tipDist = petalRadius;
    const halfWidth = petalRadius * 0.54;
    const tipX = cx + cosA * tipDist;
    const tipY = cy + sinA * tipDist;
    const notchIndent = petalRadius * 0.16;

    const leftX = cx + cosA * (tipDist * 0.92) - perpCos * halfWidth;
    const leftY = cy + sinA * (tipDist * 0.92) - perpSin * halfWidth;
    const rightX = cx + cosA * (tipDist * 0.92) + perpCos * halfWidth;
    const rightY = cy + sinA * (tipDist * 0.92) + perpSin * halfWidth;

    const notchCenterX = tipX - cosA * notchIndent;
    const notchCenterY = tipY - sinA * notchIndent;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);

    ctx.bezierCurveTo(
      cx + perpCos * (halfWidth * 0.3) + cosA * (tipDist * 0.35),
      cy + perpSin * (halfWidth * 0.3) + sinA * (tipDist * 0.35),
      leftX - cosA * (tipDist * 0.2),
      leftY - sinA * (tipDist * 0.2),
      leftX,
      leftY
    );

    ctx.quadraticCurveTo(tipX - perpCos * (halfWidth * 0.25), tipY - perpSin * (halfWidth * 0.25), notchCenterX, notchCenterY);
    ctx.quadraticCurveTo(tipX + perpCos * (halfWidth * 0.25), tipY + perpSin * (halfWidth * 0.25), rightX, rightY);

    ctx.bezierCurveTo(
      rightX - cosA * (tipDist * 0.2),
      rightY - sinA * (tipDist * 0.2),
      cx - perpCos * (halfWidth * 0.3) + cosA * (tipDist * 0.35),
      cy - perpSin * (halfWidth * 0.3) + sinA * (tipDist * 0.35),
      cx,
      cy
    );

    ctx.closePath();

    const petalGrad = ctx.createRadialGradient(cx, cy, petalRadius * 0.15, tipX, tipY, petalRadius * 0.85);
    petalGrad.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
    petalGrad.addColorStop(0.35, 'rgba(253, 164, 175, 0.88)');
    petalGrad.addColorStop(0.78, 'rgba(244, 114, 182, 0.82)');
    petalGrad.addColorStop(1, 'rgba(244, 63, 165, 0.95)');

    ctx.fillStyle = petalGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  // Golden Stamen filaments
  ctx.save();
  const stamenCount = 10;
  for (let s = 0; s < stamenCount; s++) {
    const sAngle = (s * (Math.PI * 2)) / stamenCount + rotation * 1.5;
    const sLen = petalRadius * (0.28 + Math.sin(phase * 2 + s) * 0.05);
    const sx = cx + Math.cos(sAngle) * sLen;
    const sy = cy + Math.sin(sAngle) * sLen;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(sx, sy);
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 4;
    ctx.fill();
  }

  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, petalRadius * 0.18);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.5, '#f472b6');
  coreGrad.addColorStop(1, '#db2777');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, petalRadius * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Orbiting Petal Flakes
  for (let p = 0; p < 4; p++) {
    const orbAngle = phase * 0.9 + (p * Math.PI) / 2;
    const orbDist = radius * (0.82 + Math.sin(phase * 1.5 + p) * 0.15);
    const px = cx + Math.cos(orbAngle) * orbDist;
    const py = cy + Math.sin(orbAngle) * orbDist;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(orbAngle + phase);
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 0.14, radius * 0.07, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(251, 113, 133, 0.82)';
    ctx.shadowColor = '#fb7185';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();
  }
}

function drawCyberpunkHud(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  const halo = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.1);
  halo.addColorStop(0, `rgba(6, 182, 212, ${(0.22 + smoothEnergy * 0.25).toFixed(3)})`);
  halo.addColorStop(0.7, `rgba(236, 72, 153, ${(0.12 + smoothEnergy * 0.15).toFixed(3)})`);
  halo.addColorStop(1, 'rgba(6, 182, 212, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  const brkDist = radius * 0.88;
  const brkLen = radius * 0.32;
  ctx.strokeStyle = '#22d3ee';
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 8;
  ctx.lineWidth = 2;

  // 4 Corner Brackets
  ctx.beginPath();
  ctx.moveTo(cx - brkDist, cy - brkDist + brkLen);
  ctx.lineTo(cx - brkDist, cy - brkDist);
  ctx.lineTo(cx - brkDist + brkLen, cy - brkDist);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + brkDist - brkLen, cy - brkDist);
  ctx.lineTo(cx + brkDist, cy - brkDist);
  ctx.lineTo(cx + brkDist, cy - brkDist + brkLen);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + brkDist, cy + brkDist - brkLen);
  ctx.lineTo(cx + brkDist, cy + brkDist);
  ctx.lineTo(cx + brkDist - brkLen, cy + brkDist);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - brkDist + brkLen, cy + brkDist);
  ctx.lineTo(cx - brkDist, cy + brkDist);
  ctx.lineTo(cx - brkDist, cy + brkDist - brkLen);
  ctx.stroke();

  // Segmented Ring
  const ringR = radius * 0.72;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#06b6d4';
  for (let s = 0; s < 4; s++) {
    const startA = phase * 1.2 + (s * Math.PI) / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, startA, startA + Math.PI * 0.32);
    ctx.stroke();
  }

  // Inner Hexagon
  const hexR = radius * (0.42 + smoothEnergy * 0.16);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-phase * 1.8);
  ctx.beginPath();
  for (let h = 0; h < 6; h++) {
    const hAngle = (h * Math.PI * 2) / 6;
    const hx = Math.cos(hAngle) * hexR;
    const hy = Math.sin(hAngle) * hexR;
    if (h === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.strokeStyle = '#ec4899';
  ctx.shadowColor = '#f43f5e';
  ctx.shadowBlur = 10;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.restore();

  // Core & Crosshairs
  const coreR = radius * (0.2 + smoothEnergy * 0.22);
  const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
  coreGlow.addColorStop(0, '#ffffff');
  coreGlow.addColorStop(0.4, '#22d3ee');
  coreGlow.addColorStop(0.8, '#ec4899');
  coreGlow.addColorStop(1, 'rgba(236, 72, 153, 0)');
  ctx.fillStyle = coreGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.fill();

  const crossLen = radius * (0.24 + smoothEnergy * 0.18);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - crossLen, cy);
  ctx.lineTo(cx + crossLen, cy);
  ctx.moveTo(cx, cy - crossLen);
  ctx.lineTo(cx, cy + crossLen);
  ctx.stroke();

  ctx.restore();
}

function drawFluentFluid(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  const waves = [
    { r: 56, g: 189, b: 248, speed: 1.1, freq: 2.2, amp: radius * (0.35 + smoothEnergy * 0.35), offset: 0 },
    { r: 99, g: 102, b: 241, speed: -0.95, freq: 3.1, amp: radius * (0.32 + smoothEnergy * 0.3), offset: 1.5 },
    { r: 34, g: 211, b: 238, speed: 1.4, freq: 1.8, amp: radius * (0.38 + smoothEnergy * 0.4), offset: 2.8 },
  ];

  for (const w of waves) {
    ctx.beginPath();
    const steps = 40;
    for (let s = 0; s <= steps; s++) {
      const u = (s / steps) * 2 - 1;
      const x = cx + u * radius * 0.95;
      const env = Math.cos((u * Math.PI) / 2);
      const y = cy + Math.sin(u * Math.PI * w.freq + phase * w.speed + w.offset) * w.amp * env;
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineWidth = radius * 0.22 * (0.8 + smoothEnergy * 0.4);
    ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(${w.r}, ${w.g}, ${w.b}, ${(0.42 + smoothEnergy * 0.35).toFixed(3)})`;
    ctx.shadowColor = `rgb(${w.r}, ${w.g}, ${w.b})`;
    ctx.shadowBlur = 12;
    ctx.stroke();
  }

  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * (0.3 + smoothEnergy * 0.2));
  core.addColorStop(0, `rgba(255, 255, 255, ${(0.65 + smoothEnergy * 0.3).toFixed(3)})`);
  core.addColorStop(0.5, 'rgba(56, 189, 248, 0.4)');
  core.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * (0.3 + smoothEnergy * 0.2), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawRetroCassette(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();
  const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.1);
  aura.addColorStop(0, `rgba(245, 158, 11, ${(0.25 + smoothEnergy * 0.2).toFixed(3)})`);
  aura.addColorStop(0.7, `rgba(236, 72, 153, ${(0.15 + smoothEnergy * 0.15).toFixed(3)})`);
  aura.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
  ctx.fill();

  const spoolOffset = radius * 0.42;
  const spoolR = radius * 0.28;

  for (const dir of [-1, 1]) {
    const sx = cx + dir * spoolOffset;
    const sy = cy;

    ctx.beginPath();
    ctx.arc(sx, sy, spoolR, 0, Math.PI * 2);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let sp = 0; sp < 3; sp++) {
      const spAngle = dir * phase * 2.5 + (sp * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(spAngle) * spoolR, sy + Math.sin(spAngle) * spoolR);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(sx, sy, spoolR * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#ec4899';
    ctx.fill();
  }

  ctx.beginPath();
  ctx.moveTo(cx - spoolOffset, cy + spoolR * 0.85);
  ctx.quadraticCurveTo(cx, cy + spoolR * 0.85 + Math.sin(phase * 8) * 4 * smoothEnergy, cx + spoolOffset, cy + spoolR * 0.85);
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  const vuSegments = 9;
  for (let v = 0; v < vuSegments; v++) {
    const vAngle = Math.PI + 0.35 + (v * (Math.PI - 0.7)) / (vuSegments - 1);
    const lit = v / vuSegments <= smoothEnergy * 1.25;
    const vR = radius * 0.88;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(vAngle) * vR, cy + Math.sin(vAngle) * vR, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = lit ? (v > 6 ? '#ef4444' : v > 3 ? '#fbbf24' : '#10b981') : 'rgba(255,255,255,0.15)';
    ctx.shadowColor = lit ? '#fbbf24' : 'transparent';
    ctx.shadowBlur = lit ? 6 : 0;
    ctx.fill();
  }

  ctx.restore();
}

function drawPaperInkEnso(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();
  const ensoR = radius * 0.74;

  ctx.beginPath();
  const startAngle = -0.3 + Math.sin(phase * 0.5) * 0.1;
  const endAngle = Math.PI * 1.85 + Math.sin(phase * 0.6) * 0.12;
  ctx.arc(cx, cy, ensoR, startAngle, endAngle);
  ctx.strokeStyle = 'rgba(28, 25, 23, 0.88)';
  ctx.lineWidth = 4 + smoothEnergy * 5;
  ctx.lineCap = 'round';
  ctx.stroke();

  const inkWash = ctx.createRadialGradient(cx, cy, 0, cx, cy, ensoR);
  inkWash.addColorStop(0, `rgba(220, 38, 38, ${(0.18 + smoothEnergy * 0.25).toFixed(3)})`);
  inkWash.addColorStop(0.65, 'rgba(68, 64, 60, 0.1)');
  inkWash.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = inkWash;
  ctx.beginPath();
  ctx.arc(cx, cy, ensoR, 0, Math.PI * 2);
  ctx.fill();

  const stampSize = radius * (0.28 + smoothEnergy * 0.1);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0.08);
  ctx.fillStyle = '#dc2626';
  ctx.shadowColor = '#b91c1c';
  ctx.shadowBlur = 8;
  ctx.fillRect(-stampSize / 2, -stampSize / 2, stampSize, stampSize);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(-stampSize * 0.38, -stampSize * 0.38, stampSize * 0.76, stampSize * 0.76);
  ctx.restore();

  ctx.restore();
}

function drawMotorsportGt(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();
  const gaugeR = radius * 0.8;
  const startA = Math.PI * 0.75;
  const endA = Math.PI * 2.25;

  ctx.beginPath();
  ctx.arc(cx, cy, gaugeR, startA, endA);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, gaugeR, Math.PI * 1.85, endA);
  ctx.strokeStyle = '#ef4444';
  ctx.shadowColor = '#dc2626';
  ctx.shadowBlur = 8;
  ctx.lineWidth = 5;
  ctx.stroke();

  const needleAngle = startA + (endA - startA) * Math.min(1, Math.max(0, 0.15 + smoothEnergy * 0.85));
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(needleAngle) * (gaugeR - 2), cy + Math.sin(needleAngle) * (gaugeR - 2));
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.shadowColor = '#f87171';
  ctx.shadowBlur = 10;
  ctx.stroke();

  const hubR = radius * 0.32;
  ctx.beginPath();
  ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
  ctx.fillStyle = '#18181b';
  ctx.fill();

  for (let b = 0; b < 6; b++) {
    const bAngle = phase * 3 + (b * Math.PI * 2) / 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(bAngle) * hubR, cy + Math.sin(bAngle) * hubR);
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.restore();
}

function drawCozyWoodland(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();
  const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.1);
  aura.addColorStop(0, `rgba(16, 185, 129, ${(0.28 + smoothEnergy * 0.25).toFixed(3)})`);
  aura.addColorStop(0.7, `rgba(245, 158, 11, ${(0.14 + smoothEnergy * 0.15).toFixed(3)})`);
  aura.addColorStop(1, 'rgba(16, 185, 129, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
  ctx.fill();

  const leafR = radius * (0.65 + smoothEnergy * 0.15);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.sin(phase * 0.8) * 0.2);

  ctx.beginPath();
  ctx.moveTo(0, -leafR);
  ctx.quadraticCurveTo(leafR * 0.55, -leafR * 0.3, leafR * 0.45, leafR * 0.4);
  ctx.quadraticCurveTo(0, leafR * 0.8, 0, leafR * 0.85);
  ctx.quadraticCurveTo(0, leafR * 0.8, -leafR * 0.45, leafR * 0.4);
  ctx.quadraticCurveTo(-leafR * 0.55, -leafR * 0.3, 0, -leafR);
  ctx.closePath();

  const leafGrad = ctx.createLinearGradient(0, -leafR, 0, leafR);
  leafGrad.addColorStop(0, '#34d399');
  leafGrad.addColorStop(0.6, '#10b981');
  leafGrad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = leafGrad;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, -leafR * 0.85);
  ctx.lineTo(0, leafR * 0.8);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();

  for (let f = 0; f < 5; f++) {
    const fAngle = phase * 1.2 + (f * Math.PI * 2) / 5;
    const fDist = radius * (0.75 + Math.sin(phase * 2 + f) * 0.18);
    ctx.beginPath();
    ctx.arc(cx + Math.cos(fAngle) * fDist, cy + Math.sin(fAngle) * fDist, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#fde047';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 8;
    ctx.fill();
  }

  ctx.restore();
}

function drawCupertinoSilk(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (let l = 0; l < 3; l++) {
    const lPhase = phase * 1.1 + (l * Math.PI * 2) / 3;
    ctx.beginPath();
    const steps = 36;
    for (let s = 0; s <= steps; s++) {
      const theta = (s / steps) * Math.PI * 2;
      const rVal = radius * (0.52 + Math.sin(theta * 3 + lPhase) * 0.22 * (0.8 + smoothEnergy * 0.4));
      const x = cx + Math.cos(theta) * rVal;
      const y = cy + Math.sin(theta) * rVal;
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.lineWidth = radius * 0.18;
    ctx.strokeStyle = l === 0 ? 'rgba(241, 245, 249, 0.65)' : l === 1 ? 'rgba(129, 140, 248, 0.55)' : 'rgba(192, 132, 252, 0.55)';
    ctx.shadowColor = '#818cf8';
    ctx.shadowBlur = 10;
    ctx.stroke();
  }

  ctx.restore();
}

function drawSiriRibbons(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number,
  ribbons: RibbonLayerSpec[],
  orbColors: ReturnType<typeof resolveOrbThemeColors>,
  lowPowerEco: boolean,
  _dpr: number
) {
  const outerHalo = ctx.createRadialGradient(cx, cy, radius * 0.45, cx, cy, radius * 1.1);
  outerHalo.addColorStop(0, 'rgba(255, 255, 255, 0)');
  outerHalo.addColorStop(0.75, `${orbColors.haloMid}${(0.22 + smoothEnergy * 0.22).toFixed(3)})`);
  outerHalo.addColorStop(1, orbColors.haloEnd);
  ctx.fillStyle = outerHalo;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  const steps = lowPowerEco ? 28 : 44;
  for (let i = 0; i < ribbons.length; i++) {
    const rib = ribbons[i];
    const tPhase = phase * rib.speed + rib.phaseOffset;
    const amp = radius * (0.28 + smoothEnergy * 0.34);

    const cosZ = Math.cos(rib.tiltZ + Math.sin(tPhase * 0.35) * 0.22);
    const sinZ = Math.sin(rib.tiltZ + Math.sin(tPhase * 0.35) * 0.22);
    const cosX = Math.cos(rib.tiltX + Math.cos(tPhase * 0.28) * 0.2);

    const pts: { x: number; y: number }[] = [];
    for (let s = 0; s <= steps; s++) {
      const u = (s / steps) * 2 - 1;
      const env = Math.sqrt(Math.max(0, 1 - u * u));
      const rawX = u * radius * 0.96;
      const waveY =
        (Math.sin(u * Math.PI * rib.freq1 + tPhase) * 0.62 +
          Math.cos(u * Math.PI * rib.freq2 - tPhase * 1.25) * 0.38) *
        amp *
        env;

      const rx = rawX * cosZ - waveY * sinZ;
      const ry = (rawX * sinZ + waveY * cosZ) * cosX;
      pts.push({ x: cx + rx, y: cy + ry });
    }

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
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(1, baseThick * p.mult);
      ctx.strokeStyle = `rgba(${rib.r}, ${rib.g}, ${rib.b}, ${p.alpha})`;
      ctx.stroke();
    }
  }

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

  ctx.restore();

  ctx.save();
  const specGrad = ctx.createLinearGradient(
    cx - radius * 0.5,
    cy - radius * 0.92,
    cx + radius * 0.2,
    cy - radius * 0.15
  );
  specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
  specGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.1)');
  specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.ellipse(cx - radius * 0.14, cy - radius * 0.52, radius * 0.56, radius * 0.28, -0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Master Astra AI Assistant 60fps Canvas2D Manifestations:
 * - 100% transparent backgrounds with ZERO black circles or bounding edges.
 * - Categorized packs: Naruto Jutsu, Motorsport & F1, Celestial Cosmos, Style Kits, and Apple Siri Orbs.
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
      const curStyle = styleRef.current || 'siri_rainbow';
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

      // 100% TRANSPARENT CANVAS CLEAR
      ctx.clearRect(0, 0, w, h);

      switch (curStyle) {
        // Naruto Shinobi & Jutsu
        case 'naruto_rasengan':
          drawNarutoRasengan(ctx, cx, cy, radius, phase, smoothEnergy);
          break;
        case 'naruto_rasenshuriken':
          drawNarutoRasenshuriken(ctx, cx, cy, radius, phase, smoothEnergy);
          break;
        case 'naruto_sharingan':
          drawNarutoSharingan(ctx, cx, cy, radius, phase, smoothEnergy);
          break;
        case 'naruto_mangekyo_susano':
          drawNarutoMangekyoSusano(ctx, cx, cy, radius, phase, smoothEnergy);
          break;
        case 'naruto_akatsuki_cloud':
          drawNarutoAkatsukiCloud(ctx, cx, cy, radius, phase, smoothEnergy);
          break;
        case 'naruto_white_cloud':
          drawNarutoWhiteCloud(ctx, cx, cy, radius, phase, smoothEnergy);
          break;

        // Motorsport & Formula 1
        case 'f1_telemetry_hud':
          drawF1TelemetryHud(ctx, cx, cy, radius, phase, smoothEnergy);
          break;
        case 'f1_tyre_soft':
          drawF1Tyre(ctx, cx, cy, radius, phase, smoothEnergy, 'S');
          break;
        case 'f1_tyre_medium':
          drawF1Tyre(ctx, cx, cy, radius, phase, smoothEnergy, 'M');
          break;
        case 'f1_tyre_hard':
          drawF1Tyre(ctx, cx, cy, radius, phase, smoothEnergy, 'H');
          break;
        case 'f1_tyre_inter':
          drawF1Tyre(ctx, cx, cy, radius, phase, smoothEnergy, 'I');
          break;
        case 'f1_tyre_wet':
          drawF1Tyre(ctx, cx, cy, radius, phase, smoothEnergy, 'W');
          break;
        case 'motorsport_gt':
          drawMotorsportGt(ctx, cx, cy, radius, phase, smoothEnergy);
          break;

        // Celestial Planets & Space
        case 'space_sun':
          drawSpaceSun(ctx, cx, cy, radius, phase, smoothEnergy);
          break;
        case 'space_earth':
          drawSpaceEarth(ctx, cx, cy, radius, phase, smoothEnergy);
          break;
        case 'space_moon':
          drawSpaceMoon(ctx, cx, cy, radius, phase, smoothEnergy);
          break;
        case 'space_mars':
          drawSpaceMars(ctx, cx, cy, radius, phase, smoothEnergy);
          break;
        case 'space_milkyway':
          drawSpaceMilkyway(ctx, cx, cy, radius, phase, smoothEnergy);
          break;

        // Themed Style Kits
        case 'botanical_sakura':
          drawBotanicalSakura(ctx, cx, cy, radius, phase, smoothEnergy);
          break;
        case 'cyberpunk_hud':
          drawCyberpunkHud(ctx, cx, cy, radius, phase, smoothEnergy);
          break;
        case 'fluent_fluid':
          drawFluentFluid(ctx, cx, cy, radius, phase, smoothEnergy);
          break;
        case 'retro_cassette_vu':
          drawRetroCassette(ctx, cx, cy, radius, phase, smoothEnergy);
          break;
        case 'paper_ink_enso':
          drawPaperInkEnso(ctx, cx, cy, radius, phase, smoothEnergy);
          break;
        case 'cozy_woodland':
          drawCozyWoodland(ctx, cx, cy, radius, phase, smoothEnergy);
          break;
        case 'cupertino_silk':
          drawCupertinoSilk(ctx, cx, cy, radius, phase, smoothEnergy);
          break;

        // Classic Apple Siri Shaders
        default: {
          const ribbons = resolveRibbonSpecs(curStyle);
          const orbColors = resolveOrbThemeColors(curStyle);
          drawSiriRibbons(ctx, cx, cy, radius, phase, smoothEnergy, ribbons, orbColors, lowPowerEco, dpr);
          break;
        }
      }

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
      className={`block shrink-0 select-none pointer-events-none bg-transparent ${className}`}
    />
  );
};
