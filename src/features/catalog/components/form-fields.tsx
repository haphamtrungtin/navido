'use client';
import type { CatalogActionState } from '../types';
export function NameFields({
  prefix,
  name,
}: {
  prefix: string;
  name?: { vi: string; en: string; ko: string };
}) {
  return (
    <>
      {(
        [
          ['Vi', 'vi', 'Tên tiếng Việt'],
          ['En', 'en', 'Tên tiếng Anh'],
          ['Ko', 'ko', 'Tên tiếng Hàn'],
        ] as const
      ).map(([suffix, locale, label]) => (
        <label key={locale} htmlFor={`${prefix}-${locale}`}>
          {label}
          <input
            id={`${prefix}-${locale}`}
            name={`name${suffix}`}
            defaultValue={name?.[locale] ?? ''}
            maxLength={300}
            required={locale === 'vi'}
          />
        </label>
      ))}
      <small>EN/KO còn trống sẽ dùng tên tiếng Việt khi xem trước.</small>
    </>
  );
}
const errors = {
  invalid_input: 'Vui lòng kiểm tra lại các trường nhập.',
  forbidden: 'Bạn không có quyền thực hiện thao tác này.',
  not_found: 'Bản ghi không còn tồn tại.',
  conflict: 'Bản ghi đã thay đổi. Vui lòng tải lại trang trước khi lưu.',
  unavailable: 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại.',
};
export function MutationError({ state }: { state: CatalogActionState }) {
  if (!state.error) return null;
  return (
    <div role="alert">
      <p>{errors[state.error]}</p>
      {state.fieldErrors && (
        <ul>
          {Object.entries(state.fieldErrors).map(([field, message]) => (
            <li key={field}>
              {field}: {message}
            </li>
          ))}
        </ul>
      )}
      {state.error === 'conflict' && (
        <button type="button" onClick={() => window.location.reload()}>
          Tải lại trang
        </button>
      )}
    </div>
  );
}
