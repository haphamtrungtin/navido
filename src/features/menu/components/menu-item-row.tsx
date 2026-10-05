import { formatPriceVnd } from '@/features/menu/domain/normalize';
import type { DisplayMenuItem } from '@/features/menu/domain/types';
import { getLocalizedValue, type Locale } from '@/i18n/types';

type MenuItemRowProps = Readonly<{
  compact?: boolean;
  item: DisplayMenuItem;
  locale: Locale;
}>;

export function MenuItemRow({
  compact = false,
  item,
  locale,
}: MenuItemRowProps) {
  return (
    <li
      className={[
        'grid grid-cols-[minmax(0,1fr)_auto] gap-x-6 border-b border-[var(--navido-rule)]',
        compact ? 'py-2.5' : 'py-4',
      ].join(' ')}
      data-menu-item
    >
      <span
        className="min-w-0 break-words text-base font-normal leading-7"
        data-menu-item-name
      >
        {getLocalizedValue(item.name, locale)}
        {item.isAvailable === false && (
          <small className="ml-2 text-[var(--navido-muted-ink)]">
            {locale === 'vi'
              ? 'Tạm hết'
              : locale === 'en'
                ? 'Sold out'
                : '품절'}
          </small>
        )}
      </span>
      <span className="shrink-0 self-start text-right text-sm tabular-nums text-[var(--navido-muted-ink)]">
        {formatPriceVnd(item.priceVnd, locale)}
      </span>
    </li>
  );
}
