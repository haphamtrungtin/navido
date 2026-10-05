import 'server-only';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/features/admin-auth/access';
import { AdminAccessError } from '@/features/admin-auth/types';
import { CatalogError, type CatalogActionState } from '../types';
export type ExtensionActionState = CatalogActionState & {
  savedVersion?: number;
};
export async function requireOwner() {
  const admin = await requireAdmin();
  if (admin.role !== 'owner') throw new CatalogError('forbidden');
  return admin;
}
export function mutationError(error: unknown): ExtensionActionState {
  if (error instanceof CatalogError) return { error: error.code };
  if (error instanceof AdminAccessError)
    return {
      error: error.status === 'unavailable' ? 'unavailable' : 'forbidden',
    };
  return { error: 'unavailable' };
}
export function checkMutation(error: { code: string; message: string } | null) {
  if (!error) return;
  if (error.code === '42501') throw new CatalogError('forbidden');
  if (
    ['23514', '23502', '22003', '22P02'].includes(error.code) ||
    error.message === 'catalog_invalid_input'
  )
    throw new CatalogError('invalid_input');
  if (error.message === 'catalog_conflict') throw new CatalogError('conflict');
  if (error.message === 'catalog_not_found')
    throw new CatalogError('not_found');
  throw new CatalogError('unavailable');
}
export function refreshCatalog() {
  revalidatePath('/admin/menu');
  revalidatePath('/admin/menu/preview');
  revalidatePath('/admin/menu/[id]', 'page');
  revalidatePath('/admin/settings');
  for (const locale of ['vi', 'en', 'ko']) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/menu`);
    revalidatePath(`/${locale}/roastery`);
  }
}
export function formNumber(form: FormData, key: string) {
  const v = form.get(key);
  return typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
}
export function formJson(form: FormData, key: string, max: number): unknown {
  const value = form.get(key);
  if (typeof value !== 'string' || value.length > max)
    throw new CatalogError('invalid_input');
  try {
    return JSON.parse(value);
  } catch {
    throw new CatalogError('invalid_input');
  }
}
