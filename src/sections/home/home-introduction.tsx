import { Container } from '@/components/layout/container';
import { EditorialImage } from '@/components/ui/editorial-image';
import { Eyebrow } from '@/components/ui/eyebrow';

type HomeIntroductionProps = Readonly<{
  copy: { body: string; eyebrow: string; imageAlt: string; title: string };
}>;

export function HomeIntroduction({ copy }: HomeIntroductionProps) {
  return (
    <section
      className="py-[var(--section-gap)]"
      data-home-section="introduction"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-5">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h2 className="mt-4 text-3xl font-light leading-tight sm:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-6 max-w-lg text-base leading-8 text-[var(--navido-muted-ink)]">
              {copy.body}
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-[1.28fr_0.72fr] lg:col-span-7">
            <EditorialImage
              alt={copy.imageAlt}
              aspect="4 / 5"
              sizes="(min-width: 1024px) 38vw, (min-width: 640px) 56vw, 100vw"
              src="/images/stitch/home-morning-table.jpg"
            />
            <EditorialImage
              alt=""
              aria-hidden="true"
              aspect="3 / 4"
              sizes="(min-width: 1024px) 21vw, (min-width: 640px) 30vw, 100vw"
              src="/images/stitch/home-pour-over.jpg"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
