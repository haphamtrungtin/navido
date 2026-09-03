import { Container } from '@/components/layout/container';
import { TextLink } from '@/components/ui/text-link';
import type { Locale } from '@/i18n/types';

type HomeHeroProps = Readonly<{
  copy: {
    description: string;
    eyebrow: string;
    menuAction: string;
    title: string;
    visitAction: string;
  };
  locale: Locale;
}>;

export function HomeHero({ copy, locale }: HomeHeroProps) {
  return (
    <section
      className="relative isolate overflow-hidden bg-[var(--navido-ink)] text-[var(--navido-paper)]"
      data-home-section="hero"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[url('/images/stitch/home-cafe-interior.jpg')] bg-cover bg-center opacity-55"
        data-home-hero-image
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[color:rgb(37_37_33_/_52%)]"
      />
      <Container
        className="flex min-h-[calc(100vh-5rem)] items-end py-16 sm:py-20 lg:py-24"
        data-home-hero-content
      >
        <div className="max-w-3xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.14em] text-[color:rgb(252_249_241_/_78%)]">
            {copy.eyebrow}
          </p>
          <h1 className="max-w-2xl text-5xl font-light leading-[1.04] sm:text-6xl lg:text-8xl">
            {copy.title}
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-[color:rgb(252_249_241_/_90%)] sm:text-lg">
            {copy.description}
          </p>
          <div className="mt-9 flex flex-wrap gap-x-8 gap-y-4">
            <TextLink
              className="border-[color:rgb(252_249_241_/_72%)] text-[var(--navido-paper)] hover:text-[var(--navido-paper)]"
              href="/menu"
              locale={locale}
            >
              {copy.menuAction}
            </TextLink>
            <TextLink
              className="border-[color:rgb(252_249_241_/_72%)] text-[var(--navido-paper)] hover:text-[var(--navido-paper)]"
              href="/visit"
              locale={locale}
            >
              {copy.visitAction}
            </TextLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
