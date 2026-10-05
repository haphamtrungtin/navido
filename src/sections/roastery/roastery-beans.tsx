import { Container } from '@/components/layout/container';
import { TextLink } from '@/components/ui/text-link';
import type { DisplayMenuItem } from '@/features/menu/domain/types';
import type { Locale } from '@/i18n/types';

type RoasteryBeansProps = Readonly<{
  copy: Readonly<{ action: string; empty: string; title: string }>;
  items: readonly DisplayMenuItem[];
  locale: Locale;
}>;

export function RoasteryBeans({ copy, items, locale }: RoasteryBeansProps) {
  return (
    <section
      className="bg-[#e4eadc] py-[var(--section-gap)]"
      data-roastery-section="beans"
      data-testid="roastery-beans"
    >
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-3xl font-light sm:text-5xl">{copy.title}</h2>
          <TextLink href="/menu" locale={locale}>
            {copy.action}
          </TextLink>
        </div>
        {items.length > 0 ? (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li
                className="border border-[color:rgb(29_36_30_/_22%)] p-6"
                key={item.id}
              >
                <p className="text-lg">{item.name[locale]}</p>
                <p className="mt-2 text-sm text-[var(--navido-muted-ink)]">
                  {item.netWeightGram ? `${item.netWeightGram} g` : ''}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 max-w-lg text-base leading-8 text-[var(--navido-muted-ink)]">
            {copy.empty}
          </p>
        )}
      </Container>
    </section>
  );
}
