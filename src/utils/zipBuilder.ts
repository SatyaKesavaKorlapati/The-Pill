export interface ZipFileEntry {
  path: string;
  content: string | Uint8Array;
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

export function computeCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    const index = (crc ^ bytes[i]) & 0xff;
    crc = (crc >>> 8) ^ CRC32_TABLE[index];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16LE(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value & 0xffff, true);
}

function writeUint32LE(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value >>> 0, true);
}

/**
 * Generates a standards-compliant PKZIP (Store / Method 0) binary archive in memory.
 * Used both by the Pill File Tray ("Export as ZIP") and the Native WinUI 3 Project exporter.
 */
export function createZipArchive(entries: ZipFileEntry[]): Uint8Array<ArrayBuffer> {
  const encoder = new TextEncoder();
  const prepared = entries.map((entry) => {
    const cleanPath = entry.path.replace(/^\/+/, '');
    const nameBytes = encoder.encode(cleanPath);
    const dataBytes =
      typeof entry.content === 'string' ? encoder.encode(entry.content) : entry.content;
    const crc = computeCrc32(dataBytes);
    return { nameBytes, dataBytes, crc };
  });

  let localSectionBytes = 0;
  let centralDirectoryBytes = 0;

  for (const item of prepared) {
    localSectionBytes += 30 + item.nameBytes.length + item.dataBytes.length;
    centralDirectoryBytes += 46 + item.nameBytes.length;
  }

  const totalBytes = localSectionBytes + centralDirectoryBytes + 22;
  const output = new Uint8Array(totalBytes);
  const view = new DataView(output.buffer);

  const dosTime = (12 << 11) | (0 << 5) | 0;
  const dosDate = ((2026 - 1980) << 9) | (11 << 5) | 11;

  let localOffset = 0;
  const offsets: number[] = [];

  for (const item of prepared) {
    offsets.push(localOffset);
    // Local file header signature (0x04034b50)
    writeUint32LE(view, localOffset, 0x04034b50);
    writeUint16LE(view, localOffset + 4, 20); // Version needed: 2.0
    writeUint16LE(view, localOffset + 6, 0x0800); // UTF-8 filename flag
    writeUint16LE(view, localOffset + 8, 0); // Store method (uncompressed)
    writeUint16LE(view, localOffset + 10, dosTime);
    writeUint16LE(view, localOffset + 12, dosDate);
    writeUint32LE(view, localOffset + 14, item.crc);
    writeUint32LE(view, localOffset + 18, item.dataBytes.length);
    writeUint32LE(view, localOffset + 22, item.dataBytes.length);
    writeUint16LE(view, localOffset + 26, item.nameBytes.length);
    writeUint16LE(view, localOffset + 28, 0);

    output.set(item.nameBytes, localOffset + 30);
    output.set(item.dataBytes, localOffset + 30 + item.nameBytes.length);
    localOffset += 30 + item.nameBytes.length + item.dataBytes.length;
  }

  const centralStart = localOffset;
  let centralCursor = centralStart;

  for (let i = 0; i < prepared.length; i++) {
    const item = prepared[i];
    // Central directory file header signature (0x02014b50)
    writeUint32LE(view, centralCursor, 0x02014b50);
    writeUint16LE(view, centralCursor + 4, 20);
    writeUint16LE(view, centralCursor + 6, 20);
    writeUint16LE(view, centralCursor + 8, 0x0800);
    writeUint16LE(view, centralCursor + 10, 0);
    writeUint16LE(view, centralCursor + 12, dosTime);
    writeUint16LE(view, centralCursor + 14, dosDate);
    writeUint32LE(view, centralCursor + 16, item.crc);
    writeUint32LE(view, centralCursor + 20, item.dataBytes.length);
    writeUint32LE(view, centralCursor + 24, item.dataBytes.length);
    writeUint16LE(view, centralCursor + 28, item.nameBytes.length);
    writeUint16LE(view, centralCursor + 30, 0);
    writeUint16LE(view, centralCursor + 32, 0);
    writeUint16LE(view, centralCursor + 34, 0);
    writeUint16LE(view, centralCursor + 36, 0);
    writeUint32LE(view, centralCursor + 38, 0);
    writeUint32LE(view, centralCursor + 42, offsets[i]);

    output.set(item.nameBytes, centralCursor + 46);
    centralCursor += 46 + item.nameBytes.length;
  }

  // End of central directory record (0x06054b50)
  writeUint32LE(view, centralCursor, 0x06054b50);
  writeUint16LE(view, centralCursor + 4, 0);
  writeUint16LE(view, centralCursor + 6, 0);
  writeUint16LE(view, centralCursor + 8, prepared.length);
  writeUint16LE(view, centralCursor + 10, prepared.length);
  writeUint32LE(view, centralCursor + 12, centralDirectoryBytes);
  writeUint32LE(view, centralCursor + 16, centralStart);
  writeUint16LE(view, centralCursor + 20, 0);

  return output;
}
