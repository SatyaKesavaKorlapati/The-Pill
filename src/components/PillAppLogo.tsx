import React from 'react';

interface PillAppLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

/**
 * Sexy modern app icon for Pill for Windows.
 * Features a sleek rounded titanium capsule, neon cyan/violet aura gradient,
 * specular glass bevel reflection, and dual-lens fluid sensor aperture.
 */
export const PillAppLogo: React.FC<PillAppLogoProps> = ({
  className = 'w-6 h-6',
  size = 28,
  glow = true,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Pill for Windows App Logo"
    >
      <defs>
        {/* Outer Glow Filter */}
        <filter id="pill-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Ambient Neon Outer Aura Gradient */}
        <linearGradient id="pill-rim-grad" x1="4" y1="12" x2="60" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00f2fe" />
          <stop offset="35%" stopColor="#38bdf8" />
          <stop offset="70%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>

        {/* Deep Titanium Body Gradient */}
        <linearGradient id="pill-body-grad" x1="32" y1="14" x2="32" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e2433" />
          <stop offset="40%" stopColor="#0f131c" />
          <stop offset="100%" stopColor="#05070b" />
        </linearGradient>

        {/* Top Specular Glass Lip */}
        <linearGradient id="pill-glass-lip" x1="14" y1="17" x2="50" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.55" />
        </linearGradient>

        {/* Lens Ring Gradient */}
        <radialGradient id="pill-lens-grad" cx="22" cy="32" r="5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="70%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
        </radialGradient>

        {/* Music Soundwave Pill Indicator Gradient */}
        <linearGradient id="pill-audio-wave" x1="34" y1="26" x2="48" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>

      {/* Ambient Neon Backing Halo */}
      {glow && (
        <rect
          x="7"
          y="17"
          width="50"
          height="30"
          rx="15"
          fill="url(#pill-rim-grad)"
          opacity="0.45"
          filter="url(#pill-glow)"
        />
      )}

      {/* Main Outer Pill Capsule Rim (Chamfered Bevel) */}
      <rect
        x="6"
        y="16"
        width="52"
        height="32"
        rx="16"
        fill="url(#pill-rim-grad)"
      />

      {/* Deep Titanium Inner Surface */}
      <rect
        x="7.5"
        y="17.5"
        width="49"
        height="29"
        rx="14.5"
        fill="url(#pill-body-grad)"
      />

      {/* Top Specular Light Catch */}
      <path
        d="M 22 19 L 42 19 C 47 19 50 20 52 22 C 48 20.5 44 20 40 20 L 24 20 C 20 20 16 20.5 12 22 C 14 20 17 19 22 19 Z"
        fill="url(#pill-glass-lip)"
        opacity="0.85"
      />

      {/* Dual Left Sensor / Iris Lens */}
      <circle cx="21" cy="32" r="4.5" fill="#0b0f19" stroke="#1e293b" strokeWidth="1" />
      <circle cx="21" cy="32" r="2.8" fill="url(#pill-lens-grad)" />
      <circle cx="20" cy="31" r="1" fill="#ffffff" opacity="0.85" />

      {/* Right Fluid Soundwave / Status Pill */}
      <rect x="31" y="27" width="2.5" height="10" rx="1.25" fill="url(#pill-audio-wave)" />
      <rect x="36" y="24" width="2.5" height="16" rx="1.25" fill="url(#pill-audio-wave)" />
      <rect x="41" y="28" width="2.5" height="8" rx="1.25" fill="url(#pill-audio-wave)" />
      <circle cx="47" cy="32" r="1.5" fill="#38bdf8" />
    </svg>
  );
};
