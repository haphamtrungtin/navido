import { Container } from '@/components/layout/container';
import { EditorialImage } from '@/components/ui/editorial-image';
import { Eyebrow } from '@/components/ui/eyebrow';
import { TextLink } from '@/components/ui/text-link';
import type { MenuItem } from '@/features/menu/domain/types';
import { getLocalizedValue, type Locale } from '@/i18n/types';

type SignatureHighlightsProps = Readonly<{
  copy: {
    action: string;
    body: string;
    eyebrow: string;
    imageAlts: readonly [string, string, string];
    title: string;
  };
  items: readonly MenuItem[];
  locale: Locale;
}>;

const images = [
  '/images/stitch/home-espresso.jpg',
  '/images/stitch/home-iced-latte.jpg',
  '/images/stitch/home-pour-over.jpg',
] as const;

export function SignatureHighlights({
  copy,
  items,
  locale,
}: SignatureHighlightsProps) {
  return (
    <section
      className="border-y border-[var(--navido-rule)] bg-[color:rgb(70_56_46_/_4%)] py-[var(--section-gap)]"
      data-home-section="signature-highlights"
    >
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-3xl font-light leading-tight sm:text-4xl">
            {copy.title}
          </h2>
          <p className="mt-5 text-base leading-8 text-[var(--navido-muted-ink)]">
            {copy.body}
          </p>
        </div>
        <div
          className="mt-12 grid gap-8 md:grid-cols-3"
          data-home-grid="highlights"
        >
          {items.map((item, index) => (
            <article
              className="border-t border-[var(--navido-rule)] pt-4"
              data-home-highlight
              key={item.id}
            >
              <EditorialImage
                alt={copy.imageAlts[index] ?? ''}
                aspect="4 / 5"
                sizes="(min-width: 768px) 30vw, 100vw"
                src={images[index] ?? images[0]}
              />
              <h3 className="mt-5 text-xl font-light leading-snug">
                {getLocalizedValue(item.name, locale)}
              </h3>
            </article>
          ))}
        </div>
        <TextLink className="mt-10" href="/menu" locale={locale}>
          {copy.action}
        </TextLink>
      </Container>
    </section>
  );
}
