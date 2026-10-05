import { NextRequest, NextResponse } from 'next/server';
import {
  requireOwner,
  mutationError,
} from '@/features/catalog/extensions/mutation';
import { uploadAndAttachMenuImage } from '@/features/catalog/images/service';
import { MAX_IMAGE_BYTES } from '@/features/catalog/images/validation';
import { CatalogError } from '@/features/catalog/types';
export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  try {
    if (request.headers.get('origin') !== request.nextUrl.origin)
      throw new CatalogError('forbidden');
    await requireOwner();
    const length = request.headers.get('content-length');
    if (length && (!/^\d+$/.test(length) || Number(length) > MAX_IMAGE_BYTES))
      throw new CatalogError('invalid_input');
    if (!request.body) throw new CatalogError('invalid_input');
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > MAX_IMAGE_BYTES) {
        await reader.cancel();
        throw new CatalogError('invalid_input');
      }
      chunks.push(value);
    }
    const result = await uploadAndAttachMenuImage({
      itemId: request.headers.get('x-item-id') ?? '',
      expectedVersion: Number(request.headers.get('x-expected-version')),
      bytes: Buffer.concat(chunks),
      mime: request.headers.get('content-type') ?? '',
    });
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    const state = mutationError(error);
    return NextResponse.json(state, {
      status:
        state.error === 'forbidden'
          ? 403
          : state.error === 'conflict'
            ? 409
            : state.error === 'invalid_input'
              ? 400
              : 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
