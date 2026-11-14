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
  BatteryCharging,
  Subtitles,
  Radio,
  Share2,
  Cast,
  MonitorUp,
  Accessibility,
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

// ---------------------------------------------------------------------------
// 1. CYBERPUNK HUD GLYPHS (Sci-Fi Angular Chamfers, Segmented Lasers, Reticles)
// ---------------------------------------------------------------------------
function CyberpunkGlyph({ name, size = 16, color = 'currentColor' }: { name: ThemedIconName; size?: number; color?: string }) {
  if (name === 'wifi') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square">
        <path d="M3 7L12 2L21 7" strokeDasharray="3 2" />
        <path d="M6 12L12 8L18 12" />
        <path d="M9 16L12 14L15 16" />
        <polygon points="12,19 14,21 12,23 10,21" fill={color} />
      </svg>
    );
  }
  if (name === 'bluetooth') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="square">
        <path d="M7 6.5L17 12L12 15.5V2.5L17 6.5L7 12L12 15.5V21.5L17 17.5L7 12" />
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
  if (name === 'accessibility') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square">
        <circle cx="12" cy="5" r="2.5" fill={color} />
        <path d="M4 9H20" strokeWidth="2.4" />
        <line x1="12" y1="9" x2="12" y2="15" strokeWidth="2.4" />
        <path d="M8 21L12 15L16 21" strokeWidth="2.4" />
      </svg>
    );
  }
  if (name === 'saver') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square">
        <rect x="3" y="6" width="16" height="12" strokeWidth="2" />
        <line x1="21" y1="10" x2="21" y2="14" strokeWidth="2" />
        <polygon points="12,7 8,13 11,13 10,17 14,11 11,11" fill={color} />
      </svg>
    );
  }
  if (name === 'captions') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square">
        <rect x="3" y="5" width="18" height="14" rx="1" strokeWidth="2" />
        <line x1="6" y1="10" x2="11" y2="10" strokeWidth="2.5" stroke={color} />
        <line x1="13" y1="10" x2="18" y2="10" strokeWidth="2.5" />
        <line x1="6" y1="14" x2="15" y2="14" strokeWidth="2.5" stroke={color} />
      </svg>
    );
  }
  if (name === 'hotspot') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square">
        <polygon points="12,3 15,21 12,19 9,21" fill="currentColor" fillOpacity="0.2" />
        <path d="M4.5 10C2 12 2 15 4.5 17" strokeDasharray="2 2" />
        <path d="M19.5 10C22 12 22 15 19.5 17" strokeDasharray="2 2" />
        <circle cx="12" cy="8" r="2" fill={color} />
      </svg>
    );
  }
  if (name === 'nearby') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square">
        <circle cx="18" cy="6" r="3" fill={color} />
        <circle cx="6" cy="12" r="3" fill={color} />
        <circle cx="18" cy="18" r="3" fill={color} />
        <line x1="8.5" y1="13.5" x2="15.5" y2="16.5" strokeWidth="2" />
        <line x1="8.5" y1="10.5" x2="15.5" y2="7.5" strokeWidth="2" />
      </svg>
    );
  }
  if (name === 'cast') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square">
        <rect x="2" y="4" width="20" height="15" strokeWidth="2" />
        <path d="M2 15A4 4 0 0 1 6 19" strokeWidth="2.5" />
        <path d="M2 11A8 8 0 0 1 10 19" strokeWidth="2.5" strokeDasharray="2 2" />
        <circle cx="3" cy="18" r="1.5" fill={color} />
      </svg>
    );
  }
  if (name === 'project') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square">
        <rect x="3" y="4" width="13" height="10" strokeWidth="2" />
        <rect x="8" y="9" width="13" height="10" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
        <line x1="12" y1="19" x2="12" y2="22" strokeWidth="2" />
      </svg>
    );
  }
  if (name === 'sun' || name === 'nightlight') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <polygon points="12,4 14,9 19,7 16,12 21,14 16,16 19,21 14,19 12,24 10,19 5,21 8,16 3,14 8,12 5,7 10,9" fill="currentColor" fillOpacity="0.2" />
        <circle cx="12" cy="14" r="3" fill={color} />
      </svg>
    );
  }
  if (name === 'moon' || name === 'dnd') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square">
        <path d="M19 12.5C18.5 17 14.5 20.5 10 20.5C5.5 20.5 2 17 2 12.5C2 8 5.5 4.5 10 4.5C10.5 4.5 11 4.6 11.5 4.7C10 6.5 9 9 9 12C9 15 10.5 17.5 12.5 19C15.5 19 18 16.5 19 12.5Z" fill="currentColor" fillOpacity="0.25" />
        <path d="M17 3L21 7" strokeDasharray="2 2" />
      </svg>
    );
  }
  if (name === 'mic') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square">
        <rect x="9" y="3" width="6" height="11" rx="1" fill="currentColor" fillOpacity="0.2" />
        <path d="M5 11C5 15 8 18 12 18C16 18 19 15 19 11" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="8" y1="22" x2="16" y2="22" />
        <circle cx="12" cy="8" r="1.5" fill={color} />
      </svg>
    );
  }
  if (name === 'volume') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square">
        <polygon points="11,4 6,8 3,8 3,16 6,16 11,20" fill="currentColor" fillOpacity="0.2" />
        <path d="M15 9L18 12L15 15" />
        <path d="M18 6L22 12L18 18" strokeDasharray="3 2" />
      </svg>
    );
  }
  if (name === 'settings') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square">
        <polygon points="12,2 15,4 19,3 20,7 23,9 22,13 23,17 19,18 18,22 14,21 12,23 9,21 6,22 4,18 1,17 2,13 1,9 5,7 4,3 8,4" fill="currentColor" fillOpacity="0.15" />
        <circle cx="12" cy="12" r="3.5" fill={color} />
      </svg>
    );
  }
  if (name === 'snip') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square">
        <path d="M4 8V4H8" />
        <path d="M20 8V4H16" />
        <path d="M4 16V20H8" />
        <path d="M20 16V20H16" />
        <line x1="12" y1="7" x2="12" y2="17" strokeDasharray="2 2" />
        <line x1="7" y1="12" x2="17" y2="12" strokeDasharray="2 2" />
      </svg>
    );
  }
  if (name === 'awake') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square">
        <rect x="4" y="6" width="16" height="12" rx="1" fill="currentColor" fillOpacity="0.15" />
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
        <polygon points="13,8 9,13 12,13 10,16 15,11 12,11" fill={color} />
      </svg>
    );
  }
  if (name === 'search') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square">
        <polygon points="11,3 17,6 19,12 16,18 10,19 4,15 3,9 7,4" fill="currentColor" fillOpacity="0.15" />
        <line x1="16.5" y1="16.5" x2="22" y2="22" strokeWidth="2.5" />
        <circle cx="11" cy="11" r="2" fill={color} />
      </svg>
    );
  }
  if (name === 'sparkles') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <polygon points="12,2 14,9 21,12 14,15 12,22 10,15 3,12 10,9" fill="currentColor" fillOpacity="0.25" />
        <polygon points="19,3 20,6 23,7 20,8 19,11 18,8 15,7 18,6" fill={color} />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square">
      <rect x="4" y="4" width="16" height="16" strokeDasharray="4 2" />
      <circle cx="12" cy="12" r="3" fill={color} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 2. RETRO 80s CRT PIXEL GLYPHS (Chunky 8-Bit Arcade Blocks)
// ---------------------------------------------------------------------------
function RetroCrtPixelGlyph({ name, size = 16, color = 'currentColor' }: { name: ThemedIconName; size?: number; color?: string }) {
  if (name === 'wifi') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        <rect x="2" y="3" width="2" height="2" />
        <rect x="4" y="2" width="2" height="2" />
        <rect x="6" y="1" width="4" height="2" />
        <rect x="10" y="2" width="2" height="2" />
        <rect x="12" y="3" width="2" height="2" />
        <rect x="4" y="7" width="2" height="2" />
        <rect x="6" y="5" width="4" height="2" />
        <rect x="10" y="7" width="2" height="2" />
        <rect x="6" y="9" width="4" height="2" />
        <rect x="7" y="13" width="2" height="2" />
      </svg>
    );
  }
  if (name === 'bluetooth') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        <rect x="7" y="1" width="2" height="14" />
        <rect x="9" y="3" width="2" height="2" />
        <rect x="11" y="5" width="2" height="2" />
        <rect x="9" y="7" width="2" height="2" />
        <rect x="9" y="9" width="2" height="2" />
        <rect x="11" y="11" width="2" height="2" />
        <rect x="9" y="13" width="2" height="2" />
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
  if (name === 'accessibility') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        <rect x="7" y="1" width="2" height="2" />
        <rect x="3" y="5" width="10" height="2" />
        <rect x="7" y="7" width="2" height="4" />
        <rect x="5" y="11" width="2" height="4" />
        <rect x="9" y="11" width="2" height="4" />
      </svg>
    );
  }
  if (name === 'saver') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        <rect x="2" y="4" width="11" height="8" />
        <rect x="13" y="6" width="2" height="4" />
        <rect x="7" y="6" width="2" height="4" fill="#000" fillOpacity="0.4" />
      </svg>
    );
  }
  if (name === 'captions') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        <rect x="1" y="3" width="14" height="10" />
        <rect x="3" y="6" width="4" height="2" fill="#000" fillOpacity="0.4" />
        <rect x="8" y="6" width="5" height="2" fill="#000" fillOpacity="0.4" />
        <rect x="3" y="9" width="7" height="2" fill="#000" fillOpacity="0.4" />
      </svg>
    );
  }
  if (name === 'hotspot') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        <rect x="7" y="4" width="2" height="10" />
        <rect x="5" y="2" width="6" height="2" />
        <rect x="3" y="6" width="2" height="4" />
        <rect x="11" y="6" width="2" height="4" />
      </svg>
    );
  }
  if (name === 'nearby') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        <rect x="11" y="2" width="3" height="3" />
        <rect x="2" y="6" width="3" height="3" />
        <rect x="11" y="11" width="3" height="3" />
        <rect x="5" y="5" width="6" height="2" />
        <rect x="5" y="9" width="6" height="2" />
      </svg>
    );
  }
  if (name === 'cast') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        <rect x="1" y="2" width="14" height="11" />
        <rect x="3" y="4" width="10" height="7" fill="#000" fillOpacity="0.4" />
        <rect x="2" y="11" width="3" height="2" fill={color} />
      </svg>
    );
  }
  if (name === 'project') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        <rect x="1" y="2" width="9" height="7" />
        <rect x="6" y="6" width="9" height="7" fill="currentColor" fillOpacity="0.5" />
      </svg>
    );
  }
  if (name === 'sun' || name === 'nightlight') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        <rect x="7" y="1" width="2" height="2" />
        <rect x="7" y="13" width="2" height="2" />
        <rect x="1" y="7" width="2" height="2" />
        <rect x="13" y="7" width="2" height="2" />
        <rect x="5" y="5" width="6" height="6" />
      </svg>
    );
  }
  if (name === 'moon' || name === 'dnd') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        <rect x="5" y="2" width="6" height="2" />
        <rect x="3" y="4" width="3" height="2" />
        <rect x="2" y="6" width="2" height="4" />
        <rect x="3" y="10" width="3" height="2" />
        <rect x="5" y="12" width="6" height="2" />
      </svg>
    );
  }
  if (name === 'mic') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        <rect x="6" y="2" width="4" height="7" />
        <rect x="3" y="7" width="2" height="3" />
        <rect x="11" y="7" width="2" height="3" />
        <rect x="5" y="10" width="6" height="2" />
        <rect x="7" y="12" width="2" height="3" />
      </svg>
    );
  }
  if (name === 'volume') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        <rect x="2" y="5" width="3" height="6" />
        <rect x="5" y="4" width="2" height="8" />
        <rect x="7" y="2" width="2" height="12" />
        <rect x="11" y="5" width="2" height="2" />
        <rect x="12" y="7" width="2" height="2" />
        <rect x="11" y="9" width="2" height="2" />
      </svg>
    );
  }
  if (name === 'settings') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        <rect x="6" y="1" width="4" height="2" />
        <rect x="6" y="13" width="4" height="2" />
        <rect x="1" y="6" width="2" height="4" />
        <rect x="13" y="6" width="2" height="4" />
        <rect x="4" y="4" width="8" height="8" />
        <rect x="6" y="6" width="4" height="4" fill="#000" fillOpacity="0.4" />
      </svg>
    );
  }
  if (name === 'snip') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        <rect x="2" y="2" width="3" height="3" />
        <rect x="11" y="2" width="3" height="3" />
        <rect x="6" y="6" width="4" height="4" />
        <rect x="3" y="11" width="3" height="3" />
        <rect x="10" y="11" width="3" height="3" />
      </svg>
    );
  }
  if (name === 'awake') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        <rect x="3" y="6" width="8" height="8" />
        <rect x="11" y="8" width="3" height="4" />
        <rect x="5" y="2" width="2" height="3" />
        <rect x="8" y="1" width="2" height="3" />
      </svg>
    );
  }
  if (name === 'search') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        <rect x="4" y="2" width="6" height="2" />
        <rect x="2" y="4" width="2" height="6" />
        <rect x="10" y="4" width="2" height="6" />
        <rect x="4" y="10" width="6" height="2" />
        <rect x="12" y="12" width="3" height="3" />
      </svg>
    );
  }
  if (name === 'sparkles') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill={color} shapeRendering="crispEdges">
        <rect x="7" y="1" width="2" height="4" />
        <rect x="7" y="9" width="2" height="4" />
        <rect x="3" y="5" width="4" height="2" />
        <rect x="9" y="5" width="4" height="2" />
        <rect x="6" y="4" width="4" height="4" />
      </svg>
    );
  }
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

// ---------------------------------------------------------------------------
// 3. MOTORSPORT GT GLYPHS (15° Forward Slanted Aerodynamic Winglets & Slashes)
// ---------------------------------------------------------------------------
function MotorsportGtGlyph({ name, size = 16, color = 'currentColor' }: { name: ThemedIconName; size?: number; color?: string }) {
  const tiltStyle = { transform: 'skewX(-14deg)' };
  if (name === 'wifi') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" style={tiltStyle}>
        <path d="M2.5 8L12 3.5L21.5 8" />
        <path d="M5.5 12.5L12 9.5L18.5 12.5" />
        <path d="M8.5 16.5L12 15L15.5 16.5" />
        <circle cx="12" cy="20.5" r="2" fill="#ef4444" />
      </svg>
    );
  }
  if (name === 'bluetooth') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="miter" style={tiltStyle}>
        <path d="M6 6L18 12L12 15.5V2.5L18 6L6 12L12 15.5V21.5L18 18L6 12" />
        <line x1="2" y1="12" x2="5" y2="12" stroke="#ef4444" strokeWidth="2.5" />
      </svg>
    );
  }
  if (name === 'airplane') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" style={tiltStyle}>
        <polygon points="12,2 15,10 22,13 14,14 13,22 11,20 12,14 2,13 9,10" fill="#ef4444" fillOpacity="0.2" />
      </svg>
    );
  }
  if (name === 'accessibility') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" style={tiltStyle}>
        <circle cx="12" cy="5" r="2.5" fill="#ef4444" />
        <line x1="4" y1="10" x2="20" y2="10" strokeWidth="2.5" />
        <line x1="12" y1="10" x2="12" y2="16" strokeWidth="2.5" />
        <path d="M8 21L12 16L16 21" strokeWidth="2.5" />
      </svg>
    );
  }
  if (name === 'saver') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" style={tiltStyle}>
        <rect x="4" y="6" width="15" height="12" rx="1" strokeWidth="2.2" />
        <line x1="21" y1="10" x2="21" y2="14" strokeWidth="2.5" />
        <polygon points="12,8 8,13 12,13 11,16 15,11 12,11" fill="#ef4444" />
      </svg>
    );
  }
  if (name === 'captions') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" style={tiltStyle}>
        <rect x="3" y="6" width="18" height="12" strokeWidth="2.2" />
        <line x1="6" y1="10" x2="11" y2="10" strokeWidth="2.5" stroke="#ef4444" />
        <line x1="6" y1="14" x2="16" y2="14" strokeWidth="2.5" />
      </svg>
    );
  }
  if (name === 'hotspot') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" style={tiltStyle}>
        <polygon points="12,4 14,20 12,18 10,20" fill="#ef4444" />
        <path d="M5 10A9 9 0 0 1 19 10" strokeWidth="2.2" />
        <path d="M8 13A5 5 0 0 1 16 13" strokeWidth="2.2" />
      </svg>
    );
  }
  if (name === 'nearby') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" style={tiltStyle}>
        <circle cx="18" cy="6" r="3" fill="#ef4444" />
        <circle cx="6" cy="12" r="3" fill="#ef4444" />
        <circle cx="18" cy="18" r="3" fill="#ef4444" />
        <line x1="8.5" y1="13.5" x2="15.5" y2="16.5" strokeWidth="2.4" />
        <line x1="8.5" y1="10.5" x2="15.5" y2="7.5" strokeWidth="2.4" />
      </svg>
    );
  }
  if (name === 'cast') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" style={tiltStyle}>
        <rect x="3" y="5" width="18" height="14" rx="1" strokeWidth="2.2" />
        <path d="M3 15A4 4 0 0 1 7 19" strokeWidth="2.5" stroke="#ef4444" />
        <circle cx="4" cy="18" r="1.5" fill="#ef4444" />
      </svg>
    );
  }
  if (name === 'project') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" style={tiltStyle}>
        <rect x="3" y="4" width="12" height="10" strokeWidth="2.2" />
        <rect x="9" y="10" width="12" height="10" strokeWidth="2.2" fill="#ef4444" fillOpacity="0.2" />
      </svg>
    );
  }
  if (name === 'sun' || name === 'nightlight') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" style={tiltStyle}>
        <circle cx="12" cy="12" r="5" strokeWidth="2.6" fill="#ef4444" fillOpacity="0.25" />
        <line x1="12" y1="2" x2="12" y2="5" stroke="#ef4444" strokeWidth="2.6" />
        <line x1="12" y1="19" x2="12" y2="22" strokeWidth="2.6" />
        <line x1="2" y1="12" x2="5" y2="12" strokeWidth="2.6" />
        <line x1="19" y1="12" x2="22" y2="12" strokeWidth="2.6" />
      </svg>
    );
  }
  if (name === 'mic') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" style={tiltStyle}>
        <rect x="8" y="3" width="8" height="11" rx="4" fill="currentColor" fillOpacity="0.2" />
        <path d="M4 11C4 16 20 16 20 11" />
        <line x1="12" y1="17" x2="12" y2="21" stroke="#ef4444" strokeWidth="2.8" />
      </svg>
    );
  }
  if (name === 'volume') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" style={tiltStyle}>
        <polygon points="12,4 6,8 2,8 2,16 6,16 12,20" fill="currentColor" fillOpacity="0.2" />
        <line x1="16" y1="9" x2="19" y2="9" stroke="#ef4444" strokeWidth="2.5" />
        <line x1="16" y1="12" x2="21" y2="12" strokeWidth="2.5" />
        <line x1="16" y1="15" x2="18" y2="15" strokeWidth="2.5" />
      </svg>
    );
  }
  if (name === 'settings') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" style={tiltStyle}>
        <circle cx="12" cy="12" r="8" strokeWidth="2.5" />
        <circle cx="12" cy="12" r="3" fill="#ef4444" />
        <line x1="12" y1="4" x2="12" y2="9" strokeWidth="2" />
        <line x1="12" y1="15" x2="12" y2="20" strokeWidth="2" />
      </svg>
    );
  }
  if (name === 'snip') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" style={tiltStyle}>
        <line x1="4" y1="4" x2="20" y2="20" strokeWidth="2.6" />
        <line x1="4" y1="20" x2="20" y2="4" strokeWidth="2.6" />
        <circle cx="12" cy="12" r="2.5" fill="#ef4444" />
      </svg>
    );
  }
  if (name === 'awake') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" style={tiltStyle}>
        <polygon points="14,2 6,13 12,13 10,22 18,11 12,11" fill="#ef4444" />
      </svg>
    );
  }
  if (name === 'search') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" style={tiltStyle}>
        <circle cx="11" cy="11" r="7" strokeWidth="2.6" />
        <line x1="16" y1="16" x2="22" y2="22" stroke="#ef4444" strokeWidth="3" />
      </svg>
    );
  }
  if (name === 'sparkles') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" style={tiltStyle}>
        <polygon points="12,2 14,9 21,12 14,15 12,22 10,15 3,12 10,9" fill="#ef4444" fillOpacity="0.3" />
        <circle cx="12" cy="12" r="1.8" fill="#ef4444" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" style={tiltStyle}>
      <path d="M4 18L12 6L20 18" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 4. PAPER INK BRUSH GLYPHS (Japanese Sumi-e Calligraphy & Vermilion Seals)
// ---------------------------------------------------------------------------
function PaperInkBrushGlyph({ name, size = 16, color = 'currentColor' }: { name: ThemedIconName; size?: number; color?: string }) {
  if (name === 'wifi') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round">
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
        <path d="M6.5 7.5L16.5 12L11.5 15.8V2.8L16.5 6.8L6.5 12" strokeWidth="2.6" />
        <path d="M11.5 15.8V21.5L16.5 17.5L6.5 12" strokeWidth="2.2" />
        <circle cx="12" cy="2.8" r="1.4" fill="#dc2626" />
      </svg>
    );
  }
  if (name === 'sun' || name === 'nightlight') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round">
        <path d="M12 3C7 3 3 7 3 12C3 17 7 21 12 21C17 21 21 17 21 12" strokeWidth="2.8" />
        <circle cx="12" cy="12" r="3.5" fill="#dc2626" />
      </svg>
    );
  }
  if (name === 'mic') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round">
        <path d="M9 4C9 2.5 15 2.5 15 4V12C15 14 9 14 9 12Z" strokeWidth="2.5" fill="currentColor" fillOpacity="0.15" />
        <path d="M5 11C5 16 19 16 19 11" strokeWidth="2.2" />
        <path d="M12 17V21" strokeWidth="2.5" />
        <circle cx="12" cy="8" r="1.2" fill="#dc2626" />
      </svg>
    );
  }
  if (name === 'volume') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round">
        <path d="M11 5L6 9H3V15H6L11 19V5Z" strokeWidth="2.5" fill="currentColor" fillOpacity="0.15" />
        <path d="M15 9C17 10.5 17 13.5 15 15" strokeWidth="2.2" />
        <path d="M18 6C21 8.5 21 15.5 18 18" strokeWidth="2.2" />
        <circle cx="8" cy="12" r="1.3" fill="#dc2626" />
      </svg>
    );
  }
  if (name === 'settings') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round">
        <circle cx="12" cy="12" r="7" strokeWidth="2.4" />
        <circle cx="12" cy="12" r="2.5" fill="#dc2626" />
        <path d="M12 2V5M12 19V22M2 12H5M19 12H22" strokeWidth="2.6" />
      </svg>
    );
  }
  if (name === 'snip') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round">
        <circle cx="6" cy="6" r="3" strokeWidth="2" />
        <circle cx="6" cy="18" r="3" strokeWidth="2" />
        <path d="M8.5 8L19 18" strokeWidth="2.4" />
        <path d="M8.5 16L19 6" strokeWidth="2.4" />
        <circle cx="12" cy="12" r="1.5" fill="#dc2626" />
      </svg>
    );
  }
  if (name === 'awake') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round">
        <path d="M4 10C4 16 8 19 15 19C18 19 19 16 19 14" strokeWidth="2.6" />
        <path d="M8 4C9 6 8 8 9 9" strokeWidth="2" />
        <circle cx="11.5" cy="14" r="1.6" fill="#dc2626" />
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

// ---------------------------------------------------------------------------
// 5. BOTANICAL SAKURA GLYPHS (Cherry Blossoms & Floral Curves)
// ---------------------------------------------------------------------------
function BotanicalSakuraGlyph({ name, size = 16, color = 'currentColor' }: { name: ThemedIconName; size?: number; color?: string }) {
  if (name === 'wifi') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round">
        <path d="M2 9C5 5 10 5 12 7C14 5 19 5 22 9" strokeWidth="2.2" />
        <path d="M5.5 13C7.5 10.5 10 10.5 12 12C14 10.5 16.5 10.5 18.5 13" strokeWidth="2" />
        <path d="M9 17C10.2 15.5 11.2 15.5 12 16.5C12.8 15.5 13.8 15.5 15 17" strokeWidth="1.8" />
        <ellipse cx="12" cy="20.5" rx="1.8" ry="1.2" fill="#f472b6" />
      </svg>
    );
  }
  if (name === 'bluetooth') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C11 7 13 17 12 22" strokeWidth="2.4" />
        <path d="M7 7C10 8 16 9 17 7C17 10 14 12 12 12C14 12 17 14 17 17C16 15 10 16 7 17" strokeWidth="2" />
        <circle cx="17" cy="7" r="1.5" fill="#f472b6" />
        <circle cx="17" cy="17" r="1.5" fill="#f472b6" />
      </svg>
    );
  }
  if (name === 'sun' || name === 'nightlight') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round">
        <circle cx="12" cy="12" r="3" fill="#f472b6" />
        <path d="M12 3C10 7 14 7 12 3Z" fill="#f472b6" fillOpacity="0.4" />
        <path d="M21 12C17 10 17 14 21 12Z" fill="#f472b6" fillOpacity="0.4" />
        <path d="M12 21C14 17 10 17 12 21Z" fill="#f472b6" fillOpacity="0.4" />
        <path d="M3 12C7 14 7 10 3 12Z" fill="#f472b6" fillOpacity="0.4" />
      </svg>
    );
  }
  if (name === 'volume') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round">
        <path d="M11 6C8 9 5 9 3 9V15C5 15 8 15 11 18V6Z" strokeWidth="2.2" fill="#f472b6" fillOpacity="0.2" />
        <path d="M15 9C17 11 17 13 15 15" strokeWidth="2" />
        <path d="M18 6C22 9.5 22 14.5 18 18" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <path d="M12 3C15 6 18 10 18 14C18 18 15 21 12 21C9 21 6 18 6 14C6 10 9 6 12 3Z" fill="#f472b6" fillOpacity="0.3" />
      <path d="M12 3V21" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 6. WOODLAND COZY ANIMALS GLYPHS (Organic Forest Pebble & Branch Contours)
// ---------------------------------------------------------------------------
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
        <circle cx="12" cy="12" r="1.5" fill="#10b981" />
      </svg>
    );
  }
  if (name === 'sun' || name === 'nightlight') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round">
        <circle cx="12" cy="12" r="5" fill="#10b981" fillOpacity="0.25" />
        <circle cx="12" cy="12" r="2" fill="#10b981" />
        <path d="M12 3V5M12 19V21M3 12H5M19 12H21" stroke="#10b981" strokeWidth="2.6" />
      </svg>
    );
  }
  if (name === 'volume') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round">
        <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="currentColor" fillOpacity="0.2" />
        <path d="M15 9C17 11 17 13 15 15" stroke="#10b981" strokeWidth="2.4" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round">
      <circle cx="12" cy="12" r="7" strokeWidth="2.5" />
      <circle cx="12" cy="12" r="3" fill="#10b981" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 7. CUPERTINO SOLID / LIQUID SILK GLYPHS (Apple SF Symbols Heavy Solid Geometry)
// ---------------------------------------------------------------------------
function CupertinoSolidGlyph({ name, size = 16, color = 'currentColor' }: { name: ThemedIconName; size?: number; color?: string }) {
  if (name === 'wifi') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
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
  if (name === 'airplane') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" />
      </svg>
    );
  }
  if (name === 'accessibility') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <circle cx="12" cy="4" r="2.5" />
        <path d="M5 8C4.4 8 4 8.4 4 9C4 9.6 4.4 10 5 10H19C19.6 10 20 9.6 20 9C20 8.4 19.6 8 19 8H5ZM11 11V15L7.5 20.5C7.2 21 7.3 21.6 7.8 21.9C8.3 22.2 8.9 22.1 9.2 21.6L12 17.2L14.8 21.6C15.1 22.1 15.7 22.2 16.2 21.9C16.7 21.6 16.8 21 16.5 20.5L13 11H11Z" />
      </svg>
    );
  }
  if (name === 'saver') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M17 5H3C1.9 5 1 5.9 1 7V17C1 18.1 1.9 19 3 19H17C18.1 19 19 18.1 19 17V14H21C21.6 14 22 13.6 22 13V11C22 10.4 21.6 10 21 10H19V7C19 5.9 18.1 5 17 5ZM12 8L7 13H11V16L15 11H11L12 8Z" />
      </svg>
    );
  }
  if (name === 'captions') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM6 9H11V11H6V9ZM6 13H15V15H6V13ZM18 15H17V13H18V15ZM18 11H13V9H18V11Z" />
      </svg>
    );
  }
  if (name === 'hotspot') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 2C6.5 2 2 6.5 2 12C2 14.8 3.1 17.3 5 19.1L6.4 17.7C4.9 16.2 4 14.2 4 12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12C20 14.2 19.1 16.2 17.6 17.7L19 19.1C20.9 17.3 22 14.8 22 12C22 6.5 17.5 2 12 2ZM12 6C8.7 6 6 8.7 6 12C6 13.7 6.7 15.2 7.8 16.3L9.2 14.9C8.5 14.2 8 13.1 8 12C8 9.8 9.8 8 12 8C14.2 8 16 9.8 16 12C16 13.1 15.5 14.2 14.8 14.9L16.2 16.3C17.3 15.2 18 13.7 18 12C18 8.7 15.3 6 12 6ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" />
      </svg>
    );
  }
  if (name === 'nearby') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M18 16.1C17.2 16.1 16.6 16.4 16.1 16.9L8.9 12.7C9 12.5 9 12.2 9 12C9 11.8 9 11.5 8.9 11.3L16 7.1C16.5 7.7 17.2 8 18 8C19.7 8 21 6.7 21 5C21 3.3 19.7 2 18 2C16.3 2 15 3.3 15 5C15 5.2 15 5.5 15.1 5.7L7.9 9.9C7.4 9.4 6.7 9 6 9C4.3 9 3 10.3 3 12C3 13.7 4.3 15 6 15C6.7 15 7.4 14.6 7.9 14.1L15.1 18.3C15 18.5 15 18.8 15 19C15 20.7 16.3 22 18 22C19.7 22 21 20.7 21 19C21 17.3 19.7 16.1 18 16.1Z" />
      </svg>
    );
  }
  if (name === 'cast') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M21 3H3C1.9 3 1 3.9 1 5V8H3V5H21V19H14V21H21C22.1 21 23 20.1 23 19V5C23 3.9 22.1 3 21 3ZM1 18V21H4C4 19.3 2.7 18 1 18ZM1 14V16C3.8 16 6 18.2 6 21H8C8 17.1 4.9 14 1 14ZM1 10V12C6 12 10 16 10 21H12C12 14.9 7.1 10 1 10Z" />
      </svg>
    );
  }
  if (name === 'project') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M20 3H4C2.9 3 2 3.9 2 5V15C2 16.1 2.9 17 4 17H11V19H8V21H16V19H13V17H20C21.1 17 22 16.1 22 15V5C22 3.9 21.1 3 20 3ZM20 15H4V5H20V15Z" />
      </svg>
    );
  }
  if (name === 'sun' || name === 'nightlight') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1V4M12 20V23M1 12H4M20 12H23M4.22 4.22L6.34 6.34M17.66 17.66L19.78 19.78M4.22 19.78L6.34 17.66M17.66 6.34L19.78 4.22" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'volume') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <polygon points="11,4 6,8 2,8 2,16 6,16 11,20" />
        <path d="M15 8C16.5 9.5 16.5 14.5 15 16" stroke={color} strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <path d="M18 5C21 8.5 21 15.5 18 19" stroke={color} strokeWidth="2.8" strokeLinecap="round" fill="none" />
      </svg>
    );
  }
  return <Wifi width={size} height={size} strokeWidth={2.6} color={color} />;
}

// ---------------------------------------------------------------------------
// MASTER THEMED ICON DISPATCHER
// ---------------------------------------------------------------------------
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

  // 3. Motorsport GT Automotive Winglets (15° forward tilt)
  if (packStyle === 'motorsport_gt') {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <MotorsportGtGlyph name={name} size={size} color={color} />
      </span>
    );
  }

  // 4. Paper & Fountain Ink Calligraphy
  if (packStyle === 'paper_ink_brush') {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <PaperInkBrushGlyph name={name} size={size} color={color} />
      </span>
    );
  }

  // 5. Botanical Sakura Flora
  if (packStyle === 'botanical_sakura') {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <BotanicalSakuraGlyph name={name} size={size} color={color} />
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

  // 8. Duotone Glass (Glassmorphic layered fills with cyan frosted glow)
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
        ) : name === 'accessibility' ? (
          <Accessibility className="w-full h-full text-sky-300" strokeWidth={sw} />
        ) : name === 'saver' ? (
          <BatteryCharging className="w-full h-full text-emerald-300" strokeWidth={sw} />
        ) : name === 'captions' ? (
          <Subtitles className="w-full h-full text-sky-300" strokeWidth={sw} />
        ) : name === 'sun' || name === 'nightlight' ? (
          <Sun className="w-full h-full text-amber-300" strokeWidth={sw} />
        ) : name === 'moon' || name === 'dnd' ? (
          <Moon className="w-full h-full text-purple-300" strokeWidth={sw} />
        ) : name === 'hotspot' ? (
          <Radio className="w-full h-full text-pink-300" strokeWidth={sw} />
        ) : name === 'nearby' ? (
          <Share2 className="w-full h-full text-cyan-300" strokeWidth={sw} />
        ) : name === 'cast' ? (
          <Cast className="w-full h-full text-sky-300" strokeWidth={sw} />
        ) : name === 'project' ? (
          <MonitorUp className="w-full h-full text-indigo-300" strokeWidth={sw} />
        ) : name === 'volume' ? (
          <Volume2 className="w-full h-full text-sky-300" strokeWidth={sw} />
        ) : name === 'awake' ? (
          <Coffee className="w-full h-full text-amber-300" strokeWidth={sw} />
        ) : name === 'mic' ? (
          <Mic className="w-full h-full text-emerald-300" strokeWidth={sw} />
        ) : (
          <Wifi className="w-full h-full text-sky-300" strokeWidth={sw} />
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
        ) : name === 'accessibility' ? (
          <Accessibility className="w-full h-full" strokeWidth={sw} />
        ) : name === 'saver' ? (
          <BatteryCharging className="w-full h-full" strokeWidth={sw} />
        ) : name === 'captions' ? (
          <Subtitles className="w-full h-full" strokeWidth={sw} />
        ) : name === 'sun' || name === 'nightlight' ? (
          <Sun className="w-full h-full" strokeWidth={sw} />
        ) : name === 'moon' || name === 'dnd' ? (
          <Moon className="w-full h-full" strokeWidth={sw} />
        ) : name === 'hotspot' ? (
          <Radio className="w-full h-full" strokeWidth={sw} />
        ) : name === 'nearby' ? (
          <Share2 className="w-full h-full" strokeWidth={sw} />
        ) : name === 'cast' ? (
          <Cast className="w-full h-full" strokeWidth={sw} />
        ) : name === 'project' ? (
          <MonitorUp className="w-full h-full" strokeWidth={sw} />
        ) : name === 'volume' ? (
          <Volume2 className="w-full h-full" strokeWidth={sw} />
        ) : name === 'awake' ? (
          <Coffee className="w-full h-full" strokeWidth={sw} />
        ) : name === 'mic' ? (
          <Mic className="w-full h-full" strokeWidth={sw} />
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
      ) : name === 'accessibility' ? (
        <Accessibility className="w-full h-full" strokeWidth={sw} />
      ) : name === 'saver' ? (
        <BatteryCharging className="w-full h-full" strokeWidth={sw} />
      ) : name === 'captions' ? (
        <Subtitles className="w-full h-full" strokeWidth={sw} />
      ) : name === 'sun' || name === 'nightlight' ? (
        <Sun className="w-full h-full" strokeWidth={sw} />
      ) : name === 'moon' || name === 'dnd' ? (
        <Moon className="w-full h-full" strokeWidth={sw} />
      ) : name === 'hotspot' ? (
        <Radio className="w-full h-full" strokeWidth={sw} />
      ) : name === 'nearby' ? (
        <Share2 className="w-full h-full" strokeWidth={sw} />
      ) : name === 'cast' ? (
        <Cast className="w-full h-full" strokeWidth={sw} />
      ) : name === 'project' ? (
        <MonitorUp className="w-full h-full" strokeWidth={sw} />
      ) : name === 'volume' ? (
        <Volume2 className="w-full h-full" strokeWidth={sw} />
      ) : name === 'awake' ? (
        <Coffee className="w-full h-full" strokeWidth={sw} />
      ) : name === 'mic' ? (
        <Mic className="w-full h-full" strokeWidth={sw} />
      ) : (
        <Wifi className="w-full h-full" strokeWidth={sw} />
      )}
    </span>
  );
};
