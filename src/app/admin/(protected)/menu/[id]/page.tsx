import { getAdminAccess } from '@/features/admin-auth/access';
import { getCatalogItem, listCatalog } from '@/features/catalog/repository';
import { ItemForm } from '@/features/catalog/components/item-form';
import { AvailabilityForm } from '@/features/catalog/components/availability-form';
import {
  CatalogUnavailable,
  MenuNotice,
} from '@/features/catalog/components/menu-list';
export default async function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await getAdminAccess();
  if (access.status !== 'allowed') return null;
  const { id } = await params;
  const result = await getCatalogItem(id)
    .then((item) => ({ item }))
    .catch(() => null);
  if (!result) return <CatalogUnavailable />;
  const { item } = result;
  if (!item) return <p role="alert">Không tìm thấy món.</p>;
  if (access.actor.role !== 'owner')
    return (
      <>
        <h1>{item.name.vi}</h1>
        <MenuNotice />
        <p>
          {item.priceVnd.toLocaleString('vi-VN')} ₫ ·{' '}
          {item.isAvailable ? 'Còn bán' : 'Tạm hết'}
        </p>
        <AvailabilityForm item={item} />
        <p>Chỉ chủ quán được sửa nội dung và giá.</p>
      </>
    );
  const catalog = await listCatalog({}).catch(() => null);
  if (!catalog) return <CatalogUnavailable />;
  return (
    <>
      <h1>Sửa món · {item.name.vi}</h1>
      <MenuNotice />
      <ItemForm item={item} categories={catalog.categories} />
    </>
  );
}
