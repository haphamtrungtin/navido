'use server';
import { createActionSupabaseClient } from '@/lib/supabase/server';
import { VersionSchema } from '../schemas';
import { CatalogError } from '../types';
import {
  requireOwner,
  checkMutation,
  mutationError,
  refreshCatalog,
  formNumber,
  type ExtensionActionState,
} from '../extensions/mutation';
import { isMenuImageAsset } from './assets';
export async function selectMenuImageAsset(
  state: ExtensionActionState,
  form: FormData,
): Promise<ExtensionActionState> {
  try {
    await requireOwner();
    const id = form.get('id');
    const value = form.get('imagePath');
    const version = VersionSchema.safeParse(
      formNumber(form, 'expectedVersion'),
    );
    if (
      typeof id !== 'string' ||
      !id ||
      id.length > 160 ||
      typeof value !== 'string' ||
      (value !== '' && !isMenuImageAsset(value)) ||
      !version.success
    )
      throw new CatalogError('invalid_input');
    const client = await createActionSupabaseClient();
    const result = await client.rpc('set_menu_item_image', {
      p_item_id: id,
      p_expected_version: version.data,
      p_path: value,
    });
    checkMutation(result.error);
    refreshCatalog();
    return { error: null, savedVersion: result.data! };
  } catch (error) {
    return { ...mutationError(error), savedVersion: state.savedVersion };
  }
}
