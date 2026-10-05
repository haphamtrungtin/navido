import 'server-only';
import { cache } from 'react';
import { createPublicSupabaseClient } from '@/lib/supabase/public';
import { parsePublishedMenu } from '../domain/published-menu';
import { getSupabaseServerEnv } from '@/lib/server-env';
import { isMenuImageAsset } from '@/features/catalog/images/assets';

export const getPublishedMenu = cache(async () => {
  const client = createPublicSupabaseClient();
  const result = await client.rpc('get_published_menu');
  if (result.error) throw new Error('Menu unavailable');
  const menu = parsePublishedMenu(result.data);
  const { url } = getSupabaseServerEnv();
  return {
    ...menu,
    items: menu.items.map((item) => ({
      ...item,
      imageUrl: item.imagePath
        ? isMenuImageAsset(item.imagePath)
          ? item.imagePath
          : new URL(
              `/storage/v1/object/public/menu-images/${item.imagePath}`,
              url,
            ).href
        : undefined,
    })),
  };
});
