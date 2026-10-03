import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

// Generate a valid uncompressed / deflate-compressed PNG
function createSolidColorPng(width, height, r, g, b, a = 255) {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression method: 0
  ihdrData[11] = 0; // Filter method: 0
  ihdrData[12] = 0; // Interlace method: 0
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with filter byte (0) per scanline
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      // Draw dark background with cyan center icon design
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = width * 0.45;

      if (dist < radius) {
        // Inner badge
        if (dist < width * 0.15) {
          rawData[pxOffset] = 56;   // R
          rawData[pxOffset + 1] = 189; // G
          rawData[pxOffset + 2] = 248; // B (Cyan)
          rawData[pxOffset + 3] = 255;
        } else if (dist < width * 0.35 && (Math.abs(dx) + Math.abs(dy) < width * 0.38)) {
          rawData[pxOffset] = 168; // R
          rawData[pxOffset + 1] = 85;  // G
          rawData[pxOffset + 2] = 247; // B (Purple)
          rawData[pxOffset + 3] = 255;
        } else {
          rawData[pxOffset] = 12;  // R
          rawData[pxOffset + 1] = 18;  // G
          rawData[pxOffset + 2] = 32;  // B (Obsidian)
          rawData[pxOffset + 3] = 255;
        }
      } else {
        // Border
        rawData[pxOffset] = 5;
        rawData[pxOffset + 1] = 7;
        rawData[pxOffset + 2] = 12;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  // Compress IDAT
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 implementation
function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createSolidColorPng(192, 192));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createSolidColorPng(512, 512));
fs.writeFileSync(path.join(publicDir, 'icon-maskable-512.png'), createSolidColorPng(512, 512));

console.log('PNG icons created successfully!');
