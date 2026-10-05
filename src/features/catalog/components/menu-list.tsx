import Link from 'next/link';
import type { CatalogCategory, CatalogFilters, CatalogItem } from '../types';
import { AvailabilityForm } from './availability-form';
const statuses = {
  draft: 'Nháp',
  published: 'Đã công bố trong DB',
  archived: 'Lưu trữ',
};
export function MenuNotice() {
  return (
    <p className="admin-notice">
      Website hiện vẫn dùng menu từ file; thay đổi tại đây chưa xuất hiện trên
      website.
    </p>
  );
}
export function CatalogUnavailable() {
  return (
    <p role="alert">
      Dịch vụ menu tạm thời không khả dụng. Vui lòng tải lại trang sau ít phút.
    </p>
  );
}
export function MenuList({
  categories,
  items,
  role,
  filters,
}: {
  categories: CatalogCategory[];
  items: CatalogItem[];
  role: 'owner' | 'staff';
  filters: CatalogFilters;
}) {
  return (
    <>
      <MenuNotice />
      <div className="admin-toolbar">
        <h1>Menu · {items.length} món</h1>
        {role === 'owner' && (
          <Link className="admin-button" href="/admin/menu/new">
            Thêm món
          </Link>
        )}
      </div>
      <form className="admin-filters" method="get" action="/admin/menu">
        <label>
          Tìm món
          <input
            name="query"
            defaultValue={filters.query}
            placeholder="Tên món VI / EN / KO"
            maxLength={300}
          />
        </label>
        <label>
          Danh mục
          <select name="categoryId" defaultValue={filters.categoryId ?? ''}>
            <option value="">Tất cả</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name.vi}
              </option>
            ))}
          </select>
        </label>
        <label>
          Trạng thái
          <select
            name="publicationStatus"
            defaultValue={filters.publicationStatus ?? ''}
          >
            <option value="">Tất cả</option>
            <option value="draft">Nháp</option>
            <option value="published">Đã công bố trong DB</option>
            <option value="archived">Lưu trữ</option>
          </select>
        </label>
        <label>
          <input
            name="needsReview"
            type="checkbox"
            value="true"
            defaultChecked={filters.needsReview === true}
          />
          Cần rà soát
        </label>
        <button>Lọc</button>
        <Link href="/admin/menu">Bỏ lọc</Link>
      </form>
      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Món</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Còn bán</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link href={`/admin/menu/${encodeURIComponent(item.id)}`}>
                    {item.name.vi}
                  </Link>
                  {item.needsReview && <small>Cần rà soát</small>}
                </td>
                <td>
                  {
                    categories.find(
                      (category) => category.id === item.categoryId,
                    )?.name.vi
                  }
                </td>
                <td>{item.priceVnd.toLocaleString('vi-VN')} ₫</td>
                <td>{statuses[item.publicationStatus]}</td>
                <td>
                  <small>{item.isAvailable ? 'Còn bán' : 'Tạm hết'}</small>
                  <AvailabilityForm item={item} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length === 0 && <p>Không có món phù hợp bộ lọc.</p>}
    </>
  );
}
