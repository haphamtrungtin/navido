'use server';
import { createActionSupabaseClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/features/admin-auth/access';
import { CatalogError } from '../types';
import { VersionSchema } from '../schemas';
import {
  DescriptionSchema,
  OptionGroupsSchema,
  OrderSettingsSchema,
} from './schemas';
import {
  requireOwner,
  checkMutation,
  mutationError,
  refreshCatalog,
  formNumber,
  formJson,
  type ExtensionActionState,
} from './mutation';
import type { Json } from '@/lib/supabase/database.types';
export async function saveItemExtensions(
  _state: ExtensionActionState,
  form: FormData,
): Promise<ExtensionActionState> {
  try {
    await requireOwner();
    const id = form.get('id');
    if (typeof id !== 'string' || !id || id.length > 160)
      throw new CatalogError('invalid_input');
    const version = VersionSchema.safeParse(
      formNumber(form, 'expectedVersion'),
    );
    const description = DescriptionSchema.safeParse({
      vi: form.get('descriptionVi'),
      en: form.get('descriptionEn'),
      ko: form.get('descriptionKo'),
    });
    const groups = OptionGroupsSchema.safeParse(
      formJson(form, 'groups', 150000),
    );
    if (!version.success || !description.success || !groups.success)
      throw new CatalogError('invalid_input');
    const client = await createActionSupabaseClient();
    const result = await client.rpc('save_menu_item_extensions', {
      p_item_id: id,
      p_expected_version: version.data,
      p_vi: description.data.vi,
      p_en: description.data.en,
      p_ko: description.data.ko,
      p_groups: groups.data as Json,
    });
    checkMutation(result.error);
    refreshCatalog();
    return { error: null, savedVersion: result.data! };
  } catch (error) {
    return { ...mutationError(error), savedVersion: _state.savedVersion };
  }
}
export async function saveOrderSettings(
  _state: ExtensionActionState,
  form: FormData,
): Promise<ExtensionActionState> {
  try {
    await requireOwner();
    const version = VersionSchema.safeParse(
      formNumber(form, 'expectedVersion'),
    );
    const settings = OrderSettingsSchema.safeParse({
      preparationMinutes: formNumber(form, 'preparationMinutes'),
      paused: form.get('paused') === 'on',
      days: formJson(form, 'days', 5000),
    });
    if (!version.success || !settings.success)
      throw new CatalogError('invalid_input');
    const client = await createActionSupabaseClient();
    const result = await client.rpc('save_order_settings', {
      p_expected_version: version.data,
      p_preparation_minutes: settings.data.preparationMinutes,
      p_paused: settings.data.paused,
      p_days: settings.data.days as Json,
    });
    checkMutation(result.error);
    refreshCatalog();
    return { error: null, savedVersion: result.data! };
  } catch (error) {
    return { ...mutationError(error), savedVersion: _state.savedVersion };
  }
}
export async function setOrdersPaused(
  _state: ExtensionActionState,
  form: FormData,
): Promise<ExtensionActionState> {
  try {
    await requireAdmin();
    const version = VersionSchema.safeParse(
      formNumber(form, 'expectedVersion'),
    );
    const paused = form.get('paused');
    if (!version.success || !['true', 'false'].includes(String(paused)))
      throw new CatalogError('invalid_input');
    const client = await createActionSupabaseClient();
    const result = await client.rpc('set_orders_paused', {
      p_expected_version: version.data,
      p_paused: paused === 'true',
    });
    checkMutation(result.error);
    refreshCatalog();
    return { error: null, savedVersion: result.data! };
  } catch (error) {
    return mutationError(error);
  }
}
