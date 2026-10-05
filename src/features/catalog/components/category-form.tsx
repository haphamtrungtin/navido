'use client';
import { useActionState, useId, useState } from 'react';
import type { CatalogCategory } from '../types';
import { saveMenuCategory } from '../actions';
import { MutationError, NameFields } from './form-fields';
export function CategoryForm({ category }: { category?: CatalogCategory }) {
  const prefix = useId();
  // Keep the version paired with this draft until an explicit page reload.
  const [expectedVersion] = useState(category?.version);
  const [state, action, pending] = useActionState(saveMenuCategory, {
    error: null,
  });
  return (
    <form action={action} className="admin-form">
      {category && (
        <>
          <input type="hidden" name="id" value={category.id} />
          <input type="hidden" name="expectedVersion" value={expectedVersion} />
        </>
      )}
      <NameFields prefix={prefix} name={category?.name} />
      <label htmlFor={`${prefix}-sort`}>
        Thứ tự danh mục
        <input
          id={`${prefix}-sort`}
          type="number"
          name="sortOrder"
          min={-2147483648}
          max={2147483647}
          step={1}
          defaultValue={category?.sortOrder ?? 0}
          required
        />
      </label>
      <MutationError state={state} />
      <button disabled={pending}>
        {pending ? 'Đang lưu…' : category ? 'Lưu danh mục' : 'Thêm danh mục'}
      </button>
    </form>
  );
}
