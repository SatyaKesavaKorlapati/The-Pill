import React from 'react';
import { IconPackStyle } from '../utils/themeAndSliders';
import {
  Wifi,
  Bluetooth,
  Plane,
  Sun,
  Moon,
  Volume2,
  Music,
  Mic,
  Coffee,
  Scissors,
  Sparkles,
  Search,
  Settings,
  MessageSquare,
  Shield,
  Layers,
  Activity,
  FileText,
  BatteryCharging,
  Subtitles,
  Radio,
  Share2,
  Cast,
  MonitorUp,
  Headphones,
  MicOff,
} from 'lucide-react';

export type ThemedIconName =
  | 'wifi'
  | 'bluetooth'
  | 'airplane'
  | 'nightlight'
  | 'sun'
  | 'moon'
  | 'dnd'
  | 'volume'
  | 'music'
  | 'mic'
  | 'awake'
  | 'snip'
  | 'sparkles'
  | 'search'
  | 'settings'
  | 'chat'
  | 'shield'
  | 'layers'
  | 'monitor'
  | 'notes'
  | 'saver'
  | 'captions'
  | 'hotspot'
  | 'nearby'
  | 'cast'
  | 'project'
  | 'spatial'
  | 'accessibility';

interface ThemedIconProps {
  name: ThemedIconName;
  packStyle?: IconPackStyle;
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * 1. CYBERPUNK HUD GLYPHS: Sharp 45° chamfers, segmented laser brackets, and cyber ticks
 */
function CyberpunkGlyph({ name, size = 16, color = 'currentColor' }: { name: ThemedIconName; size?: number; color?: string }) {
  if (name === 'wifi') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square">
        {/* Outer segmented angular chevron */}
        <path d="M3 7L12 2L21 7" strokeDasharray="3 2" />
        {/* Mid chamfered cyber bar */}
        <path d="M6 12L12 8L18 12" />
        {/* Inner chevron */}
        <path d="M9 16L12 14L15 16" />
        {/* Central diamond reticle */}
        <polygon points="12,19 14,21 12,23 10,21" fill={color} />
      </svg>
    );
  }
  if (name === 'bluetooth') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square">
        {/* Cyber-faceted angular rune */}
        <path d="M7 6.5L17 12L12 15.5V2.5L17 6.5L7 12L12 15.5V21.5L17 17.5L7 12" />
        {/* Corner HUD targeting brackets */}
        <path d="M3 4H5" />
        <path d="M19 4H21" />
        <path d="M3 20H5" />
        <path d="M19 20H21" />
      </svg>
    );
  }
  if (name === 'airplane') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square">
        <polygon points="12,2 15,10 22,13 14,14 13,22 11,20 12,14 2,13 9,10" fill="currentColor" fillOpacity="0.2" />
      </svg>
    );
  }
  if (name === 'nightlight' || name === 'sun') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <polygon points="12,4 14,9 19,7 16,12 21,14 16,16 19,21 14,19 12,24 10,19 5,21 8,16 3,14 8,12 5,7 10,9" fill="currentColor" fillOpacity="0.15" />
        <circle cx="12" cy="14" r="3" fill={color} />
      </svg>
    );
  }
  // Default Cyberpunk Box Reticle
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="4" y="4" width="16" height="16" strokeDasharray="4 2" />
      <circle cx="12" cy="12" r="3" fill={color} />
    </svg>
  );
}

/**
 * 2. RETRO 80s CRT GLYPHS: Authentic chunky 8-bit pixel-art blocks
 */
function RetroCrtPixelGlyph({ name, size = 16, color = 'currentColor' }: { name: ThemedIconName; size?: number; color?: string }) {
  if (name === 'wifi') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        {/* Top 8-bit arc */}
        <rect x="2" y="3" width="2" height="2" />
        <rect x="4" y="2" width="2" height="2" />
        <rect x="6" y="1" width="4" height="2" />
        <rect x="10" y="2" width="2" height="2" />
        <rect x="12" y="3" width="2" height="2" />
        {/* Middle 8-bit arc */}
        <rect x="4" y="7" width="2" height="2" />
        <rect x="6" y="5" width="4" height="2" />
        <rect x="10" y="7" width="2" height="2" />
        {/* Inner 8-bit arc */}
        <rect x="6" y="9" width="4" height="2" />
        {/* Base 8-bit pixel dot */}
        <rect x="7" y="13" width="2" height="2" />
      </svg>
    );
  }
  if (name === 'bluetooth') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        {/* Vertical pixel spine */}
        <rect x="7" y="1" width="2" height="14" />
        {/* Upper pixel chevron */}
        <rect x="9" y="3" width="2" height="2" />
        <rect x="11" y="5" width="2" height="2" />
        <rect x="9" y="7" width="2" height="2" />
        {/* Lower pixel chevron */}
        <rect x="9" y="9" width="2" height="2" />
        <rect x="11" y="11" width="2" height="2" />
        <rect x="9" y="13" width="2" height="2" />
        {/* Left pixel crossbars */}
        <rect x="4" y="5" width="3" height="2" />
        <rect x="4" y="11" width="3" height="2" />
      </svg>
    );
  }
  if (name === 'airplane') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        <rect x="7" y="1" width="2" height="12" />
        <rect x="1" y="6" width="14" height="2" />
        <rect x="4" y="12" width="8" height="2" />
      </svg>
    );
  }
  if (name === 'nightlight' || name === 'moon' || name === 'dnd') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        <rect x="5" y="2" width="6" height="2" />
        <rect x="3" y="4" width="3" height="2" />
        <rect x="2" y="6" width="2" height="4" />
        <rect x="3" y="10" width="3" height="2" />
        <rect x="5" y="12" width="6" height="2" />
        <rect x="8" y="4" width="3" height="2" />
        <rect x="9" y="6" width="3" height="4" />
        <rect x="8" y="10" width="3" height="2" />
      </svg>
    );
  }
  // Generic 8-bit diamond
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
      <rect x="7" y="2" width="2" height="2" />
      <rect x="5" y="4" width="6" height="2" />
      <rect x="3" y="6" width="10" height="4" />
      <rect x="5" y="10" width="6" height="2" />
      <rect x="7" y="12" width="2" height="2" />
    </svg>
  );
}

/**
 * 3. PAPER INK BRUSH GLYPHS: Japanese Sumi-e calligraphic organic strokes
 */
function PaperInkBrushGlyph({ name, size = 16, color = 'currentColor' }: { name: ThemedIconName; size?: number; color?: string }) {
  if (name === 'wifi') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round">
        {/* Organic tapered brush strokes with varying pressure */}
        <path d="M2.5 8.5C7.2 4.2 16.8 4.2 21.5 8.5" strokeWidth="2.8" />
        <path d="M5.8 12.8C9.2 9.5 14.8 9.5 18.2 12.8" strokeWidth="2.2" />
        <path d="M9.2 16.8C10.8 15.2 13.2 15.2 14.8 16.8" strokeWidth="1.8" />
        <circle cx="12" cy="20.5" r="1.6" fill={color} />
      </svg>
    );
  }
  if (name === 'bluetooth') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
        {/* Brush calligraphic rune stroke */}
        <path d="M6.5 7.5L16.5 12L11.5 15.8V2.8L16.5 6.8L6.5 12" strokeWidth="2.6" />
        <path d="M11.5 15.8V21.5L16.5 17.5L6.5 12" strokeWidth="2.2" />
        {/* Vermilion ink droplet accent */}
        <circle cx="12" cy="2.8" r="1.2" fill="#dc2626" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round">
      <path d="M4 12C8 6 16 6 20 12C16 18 8 18 4 12Z" />
      <circle cx="12" cy="12" r="2.5" fill="#dc2626" />
    </svg>
  );
}

/**
 * 4. BOTANICAL SAKURA GLYPHS: Organic floral petals, buds, and flowing leaf curves
 */
function BotanicalSakuraGlyph({ name, size = 16, color = 'currentColor' }: { name: ThemedIconName; size?: number; color?: string }) {
  if (name === 'wifi') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round">
        {/* Petal wave 1 */}
        <path d="M2 9C5 5 10 5 12 7C14 5 19 5 22 9" strokeWidth="2.2" />
        {/* Petal wave 2 */}
        <path d="M5.5 13C7.5 10.5 10 10.5 12 12C14 10.5 16.5 10.5 18.5 13" strokeWidth="2" />
        {/* Bud wave 3 */}
        <path d="M9 17C10.2 15.5 11.2 15.5 12 16.5C12.8 15.5 13.8 15.5 15 17" strokeWidth="1.8" />
        {/* Flower seed core */}
        <ellipse cx="12" cy="20.5" rx="1.8" ry="1.2" fill={color} />
      </svg>
    );
  }
  if (name === 'bluetooth') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
        {/* Curving vine stem */}
        <path d="M12 2C11 7 13 17 12 22" strokeWidth="2.4" />
        {/* Sakura Petal loops */}
        <path d="M7 7C10 8 16 9 17 7C17 10 14 12 12 12C14 12 17 14 17 17C16 15 10 16 7 17" strokeWidth="2" />
        <circle cx="17" cy="7" r="1.5" fill="#f472b6" />
        <circle cx="17" cy="17" r="1.5" fill="#f472b6" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <path d="M12 3C15 6 18 10 18 14C18 18 15 21 12 21C9 21 6 18 6 14C6 10 9 6 12 3Z" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 3V21" />
    </svg>
  );
}

/**
 * 5. MOTORSPORT GT GLYPHS: 15° forward-slanted aerodynamic racing winglets & carbon slashes
 */
function MotorsportGtGlyph({ name, size = 16, color = 'currentColor' }: { name: ThemedIconName; size?: number; color?: string }) {
  if (name === 'wifi') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        style={{ transform: 'skewX(-14deg)' }}
      >
        {/* Aerodynamic winglet chevrons */}
        <path d="M2.5 8L12 3.5L21.5 8" />
        <path d="M5.5 12.5L12 9.5L18.5 12.5" />
        <path d="M8.5 16.5L12 15L15.5 16.5" />
        <circle cx="12" cy="20.5" r="2" fill="#ef4444" />
      </svg>
    );
  }
  if (name === 'bluetooth') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="miter"
        style={{ transform: 'skewX(-14deg)' }}
      >
        <path d="M6 6L18 12L12 15.5V2.5L18 6L6 12L12 15.5V21.5L18 18L6 12" />
        <line x1="2" y1="12" x2="5" y2="12" stroke="#ef4444" strokeWidth="2.5" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" style={{ transform: 'skewX(-14deg)' }}>
      <path d="M4 18L12 6L20 18" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 6. WOODLAND ANIMALS GLYPHS: Rounded wooden branch knots, organic pebble curves
 */
function WoodlandAnimalsGlyph({ name, size = 16, color = 'currentColor' }: { name: ThemedIconName; size?: number; color?: string }) {
  if (name === 'wifi') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
        <path d="M3 9C8 4.5 16 4.5 21 9" />
        <path d="M6.5 13C9.5 10 14.5 10 17.5 13" />
        <path d="M10 17C11.2 16 12.8 16 14 17" />
        <circle cx="12" cy="20.5" r="2" fill="#10b981" />
      </svg>
    );
  }
  if (name === 'bluetooth') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
        <path d="M7 7L16 12L12 15V3L16 6L7 12L12 15V21L16 18L7 12" />
      </svg>
    );
  }
  return <Wifi width={size} height={size} strokeWidth={2.4} color={color} />;
}

/**
 * 7. CUPERTINO LIQUID SILK GLYPHS: Solid weighted SF Symbols style
 */
function CupertinoSolidGlyph({ name, size = 16, color = 'currentColor' }: { name: ThemedIconName; size?: number; color?: string }) {
  if (name === 'wifi') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        {/* Solid filled arcs */}
        <path d="M12 3C7.03 3 2.6 5.02 0 8.29L1.41 9.7C3.65 6.88 7.57 5 12 5C16.43 5 20.35 6.88 22.59 9.7L24 8.29C21.4 5.02 16.97 3 12 3ZM12 7C8.25 7 4.93 8.52 3 10.97L4.41 12.38C6.03 10.3 8.84 9 12 9C15.16 9 17.97 10.3 19.59 12.38L21 10.97C19.07 8.52 15.75 7 12 7ZM12 11C9.48 11 7.24 12.02 5.92 13.66L7.33 15.07C8.34 13.79 10.07 13 12 13C13.93 13 15.66 13.79 16.67 15.07L18.08 13.66C16.76 12.02 14.52 11 12 11ZM12 15C10.7 15 9.55 15.53 8.83 16.36L12 21.5L15.17 16.36C14.45 15.53 13.3 15 12 15Z" />
      </svg>
    );
  }
  if (name === 'bluetooth') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5L17.5 12L12 15.5V2.5L17.5 6.5L6.5 12L12 15.5V21.5L17.5 17.5L6.5 12" />
      </svg>
    );
  }
  return <Wifi width={size} height={size} strokeWidth={2.6} color={color} />;
}

/**
 * Master Themed Icon Dispatcher:
 * Automatically picks the actual hand-drawn art style corresponding to the active `IconPackStyle`!
 */
export const ThemedIcon: React.FC<ThemedIconProps> = ({
  name,
  packStyle = 'fluent_outline',
  className = '',
  size = 16,
  color,
  strokeWidth,
}) => {
  // 1. Cyberpunk Sci-Fi HUD
  if (packStyle === 'cyberpunk_hud') {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <CyberpunkGlyph name={name} size={size} color={color} />
      </span>
    );
  }

  // 2. Retro 80s 8-Bit CRT
  if (packStyle === 'retro_80s_crt') {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <RetroCrtPixelGlyph name={name} size={size} color={color} />
      </span>
    );
  }

  // 3. Paper & Fountain Ink Calligraphy
  if (packStyle === 'paper_ink_brush') {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <PaperInkBrushGlyph name={name} size={size} color={color} />
      </span>
    );
  }

  // 4. Botanical Sakura Flora
  if (packStyle === 'botanical_sakura') {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <BotanicalSakuraGlyph name={name} size={size} color={color} />
      </span>
    );
  }

  // 5. Motorsport GT Automotive Winglets
  if (packStyle === 'motorsport_gt') {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <MotorsportGtGlyph name={name} size={size} color={color} />
      </span>
    );
  }

  // 6. Woodland Cozy Animals
  if (packStyle === 'cozy_woodland') {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <WoodlandAnimalsGlyph name={name} size={size} color={color} />
      </span>
    );
  }

  // 7. Cupertino Liquid Silk / Apple Solid
  if (packStyle === 'cupertino_silk' || packStyle === 'apple_solid') {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <CupertinoSolidGlyph name={name} size={size} color={color} />
      </span>
    );
  }

  // 8. Duotone Glass (Glassmorphic layered fills)
  if (packStyle === 'duotone_glass') {
    const sw = strokeWidth ?? 1.9;
    return (
      <span className={`inline-flex items-center justify-center shrink-0 filter drop-shadow-[0_0_6px_rgba(56,189,248,0.35)] ${className}`}>
        {name === 'wifi' ? (
          <Wifi className="w-full h-full text-sky-300" strokeWidth={sw} />
        ) : name === 'bluetooth' ? (
          <Bluetooth className="w-full h-full text-indigo-300" strokeWidth={sw} />
        ) : name === 'airplane' ? (
          <Plane className="w-full h-full text-sky-300" strokeWidth={sw} />
        ) : name === 'sun' || name === 'nightlight' ? (
          <Sun className="w-full h-full text-amber-300" strokeWidth={sw} />
        ) : name === 'moon' || name === 'dnd' ? (
          <Moon className="w-full h-full text-purple-300" strokeWidth={sw} />
        ) : (
          <Wifi className="w-full h-full" strokeWidth={sw} />
        )}
      </span>
    );
  }

  // 9. Minimalist Mono Hairline
  if (packStyle === 'minimal_mono') {
    const sw = strokeWidth ?? 1.25;
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        {name === 'wifi' ? (
          <Wifi className="w-full h-full" strokeWidth={sw} />
        ) : name === 'bluetooth' ? (
          <Bluetooth className="w-full h-full" strokeWidth={sw} />
        ) : name === 'airplane' ? (
          <Plane className="w-full h-full" strokeWidth={sw} />
        ) : (
          <Wifi className="w-full h-full" strokeWidth={sw} />
        )}
      </span>
    );
  }

  // 10. Fluent Outline (Default Windows 11)
  const sw = strokeWidth ?? 1.75;
  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      {name === 'wifi' ? (
        <Wifi className="w-full h-full" strokeWidth={sw} />
      ) : name === 'bluetooth' ? (
        <Bluetooth className="w-full h-full" strokeWidth={sw} />
      ) : name === 'airplane' ? (
        <Plane className="w-full h-full" strokeWidth={sw} />
      ) : name === 'sun' || name === 'nightlight' ? (
        <Sun className="w-full h-full" strokeWidth={sw} />
      ) : name === 'moon' || name === 'dnd' ? (
        <Moon className="w-full h-full" strokeWidth={sw} />
      ) : name === 'volume' ? (
        <Volume2 className="w-full h-full" strokeWidth={sw} />
      ) : name === 'music' ? (
        <Music className="w-full h-full" strokeWidth={sw} />
      ) : name === 'mic' ? (
        <Mic className="w-full h-full" strokeWidth={sw} />
      ) : name === 'awake' ? (
        <Coffee className="w-full h-full" strokeWidth={sw} />
      ) : name === 'snip' ? (
        <Scissors className="w-full h-full" strokeWidth={sw} />
      ) : name === 'sparkles' ? (
        <Sparkles className="w-full h-full" strokeWidth={sw} />
      ) : name === 'search' ? (
        <Search className="w-full h-full" strokeWidth={sw} />
      ) : name === 'settings' ? (
        <Settings className="w-full h-full" strokeWidth={sw} />
      ) : (
        <Wifi className="w-full h-full" strokeWidth={sw} />
      )}
    </span>
  );
};
