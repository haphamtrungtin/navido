'use client';
import { useActionState, useId, useState } from 'react';
import type { CatalogCategory } from '../types';
import { saveMenuCategory } from '../actions';
import { MutationError, NameFields } from './form-fields';
export function CategoryForm({ category }: { category?: CatalogCategory }) {
  return <CategoryFormFields key={category?.id ?? 'new'} category={category} />;
}
function CategoryFormFields({ category }: { category?: CatalogCategory }) {
  const prefix = useId();
  const [draft, setDraft] = useState(() => ({
    name: { ...(category?.name ?? { vi: '', en: '', ko: '' }) },
    sortOrder: String(category?.sortOrder ?? 0),
    expectedVersion: category?.version ?? 0,
  }));
  // Advance only when every mutable field matches the refreshed server record.
  // Otherwise preserve the complete draft and its original concurrency version.
  if (
    category &&
    category.version > draft.expectedVersion &&
    (['vi', 'en', 'ko'] as const).every(
      (locale) => draft.name[locale].trim() === category.name[locale],
    ) &&
    draft.sortOrder.trim() !== '' &&
    Number(draft.sortOrder) === category.sortOrder
  ) {
    setDraft({ ...draft, expectedVersion: category.version });
  }
  const [state, action, pending] = useActionState(saveMenuCategory, {
    error: null,
  });
  return (
    <form action={action} className="admin-form">
      {category && (
        <>
          <input type="hidden" name="id" value={category.id} />
          <input
            type="hidden"
            name="expectedVersion"
            value={draft.expectedVersion}
          />
        </>
      )}
      <NameFields
        prefix={prefix}
        name={category ? draft.name : undefined}
        onChange={
          category
            ? (locale, value) =>
                setDraft((current) => ({
                  ...current,
                  name: { ...current.name, [locale]: value },
                }))
            : undefined
        }
        disabled={pending}
      />
      <label htmlFor={`${prefix}-sort`}>
        Thứ tự danh mục
        <input
          id={`${prefix}-sort`}
          type="number"
          name="sortOrder"
          min={-2147483648}
          max={2147483647}
          step={1}
          {...(category
            ? {
                value: draft.sortOrder,
                onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                  setDraft((current) => ({
                    ...current,
                    sortOrder: event.target.value,
                  })),
              }
            : { defaultValue: 0 })}
          disabled={pending}
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
