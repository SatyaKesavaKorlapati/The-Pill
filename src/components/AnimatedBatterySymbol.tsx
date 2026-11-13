import React, { useId } from 'react';

export type BatteryOperationalMode = 'charging' | 'discharging' | 'idle_full' | 'low';

interface AnimatedBatterySymbolProps {
  percent: number;
  isCharging: boolean;
  modeOverride?: BatteryOperationalMode;
  accentHex?: string;
  size?: 'sm' | 'md' | 'lg';
  lowPowerEco?: boolean;
  className?: string;
}

export const AnimatedBatterySymbol: React.FC<AnimatedBatterySymbolProps> = ({
  percent,
  isCharging,
  modeOverride,
  accentHex = '#22d3ee',
  size = 'md',
  lowPowerEco = false,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const clamped = Math.max(2, Math.min(100, Math.round(percent)));

  const effectiveMode: BatteryOperationalMode =
    modeOverride ??
    (isCharging && clamped >= 99
      ? 'idle_full'
      : isCharging
        ? 'charging'
        : clamped <= 20
          ? 'low'
          : 'discharging');

  const dims =
    size === 'sm'
      ? { w: 24, h: 12 }
      : size === 'lg'
        ? { w: 46, h: 22 }
        : { w: 32, h: 16 };

  // Internal fill max width inside 40x20 viewBox body (body is x=1.5..35.5 => inner x=3.5..33.5, maxW=30)
  const fillWidth = Math.max(2.2, (clamped / 100) * 30);

  const primaryColor =
    effectiveMode === 'charging'
      ? '#34d399'
      : effectiveMode === 'idle_full'
        ? accentHex
        : effectiveMode === 'low'
          ? '#fb7185'
          : '#fbbf24';

  const secondaryColor =
    effectiveMode === 'charging'
      ? accentHex
      : effectiveMode === 'idle_full'
        ? '#34d399'
        : effectiveMode === 'low'
          ? '#e11d48'
          : '#f59e0b';

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}
      title={
        effectiveMode === 'charging'
          ? `Charging (${clamped}%)`
          : effectiveMode === 'idle_full'
            ? `Plugged In · Idle Full (${clamped}%)`
            : effectiveMode === 'low'
              ? `Low Battery (${clamped}%)`
              : `Discharging on Battery (${clamped}%)`
      }
    >
      <svg
        width={dims.w}
        height={dims.h}
        viewBox="0 0 42 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={`bat-grad-${uid}`} x1="3.5" y1="10" x2="33.5" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>

          <linearGradient id={`bat-shimmer-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <clipPath id={`bat-clip-${uid}`}>
            <rect x="3.5" y="3.5" width={fillWidth} height="13" rx="3.2" />
          </clipPath>
        </defs>

        {/* Subtle Ambient Glow when Charging or Low */}
        {!lowPowerEco && (effectiveMode === 'charging' || effectiveMode === 'low') && (
          <rect
            x="2"
            y="2"
            width="33"
            height="16"
            rx="5"
            fill={primaryColor}
            opacity={effectiveMode === 'low' ? 0.22 : 0.16}
          >
            <animate
              attributeName="opacity"
              values={effectiveMode === 'low' ? '0.1;0.34;0.1' : '0.1;0.24;0.1'}
              dur={effectiveMode === 'low' ? '1.1s' : '2.2s'}
              repeatCount="indefinite"
            />
          </rect>
        )}

        {/* Outer Titanium / Glass Battery Shell */}
        <rect
          x="1.5"
          y="1.5"
          width="34"
          height="17"
          rx="5"
          fill="rgba(15,23,42,0.72)"
          stroke="rgba(255,255,255,0.42)"
          strokeWidth="1.4"
        />

        {/* Positive Terminal Cap */}
        <path
          d="M37.2 7.2C38.5 7.2 39.5 8.1 39.5 9.3V10.7C39.5 11.9 38.5 12.8 37.2 12.8V7.2Z"
          fill={effectiveMode === 'charging' ? primaryColor : 'rgba(255,255,255,0.45)'}
        />

        {/* Inner Cell Track Background */}
        <rect x="3.5" y="3.5" width="30" height="13" rx="3.2" fill="rgba(255,255,255,0.08)" />

        {/* Dynamic Liquid Level Fill */}
        <rect
          x="3.5"
          y="3.5"
          width={fillWidth}
          height="13"
          rx="3.2"
          fill={`url(#bat-grad-${uid})`}
        />

        {/* Top Specular Glass Reflection on Fill */}
        <g clipPath={`url(#bat-clip-${uid})`}>
          <rect x="3.5" y="3.5" width="30" height="4.5" rx="2" fill="#ffffff" opacity="0.22" />

          {/* CASE 1: CHARGING — Travelling Liquid Current Wave */}
          {!lowPowerEco && effectiveMode === 'charging' && (
            <rect x="-14" y="3.5" width="14" height="13" fill={`url(#bat-shimmer-${uid})`}>
              <animate
                attributeName="x"
                from="-12"
                to="35"
                dur="1.55s"
                repeatCount="indefinite"
              />
            </rect>
          )}

          {/* CASE 2: DISCHARGING — Gentle Energy Micro-Pulse Toward Load */}
          {!lowPowerEco && effectiveMode === 'discharging' && (
            <circle cx={Math.max(6, fillWidth)} cy="10" r="3.5" fill="#ffffff" opacity="0.2">
              <animate
                attributeName="cx"
                from={String(Math.min(32, fillWidth + 2))}
                to="5"
                dur="2.6s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;0.28;0"
                dur="2.6s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </g>

        {/* Center Status Glyph Per Operational State */}
        {effectiveMode === 'charging' && (
          <path
            d="M20.2 4.2L15.4 10.4H19.0L17.6 15.8L22.8 9.5H19.1L20.2 4.2Z"
            fill="#ffffff"
            stroke="#064e3b"
            strokeWidth="0.6"
            strokeLinejoin="round"
          >
            {!lowPowerEco && (
              <animate
                attributeName="opacity"
                values="0.82;1;0.82"
                dur="1.4s"
                repeatCount="indefinite"
              />
            )}
          </path>
        )}

        {effectiveMode === 'idle_full' && (
          <path
            d="M15.2 10.2L17.8 12.7L22.8 7.5"
            stroke="#ffffff"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {effectiveMode === 'low' && (
          <g>
            <line
              x1="18.5"
              y1="6.2"
              x2="18.5"
              y2="11.0"
              stroke="#ffffff"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
            <circle cx="18.5" cy="13.6" r="1.05" fill="#ffffff" />
          </g>
        )}
      </svg>
    </span>
  );
};
