import React, { useEffect, useRef, useState } from 'react';
import { ControlSliderOrientation, SliderVisualStyle } from '../utils/themeAndSliders';

interface FluidEffectSliderProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (nextValue: number) => void;
  styleVariant: SliderVisualStyle;
  primaryHex: string;
  secondaryHex?: string;
  /** Enables continuous 60fps wave/bar animation (e.g. while music is playing or previewing) */
  animateWave?: boolean;
  glowIntensity?: number;
  ariaLabel: string;
  formatTooltip?: (val: number) => string;
  lowPowerEco?: boolean;
  orientation?: ControlSliderOrientation;
  isLightSurface?: boolean;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = (hex || '#22d3ee').replace('#', '');
  const full =
    clean.length === 3
      ? `${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`
      : clean.padEnd(6, '0');
  const num = parseInt(full.slice(0, 6), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
}

/**
 * Universal high-craft slider supporting 11 themed visualizers (Liquid Silk Ribbon, Harmonic Bars,
 * Cyberpunk Laser, Retro 16-LED Cassette VU, Motorsport GT RPM Redline, Paper Fountain-Ink Stroke,
 * Botanical Petal Wave, Win11 Cyan, iOS Capsule, Aurora Meniscus, Minimal Hairline) plus both
 * Horizontal and Vertical orientations.
 */
export const FluidEffectSlider: React.FC<FluidEffectSliderProps> = ({
  value,
  min = 0,
  max = 100,
  onChange,
  styleVariant,
  primaryHex,
  secondaryHex = '#a855f7',
  animateWave = false,
  glowIntensity = 0.8,
  ariaLabel,
  formatTooltip,
  lowPowerEco = false,
  orientation = 'horizontal',
  isLightSurface = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverRatio, setHoverRatio] = useState<number | null>(null);

  const safeSpan = Math.max(0.0001, max - min);
  const clampedRatio = Math.max(0, Math.min(1, (value - min) / safeSpan));
  const isVertical = orientation === 'vertical';

  const stateRef = useRef({
    ratio: clampedRatio,
    primaryHex,
    secondaryHex,
    animate: animateWave || isDragging,
    hovered: isHovered || isDragging,
    styleVariant,
    glowIntensity,
    lowPowerEco,
    isLightSurface,
  });
  stateRef.current = {
    ratio: clampedRatio,
    primaryHex,
    secondaryHex,
    animate: animateWave || isDragging,
    hovered: isHovered || isDragging,
    styleVariant,
    glowIntensity,
    lowPowerEco,
    isLightSurface,
  };

  const isCanvasMode =
    !isVertical &&
    (styleVariant === 'fused_liquid_ribbon' ||
      styleVariant === 'fused_harmonic_bars' ||
      styleVariant === 'botanical_petal_wave');

  useEffect(() => {
    if (!isCanvasMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let phase = Math.random() * 8;
    let smoothAmp = animateWave ? 1 : 0.35;
    let lastTs = performance.now();

    const renderFrame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;

      const st = stateRef.current;
      const targetAmp = st.animate ? (st.lowPowerEco ? 0.55 : 1.0) : 0.32;
      smoothAmp += (targetAmp - smoothAmp) * Math.min(1, dt * 8);
      if (st.animate) {
        phase += dt * (st.lowPowerEco ? 2.0 : 3.4);
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth || 220;
      const cssH = canvas.clientHeight || 24;
      const targetW = Math.round(cssW * dpr);
      const targetH = Math.round(cssH * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      const midY = cssH / 2;
      const padX = 7;
      const usableW = Math.max(12, cssW - padX * 2);
      const headX = padX + usableW * st.ratio;
      const railColor = st.isLightSurface
        ? 'rgba(28, 25, 23, 0.16)'
        : 'rgba(255, 255, 255, 0.14)';

      if (st.styleVariant === 'fused_liquid_ribbon' || st.styleVariant === 'botanical_petal_wave') {
        const isPetal = st.styleVariant === 'botanical_petal_wave';
        ctx.fillStyle = railColor;
        ctx.beginPath();
        ctx.roundRect(
          Math.max(padX, headX - 1),
          midY - 2,
          Math.max(2, padX + usableW - headX + 1),
          4,
          99
        );
        ctx.fill();

        const spineGrad = ctx.createLinearGradient(padX, 0, Math.max(padX + 8, headX), 0);
        spineGrad.addColorStop(0, hexToRgba(st.secondaryHex, 0.65));
        spineGrad.addColorStop(0.75, hexToRgba(st.primaryHex, 0.9));
        spineGrad.addColorStop(1, st.isLightSurface ? st.primaryHex : '#ffffff');
        ctx.fillStyle = spineGrad;
        ctx.beginPath();
        ctx.roundRect(padX, midY - 1.75, Math.max(3, headX - padX), 3.5, 99);
        ctx.fill();

        const playedLen = headX - padX;
        if (playedLen > 8) {
          const ribbons = isPetal
            ? [
                { color: st.secondaryHex, freq: 0.09, speed: 1.1, amp: 0.38, alpha: 0.48 },
                { color: st.primaryHex, freq: 0.065, speed: -1.5, amp: 0.44, alpha: 0.58 },
              ]
            : [
                { color: st.secondaryHex, freq: 0.065, speed: 1.4, amp: 0.42, alpha: 0.42 },
                { color: st.primaryHex, freq: 0.05, speed: -1.9, amp: 0.36, alpha: 0.52 },
                { color: '#e2e8f0', freq: 0.082, speed: 2.3, amp: 0.22, alpha: 0.28 },
              ];

          for (const rb of ribbons) {
            ctx.fillStyle = hexToRgba(rb.color, rb.alpha);
            ctx.beginPath();
            ctx.moveTo(padX, midY);
            const stepPx = 3;
            for (let lx = 0; lx <= playedLen; lx += stepPx) {
              const t = lx / playedLen;
              const env = Math.sin(t * Math.PI) * (st.hovered ? 1.15 : 0.95);
              const dy =
                Math.sin(lx * rb.freq + phase * rb.speed) *
                (cssH * rb.amp) *
                env *
                smoothAmp;
              ctx.lineTo(padX + lx, midY + dy);
            }
            for (let lx = playedLen; lx >= 0; lx -= stepPx) {
              const t = lx / playedLen;
              const env = Math.sin(t * Math.PI) * (st.hovered ? 1.15 : 0.95);
              const dy =
                Math.cos(lx * rb.freq * 0.9 - phase * rb.speed * 0.8) *
                (cssH * rb.amp * 0.72) *
                env *
                smoothAmp;
              ctx.lineTo(padX + lx, midY - dy * 0.65);
            }
            ctx.closePath();
            ctx.fill();
          }
        }

        if (st.glowIntensity > 0.05 && !st.isLightSurface) {
          const halo = ctx.createRadialGradient(headX, midY, 1, headX, midY, st.hovered ? 11 : 8);
          halo.addColorStop(0, hexToRgba('#ffffff', 0.9));
          halo.addColorStop(0.45, hexToRgba(st.primaryHex, 0.55 * st.glowIntensity));
          halo.addColorStop(1, hexToRgba(st.primaryHex, 0));
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(headX, midY, st.hovered ? 11 : 8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = st.isLightSurface ? st.primaryHex : '#ffffff';
        ctx.beginPath();
        ctx.arc(headX, midY, st.hovered ? 4.6 : 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const barCount = Math.max(18, Math.min(38, Math.floor(usableW / 6.5)));
        const step = usableW / barCount;
        const barW = Math.max(2.2, step * 0.56);

        for (let i = 0; i < barCount; i++) {
          const bx = padX + i * step + (step - barW) / 2;
          const barCenterRatio = (i + 0.5) / barCount;
          const isPlayed = barCenterRatio <= st.ratio + 0.005;

          const wave =
            0.3 +
            0.38 * Math.abs(Math.sin(phase * 1.9 + i * 0.52)) +
            0.32 * Math.abs(Math.cos(phase * 1.2 - i * 0.31));
          const maxBarH = cssH * (st.hovered ? 0.84 : 0.72);
          const h = Math.max(
            3.5,
            maxBarH *
              (isPlayed
                ? 0.25 + 0.75 * wave * smoothAmp
                : 0.22 + 0.32 * Math.abs(Math.sin(i * 0.7)))
          );

          if (isPlayed) {
            const g = ctx.createLinearGradient(0, midY - h / 2, 0, midY + h / 2);
            g.addColorStop(0, st.primaryHex);
            g.addColorStop(1, st.secondaryHex);
            ctx.fillStyle = g;
          } else {
            ctx.fillStyle = railColor;
          }

          ctx.beginPath();
          ctx.roundRect(bx, midY - h / 2, barW, h, 99);
          ctx.fill();
        }

        ctx.fillStyle = st.isLightSurface ? '#1c1917' : '#ffffff';
        ctx.beginPath();
        ctx.roundRect(headX - 1.5, midY - cssH * 0.42, 3, cssH * 0.84, 99);
        ctx.fill();
      }

      if (st.animate || Math.abs(smoothAmp - targetAmp) > 0.015) {
        rafId = requestAnimationFrame(renderFrame);
      } else {
        rafId = 0;
      }
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId);
    };
  }, [
    isCanvasMode,
    styleVariant,
    clampedRatio,
    primaryHex,
    secondaryHex,
    animateWave,
    isHovered,
    isDragging,
    glowIntensity,
    lowPowerEco,
    isLightSurface,
  ]);

  const computeValueFromPointer = (clientX: number, clientY: number): number => {
    if (!containerRef.current) return value;
    const rect = containerRef.current.getBoundingClientRect();
    if (isVertical) {
      if (rect.height <= 0) return value;
      const r = Math.max(0, Math.min(1, (rect.bottom - clientY) / rect.height));
      return min + r * safeSpan;
    }
    if (rect.width <= 0) return value;
    const r = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return min + r * safeSpan;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    const next = computeValueFromPointer(e.clientX, e.clientY);
    onChange(Math.round(next));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (!isVertical && rect.width > 0) {
      setHoverRatio(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
    }
    if (isDragging) {
      const next = computeValueFromPointer(e.clientX, e.clientY);
      onChange(Math.round(next));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setIsDragging(false);
    }
  };

  const pctStr = `${(clampedRatio * 100).toFixed(2)}%`;
  const activeHover = isHovered || isDragging;

  // Vertical Pillar Slider Rendering (for Vertical Control Center Block Layout)
  if (isVertical) {
    return (
      <div
        ref={containerRef}
        role="slider"
        tabIndex={0}
        aria-orientation="vertical"
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(value)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={(e) => {
          const step = Math.max(1, Math.round(safeSpan * 0.05));
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            e.preventDefault();
            onChange(Math.min(max, Math.round(value + step)));
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            e.preventDefault();
            onChange(Math.max(min, Math.round(value - step)));
          }
        }}
        className={`relative w-11 h-full min-h-[118px] rounded-2xl overflow-hidden select-none cursor-pointer border transition-transform ${
          activeHover ? 'scale-[1.02]' : ''
        } ${
          isLightSurface
            ? 'bg-stone-900/10 border-stone-900/15'
            : 'bg-white/[0.08] border-white/12'
        }`}
      >
        <div
          style={{
            height: pctStr,
            background: `linear-gradient(0deg, ${hexToRgba(secondaryHex, 0.85)} 0%, ${primaryHex} 100%)`,
          }}
          className="absolute inset-x-0 bottom-0 transition-[height] duration-75"
        />
        <div
          style={{ bottom: pctStr }}
          className="absolute inset-x-2 translate-y-0.5 h-1 rounded-full bg-white/90 shadow pointer-events-none"
        />
      </div>
    );
  }

  const unplayedBg = isLightSurface ? 'bg-stone-900/15' : 'bg-white/20';

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoverRatio(null);
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={(e) => {
        const step = Math.max(1, Math.round(safeSpan * 0.04));
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          onChange(Math.min(max, Math.round(value + step)));
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          onChange(Math.max(min, Math.round(value - step)));
        }
      }}
      className="relative flex-1 flex items-center select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-400 rounded-lg min-h-[24px]"
    >
      {activeHover && hoverRatio !== null && formatTooltip && (
        <div
          style={{ left: `${(hoverRatio * 100).toFixed(1)}%` }}
          className="absolute -top-5 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-950/95 border border-white/15 text-[10px] font-mono text-white tabular-nums pointer-events-none shadow-md z-20 whitespace-nowrap"
        >
          {formatTooltip(Math.round(min + hoverRatio * safeSpan))}
        </div>
      )}

      {isCanvasMode ? (
        <canvas ref={canvasRef} className="w-full h-6 block pointer-events-none" />
      ) : styleVariant === 'cyberpunk_laser' ? (
        /* Cyberpunk High-Voltage Chamfered Laser Rail + Diamond Cursor */
        <div className="relative w-full h-5 flex items-center">
          <div className="w-full h-[6px] bg-[#1b1433] border border-cyan-400/35 overflow-hidden [clip-path:polygon(0_0,calc(100%-4px)_0,100%_4px,100%_100%,4px_100%,0_calc(100%-4px))]">
            <div
              style={{
                width: pctStr,
                background: `linear-gradient(90deg, ${secondaryHex} 0%, ${primaryHex} 100%)`,
                boxShadow: `0 0 12px ${primaryHex}`,
              }}
              className="h-full"
            />
          </div>
          <div
            style={{
              left: pctStr,
              borderColor: primaryHex,
              boxShadow: `0 0 10px ${primaryHex}`,
            }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-slate-950 border-2 pointer-events-none"
          />
        </div>
      ) : styleVariant === 'retro_vu_cassette' ? (
        /* Retro 80s 16-LED Segmented VU Meter Bar */
        <div className="relative w-full h-5 grid grid-cols-[repeat(16,minmax(0,1fr))] gap-[2px] items-center">
          {Array.from({ length: 16 }).map((_, idx) => {
            const segRatio = (idx + 0.5) / 16;
            const lit = segRatio <= clampedRatio + 0.01;
            const hotPeak = idx >= 13;
            const warmMid = idx >= 9 && idx < 13;
            const segColor = !lit
              ? isLightSurface
                ? 'rgba(28,25,23,0.14)'
                : 'rgba(255,255,255,0.12)'
              : hotPeak
                ? '#f43f5e'
                : warmMid
                  ? secondaryHex
                  : primaryHex;
            return (
              <span
                key={idx}
                style={{ backgroundColor: segColor }}
                className="h-3 rounded-[2px] transition-colors duration-75"
              />
            );
          })}
        </div>
      ) : styleVariant === 'gt_rpm_redline' ? (
        /* Motorsport GT Tachometer RPM Redline Bar */
        <div className="relative w-full h-5 flex items-center gap-[2px]">
          {Array.from({ length: 20 }).map((_, idx) => {
            const segRatio = (idx + 0.5) / 20;
            const lit = segRatio <= clampedRatio + 0.01;
            const redline = idx >= 15;
            return (
              <span
                key={idx}
                style={{
                  backgroundColor: !lit
                    ? 'rgba(255,255,255,0.11)'
                    : redline
                      ? '#ef4444'
                      : idx >= 10
                        ? secondaryHex
                        : primaryHex,
                }}
                className={`flex-1 -skew-x-12 rounded-[1px] ${
                  redline ? 'h-3.5' : 'h-2.5'
                }`}
              />
            );
          })}
        </div>
      ) : styleVariant === 'paper_ink_stroke' ? (
        /* Tactile Archival Paper Fountain-Ink Stroke + Nib Marker */
        <div className="relative w-full h-5 flex items-center">
          <div
            className={`w-full h-[3px] rounded-full overflow-hidden ${
              isLightSurface ? 'bg-stone-900/20' : 'bg-white/20'
            }`}
          >
            <div
              style={{ width: pctStr, backgroundColor: primaryHex }}
              className="h-full rounded-full"
            />
          </div>
          <div
            style={{
              left: pctStr,
              borderColor: primaryHex,
              backgroundColor: isLightSurface ? '#faf6ee' : '#0f172a',
            }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 shadow-sm pointer-events-none"
          />
        </div>
      ) : styleVariant === 'win11_fluent' ? (
        /* Windows 11 Quick Settings Cyan/Accent Track + Dark-Halo Dot Thumb */
        <div className="relative w-full h-5 flex items-center">
          <div className={`w-full h-[4px] rounded-full ${unplayedBg} overflow-hidden`}>
            <div
              style={{
                width: pctStr,
                backgroundColor: primaryHex,
              }}
              className="h-full rounded-full"
            />
          </div>
          <div
            style={{ left: pctStr }}
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[18px] h-[18px] rounded-full ring-1 flex items-center justify-center shadow-md pointer-events-none ${
              isLightSurface
                ? 'bg-stone-100 ring-stone-900/20'
                : 'bg-[#262b36] ring-white/15'
            }`}
          >
            <span
              style={{ backgroundColor: primaryHex }}
              className={`rounded-full transition-transform duration-150 ${
                activeHover ? 'w-3 h-3 scale-105' : 'w-2.5 h-2.5'
              }`}
            />
          </div>
        </div>
      ) : styleVariant === 'apple_thick_capsule' ? (
        /* iOS Thick Translucent Glass Capsule Slider */
        <div
          className={`relative w-full h-[22px] rounded-full border overflow-hidden ${
            isLightSurface
              ? 'bg-stone-900/[0.08] border-stone-900/15'
              : 'bg-white/[0.09] border-white/[0.1]'
          }`}
        >
          <div
            style={{
              width: pctStr,
              background: `linear-gradient(90deg, ${hexToRgba(secondaryHex, 0.78)} 0%, ${primaryHex} 100%)`,
            }}
            className="h-full rounded-full transition-[filter] duration-150"
          />
          <div
            style={{ left: pctStr }}
            className="absolute inset-y-1 -translate-x-1 w-1 rounded-full bg-white/90 shadow pointer-events-none"
          />
        </div>
      ) : styleVariant === 'minimal_hairline' ? (
        /* Studio Precision 2px Hairline Fader */
        <div className="relative w-full h-5 flex items-center">
          <div className={`w-full h-[2px] ${unplayedBg} rounded-full overflow-hidden`}>
            <div
              style={{
                width: pctStr,
                backgroundColor: isLightSurface ? primaryHex : '#ffffff',
              }}
              className="h-full"
            />
          </div>
          <div
            style={{
              left: pctStr,
              boxShadow: glowIntensity > 0 ? `0 0 8px ${primaryHex}` : undefined,
            }}
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[3px] h-3.5 rounded-full pointer-events-none ${
              isLightSurface ? 'bg-stone-900' : 'bg-white'
            }`}
          />
        </div>
      ) : (
        /* aurora_meniscus: Elastic Hover-Swelling Aurora Glow Bar */
        <div className="relative w-full h-6 flex items-center">
          <div
            className={`relative w-full rounded-full ${unplayedBg} overflow-hidden transition-all duration-200 ${
              activeHover ? 'h-[9px]' : 'h-[5px]'
            }`}
          >
            <div
              style={{
                width: pctStr,
                background: `linear-gradient(90deg, ${secondaryHex} 0%, ${primaryHex} 70%, #ffffff 100%)`,
              }}
              className="absolute inset-y-0 left-0 rounded-full"
            />
          </div>
          <div
            style={{
              left: pctStr,
              boxShadow: glowIntensity > 0 ? `0 0 12px ${primaryHex}` : undefined,
            }}
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white pointer-events-none transition-all duration-150 ${
              activeHover ? 'w-3.5 h-3.5' : 'w-2 h-2'
            }`}
          />
        </div>
      )}
    </div>
  );
};
