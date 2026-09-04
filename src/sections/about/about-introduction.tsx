import { Container } from '@/components/layout/container';
import { EditorialImage } from '@/components/ui/editorial-image';
import { Eyebrow } from '@/components/ui/eyebrow';

type AboutIntroductionProps = Readonly<{
  copy: { body: string; eyebrow: string; imageAlt: string; title: string };
}>;

export function AboutIntroduction({ copy }: AboutIntroductionProps) {
  return (
    <section
      className="py-[var(--section-gap)]"
      data-about-section="introduction"
    >
      <Container>
        <div
          className="grid gap-10 md:grid-cols-8 md:items-center md:gap-8 lg:grid-cols-12 lg:gap-12"
          data-about-grid="introduction"
        >
          <div className="md:col-span-3 lg:col-span-4 lg:col-start-2">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h1 className="mt-4 max-w-xl text-4xl font-light leading-tight sm:text-5xl lg:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-[var(--navido-muted-ink)]">
              {copy.body}
            </p>
          </div>
          <div className="md:col-span-5 lg:col-span-6 lg:col-start-7">
            <EditorialImage
              alt={copy.imageAlt}
              aspect="16 / 9"
              objectPosition="center"
              priority
              sizes="(min-width: 1024px) 48vw, (min-width: 768px) 60vw, 100vw"
              src="/images/stitch/about-street.jpg"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
