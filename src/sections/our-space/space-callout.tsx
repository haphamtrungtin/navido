import { Container } from '@/components/layout/container';
import { Eyebrow } from '@/components/ui/eyebrow';
import { TextLink } from '@/components/ui/text-link';
import type { Locale } from '@/i18n/types';

type SpaceCalloutProps = Readonly<{
  copy: { action: string; body: string; eyebrow: string; title: string };
  locale: Locale;
}>;

export function SpaceCallout({ copy, locale }: SpaceCalloutProps) {
  return (
    <section
      className="bg-[var(--navido-ink)] py-[var(--section-gap)] text-[var(--navido-paper)]"
      data-space-callout
    >
      <Container>
        <div className="grid gap-8 md:grid-cols-8 lg:grid-cols-12">
          <div className="md:col-span-6 lg:col-span-7">
            <Eyebrow className="text-[color:rgb(252_249_241_/_72%)]">
              {copy.eyebrow}
            </Eyebrow>
            <h2 className="mt-4 text-3xl font-light leading-tight sm:text-4xl">
              {copy.title}
            </h2>
          </div>
          <div className="md:col-span-5 md:col-start-4 lg:col-span-4 lg:col-start-9">
            <p className="text-base leading-8 text-[color:rgb(252_249_241_/_86%)]">
              {copy.body}
            </p>
            <TextLink
              className="mt-8 border-[color:rgb(252_249_241_/_72%)] text-[var(--navido-paper)] hover:text-[var(--navido-paper)]"
              href="/visit"
              locale={locale}
            >
              {copy.action}
            </TextLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
