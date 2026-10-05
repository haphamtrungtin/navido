import 'server-only';
import { randomUUID } from 'node:crypto';
import { createActionSupabaseClient } from '@/lib/supabase/server';
import { CatalogError } from '../types';
import { VersionSchema } from '../schemas';
import {
  requireOwner,
  checkMutation,
  refreshCatalog,
} from '../extensions/mutation';
import { normalizeMenuImage } from './validation';
export async function uploadAndAttachMenuImage({
  itemId,
  expectedVersion,
  bytes,
  mime,
}: {
  itemId: string;
  expectedVersion: number;
  bytes: Buffer;
  mime: string;
}) {
  const owner = await requireOwner();
  if (
    !itemId ||
    itemId.length > 160 ||
    !VersionSchema.safeParse(expectedVersion).success
  )
    throw new CatalogError('invalid_input');
  const normalized = await normalizeMenuImage(bytes, mime);
  const client = await createActionSupabaseClient();
  const storage = client.storage.from('menu-images');
  const key = `${owner.userId}/${randomUUID()}.webp`;
  const uploaded = await storage.upload(key, normalized, {
    contentType: 'image/webp',
    upsert: false,
    cacheControl: '31536000',
  });
  if (uploaded.error) throw new CatalogError('unavailable');
  try {
    const attached = await client.rpc('set_menu_item_image', {
      p_item_id: itemId,
      p_expected_version: expectedVersion,
      p_path: key,
    });
    checkMutation(attached.error);
    refreshCatalog();
    return { version: attached.data!, imagePath: key };
  } catch (error) {
    // Best effort: revoked owners may no longer be able to remove the orphan.
    // Storage DELETE policy refuses deletion if the attachment actually committed.
    await storage.remove([key]).catch(() => undefined);
    throw error;
  }
}
