import { getCatalogPreview } from '@/features/catalog/repository';
import {
  CatalogUnavailable,
  MenuNotice,
} from '@/features/catalog/components/menu-list';
export default async function MenuPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = lang === 'en' || lang === 'ko' ? lang : 'vi';
  const catalog = await getCatalogPreview().catch(() => null);
  if (!catalog) return <CatalogUnavailable />;
  const { categories, items } = catalog;
  return (
    <>
      <h1>Xem trước menu DB</h1>
      <MenuNotice />
      <form method="get">
        <label>
          Ngôn ngữ
          <select name="lang" defaultValue={locale}>
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
            <option value="ko">한국어</option>
          </select>
        </label>
        <button>Xem</button>
      </form>
      {categories.map((category) => (
        <section className="admin-card" key={category.id}>
          <h2>{category.name[locale] || category.name.vi}</h2>
          {items
            .filter((item) => item.categoryId === category.id)
            .map((item) => (
              <p key={item.id}>
                {item.name[locale] || item.name.vi} ·{' '}
                {item.priceVnd.toLocaleString('vi-VN')} ₫{' '}
                {!item.isAvailable && <strong>· Tạm hết</strong>}
              </p>
            ))}
        </section>
      ))}
      {items.length === 0 && <p>Chưa có món được công bố trong DB.</p>}
    </>
  );
}
