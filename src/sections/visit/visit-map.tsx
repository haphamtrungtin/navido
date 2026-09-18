import { EditorialImage } from '@/components/ui/editorial-image';

type VisitMapProps = Readonly<{
  alt: string;
  caption: string;
  href: string;
  linkLabel: string;
  title: string;
}>;

export function VisitMap({
  alt,
  caption,
  href,
  linkLabel,
  title,
}: VisitMapProps) {
  return (
    <section data-visit-section="map">
      <h2 className="text-2xl font-light leading-tight sm:text-3xl">{title}</h2>
      <figure className="mt-6">
        <a
          aria-label={linkLabel}
          className="block"
          href={href}
          rel="noreferrer"
          target="_blank"
        >
          <EditorialImage
            alt={alt}
            aspect="5 / 4"
            objectPosition="center"
            sizes="(min-width: 1024px) 32vw, (min-width: 768px) 50vw, 100vw"
            src="/images/stitch/visit-map-placeholder.jpg"
          />
          <figcaption className="mt-3 text-sm leading-6 text-[var(--navido-muted-ink)]">
            {caption}
          </figcaption>
        </a>
      </figure>
    </section>
  );
}
