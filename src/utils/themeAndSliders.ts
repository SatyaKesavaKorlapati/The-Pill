import type { EdgeLightProfile } from '../types/ledge';

export type LedgeThemeId =
  | 'win11_cyan'
  | 'midnight_sapphire'
  | 'apple_indigo'
  | 'cyberpunk_neon'
  | 'retro_synth_crt'
  | 'paper_editorial'
  | 'cozy_animals'
  | 'botanical_sakura'
  | 'motorsport_gt'
  | 'emerald_forest'
  | 'sunset_rose'
  | 'crimson_titanium'
  | 'custom_hex';

export type IconPackStyle =
  | 'fluent_outline'
  | 'apple_solid'
  | 'duotone_glass'
  | 'minimal_mono';

export type InnerPillScale = 'compact' | 'balanced' | 'plush';

export type InnerCapsuleRadius = 'win11_card' | 'pill_capsule' | 'squircle_soft';

export type TileSurfaceStyle =
  | 'fluent_glass'
  | 'chamfer_cyber'
  | 'retro_bevel'
  | 'paper_sketch'
  | 'carbon_gt'
  | 'pebble_organic';

export type SliderVisualStyle =
  | 'fused_liquid_ribbon'
  | 'fused_harmonic_bars'
  | 'win11_fluent'
  | 'apple_thick_capsule'
  | 'aurora_meniscus'
  | 'minimal_hairline'
  | 'cyberpunk_laser'
  | 'retro_vu_cassette'
  | 'gt_rpm_redline'
  | 'paper_ink_stroke'
  | 'botanical_petal_wave';

export type ControlCenterLayoutMode =
  | 'squarish_blocks'
  | 'circular_orbs'
  | 'win11_split'
  | 'bento_mixed'
  | 'vertical_pillars'
  | 'horizontal_strips'
  | 'inline_pills'
  | 'minimal_grid';

export type ControlSliderOrientation = 'horizontal' | 'vertical';

export interface ThemePalette {
  id: LedgeThemeId;
  name: string;
  subtitle: string;
  primaryHex: string;
  secondaryHex: string;
  /** Text color placed on solid primary-filled active tiles (WCAG AA contrast) */
  onPrimaryTextClass: 'text-slate-950' | 'text-white';
  surfaceTintHex: string;
  /** Warm archival light paper mode with dark sumi-ink typography */
  isLightSurface?: boolean;
  motifName?: string;
}

export interface StyleKitPreset {
  id: Exclude<LedgeThemeId, 'custom_hex'>;
  title: string;
  genre: string;
  summary: string;
  themeId: Exclude<LedgeThemeId, 'custom_hex'>;
  musicSliderStyle: SliderVisualStyle;
  controlSliderStyle: SliderVisualStyle;
  tileSurfaceStyle: TileSurfaceStyle;
  iconPack: IconPackStyle;
  innerCapsuleRadius: InnerCapsuleRadius;
  edgeLightProfile:
    | 'off'
    | 'album_adaptive'
    | 'apple_aura'
    | 'northern_aurora'
    | 'solar_amber'
    | 'glacial_ice'
    | 'crimson_pulse';
  soundProfile:
    | 'wooden_marimba'
    | 'velvet_droplet'
    | 'brushed_glass'
    | 'taptic_thump'
    | 'cyber_synth'
    | 'retro_cassette'
    | 'mechanical_gt'
    | 'zen_garden'
    | 'silent';
}

export const LEDGE_THEMES: Record<Exclude<LedgeThemeId, 'custom_hex'>, ThemePalette> = {
  win11_cyan: {
    id: 'win11_cyan',
    name: 'Windows 11 Fluent Cyan',
    subtitle: 'Crisp electric cyan active tiles inspired by Windows 11 Quick Settings',
    primaryHex: '#22d3ee',
    secondaryHex: '#818cf8',
    onPrimaryTextClass: 'text-slate-950',
    surfaceTintHex: '#0b131d',
    motifName: 'Fluent Mica',
  },
  cyberpunk_neon: {
    id: 'cyberpunk_neon',
    name: 'Cyberpunk Night City',
    subtitle: 'High-voltage cyber yellow & cyan laser rails with chamfered HUD geometry',
    primaryHex: '#facc15',
    secondaryHex: '#22d3ee',
    onPrimaryTextClass: 'text-slate-950',
    surfaceTintHex: '#0d0a18',
    motifName: 'Chamfer Cyber',
  },
  retro_synth_crt: {
    id: 'retro_synth_crt',
    name: 'Retro 80s Cassette & CRT',
    subtitle: 'Warm phosphor amber VU-meter segments, tactile bevel keys & analog tape click',
    primaryHex: '#fb923c',
    secondaryHex: '#f472b6',
    onPrimaryTextClass: 'text-slate-950',
    surfaceTintHex: '#17110b',
    motifName: 'Analog Tape Deck',
  },
  paper_editorial: {
    id: 'paper_editorial',
    name: 'Paper & Sumi Ink Studio',
    subtitle: 'Tactile warm archival cream paper with crisp fountain-ink strokes & editorial calm',
    primaryHex: '#b45309',
    secondaryHex: '#44403c',
    onPrimaryTextClass: 'text-white',
    surfaceTintHex: '#f4efe4',
    isLightSurface: true,
    motifName: 'Archival Paper',
  },
  cozy_animals: {
    id: 'cozy_animals',
    name: 'Woodland Animals & Fox',
    subtitle: 'Playful fox-amber & forest-moss organic pebble capsules with warm marimba taps',
    primaryHex: '#fb923c',
    secondaryHex: '#4ade80',
    onPrimaryTextClass: 'text-slate-950',
    surfaceTintHex: '#14110d',
    motifName: 'Woodland Companion',
  },
  botanical_sakura: {
    id: 'botanical_sakura',
    name: 'Botanical Sakura & Flora',
    subtitle: 'Soft cherry-blossom petals & sage botanical stem waves with zen chimes',
    primaryHex: '#f472b6',
    secondaryHex: '#34d399',
    onPrimaryTextClass: 'text-slate-950',
    surfaceTintHex: '#160e14',
    motifName: 'Sakura Flora',
  },
  motorsport_gt: {
    id: 'motorsport_gt',
    name: 'Motorsport GT Telemetry',
    subtitle: 'Carbon-weave cockpit tiles, tachometer RPM redline faders & paddle-shift clicks',
    primaryHex: '#ef4444',
    secondaryHex: '#f59e0b',
    onPrimaryTextClass: 'text-white',
    surfaceTintHex: '#111216',
    motifName: 'GT Carbon Cockpit',
  },
  midnight_sapphire: {
    id: 'midnight_sapphire',
    name: 'Sapphire & Warm Amber',
    subtitle: 'Deep studio obsidian with sky-blue controls and warm amber media accents',
    primaryHex: '#38bdf8',
    secondaryHex: '#f59e0b',
    onPrimaryTextClass: 'text-slate-950',
    surfaceTintHex: '#090f1a',
    motifName: 'Sapphire Studio',
  },
  apple_indigo: {
    id: 'apple_indigo',
    name: 'Apple Indigo Aura',
    subtitle: 'Refractive periwinkle indigo paired with soft violet harmonics',
    primaryHex: '#818cf8',
    secondaryHex: '#c084fc',
    onPrimaryTextClass: 'text-slate-950',
    surfaceTintHex: '#101022',
    motifName: 'Cupertino Glass',
  },
  emerald_forest: {
    id: 'emerald_forest',
    name: 'Emerald Bioluminescence',
    subtitle: 'Calm high-contrast mint and deep-sea teal hardware indicators',
    primaryHex: '#34d399',
    secondaryHex: '#22d3ee',
    onPrimaryTextClass: 'text-slate-950',
    surfaceTintHex: '#081614',
    motifName: 'Emerald Tide',
  },
  sunset_rose: {
    id: 'sunset_rose',
    name: 'Solar Rose Gold',
    subtitle: 'Warm tungsten coral and golden amber studio highlights',
    primaryHex: '#fb7185',
    secondaryHex: '#fbbf24',
    onPrimaryTextClass: 'text-slate-950',
    surfaceTintHex: '#190d14',
    motifName: 'Tungsten Silk',
  },
  crimson_titanium: {
    id: 'crimson_titanium',
    name: 'Titanium Ruby',
    subtitle: 'Anodized dark titanium with precision ruby-orange accents',
    primaryHex: '#f43f5e',
    secondaryHex: '#fb923c',
    onPrimaryTextClass: 'text-white',
    surfaceTintHex: '#180b10',
    motifName: 'Anodized Titanium',
  },
};

export const COMPLETE_STYLE_KITS: StyleKitPreset[] = [
  {
    id: 'win11_cyan',
    title: 'Windows 11 Fluent Pro',
    genre: 'OS Native',
    summary: 'Fluent Cyan split tiles, liquid ribbon scrubber, outline glyphs & rosewood sound',
    themeId: 'win11_cyan',
    musicSliderStyle: 'fused_liquid_ribbon',
    controlSliderStyle: 'win11_fluent',
    tileSurfaceStyle: 'fluent_glass',
    iconPack: 'fluent_outline',
    innerCapsuleRadius: 'win11_card',
    edgeLightProfile: 'album_adaptive',
    soundProfile: 'wooden_marimba',
  },
  {
    id: 'cyberpunk_neon',
    title: 'Cyberpunk Night Kit',
    genre: 'Sci-Fi HUD',
    summary: 'Chamfered neon-yellow/cyan tiles, laser-grid fader, glowing icons & synth blips',
    themeId: 'cyberpunk_neon',
    musicSliderStyle: 'cyberpunk_laser',
    controlSliderStyle: 'cyberpunk_laser',
    tileSurfaceStyle: 'chamfer_cyber',
    iconPack: 'duotone_glass',
    innerCapsuleRadius: 'win11_card',
    edgeLightProfile: 'apple_aura',
    soundProfile: 'cyber_synth',
  },
  {
    id: 'retro_synth_crt',
    title: 'Retro Cassette & VU',
    genre: '80s Analog',
    summary: 'Tactile beveled keycaps, 16-LED amber/magenta VU meter bar & cassette latch sound',
    themeId: 'retro_synth_crt',
    musicSliderStyle: 'retro_vu_cassette',
    controlSliderStyle: 'retro_vu_cassette',
    tileSurfaceStyle: 'retro_bevel',
    iconPack: 'apple_solid',
    innerCapsuleRadius: 'win11_card',
    edgeLightProfile: 'solar_amber',
    soundProfile: 'retro_cassette',
  },
  {
    id: 'paper_editorial',
    title: 'Paper & Fountain Ink',
    genre: 'E-Ink / Print',
    summary: 'Warm cream paper island, hand-inked stroke faders, hairline icons & quiet page acoustics',
    themeId: 'paper_editorial',
    musicSliderStyle: 'paper_ink_stroke',
    controlSliderStyle: 'paper_ink_stroke',
    tileSurfaceStyle: 'paper_sketch',
    iconPack: 'minimal_mono',
    innerCapsuleRadius: 'win11_card',
    edgeLightProfile: 'off',
    soundProfile: 'zen_garden',
  },
  {
    id: 'cozy_animals',
    title: 'Woodland Animals',
    genre: 'Cozy Nature',
    summary: 'Plush pebble capsules, fox-amber & moss tones, organic waveforms & wooden marimba',
    themeId: 'cozy_animals',
    musicSliderStyle: 'fused_liquid_ribbon',
    controlSliderStyle: 'apple_thick_capsule',
    tileSurfaceStyle: 'pebble_organic',
    iconPack: 'apple_solid',
    innerCapsuleRadius: 'pill_capsule',
    edgeLightProfile: 'solar_amber',
    soundProfile: 'wooden_marimba',
  },
  {
    id: 'botanical_sakura',
    title: 'Botanical Flowers',
    genre: 'Sakura Flora',
    summary: 'Cherry-blossom & sage petal wave scrubber, soft squircles & zen garden chimes',
    themeId: 'botanical_sakura',
    musicSliderStyle: 'botanical_petal_wave',
    controlSliderStyle: 'botanical_petal_wave',
    tileSurfaceStyle: 'pebble_organic',
    iconPack: 'duotone_glass',
    innerCapsuleRadius: 'squircle_soft',
    edgeLightProfile: 'northern_aurora',
    soundProfile: 'zen_garden',
  },
  {
    id: 'motorsport_gt',
    title: 'Motorsport Cars GT',
    genre: 'Automotive',
    summary: 'Carbon-fiber weave tiles, RPM tachometer redline bar, ruby glow & paddle-shift click',
    themeId: 'motorsport_gt',
    musicSliderStyle: 'gt_rpm_redline',
    controlSliderStyle: 'gt_rpm_redline',
    tileSurfaceStyle: 'carbon_gt',
    iconPack: 'apple_solid',
    innerCapsuleRadius: 'win11_card',
    edgeLightProfile: 'crimson_pulse',
    soundProfile: 'mechanical_gt',
  },
  {
    id: 'apple_indigo',
    title: 'Cupertino Liquid Silk',
    genre: 'Minimal Pro',
    summary: 'Indigo squircle capsules, iOS thick frosted sliders, solid glyphs & taptic thump',
    themeId: 'apple_indigo',
    musicSliderStyle: 'fused_harmonic_bars',
    controlSliderStyle: 'apple_thick_capsule',
    tileSurfaceStyle: 'fluent_glass',
    iconPack: 'apple_solid',
    innerCapsuleRadius: 'squircle_soft',
    edgeLightProfile: 'glacial_ice',
    soundProfile: 'taptic_thump',
  },
];

function sanitizeHexColor(input: string, fallback: string): string {
  const trimmed = (input || '').trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return fallback;
}

/**
 * Computes relative luminance of a #RRGGBB color to choose dark vs light foreground text.
 */
export function getReadableForegroundClass(hexColor: string): 'text-slate-950' | 'text-white' {
  const clean = sanitizeHexColor(hexColor, '#22d3ee').slice(1);
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.48 ? 'text-slate-950' : 'text-white';
}

export function resolveThemePalette(
  themeId: LedgeThemeId,
  customPrimaryHex = '#22d3ee',
  customSecondaryHex = '#a855f7'
): ThemePalette {
  if (themeId === 'custom_hex') {
    const primary = sanitizeHexColor(customPrimaryHex, '#22d3ee');
    const secondary = sanitizeHexColor(customSecondaryHex, '#a855f7');
    return {
      id: 'custom_hex',
      name: 'Custom Studio Palette',
      subtitle: 'User-defined primary and harmonic secondary accent colors',
      primaryHex: primary,
      secondaryHex: secondary,
      onPrimaryTextClass: getReadableForegroundClass(primary),
      surfaceTintHex: '#0a0f18',
      motifName: 'Custom Studio',
    };
  }
  return LEDGE_THEMES[themeId] ?? LEDGE_THEMES.win11_cyan;
}

export function resolveTileSurfaceClasses(
  tileSurfaceStyle: TileSurfaceStyle,
  isActive: boolean,
  isLightSurface = false
): string {
  if (isLightSurface) {
    return isActive
      ? 'shadow-sm ring-1 ring-stone-900/15'
      : 'bg-stone-900/[0.06] hover:bg-stone-900/[0.11] border-stone-900/15 text-stone-900';
  }

  switch (tileSurfaceStyle) {
    case 'chamfer_cyber':
      return isActive
        ? '[clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%-8px))]'
        : 'bg-[#161229]/90 hover:bg-[#1f1938] border-cyan-400/25 text-slate-100 [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%-8px))]';
    case 'retro_bevel':
      return isActive
        ? 'shadow-[inset_0_2px_0_rgba(255,255,255,0.35),inset_0_-2px_0_rgba(0,0,0,0.35)]'
        : 'bg-[#281f18] hover:bg-[#33271e] border-amber-500/25 text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_0_rgba(0,0,0,0.65)]';
    case 'paper_sketch':
      return isActive
        ? 'shadow-[2px_2px_0_rgba(28,25,23,0.45)]'
        : 'bg-white/[0.06] hover:bg-white/[0.11] border-white/20 text-slate-100';
    case 'carbon_gt':
      return isActive
        ? 'ring-1 ring-red-400/50'
        : 'bg-[radial-gradient(#2a2e39_1px,transparent_1px)] [background-size:6px_6px] bg-[#181b22] hover:bg-[#20242d] border-white/12 text-slate-100';
    case 'pebble_organic':
      return isActive
        ? 'shadow-sm'
        : 'bg-white/[0.06] hover:bg-white/[0.11] border-white/12 text-slate-100';
    case 'fluent_glass':
    default:
      return isActive
        ? ''
        : 'bg-[#2b2f3a]/85 hover:bg-[#343946] border-white/[0.08] text-slate-100';
  }
}

export interface IconPackMetrics {
  strokeWidth: number;
  badgeRadiusClass: string;
  showHalo: boolean;
  solidActiveBadge: boolean;
}

export function resolveIconPackMetrics(style: IconPackStyle): IconPackMetrics {
  switch (style) {
    case 'fluent_outline':
      return {
        strokeWidth: 1.75,
        badgeRadiusClass: 'rounded-lg',
        showHalo: false,
        solidActiveBadge: false,
      };
    case 'apple_solid':
      return {
        strokeWidth: 2.35,
        badgeRadiusClass: 'rounded-full',
        showHalo: false,
        solidActiveBadge: true,
      };
    case 'duotone_glass':
      return {
        strokeWidth: 1.9,
        badgeRadiusClass: 'rounded-xl',
        showHalo: true,
        solidActiveBadge: false,
      };
    case 'minimal_mono':
      return {
        strokeWidth: 1.35,
        badgeRadiusClass: 'rounded-md',
        showHalo: false,
        solidActiveBadge: false,
      };
  }
}

export interface InnerPillMetrics {
  tileHeightClass: string;
  tilePaddingClass: string;
  radiusClass: string;
  iconBoxClass: string;
  labelSizeClass: string;
}

export function resolveInnerPillMetrics(
  scale: InnerPillScale,
  radius: InnerCapsuleRadius
): InnerPillMetrics {
  const radiusClass =
    radius === 'pill_capsule'
      ? 'rounded-full'
      : radius === 'squircle_soft'
        ? 'rounded-2xl'
        : 'rounded-xl';

  if (scale === 'compact') {
    return {
      tileHeightClass: 'h-9',
      tilePaddingClass: 'px-2 py-1',
      radiusClass,
      iconBoxClass: 'w-6 h-6',
      labelSizeClass: 'text-[11px]',
    };
  }
  if (scale === 'plush') {
    return {
      tileHeightClass: 'h-12',
      tilePaddingClass: 'px-3.5 py-2.5',
      radiusClass,
      iconBoxClass: 'w-8 h-8',
      labelSizeClass: 'text-xs',
    };
  }
  return {
    tileHeightClass: 'h-11',
    tilePaddingClass: 'px-2.5 py-1.5',
    radiusClass,
    iconBoxClass: 'w-7 h-7',
    labelSizeClass: 'text-xs',
  };
}

/**
 * Splits Control Center tiles into pages based on columns and rows per page.
 */
export function paginateControlTiles<T>(
  tiles: readonly T[],
  columns: 3 | 4 | 5 | 6,
  rowsPerPage = 2
): T[][] {
  const pageSize = Math.max(1, columns * rowsPerPage);
  if (tiles.length === 0) return [[]];
  const pages: T[][] = [];
  for (let i = 0; i < tiles.length; i += pageSize) {
    pages.push(tiles.slice(i, i + pageSize));
  }
  return pages;
}

/**
 * Deterministic CSS box-shadow generator for Dynamic Island perimeter edge lighting.
 */
export function resolveEdgeGlowCss(
  profile: EdgeLightProfile,
  intensity: number,
  trackAccent = '#38bdf8',
  trackSecondary = '#f59e0b'
): string | undefined {
  if (profile === 'off' || intensity <= 0.02) return undefined;
  const a1 = Math.min(0.85, intensity * 0.65).toFixed(2);
  const a2 = Math.min(0.65, intensity * 0.42).toFixed(2);
  const spread1 = Math.round(14 + intensity * 14);
  const spread2 = Math.round(28 + intensity * 24);

  switch (profile) {
    case 'album_adaptive':
      return `0 0 ${spread1}px ${trackAccent}${Math.round(Number(a1) * 255)
        .toString(16)
        .padStart(2, '0')}, 0 0 ${spread2}px ${trackSecondary}${Math.round(Number(a2) * 255)
        .toString(16)
        .padStart(2, '0')}`;
    case 'apple_aura':
      return `0 -2px ${spread1}px rgba(56,189,248,${a1}), -6px 4px ${spread2}px rgba(217,70,239,${a2}), 6px 4px ${spread2}px rgba(251,191,36,${a2})`;
    case 'northern_aurora':
      return `0 0 ${spread1}px rgba(52,211,153,${a1}), 0 4px ${spread2}px rgba(34,211,238,${a2})`;
    case 'solar_amber':
      return `0 0 ${spread1}px rgba(251,191,36,${a1}), 0 4px ${spread2}px rgba(244,63,94,${a2})`;
    case 'glacial_ice':
      return `0 0 ${spread1}px rgba(186,230,253,${a1}), 0 4px ${spread2}px rgba(59,130,246,${a2})`;
    case 'crimson_pulse':
      return `0 0 ${spread1}px rgba(251,113,133,${a1}), 0 4px ${spread2}px rgba(220,38,38,${a2})`;
    default:
      return undefined;
  }
}

