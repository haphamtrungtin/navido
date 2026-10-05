import 'server-only';
import sharp from 'sharp';
import { CatalogError } from '../types';
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const formats: Record<string, string> = {
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
};
export async function normalizeMenuImage(
  bytes: Buffer,
  mime: string,
): Promise<Buffer> {
  if (!formats[mime] || bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES)
    throw new CatalogError('invalid_input');
  try {
    const decoder = sharp(bytes, {
      limitInputPixels: 16000000,
      failOn: 'warning',
    });
    const metadata = await decoder.metadata();
    if (
      metadata.format !== formats[mime] ||
      !metadata.width ||
      !metadata.height ||
      (metadata.pages ?? 1) > 1
    )
      throw new Error();
    const output = await decoder
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();
    if (output.length > MAX_IMAGE_BYTES) throw new Error();
    return output;
  } catch {
    throw new CatalogError('invalid_input');
  }
}
