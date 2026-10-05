import 'server-only';
import { cache } from 'react';
import { createPublicSupabaseClient } from '@/lib/supabase/public';
import { parsePublishedMenu } from '../domain/published-menu';

export const getPublishedMenu = cache(async () => {
  const client = createPublicSupabaseClient();
  const result = await client.rpc('get_published_menu');
  if (result.error) throw new Error('Menu unavailable');
  return parsePublishedMenu(result.data);
});
