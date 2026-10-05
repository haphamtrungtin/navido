'use client';
import type { CatalogCategory, CatalogItem } from '../types';
import { useActionState, useId, useState } from 'react';
import { saveMenuItem } from '../actions';
import { MutationError, NameFields } from './form-fields';
export function ItemForm({
  item,
  categories,
}: {
  item?: CatalogItem;
  categories: CatalogCategory[];
}) {
  const [state, action, pending] = useActionState(saveMenuItem, {
    error: null,
  });
  const prefix = useId();
  // Refreshed props must not advance the version of an unsaved draft.
  const [expectedVersion] = useState(item?.version);
  return (
    <form action={action} className="admin-form">
      {item && (
        <>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="expectedVersion" value={expectedVersion} />
        </>
      )}
      <NameFields prefix={prefix} name={item?.name} />
      <label htmlFor={`${prefix}-category`}>
        Danh mục
        <select
          id={`${prefix}-category`}
          name="categoryId"
          defaultValue={item?.categoryId ?? categories[0]?.id}
          required
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name.vi}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor={`${prefix}-price`}>
        Giá (VND)
        <input
          id={`${prefix}-price`}
          name="priceVnd"
          type="number"
          min={0}
          max={2147483647}
          step={1}
          defaultValue={item?.priceVnd ?? ''}
          required
        />
      </label>
      <label htmlFor={`${prefix}-sort`}>
        Thứ tự
        <input
          id={`${prefix}-sort`}
          name="sortOrder"
          type="number"
          min={-2147483648}
          max={2147483647}
          step={1}
          defaultValue={item?.sortOrder ?? 0}
          required
        />
      </label>
      <label htmlFor={`${prefix}-weight`}>
        Trọng lượng (gram, nếu có)
        <input
          id={`${prefix}-weight`}
          name="netWeightGram"
          type="number"
          min={1}
          max={2147483647}
          step={1}
          defaultValue={item?.netWeightGram ?? ''}
        />
      </label>
      <label htmlFor={`${prefix}-publication`}>
        Trạng thái công bố
        <select
          id={`${prefix}-publication`}
          name="publicationStatus"
          defaultValue={item?.publicationStatus ?? 'draft'}
        >
          <option value="draft">Nháp</option>
          <option value="published">Đã công bố trong DB</option>
          <option value="archived">Lưu trữ / ngừng dùng</option>
        </select>
      </label>
      <label>
        <input
          name="isAvailable"
          type="checkbox"
          defaultChecked={item?.isAvailable ?? true}
        />
        Còn bán
      </label>
      <label>
        <input
          name="needsReview"
          type="checkbox"
          defaultChecked={item?.needsReview ?? false}
        />
        Cần rà soát nội dung / bản dịch
      </label>
      {item?.sourceRow !== null && item?.sourceRow !== undefined && (
        <aside className="admin-notice">
          <p>
            Dòng nguồn: {item.sourceRow} · {item.sourceCategoryCode}
          </p>
          <p>Tên nguồn: {item.sourceName}</p>
          <small>Thông tin nguồn được giữ để đối chiếu.</small>
          {item.reviewNotes.length > 0 && (
            <ul>
              {item.reviewNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          )}
        </aside>
      )}
      <MutationError state={state} />
      <button disabled={pending || categories.length === 0}>
        {pending ? 'Đang lưu…' : 'Lưu món'}
      </button>
    </form>
  );
}
