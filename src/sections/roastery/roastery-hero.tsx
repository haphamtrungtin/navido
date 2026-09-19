import type { Locale } from '@/i18n/types';

import { Container } from '@/components/layout/container';
import { EditorialImage } from '@/components/ui/editorial-image';
import { Eyebrow } from '@/components/ui/eyebrow';
import { TextLink } from '@/components/ui/text-link';

import type { RoasteryMediaAsset } from '@/features/roastery/domain/types';

type RoasteryHeroProps = Readonly<{
  copy: Readonly<{
    action: string;
    description: string;
    eyebrow: string;
    title: string;
  }>;
  locale: Locale;
  media: RoasteryMediaAsset;
}>;

export function RoasteryHero({ copy, locale, media }: RoasteryHeroProps) {
  return (
    <section
      className="relative isolate overflow-hidden bg-[#1d241e] py-20 text-[var(--navido-paper)] sm:py-28 lg:py-36"
      data-roastery-section="hero"
    >
      <div
        className="absolute inset-0 -z-10 opacity-35"
        data-roastery-hero-image
      >
        <EditorialImage
          alt={copy.title}
          aspect="16 / 9"
          className="h-full"
          sizes="100vw"
          src={media.src}
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[color:rgb(18_24_19_/_72%)]"
      />
      <Container>
        <div className="max-w-4xl" data-roastery-hero-copy>
          <Eyebrow className="text-[color:rgb(216_224_205_/_85%)]">
            {copy.eyebrow}
          </Eyebrow>
          <h1 className="mt-6 max-w-3xl text-5xl font-light leading-[0.98] sm:text-7xl lg:text-9xl">
            {copy.title}
          </h1>
          <p className="mt-8 max-w-xl text-base leading-8 text-[color:rgb(252_249_241_/_86%)] sm:text-lg">
            {copy.description}
          </p>
          <TextLink
            className="mt-9 border-[color:rgb(252_249_241_/_70%)] text-[var(--navido-paper)] hover:text-[var(--navido-paper)]"
            href="/visit"
            locale={locale}
          >
            {copy.action}
          </TextLink>
        </div>
      </Container>
    </section>
  );
}
