import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SPRING_PRESETS,
  SpringPresetId,
  PillSizeScale,
  PillShapeStyle,
  PillAnchorPosition,
  stepSpring1D,
  isSpringAtRest,
  computeLiquidDeformation,
  computeMetaballBridge,
  resolvePillGeometry,
} from './springPhysics';

test('stepSpring1D converges cleanly to target position for LiquidSilk and ElasticDrop presets', () => {
  let silk = { position: 176, velocity: 0 };
  let elastic = { position: 176, velocity: 0 };
  const target = 604;

  for (let i = 0; i < 220; i++) {
    silk = stepSpring1D(silk, target, SPRING_PRESETS[SpringPresetId.LiquidSilk], 1 / 60);
    elastic = stepSpring1D(elastic, target, SPRING_PRESETS[SpringPresetId.ElasticDrop], 1 / 60);
  }

  assert.equal(isSpringAtRest(silk, target), true);
  assert.equal(isSpringAtRest(elastic, target), true);
});

test('Fluid spring produces organic overshoot while Calm spring stays critically damped', () => {
  let fluidState = { position: 0, velocity: 0 };
  let calmState = { position: 0, velocity: 0 };
  let maxFluid = 0;
  let maxCalm = 0;

  for (let i = 0; i < 120; i++) {
    fluidState = stepSpring1D(fluidState, 100, SPRING_PRESETS[SpringPresetId.Fluid], 1 / 60);
    calmState = stepSpring1D(calmState, 100, SPRING_PRESETS[SpringPresetId.Calm], 1 / 60);
    if (fluidState.position > maxFluid) maxFluid = fluidState.position;
    if (calmState.position > maxCalm) maxCalm = calmState.position;
  }

  assert.ok(maxFluid > 100.5);
  assert.ok(maxCalm <= 101.0);
});

test('computeLiquidDeformation preserves incompressible 2D fluid area (scaleX * scaleY ≈ 1)', () => {
  const expanding = computeLiquidDeformation(1400, 120);
  assert.ok(expanding.scaleX > 1.01);
  assert.ok(expanding.scaleY < 0.99);
  assert.ok(Math.abs(expanding.scaleX * expanding.scaleY - 1) < 0.001);
});

test('computeMetaballBridge transitions smoothly from fused neck to detached droplet', () => {
  assert.equal(computeMetaballBridge(0, 14).detachmentRatio, 0);
  assert.equal(computeMetaballBridge(7, 14).detachmentRatio, 0.5);
  assert.equal(computeMetaballBridge(16, 14).detachmentRatio, 1);
});

test('resolvePillGeometry handles DynamicPill, TopBezelPill, Squircle, MinimalistBar, and Stealth Hide', () => {
  const baseInput = {
    isExpanded: false,
    isLauncherOpen: false,
    activeTab: 'home',
    transientKind: 'none' as const,
    hasPrimaryActivity: false,
    hasSecondaryDroplet: false,
    isHovered: false,
    isDragOver: false,
    sizeScale: PillSizeScale.Medium,
    isElongated: false,
  };

  const pillIdle = resolvePillGeometry({
    ...baseInput,
    shapeStyle: PillShapeStyle.DynamicPill,
    anchorPosition: PillAnchorPosition.TopCenter,
  });
  assert.equal(pillIdle.isDockedFlushTop, false);
  assert.equal(pillIdle.topOffset, 12);

  const bezelDocked = resolvePillGeometry({
    ...baseInput,
    shapeStyle: PillShapeStyle.TopBezelPill,
    anchorPosition: PillAnchorPosition.TopCenter,
  });
  assert.equal(bezelDocked.isDockedFlushTop, true);
  assert.equal(bezelDocked.topOffset, 0);

  const minimalBar = resolvePillGeometry({
    ...baseInput,
    hasPrimaryActivity: true,
    shapeStyle: PillShapeStyle.MinimalistBar,
  });
  assert.equal(minimalBar.height, 28);

  const stealthTop = resolvePillGeometry({
    ...baseInput,
    isStealthHidden: true,
    anchorPosition: PillAnchorPosition.TopRight,
  });
  assert.ok(stealthTop.topOffset < -30);

  const expandedControl = resolvePillGeometry({
    ...baseInput,
    isExpanded: true,
    activeTab: 'control',
  });
  assert.equal(expandedControl.width, 684);
  assert.equal(expandedControl.height, 388);

  const expandedAi = resolvePillGeometry({
    ...baseInput,
    isExpanded: true,
    activeTab: 'ai',
  });
  assert.equal(expandedAi.width, 684);
  assert.equal(expandedAi.height, 422);

  const expandedClipboard = resolvePillGeometry({
    ...baseInput,
    isExpanded: true,
    activeTab: 'clipboard',
  });
  assert.equal(expandedClipboard.height, 426);

  const expandedMonitor = resolvePillGeometry({
    ...baseInput,
    isExpanded: true,
    activeTab: 'monitor',
  });
  assert.equal(expandedMonitor.height, 414);
});

test('resolvePillGeometry morphs the existing Pill directly into Astra (orb_only & orb_with_chat) and overrides stealth hide', () => {
  const baseInput = {
    isExpanded: false,
    isLauncherOpen: false,
    activeTab: 'home',
    transientKind: 'none' as const,
    hasPrimaryActivity: false,
    hasSecondaryDroplet: false,
    isHovered: false,
    isDragOver: false,
    sizeScale: PillSizeScale.Medium,
    isElongated: false,
  };

  const orbOnlyIdle = resolvePillGeometry({
    ...baseInput,
    isStealthHidden: true,
    isAstraActive: true,
    astraMode: 'orb_only',
    astraExpandedResult: false,
  });
  assert.equal(orbOnlyIdle.width, 70);
  assert.equal(orbOnlyIdle.height, 70);
  assert.equal(orbOnlyIdle.topOffset, 12);

  const orbOnlyWithResult = resolvePillGeometry({
    ...baseInput,
    isAstraActive: true,
    astraMode: 'orb_only',
    astraExpandedResult: true,
  });
  assert.equal(orbOnlyWithResult.width, 420);
  assert.equal(orbOnlyWithResult.height, 138);

  const orbWithChat = resolvePillGeometry({
    ...baseInput,
    isAstraActive: true,
    astraMode: 'orb_with_chat',
    astraExpandedResult: true,
  });
  assert.equal(orbWithChat.width, 504);
  assert.equal(orbWithChat.height, 308);
});

