export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

export interface SpringState1D {
  position: number;
  velocity: number;
}

export enum SpringPresetId {
  LiquidSilk = 'liquid_silk',
  Fluid = 'fluid',
  Snappy = 'snappy',
  ElasticDrop = 'elastic_drop',
  Calm = 'calm',
  ZeroGravity = 'zero_gravity',
}

export const SPRING_PRESETS: Record<SpringPresetId, SpringConfig> = {
  [SpringPresetId.LiquidSilk]: {
    stiffness: 440,
    damping: 30,
    mass: 0.82,
  },
  [SpringPresetId.Fluid]: {
    stiffness: 480,
    damping: 28,
    mass: 0.80,
  },
  [SpringPresetId.Snappy]: {
    stiffness: 580,
    damping: 36,
    mass: 0.72,
  },
  [SpringPresetId.ElasticDrop]: {
    stiffness: 420,
    damping: 22,
    mass: 0.78,
  },
  [SpringPresetId.Calm]: {
    stiffness: 340,
    damping: 36,
    mass: 0.95,
  },
  [SpringPresetId.ZeroGravity]: {
    stiffness: 240,
    damping: 24,
    mass: 0.90,
  },
};

const MAX_DT = 0.064;
const SUBSTEP_DT = 0.004;
const REST_VELOCITY_EPSILON = 0.08;
const REST_DISPLACEMENT_EPSILON = 0.05;

/**
 * Advances a 1D damped harmonic oscillator (m*x'' + c*x' + k*(x - target) = 0)
 * using sub-stepped symplectic Euler integration for unconditional frame-rate stability.
 */
export function stepSpring1D(
  state: SpringState1D,
  target: number,
  config: SpringConfig,
  dtSeconds: number
): SpringState1D {
  const safeDt = Math.min(Math.max(dtSeconds, 0), MAX_DT);
  if (safeDt === 0) {
    return { position: state.position, velocity: state.velocity };
  }

  const mass = Math.max(config.mass, 0.05);
  const stiffness = Math.max(config.stiffness, 1);
  const damping = Math.max(config.damping, 0.1);

  let pos = state.position;
  let vel = state.velocity;

  let remaining = safeDt;
  while (remaining > 0) {
    const h = Math.min(remaining, SUBSTEP_DT);
    const displacement = pos - target;
    const springForce = -stiffness * displacement;
    const dampingForce = -damping * vel;
    const acceleration = (springForce + dampingForce) / mass;

    vel += acceleration * h;
    pos += vel * h;
    remaining -= h;
  }

  if (
    Math.abs(vel) < REST_VELOCITY_EPSILON &&
    Math.abs(pos - target) < REST_DISPLACEMENT_EPSILON
  ) {
    return { position: target, velocity: 0 };
  }

  return { position: pos, velocity: vel };
}

export function isSpringAtRest(state: SpringState1D, target: number): boolean {
  return (
    Math.abs(state.velocity) <= REST_VELOCITY_EPSILON &&
    Math.abs(state.position - target) <= REST_DISPLACEMENT_EPSILON
  );
}

export interface LiquidDeformation {
  scaleX: number;
  scaleY: number;
}

/**
 * Computes incompressible fluid squash-and-stretch deformation (scaleX * scaleY ≈ 1)
 * driven by instantaneous horizontal and vertical expansion velocities.
 */
export function computeLiquidDeformation(
  velocityWidth: number,
  velocityHeight: number,
  maxStretch = 0.065
): LiquidDeformation {
  const normalizedW = Math.tanh(velocityWidth / 1800) * maxStretch;
  const normalizedH = Math.tanh(velocityHeight / 1400) * maxStretch;

  const netHorizontalStrain = normalizedW - normalizedH * 0.45;
  const clampedStrain = Math.max(-maxStretch, Math.min(maxStretch, netHorizontalStrain));

  const scaleX = 1 + clampedStrain;
  const scaleY = 1 / scaleX;

  return {
    scaleX: Number(scaleX.toFixed(5)),
    scaleY: Number(scaleY.toFixed(5)),
  };
}

export interface MetaballBridgeMetrics {
  detachmentRatio: number;
  neckThicknessPx: number;
}

export function computeMetaballBridge(
  edgeGapPx: number,
  pinchOffGapPx = 14
): MetaballBridgeMetrics {
  if (edgeGapPx <= 0) {
    return { detachmentRatio: 0, neckThicknessPx: 22 };
  }
  if (edgeGapPx >= pinchOffGapPx) {
    return { detachmentRatio: 1, neckThicknessPx: 0 };
  }
  const ratio = edgeGapPx / pinchOffGapPx;
  const smooth = ratio * ratio * (3 - 2 * ratio);
  const neckThicknessPx = Math.max(0, (1 - smooth) * 20);
  return {
    detachmentRatio: Number(smooth.toFixed(4)),
    neckThicknessPx: Number(neckThicknessPx.toFixed(2)),
  };
}

export enum LedgeSizeScale {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

export enum LedgeShapeStyle {
  DynamicPill = 'dynamic_pill',
  TopBezelLedge = 'top_bezel_ledge',
  SuperellipseSquircle = 'squircle',
  MinimalistBar = 'minimal_bar',
  SplitDualCapsule = 'split_capsule',
}

export enum LedgeAnchorPosition {
  TopCenter = 'top_center',
  TopLeft = 'top_left',
  TopRight = 'top_right',
  BottomTaskbar = 'bottom_taskbar',
}

export interface LedgeGeometryInput {
  isExpanded: boolean;
  isLauncherOpen: boolean;
  activeTab: string;
  transientKind: 'none' | 'call' | 'agent' | 'volume' | 'brightness' | 'battery' | 'download';
  hasPrimaryActivity: boolean;
  hasSecondaryDroplet: boolean;
  isHovered: boolean;
  isDragOver: boolean;
  sizeScale: LedgeSizeScale;
  isElongated: boolean;
  isFloatingPill?: boolean;
  shapeStyle?: LedgeShapeStyle;
  anchorPosition?: LedgeAnchorPosition;
  floatingOffsetPx?: number;
  isStealthHidden?: boolean;
  isAstraActive?: boolean;
  astraMode?: 'orb_only' | 'orb_with_captions' | 'orb_with_chat';
  astraExpandedResult?: boolean;
}

export interface LedgeGeometryOutput {
  width: number;
  height: number;
  borderRadius: number;
  topOffset: number;
  satelliteGap: number;
  satelliteSize: number;
  isDockedFlushTop: boolean;
}

const SCALE_MULTIPLIER: Record<LedgeSizeScale, number> = {
  [LedgeSizeScale.Small]: 0.92,
  [LedgeSizeScale.Medium]: 1.0,
  [LedgeSizeScale.Large]: 1.09,
};

/**
 * Pure deterministic layout solver for all Dynamic Island / Ledge shapes, anchor positions,
 * stealth edge-hide mode, In-Pill Astra morphing, transient HUDs, and expanded workspaces.
 */
export function resolveLedgeGeometry(input: LedgeGeometryInput): LedgeGeometryOutput {
  const mult = SCALE_MULTIPLIER[input.sizeScale] ?? 1.0;

  // Backward compatibility with boolean isFloatingPill if shapeStyle omitted
  const effectiveShape =
    input.shapeStyle ??
    (input.isFloatingPill === false
      ? LedgeShapeStyle.TopBezelLedge
      : LedgeShapeStyle.DynamicPill);

  const anchor = input.anchorPosition ?? LedgeAnchorPosition.TopCenter;
  const isDockedFlushTop =
    effectiveShape === LedgeShapeStyle.TopBezelLedge &&
    anchor !== LedgeAnchorPosition.BottomTaskbar;

  const defaultOffset = isDockedFlushTop ? 0 : (input.floatingOffsetPx ?? 12);

  // 0. Stealth Auto-Hide until edge touch or keyboard shortcut (Astra summon overrides stealth!)
  if (
    input.isStealthHidden &&
    !input.isExpanded &&
    !input.isAstraActive &&
    input.transientKind === 'none'
  ) {
    const h = 6;
    return {
      width: Math.round(140 * mult),
      height: h,
      borderRadius: Math.round(h / 2),
      topOffset: anchor === LedgeAnchorPosition.BottomTaskbar ? 52 : -48,
      satelliteGap: 0,
      satelliteSize: 0,
      isDockedFlushTop: false,
    };
  }

  const computeCornerRadius = (h: number, expanded: boolean): number => {
    if (effectiveShape === LedgeShapeStyle.SuperellipseSquircle) {
      return expanded ? 24 : 14;
    }
    if (effectiveShape === LedgeShapeStyle.MinimalistBar) {
      return expanded ? 12 : 7;
    }
    if (effectiveShape === LedgeShapeStyle.TopBezelLedge) {
      return expanded ? 28 : Math.round(h / 2);
    }
    return expanded ? 34 : Math.round(h / 2);
  };

  // 0.5 In-Pill Astra (అస్త్రం) Morph — Uses the existing Pill directly instead of a separate box!
  if (input.isAstraActive && !input.isExpanded) {
    if (input.astraMode === 'orb_only') {
      const baseW = input.astraExpandedResult ? 420 : 70;
      const baseH = input.astraExpandedResult ? 138 : 70;
      const h = Math.round(baseH * mult);
      return {
        width: Math.round(baseW * mult),
        height: h,
        borderRadius: input.astraExpandedResult ? computeCornerRadius(h, true) : Math.round(h / 2),
        topOffset: defaultOffset,
        satelliteGap: 0,
        satelliteSize: 0,
        isDockedFlushTop,
      };
    }

    if (input.astraMode === 'orb_with_captions') {
      const baseW = input.astraExpandedResult ? 460 : 420;
      const baseH = input.astraExpandedResult ? 144 : 58;
      const h = Math.round(baseH * mult);
      return {
        width: Math.round(baseW * mult),
        height: h,
        borderRadius: computeCornerRadius(h, true),
        topOffset: defaultOffset,
        satelliteGap: 0,
        satelliteSize: 0,
        isDockedFlushTop,
      };
    }

    const baseW = 504;
    const baseH = input.astraExpandedResult ? 308 : 228;
    const h = Math.round(baseH * mult);
    return {
      width: Math.round(baseW * mult),
      height: h,
      borderRadius: computeCornerRadius(h, true),
      topOffset: defaultOffset,
      satelliteGap: 0,
      satelliteSize: 0,
      isDockedFlushTop,
    };
  }

  // 1. Dragging files near or over the Island swells it into a magnetic drop pocket
  if (input.isDragOver && !input.isExpanded) {
    const h = Math.round(88 * mult);
    return {
      width: Math.round(368 * mult),
      height: h,
      borderRadius: computeCornerRadius(h, true),
      topOffset: defaultOffset,
      satelliteGap: 0,
      satelliteSize: 0,
      isDockedFlushTop,
    };
  }

  // 2. Full Expanded Interactive Island
  if (input.isExpanded) {
    const baseWidth = input.isElongated ? 748 : 684;
    let baseHeight = 368;
    if (input.isLauncherOpen) {
      baseHeight = 358;
    } else if (input.activeTab === 'home' || input.activeTab.startsWith('custom_')) {
      baseHeight = 368;
    } else if (input.activeTab === 'control') {
      baseHeight = 388;
    } else if (input.activeTab === 'ai') {
      baseHeight = 422;
    } else if (input.activeTab === 'monitor') {
      baseHeight = 414;
    } else if (input.activeTab === 'clipboard') {
      baseHeight = 426;
    } else if (input.activeTab === 'tray') {
      baseHeight = 338;
    } else if (input.activeTab === 'mirror') {
      baseHeight = 312;
    } else if (input.activeTab === 'notes') {
      baseHeight = 348;
    }

    const h = Math.round(baseHeight * mult);
    return {
      width: Math.round(baseWidth * mult),
      height: h,
      borderRadius: computeCornerRadius(h, true),
      topOffset: defaultOffset,
      satelliteGap: 0,
      satelliteSize: 0,
      isDockedFlushTop,
    };
  }

  // 3. High-priority Transient System Interrupts
  if (input.transientKind === 'call') {
    const h = Math.round(68 * mult);
    return {
      width: Math.round(416 * mult),
      height: h,
      borderRadius: computeCornerRadius(h, false),
      topOffset: defaultOffset,
      satelliteGap: 0,
      satelliteSize: 0,
      isDockedFlushTop,
    };
  }

  if (input.transientKind === 'agent') {
    const h = Math.round(74 * mult);
    return {
      width: Math.round(452 * mult),
      height: h,
      borderRadius: computeCornerRadius(h, false),
      topOffset: defaultOffset,
      satelliteGap: 0,
      satelliteSize: 0,
      isDockedFlushTop,
    };
  }

  if (input.transientKind === 'battery') {
    const h = Math.round(48 * mult);
    return {
      width: Math.round(356 * mult),
      height: h,
      borderRadius: computeCornerRadius(h, false),
      topOffset: defaultOffset,
      satelliteGap: 0,
      satelliteSize: 0,
      isDockedFlushTop,
    };
  }

  if (
    input.transientKind === 'volume' ||
    input.transientKind === 'brightness' ||
    input.transientKind === 'download'
  ) {
    const h = Math.round(44 * mult);
    return {
      width: Math.round(308 * mult),
      height: h,
      borderRadius: computeCornerRadius(h, false),
      topOffset: defaultOffset,
      satelliteGap: 0,
      satelliteSize: 0,
      isDockedFlushTop,
    };
  }

  // 4. Compact Live Activity State (with optional liquid-split secondary droplet)
  const forceSplit = effectiveShape === LedgeShapeStyle.SplitDualCapsule;
  if (input.hasPrimaryActivity) {
    const isMinimal = effectiveShape === LedgeShapeStyle.MinimalistBar;
    const baseW = isMinimal ? 272 : 258;
    const baseH = isMinimal ? 28 : 37;
    const h = Math.round(baseH * mult);
    const showSat = input.hasSecondaryDroplet || forceSplit;
    return {
      width: Math.round(baseW * mult),
      height: h,
      borderRadius: computeCornerRadius(h, false),
      topOffset: defaultOffset,
      satelliteGap: showSat ? 10 : 0,
      satelliteSize: showSat ? h : 0,
      isDockedFlushTop,
    };
  }

  // 5. Quiet Idle Capsule
  const isMinimalIdle = effectiveShape === LedgeShapeStyle.MinimalistBar;
  const idleW = isMinimalIdle ? 164 : 176;
  const idleH = isMinimalIdle ? 24 : 33;
  const h = Math.round(idleH * mult);
  return {
    width: Math.round(idleW * mult),
    height: h,
    borderRadius: computeCornerRadius(h, false),
    topOffset: defaultOffset,
    satelliteGap: forceSplit ? 10 : 0,
    satelliteSize: forceSplit ? h : 0,
    isDockedFlushTop,
  };
}
