import type { Locale } from '@/i18n/types';
const messages = {
  vi: {
    unavailable:
      'Tạm thời không tải được thực đơn. Vui lòng tải lại trang hoặc liên hệ quán.',
    empty: 'Thực đơn đang được cập nhật.',
  },
  en: {
    unavailable:
      'The menu is temporarily unavailable. Please reload or contact the café.',
    empty: 'The menu is being updated.',
  },
  ko: {
    unavailable:
      '메뉴를 불러올 수 없습니다. 페이지를 새로고침하거나 매장에 문의해 주세요.',
    empty: '메뉴를 업데이트하고 있습니다.',
  },
};
export function MenuReadStatus({
  locale,
  unavailable = false,
}: {
  locale: Locale;
  unavailable?: boolean;
}) {
  return (
    <p
      role={unavailable ? 'alert' : 'status'}
      className="mx-auto max-w-[1200px] px-5 py-10"
    >
      {messages[locale][unavailable ? 'unavailable' : 'empty']}
    </p>
  );
}
