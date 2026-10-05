import { getAdminAccess } from '@/features/admin-auth/access';
import { listCatalog } from '@/features/catalog/repository';
import { ItemForm } from '@/features/catalog/components/item-form';
import {
  CatalogUnavailable,
  MenuNotice,
} from '@/features/catalog/components/menu-list';
export default async function NewMenuItemPage() {
  const access = await getAdminAccess();
  if (access.status !== 'allowed') return null;
  if (access.actor.role !== 'owner')
    return <p role="alert">Chỉ chủ quán được thêm món.</p>;
  const catalog = await listCatalog({}).catch(() => null);
  if (!catalog) return <CatalogUnavailable />;
  const { categories } = catalog;
  return (
    <>
      <h1>Thêm món</h1>
      <MenuNotice />
      {categories.length === 0 && <p>Tạo danh mục trước khi thêm món.</p>}
      <ItemForm categories={categories} />
    </>
  );
}
