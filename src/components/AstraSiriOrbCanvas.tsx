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

/**
 * 1. BOTANICAL SAKURA: Floating Glowing Cherry Blossom Flower & Orbiting Petals
 * Pure transparent background, 5 sculpted Sakura petals with notched tips,
 * breathing stamen filaments, and orbiting floral petal flakes.
 */
function drawBotanicalSakura(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number,
  _curState: SiriOrbVisualState
) {
  // Soft rosy aura bloom behind blossom
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

  // Draw 5 Sakura petals
  for (let i = 0; i < 5; i++) {
    const angle = (i * (Math.PI * 2)) / 5 + rotation;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const perpCos = -sinA;
    const perpSin = cosA;

    // Outer notch coordinates
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

    // Left curve to petal shoulder
    ctx.bezierCurveTo(
      cx + perpCos * (halfWidth * 0.3) + cosA * (tipDist * 0.35),
      cy + perpSin * (halfWidth * 0.3) + sinA * (tipDist * 0.35),
      leftX - cosA * (tipDist * 0.2),
      leftY - sinA * (tipDist * 0.2),
      leftX,
      leftY
    );

    // Notched tip: Left lobe to center notch to right lobe
    ctx.quadraticCurveTo(tipX - perpCos * (halfWidth * 0.25), tipY - perpSin * (halfWidth * 0.25), notchCenterX, notchCenterY);
    ctx.quadraticCurveTo(tipX + perpCos * (halfWidth * 0.25), tipY + perpSin * (halfWidth * 0.25), rightX, rightY);

    // Right curve back to center
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

    // Petal delicate translucent highlight rim
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  // Floral Center: Golden Stamen filaments radiating outward
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

    // Pollen anther dot
    ctx.beginPath();
    ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 4;
    ctx.fill();
  }

  // Central Pistil Core
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, petalRadius * 0.18);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.5, '#f472b6');
  coreGrad.addColorStop(1, '#db2777');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, petalRadius * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4 Orbiting Petal Flakes spiraling gently around the flower
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

/**
 * 2. CYBERPUNK HUD: Holographic Sci-Fi HUD Construct & Targeting Reticle
 * Pure transparent background, corner brackets, rotating segmented rings,
 * neon cyan/magenta glitch core, and sound-reactive laser targeting spikes.
 */
function drawCyberpunkHud(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number,
  _curState: SiriOrbVisualState
) {
  // Ambient Holographic Cyan/Magenta Bloom
  const halo = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.1);
  halo.addColorStop(0, `rgba(6, 182, 212, ${(0.22 + smoothEnergy * 0.25).toFixed(3)})`);
  halo.addColorStop(0.7, `rgba(236, 72, 153, ${(0.12 + smoothEnergy * 0.15).toFixed(3)})`);
  halo.addColorStop(1, 'rgba(6, 182, 212, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();

  // 1. Four Sci-Fi Corner Targeting Brackets [  ]
  const brkDist = radius * 0.88;
  const brkLen = radius * 0.32;
  const brkThick = 2;
  ctx.strokeStyle = '#22d3ee';
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 8;
  ctx.lineWidth = brkThick;

  // Top-Left [
  ctx.beginPath();
  ctx.moveTo(cx - brkDist, cy - brkDist + brkLen);
  ctx.lineTo(cx - brkDist, cy - brkDist);
  ctx.lineTo(cx - brkDist + brkLen, cy - brkDist);
  ctx.stroke();

  // Top-Right ]
  ctx.beginPath();
  ctx.moveTo(cx + brkDist - brkLen, cy - brkDist);
  ctx.lineTo(cx + brkDist, cy - brkDist);
  ctx.lineTo(cx + brkDist, cy - brkDist + brkLen);
  ctx.stroke();

  // Bottom-Right ]
  ctx.beginPath();
  ctx.moveTo(cx + brkDist, cy + brkDist - brkLen);
  ctx.lineTo(cx + brkDist, cy + brkDist);
  ctx.lineTo(cx + brkDist - brkLen, cy + brkDist);
  ctx.stroke();

  // Bottom-Left [
  ctx.beginPath();
  ctx.moveTo(cx - brkDist + brkLen, cy + brkDist);
  ctx.lineTo(cx - brkDist, cy + brkDist);
  ctx.lineTo(cx - brkDist, cy + brkDist - brkLen);
  ctx.stroke();

  // 2. Rotating Segmented Outer Ring with Tick Marks
  const ringR = radius * 0.72;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#06b6d4';
  const segs = 4;
  for (let s = 0; s < segs; s++) {
    const startA = phase * 1.2 + (s * Math.PI) / 2;
    const arcLen = Math.PI * 0.32;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, startA, startA + arcLen);
    ctx.stroke();
  }

  // Ticks along the ring
  const numTicks = 12;
  for (let t = 0; t < numTicks; t++) {
    const tAngle = phase * 0.6 + (t * Math.PI * 2) / numTicks;
    const innerR = ringR - (t % 3 === 0 ? 5 : 2.5);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(tAngle) * innerR, cy + Math.sin(tAngle) * innerR);
    ctx.lineTo(cx + Math.cos(tAngle) * (ringR + 2), cy + Math.sin(tAngle) * (ringR + 2));
    ctx.strokeStyle = t % 3 === 0 ? '#facc15' : '#06b6d4';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 3. Counter-Rotating Inner Hexagon
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

  // 4. Central Pulsing Glitch Data Core & Targeting Crosshairs
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

  // Crosshair laser lines
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

/**
 * 3. FLUENT FLUID: Windows 11 Floating Aurora Wave Ribbon
 * Borderless, fluid ribbons floating organically on transparent canvas.
 */
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
      const u = (s / steps) * 2 - 1; // -1 .. 1
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

  // Central brilliant caustic intersection hotspot
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

/**
 * 4. RETRO CASSETTE & VU: 80s Synthwave Dual Spools & Neon VU Meters
 */
function drawRetroCassette(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();

  // Amber/Magenta Synthwave Background Aura
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

  // Draw 2 Spools (Left & Right)
  for (const dir of [-1, 1]) {
    const sx = cx + dir * spoolOffset;
    const sy = cy;

    // Spool Outer Rim
    ctx.beginPath();
    ctx.arc(sx, sy, spoolR, 0, Math.PI * 2);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3 Rotating Spokes
    for (let sp = 0; sp < 3; sp++) {
      const spAngle = dir * phase * 2.5 + (sp * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(spAngle) * spoolR, sy + Math.sin(spAngle) * spoolR);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Spool Hub
    ctx.beginPath();
    ctx.arc(sx, sy, spoolR * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#ec4899';
    ctx.fill();
  }

  // Connecting Tape Line with voice vibration
  ctx.beginPath();
  ctx.moveTo(cx - spoolOffset, cy + spoolR * 0.85);
  ctx.quadraticCurveTo(cx, cy + spoolR * 0.85 + Math.sin(phase * 8) * 4 * smoothEnergy, cx + spoolOffset, cy + spoolR * 0.85);
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Radial VU Meter Segments around the top
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

/**
 * 5. PAPER INK ENSO: Zen Calligraphy Brush Enso & Vermilion Seal
 */
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

  // Calligraphic brush enso circle with breathing stroke taper
  ctx.beginPath();
  const startAngle = -0.3 + Math.sin(phase * 0.5) * 0.1;
  const endAngle = Math.PI * 1.85 + Math.sin(phase * 0.6) * 0.12;
  ctx.arc(cx, cy, ensoR, startAngle, endAngle);
  ctx.strokeStyle = 'rgba(28, 25, 23, 0.88)';
  ctx.lineWidth = 4 + smoothEnergy * 5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Inner organic ink wash
  const inkWash = ctx.createRadialGradient(cx, cy, 0, cx, cy, ensoR);
  inkWash.addColorStop(0, `rgba(220, 38, 38, ${(0.18 + smoothEnergy * 0.25).toFixed(3)})`);
  inkWash.addColorStop(0.65, 'rgba(68, 64, 60, 0.1)');
  inkWash.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = inkWash;
  ctx.beginPath();
  ctx.arc(cx, cy, ensoR, 0, Math.PI * 2);
  ctx.fill();

  // Vermilion Cinnabar Stamp Seal [印] at center
  const stampSize = radius * (0.28 + smoothEnergy * 0.1);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0.08);
  ctx.fillStyle = '#dc2626';
  ctx.shadowColor = '#b91c1c';
  ctx.shadowBlur = 8;
  ctx.fillRect(-stampSize / 2, -stampSize / 2, stampSize, stampSize);

  // Inked character outline inside stamp
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(-stampSize * 0.38, -stampSize * 0.38, stampSize * 0.76, stampSize * 0.76);
  ctx.restore();

  ctx.restore();
}

/**
 * 6. MOTORSPORT GT: High-RPM Tachometer Redline & Turbo Turbine
 */
function drawMotorsportGt(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();

  // Tachometer 270° gauge arc
  const gaugeR = radius * 0.8;
  const startA = Math.PI * 0.75;
  const endA = Math.PI * 2.25;

  // Track arc
  ctx.beginPath();
  ctx.arc(cx, cy, gaugeR, startA, endA);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Redline section
  ctx.beginPath();
  ctx.arc(cx, cy, gaugeR, Math.PI * 1.85, endA);
  ctx.strokeStyle = '#ef4444';
  ctx.shadowColor = '#dc2626';
  ctx.shadowBlur = 8;
  ctx.lineWidth = 5;
  ctx.stroke();

  // Needle responding to smoothEnergy
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

  // Center Turbine Hub with rotating blades
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

/**
 * 7. COZY WOODLAND: Organic Leaf & Swirling Fireflies
 */
function drawCozyWoodland(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  smoothEnergy: number
) {
  ctx.save();

  // Soft Emerald Aura
  const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.1);
  aura.addColorStop(0, `rgba(16, 185, 129, ${(0.28 + smoothEnergy * 0.25).toFixed(3)})`);
  aura.addColorStop(0.7, `rgba(245, 158, 11, ${(0.14 + smoothEnergy * 0.15).toFixed(3)})`);
  aura.addColorStop(1, 'rgba(16, 185, 129, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
  ctx.fill();

  // Floating Curved Leaf
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

  // Center Vein
  ctx.beginPath();
  ctx.moveTo(0, -leafR * 0.85);
  ctx.lineTo(0, leafR * 0.8);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.restore();

  // Swirling Fireflies
  for (let f = 0; f < 5; f++) {
    const fAngle = phase * 1.2 + (f * Math.PI * 2) / 5;
    const fDist = radius * (0.75 + Math.sin(phase * 2 + f) * 0.18);
    const fx = cx + Math.cos(fAngle) * fDist;
    const fy = cy + Math.sin(fAngle) * fDist;

    ctx.beginPath();
    ctx.arc(fx, fy, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#fde047';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 8;
    ctx.fill();
  }

  ctx.restore();
}

/**
 * 8. CUPERTINO SILK: Liquid Pearlescent Knot
 */
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

  const loops = 3;
  for (let l = 0; l < loops; l++) {
    const lPhase = phase * 1.1 + (l * Math.PI * 2) / loops;
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

/**
 * 9. SIRI MULTI-RIBBON: Pure Transparent Canvas (NO Black Circle!)
 */
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
  dpr: number
) {
  // Soft External Aura
  const outerHalo = ctx.createRadialGradient(cx, cy, radius * 0.45, cx, cy, radius * 1.1);
  outerHalo.addColorStop(0, 'rgba(255, 255, 255, 0)');
  outerHalo.addColorStop(0.75, `${orbColors.haloMid}${(0.22 + smoothEnergy * 0.22).toFixed(3)})`);
  outerHalo.addColorStop(1, orbColors.haloEnd);
  ctx.fillStyle = outerHalo;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
  ctx.fill();

  // Additive 3D Parametric Silk Ribbons on Transparent Background
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
      const last = pts[pts.length - 1];
      ctx.lineTo(last.x, last.y);

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(1, baseThick * p.mult);
      ctx.strokeStyle = `rgba(${rib.r}, ${rib.g}, ${rib.b}, ${p.alpha})`;
      ctx.stroke();
    }
  }

  // Central Luminous Caustic Bloom
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

  // Delicate Specular Glass Arc (Transparent, no solid border)
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
  ctx.restore();
}

/**
 * Authentic 60fps Canvas2D Astra AI Assistant Manifestations:
 * - botanical_sakura: Floating 5-petal glowing cherry blossom flower with stamen filaments & orbiting petal flakes
 * - cyberpunk_hud: Sci-fi holographic HUD construct with targeting reticle, segmented rotating rings & glitch laser core
 * - fluent_fluid: Floating pure aurora ribbon wave with borderless transparency
 * - retro_cassette_vu: 80s synthwave cassette spools & dancing neon VU meters
 * - paper_ink_enso: Zen calligraphy sumi-e ink enso & vermilion seal
 * - motorsport_gt: High-RPM tachometer redline & turbo turbine
 * - cozy_woodland: Organic forest leaf & swirling fireflies
 * - cupertino_silk: Liquid pearlescent silk knot
 * - siri_rainbow / celestial / cyber_plasma / neon_pulse / emerald / pearl: Fluid silk ribbons
 * ALL rendered on a 100% transparent canvas with ZERO black background circles!
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

      // 100% TRANSPARENT CANVAS CLEAR - Zero black background or outline
      ctx.clearRect(0, 0, w, h);

      switch (curStyle) {
        case 'botanical_sakura':
          drawBotanicalSakura(ctx, cx, cy, radius, phase, smoothEnergy, curState);
          break;
        case 'cyberpunk_hud':
          drawCyberpunkHud(ctx, cx, cy, radius, phase, smoothEnergy, curState);
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
        case 'motorsport_gt':
          drawMotorsportGt(ctx, cx, cy, radius, phase, smoothEnergy);
          break;
        case 'cozy_woodland':
          drawCozyWoodland(ctx, cx, cy, radius, phase, smoothEnergy);
          break;
        case 'cupertino_silk':
          drawCupertinoSilk(ctx, cx, cy, radius, phase, smoothEnergy);
          break;
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
