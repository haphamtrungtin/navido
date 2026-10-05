import 'server-only';
import { requireAdmin } from '@/features/admin-auth/access';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CatalogError } from '../types';
import {
  DescriptionSchema,
  OptionGroupsSchema,
  OrderSettingsSchema,
} from './schemas';
export async function getItemExtensions(id: string) {
  await requireAdmin();
  const client = await createServerSupabaseClient();
  const { data, error } = await client
    .from('menu_items')
    .select(
      'id,version,description_vi,description_en,description_ko,option_groups',
    )
    .eq('id', id)
    .maybeSingle();
  if (error || !data)
    throw new CatalogError(error ? 'unavailable' : 'not_found');
  return {
    itemId: data.id,
    version: data.version,
    description: DescriptionSchema.parse({
      vi: data.description_vi,
      en: data.description_en,
      ko: data.description_ko,
    }),
    groups: OptionGroupsSchema.parse(data.option_groups),
  };
}
export async function getOrderSettings() {
  await requireAdmin();
  const client = await createServerSupabaseClient();
  const { data, error } = await client
    .from('store_order_settings')
    .select('version,preparation_minutes,paused,days')
    .eq('id', 'store')
    .single();
  if (error || !data) throw new CatalogError('unavailable');
  return {
    ...OrderSettingsSchema.parse({
      preparationMinutes: data.preparation_minutes,
      paused: data.paused,
      days: data.days,
    }),
    version: data.version,
  };
}
