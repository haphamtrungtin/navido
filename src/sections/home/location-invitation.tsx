import { Container } from '@/components/layout/container';
import { EditorialImage } from '@/components/ui/editorial-image';
import { Eyebrow } from '@/components/ui/eyebrow';
import { TextLink } from '@/components/ui/text-link';
import type { Locale } from '@/i18n/types';

type LocationInvitationProps = Readonly<{
  copy: {
    action: string;
    body: string;
    eyebrow: string;
    imageAlt: string;
    title: string;
  };
  locale: Locale;
}>;

export function LocationInvitation({ copy, locale }: LocationInvitationProps) {
  return (
    <section
      className="py-[var(--section-gap)]"
      data-home-section="location-invitation"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-5 lg:col-start-2">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h2 className="mt-4 text-3xl font-light leading-tight sm:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-6 max-w-lg text-base leading-8 text-[var(--navido-muted-ink)]">
              {copy.body}
            </p>
            <TextLink className="mt-8" href="/visit" locale={locale}>
              {copy.action}
            </TextLink>
          </div>
          <div className="lg:col-span-5">
            <EditorialImage
              alt={copy.imageAlt}
              aspect="5 / 4"
              sizes="(min-width: 1024px) 40vw, 100vw"
              src="/images/stitch/home-cafe-interior.jpg"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
