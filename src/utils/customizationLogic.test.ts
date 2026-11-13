import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyClipboardPayload,
  moveOrderedItem,
  computeBatteryEta,
  matchesShortcutCombo,
} from './customizationLogic';

test('classifyClipboardPayload detects A-to-Z file formats, colors, links, and code snippets', () => {
  assert.equal(classifyClipboardPayload('#38BDF8').category, 'color');
  assert.equal(classifyClipboardPayload('https://github.com/shandilyaswagat/dynamic_ledge').category, 'link');
  assert.equal(classifyClipboardPayload('MotionShader.hlsl').category, 'code');
  assert.equal(classifyClipboardPayload('Mockup_v4.fig').category, 'image');
  assert.equal(classifyClipboardPayload('DemoReel_120fps.mp4').category, 'video');
  assert.equal(classifyClipboardPayload('AmbientLoop.flac').category, 'audio');
  assert.equal(classifyClipboardPayload('ReleaseBundle.msix').category, 'archive');
  assert.equal(classifyClipboardPayload('Architecture_Notes.pdf').category, 'document');
  assert.equal(classifyClipboardPayload('CustomFirmware.apk').category, 'binary');
  assert.equal(classifyClipboardPayload('public sealed class FluidSpringCompositor').category, 'code');
});

test('moveOrderedItem reorders tabs cleanly without mutating original array', () => {
  const initial = ['home', 'control', 'tray', 'clipboard', 'notes'] as const;
  const moved = moveOrderedItem(initial, 2, -1);
  assert.deepEqual(moved, ['home', 'tray', 'control', 'clipboard', 'notes']);
  assert.deepEqual(initial, ['home', 'control', 'tray', 'clipboard', 'notes']);
});

test('computeBatteryEta calculates charging time-to-full and battery runtime accurately', () => {
  const fastCharge = computeBatteryEta(70, true, 65, 68);
  assert.ok(fastCharge.minutesToFull !== null && fastCharge.minutesToFull > 10 && fastCharge.minutesToFull < 40);
  assert.match(fastCharge.formattedEta, /min to 100%|to full/);

  const discharging = computeBatteryEta(80, false, 9, 68);
  assert.ok(discharging.minutesRemainingOnBattery !== null && discharging.minutesRemainingOnBattery > 300);
  assert.match(discharging.formattedEta, /remaining/);
});

test('matchesShortcutCombo matches Alt+L and Alt+Space accurately', () => {
  assert.equal(
    matchesShortcutCombo(
      { altKey: true, ctrlKey: false, shiftKey: false, metaKey: false, code: 'KeyL', key: 'l' },
      'Alt+L'
    ),
    true
  );
  assert.equal(
    matchesShortcutCombo(
      { altKey: true, ctrlKey: false, shiftKey: false, metaKey: false, code: 'Space', key: ' ' },
      'Alt+Space'
    ),
    true
  );
  assert.equal(
    matchesShortcutCombo(
      { altKey: false, ctrlKey: true, shiftKey: false, metaKey: false, code: 'KeyL', key: 'l' },
      'Alt+L'
    ),
    false
  );
});
