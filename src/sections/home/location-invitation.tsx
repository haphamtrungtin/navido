import { Container } from '@/components/layout/container';
import { EditorialImage } from '@/components/ui/editorial-image';
import { Eyebrow } from '@/components/ui/eyebrow';
import { TextLink } from '@/components/ui/text-link';
import type { Locale } from '@/i18n/types';

type LocationInvitationProps = Readonly<{
  address: string;
  copy: {
    action: string;
    body: string;
    eyebrow: string;
    imageAlt: string;
    title: string;
  };
  daily: string;
  hours: string;
  locale: Locale;
}>;

export function LocationInvitation({
  address,
  copy,
  daily,
  hours,
  locale,
}: LocationInvitationProps) {
  return (
    <section
      className="py-[var(--section-gap)]"
      data-home-section="location-invitation"
    >
      <Container>
        <div
          className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12"
          data-home-grid="location"
        >
          <div className="lg:col-span-5 lg:col-start-2">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h2 className="mt-4 text-3xl font-light leading-tight sm:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-6 max-w-lg text-base leading-8 text-[var(--navido-muted-ink)]">
              {copy.body}
            </p>
            <div className="mt-6 grid gap-2 text-sm leading-6 text-[var(--navido-muted-ink)]">
              <address className="not-italic">{address}</address>
              <p>
                <span>{daily}</span> <span>{hours}</span>
              </p>
            </div>
            <TextLink className="mt-8" href="/visit" locale={locale}>
              {copy.action}
            </TextLink>
          </div>
          <div className="lg:col-span-5">
            <EditorialImage
              alt={copy.imageAlt}
              aspect="5 / 4"
              sizes="(min-width: 1024px) 40vw, 100vw"
              src="/images/navido/space/navido_space_ground_floor_seating_01.jpeg"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
