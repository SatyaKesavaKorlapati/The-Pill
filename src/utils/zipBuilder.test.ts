import test from 'node:test';
import assert from 'node:assert/strict';
import { computeCrc32, createZipArchive } from './zipBuilder';

test('computeCrc32 matches standard IEEE 802.3 check value for 123456789', () => {
  const bytes = new TextEncoder().encode('123456789');
  const crc = computeCrc32(bytes);
  assert.equal(crc, 0xcbf43926);
});

test('createZipArchive writes valid PKZIP local headers, central directory, and EOCD signature', () => {
  const archive = createZipArchive([
    { path: 'DynamicLedge.WinUI/Program.cs', content: 'using System;\nConsole.WriteLine("OK");' },
    { path: 'DynamicLedge.WinUI/Shaders/Liquid.hlsl', content: 'float4 main() : SV_TARGET { return 1; }' },
  ]);

  const view = new DataView(archive.buffer);
  // First 4 bytes must be Local File Header signature 0x04034b50
  assert.equal(view.getUint32(0, true), 0x04034b50);

  // Last 22 bytes must start with End of Central Directory signature 0x06054b50
  const eocdOffset = archive.byteLength - 22;
  assert.equal(view.getUint32(eocdOffset, true), 0x06054b50);
  // Total entry count in EOCD must be 2
  assert.equal(view.getUint16(eocdOffset + 10, true), 2);
});
