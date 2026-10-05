import { formatPriceVnd } from '@/features/menu/domain/normalize';
import type { DisplayMenuItem } from '@/features/menu/domain/types';
import { getLocalizedValue, type Locale } from '@/i18n/types';
import { MenuItemImage } from './menu-item-image';

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
      <div
        className="min-w-0 break-words text-base font-normal leading-7"
        data-menu-item-name
      >
        {item.imageUrl && (
          <MenuItemImage
            src={item.imageUrl}
            alt={getLocalizedValue(item.name, locale)}
          />
        )}
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
        {item.description && (
          <p className="text-sm text-[var(--navido-muted-ink)]">
            {getLocalizedValue(item.description, locale)}
          </p>
        )}
        {item.optionGroups?.length ? (
          <details className="text-sm">
            <summary>
              {locale === 'vi'
                ? 'Tùy chọn món'
                : locale === 'en'
                  ? 'Options'
                  : '옵션'}
            </summary>
            {item.optionGroups.map((group) => (
              <div key={group.id}>
                <p>{getLocalizedValue(group.name, locale)}</p>
                <ul>
                  {group.choices.map((choice) => (
                    <li key={choice.id}>
                      {getLocalizedValue(choice.name, locale)}
                      {choice.priceVnd > 0
                        ? ` +${formatPriceVnd(choice.priceVnd, locale)}`
                        : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </details>
        ) : null}
      </div>
      <span className="shrink-0 self-start text-right text-sm tabular-nums text-[var(--navido-muted-ink)]">
        {formatPriceVnd(item.priceVnd, locale)}
      </span>
    </li>
  );
}
