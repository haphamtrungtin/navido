import { getAdminAccess } from '@/features/admin-auth/access';
import { listCatalog } from '@/features/catalog/repository';
import {
  CatalogUnavailable,
  MenuList,
} from '@/features/catalog/components/menu-list';
import type { CatalogFilters } from '@/features/catalog/types';
export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const access = await getAdminAccess();
  if (access.status !== 'allowed') return null;
  const params = await searchParams;
  const publicationStatus =
    params.publicationStatus === 'draft' ||
    params.publicationStatus === 'published' ||
    params.publicationStatus === 'archived'
      ? params.publicationStatus
      : undefined;
  const filters: CatalogFilters = {
    query: typeof params.query === 'string' ? params.query : undefined,
    categoryId:
      typeof params.categoryId === 'string' ? params.categoryId : undefined,
    publicationStatus,
    needsReview: params.needsReview === 'true' ? true : undefined,
  };
  const catalog = await listCatalog(filters).catch(() => null);
  if (!catalog) return <CatalogUnavailable />;
  return <MenuList {...catalog} filters={filters} role={access.actor.role} />;
}
