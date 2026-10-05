'use client';
import type { CatalogItem } from '../types';
import { useActionState } from 'react';
import { setMenuAvailability } from '../actions';
import { MutationError } from './form-fields';
export function AvailabilityForm({ item }: { item: CatalogItem }) {
  const [state, action, pending] = useActionState(setMenuAvailability, {
    error: null,
  });
  return (
    <form action={action}>
      <input name="id" type="hidden" value={item.id} />
      <input name="expectedVersion" type="hidden" value={item.version} />
      <input
        name="isAvailable"
        type="hidden"
        value={String(!item.isAvailable)}
      />
      <button disabled={pending}>
        {pending
          ? 'Đang lưu…'
          : item.isAvailable
            ? 'Đánh dấu tạm hết'
            : 'Đánh dấu còn bán'}
      </button>
      <MutationError state={state} />
    </form>
  );
}
