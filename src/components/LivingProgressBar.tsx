import React, { useEffect, useRef, useState } from 'react';
import { formatDurationClock } from '../utils/audioSynth';
import { SliderVisualStyle } from '../utils/themeAndSliders';
import { FluidEffectSlider } from './FluidEffectSlider';

interface LivingProgressBarProps {
  currentSec: number;
  durationSec: number;
  isPlaying: boolean;
  accentHex: string;
  secondaryHex?: string;
  sliderStyle?: SliderVisualStyle;
  livingGlowEnabled?: boolean;
  glowIntensity?: number;
  lowPowerEco?: boolean;
  onSeek: (targetSec: number) => void;
}

/**
 * 60fps interpolated music progress scrubber supporting fused Liquid Ribbon,
 * Harmonic Bars, Windows 11 Cyan Fluent, Apple Thick Capsule, Aurora Meniscus, and Minimal Hairline.
 */
export const LivingProgressBar: React.FC<LivingProgressBarProps> = ({
  currentSec,
  durationSec,
  isPlaying,
  accentHex,
  secondaryHex = '#a855f7',
  sliderStyle = 'fused_liquid_ribbon',
  livingGlowEnabled = true,
  glowIntensity = 0.8,
  lowPowerEco = false,
  onSeek,
}) => {
  const [smoothSec, setSmoothSec] = useState(currentSec);
  const anchorRef = useRef({ baseSec: currentSec, syncPerf: performance.now() });

  useEffect(() => {
    anchorRef.current = { baseSec: currentSec, syncPerf: performance.now() };
    setSmoothSec(currentSec);
  }, [currentSec, isPlaying]);

  // Sub-second interpolation (~20Hz lightweight tick for canvas/DOM smoothness when playing)
  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      const elapsed = Math.min(1.05, Math.max(0, (performance.now() - anchorRef.current.syncPerf) / 1000));
      setSmoothSec(Math.min(durationSec, anchorRef.current.baseSec + elapsed));
    }, 50);
    return () => window.clearInterval(id);
  }, [isPlaying, durationSec]);

  const remainingSec = Math.max(0, durationSec - currentSec);

  return (
    <div className="flex items-center gap-2.5 select-none" data-testid="living-progress-bar">
      <span className="text-[11px] font-mono text-slate-400 tabular-nums w-8 shrink-0">
        {formatDurationClock(currentSec)}
      </span>

      <FluidEffectSlider
        value={smoothSec}
        min={0}
        max={Math.max(1, durationSec)}
        onChange={(targetSec) => {
          anchorRef.current = { baseSec: targetSec, syncPerf: performance.now() };
          setSmoothSec(targetSec);
          onSeek(targetSec);
        }}
        styleVariant={sliderStyle}
        primaryHex={accentHex}
        secondaryHex={secondaryHex}
        animateWave={isPlaying}
        glowIntensity={livingGlowEnabled ? glowIntensity : 0}
        ariaLabel="Seek track position"
        formatTooltip={(sec) => formatDurationClock(sec)}
        lowPowerEco={lowPowerEco}
      />

      <span className="text-[11px] font-mono text-slate-400 tabular-nums w-9 text-right shrink-0">
        -{formatDurationClock(remainingSec)}
      </span>
    </div>
  );
};
