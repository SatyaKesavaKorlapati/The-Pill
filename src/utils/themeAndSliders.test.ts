import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMPLETE_STYLE_KITS,
  getReadableForegroundClass,
  paginateControlTiles,
  resolveIconPackMetrics,
  resolveInnerPillMetrics,
  resolveThemePalette,
  resolveTileSurfaceClasses,
} from './themeAndSliders';

test('resolveThemePalette returns Windows 11 Cyan, Paper Editorial light surface, and sanitizes custom hex palettes', () => {
  const win11 = resolveThemePalette('win11_cyan');
  assert.equal(win11.primaryHex, '#22d3ee');
  assert.equal(win11.onPrimaryTextClass, 'text-slate-950');

  const paper = resolveThemePalette('paper_editorial');
  assert.equal(paper.isLightSurface, true);
  assert.equal(paper.onPrimaryTextClass, 'text-white');

  const custom = resolveThemePalette('custom_hex', '#0f8', 'invalid-hex');
  assert.equal(custom.primaryHex, '#00ff88');
  assert.equal(custom.secondaryHex, '#a855f7');
  assert.equal(custom.onPrimaryTextClass, 'text-slate-950');
});

test('COMPLETE_STYLE_KITS covers Cyberpunk, Retro, Paper, Animals, Botanical Flowers, and Motorsport Cars', () => {
  const ids = COMPLETE_STYLE_KITS.map((k) => k.id);
  assert.ok(ids.includes('cyberpunk_neon'));
  assert.ok(ids.includes('retro_synth_crt'));
  assert.ok(ids.includes('paper_editorial'));
  assert.ok(ids.includes('cozy_animals'));
  assert.ok(ids.includes('botanical_sakura'));
  assert.ok(ids.includes('motorsport_gt'));

  const cyberTile = resolveTileSurfaceClasses('chamfer_cyber', false, false);
  assert.ok(cyberTile.includes('clip-path'));
  const lightPaperTile = resolveTileSurfaceClasses('paper_sketch', false, true);
  assert.ok(lightPaperTile.includes('text-stone-900'));
});

test('getReadableForegroundClass selects high-contrast ink for bright vs deep accents', () => {
  assert.equal(getReadableForegroundClass('#22d3ee'), 'text-slate-950');
  assert.equal(getReadableForegroundClass('#1e1b4b'), 'text-white');
});

test('resolveIconPackMetrics and resolveInnerPillMetrics map distinct stroke and radius tokens', () => {
  const solid = resolveIconPackMetrics('apple_solid');
  const minimal = resolveIconPackMetrics('minimal_mono');
  assert.ok(solid.strokeWidth > minimal.strokeWidth);
  assert.equal(solid.solidActiveBadge, true);

  const pillPlush = resolveInnerPillMetrics('plush', 'pill_capsule');
  assert.equal(pillPlush.radiusClass, 'rounded-full');
  assert.equal(pillPlush.tileHeightClass, 'h-12');
});

test('paginateControlTiles splits tiles into Windows 11 3x2 pages accurately', () => {
  const tiles = ['wifi', 'bt', 'airplane', 'acc', 'saver', 'captions', 'nightlight', 'cast', 'project'];
  const pages = paginateControlTiles(tiles, 3, 2);
  assert.equal(pages.length, 2);
  assert.deepEqual(pages[0], ['wifi', 'bt', 'airplane', 'acc', 'saver', 'captions']);
  assert.deepEqual(pages[1], ['nightlight', 'cast', 'project']);
});
