'use server';
import type { CatalogActionState } from './types';
import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/features/admin-auth/access';
import { AdminAccessError } from '@/features/admin-auth/types';
import { createActionSupabaseClient } from '@/lib/supabase/server';
import { CatalogError } from './types';
import { CategoryInputSchema, ItemInputSchema, VersionSchema } from './schemas';

function number(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
}
function categoryFields(form: FormData) {
  return {
    name: {
      vi: form.get('nameVi'),
      en: form.get('nameEn') ?? '',
      ko: form.get('nameKo') ?? '',
    },
    sortOrder: number(form, 'sortOrder'),
  };
}
function identity(form: FormData) {
  const value = form.get('id');
  if (value !== null && typeof value !== 'string')
    throw new CatalogError('invalid_input');
  const id = String(value ?? '');
  if (id.length > 160) throw new CatalogError('invalid_input');
  const version = id
    ? VersionSchema.safeParse(number(form, 'expectedVersion'))
    : null;
  if (version && !version.success) throw new CatalogError('invalid_input');
  return { id, expectedVersion: version?.success ? version.data : 0 };
}
function fail(error: unknown): CatalogActionState {
  if (error instanceof CatalogError) return { error: error.code };
  if (error instanceof AdminAccessError)
    return {
      error: error.status === 'unavailable' ? 'unavailable' : 'forbidden',
    };
  return { error: 'unavailable' };
}
function checkDb(error: { code: string; message: string } | null) {
  if (!error) return;
  if (error.code === '42501') throw new CatalogError('forbidden');
  if (['23503', '23514', '23502', '22003'].includes(error.code))
    throw new CatalogError('invalid_input');
  if (error.message === 'catalog_conflict') throw new CatalogError('conflict');
  if (error.message === 'catalog_not_found')
    throw new CatalogError('not_found');
  if (error.message === 'catalog_invalid_input')
    throw new CatalogError('invalid_input');
  throw new CatalogError('unavailable');
}
function refresh() {
  for (const path of [
    '/admin/menu',
    '/admin/menu/categories',
    '/admin/menu/preview',
  ])
    revalidatePath(path);
  revalidatePath('/admin/menu/[id]', 'page');
}
async function ensureOwner() {
  const actor = await requireAdmin();
  if (actor.role !== 'owner') throw new CatalogError('forbidden');
}
async function missingUpdate(
  table: 'menu_items' | 'menu_categories',
  id: string,
) {
  await ensureOwner();
  const client = await createActionSupabaseClient();
  const existing = await client
    .from(table)
    .select('id')
    .eq('id', id)
    .maybeSingle();
  checkDb(existing.error);
  throw new CatalogError(existing.data ? 'conflict' : 'not_found');
}

export async function saveMenuItem(
  _state: CatalogActionState,
  form: FormData,
): Promise<CatalogActionState> {
  try {
    await ensureOwner();
    const parsed = ItemInputSchema.safeParse({
      ...categoryFields(form),
      categoryId: form.get('categoryId'),
      priceVnd: number(form, 'priceVnd'),
      publicationStatus: form.get('publicationStatus'),
      isAvailable: form.get('isAvailable') === 'on',
      needsReview: form.get('needsReview') === 'on',
      netWeightGram: form.get('netWeightGram')
        ? number(form, 'netWeightGram')
        : null,
    });
    if (!parsed.success)
      return {
        error: 'invalid_input',
        fieldErrors: Object.fromEntries(
          parsed.error.issues.map((issue) => [
            issue.path.join('.'),
            'Giá trị không hợp lệ.',
          ]),
        ),
      };
    const { id, expectedVersion } = identity(form);
    const input = parsed.data;
    const client = await createActionSupabaseClient();
    const payload = {
      name_vi: input.name.vi,
      name_en: input.name.en,
      name_ko: input.name.ko,
      sort_order: input.sortOrder,
      category_id: input.categoryId,
      price_vnd: input.priceVnd,
      publication_status: input.publicationStatus,
      is_available: input.isAvailable,
      needs_review: input.needsReview,
      net_weight_gram: input.netWeightGram,
    };
    const mutation = id
      ? client
          .from('menu_items')
          .update(payload)
          .eq('id', id)
          .eq('version', expectedVersion)
      : client.from('menu_items').insert({ ...payload, id: randomUUID() });
    const result = await mutation.select('id').maybeSingle();
    checkDb(result.error);
    if (!result.data) await missingUpdate('menu_items', id);
  } catch (error) {
    return fail(error);
  }
  refresh();
  redirect('/admin/menu');
}

export async function saveMenuCategory(
  _state: CatalogActionState,
  form: FormData,
): Promise<CatalogActionState> {
  try {
    await ensureOwner();
    const parsed = CategoryInputSchema.safeParse(categoryFields(form));
    if (!parsed.success)
      return {
        error: 'invalid_input',
        fieldErrors: Object.fromEntries(
          parsed.error.issues.map((issue) => [
            issue.path.join('.'),
            'Giá trị không hợp lệ.',
          ]),
        ),
      };
    const { id, expectedVersion } = identity(form);
    const client = await createActionSupabaseClient();
    const input = parsed.data;
    const payload = {
      name_vi: input.name.vi,
      name_en: input.name.en,
      name_ko: input.name.ko,
      sort_order: input.sortOrder,
    };
    const mutation = id
      ? client
          .from('menu_categories')
          .update(payload)
          .eq('id', id)
          .eq('version', expectedVersion)
      : client.from('menu_categories').insert({ ...payload, id: randomUUID() });
    const result = await mutation.select('id').maybeSingle();
    checkDb(result.error);
    if (!result.data) await missingUpdate('menu_categories', id);
  } catch (error) {
    return fail(error);
  }
  refresh();
  redirect('/admin/menu/categories');
}

export async function setMenuAvailability(
  _state: CatalogActionState,
  form: FormData,
): Promise<CatalogActionState> {
  try {
    await requireAdmin();
    const { id, expectedVersion } = identity(form);
    const available = form.get('isAvailable');
    if (!id || !['true', 'false', 'on'].includes(String(available)))
      throw new CatalogError('invalid_input');
    const client = await createActionSupabaseClient();
    const result = await client.rpc('set_menu_item_availability', {
      p_item_id: id,
      p_is_available: available === 'true' || available === 'on',
      p_expected_version: expectedVersion,
    });
    checkDb(result.error);
  } catch (error) {
    return fail(error);
  }
  refresh();
  redirect('/admin/menu');
}
