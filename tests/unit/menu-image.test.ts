// @vitest-environment node
import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { normalizeMenuImage } from '@/features/catalog/images/validation';
describe('real menu image decode', () => {
  it('normalizes a large PNG to WebP within 1600px without metadata', async () => {
    const input = await sharp({
      create: { width: 1800, height: 100, channels: 3, background: 'red' },
    })
      .png()
      .toBuffer();
    const output = await normalizeMenuImage(input, 'image/png');
    const meta = await sharp(output).metadata();
    expect(meta.format).toBe('webp');
    expect(meta.width).toBe(1600);
    expect(meta.exif).toBeUndefined();
  });
  it('rejects MIME spoofing, corrupt bytes and unapproved formats', async () => {
    const png = await sharp({
      create: { width: 2, height: 2, channels: 3, background: 'red' },
    })
      .png()
      .toBuffer();
    await expect(normalizeMenuImage(png, 'image/jpeg')).rejects.toThrow();
    await expect(
      normalizeMenuImage(Buffer.from('<svg/>'), 'image/png'),
    ).rejects.toThrow();
    await expect(normalizeMenuImage(png, 'image/svg+xml')).rejects.toThrow();
  });
  it('rejects input beyond 3 MiB or 16 megapixels', async () => {
    await expect(
      normalizeMenuImage(Buffer.alloc(3 * 1024 * 1024 + 1), 'image/png'),
    ).rejects.toThrow();
    const large = await sharp({
      create: { width: 4100, height: 4000, channels: 3, background: 'red' },
    })
      .png()
      .toBuffer();
    await expect(normalizeMenuImage(large, 'image/png')).rejects.toThrow();
  });
});
