import { getAdminAccess } from '@/features/admin-auth/access';
import { listCatalog } from '@/features/catalog/repository';
import { CategoryForm } from '@/features/catalog/components/category-form';
import {
  CatalogUnavailable,
  MenuNotice,
} from '@/features/catalog/components/menu-list';
export default async function CategoriesPage() {
  const access = await getAdminAccess();
  if (access.status !== 'allowed') return null;
  const catalog = await listCatalog({}).catch(() => null);
  if (!catalog) return <CatalogUnavailable />;
  const { categories } = catalog;
  return (
    <>
      <h1>Danh mục menu</h1>
      <MenuNotice />
      {access.actor.role === 'owner' && (
        <section className="admin-card">
          <h2>Thêm danh mục</h2>
          <CategoryForm />
        </section>
      )}
      {categories.map((category) => (
        <details key={category.id} className="admin-card">
          <summary>
            {category.name.vi} · Thứ tự {category.sortOrder}
          </summary>
          {access.actor.role === 'owner' ? (
            <CategoryForm category={category} />
          ) : (
            <p>Chỉ chủ quán được sửa danh mục.</p>
          )}
        </details>
      ))}
    </>
  );
}
