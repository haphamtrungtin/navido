import Image from 'next/image';

import { Container } from '@/components/layout/container';

type SpaceHeroProps = Readonly<{
  copy: { body: string; eyebrow: string; imageAlt: string; title: string };
}>;

export function SpaceHero({ copy }: SpaceHeroProps) {
  return (
    <section
      className="relative isolate overflow-hidden bg-[var(--navido-ink)] text-[var(--navido-paper)]"
      data-space-section="hero"
    >
      <Image
        alt={copy.imageAlt}
        className="-z-20 object-cover"
        data-space-hero-image
        fill
        priority
        sizes="100vw"
        src="/images/navido/space/navido_space_ground_floor_seating_01.jpeg"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[color:rgb(37_37_33_/_58%)]"
      />
      <Container className="flex min-h-[72vh] items-end py-16 sm:min-h-[calc(82vh-5rem)] sm:py-20 lg:min-h-[calc(86vh-5rem)] lg:py-24">
        <div className="max-w-3xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.14em] text-[color:rgb(252_249_241_/_80%)]">
            {copy.eyebrow}
          </p>
          <h1 className="max-w-2xl text-5xl font-light leading-[1.04] sm:text-6xl lg:text-8xl">
            {copy.title}
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-[color:rgb(252_249_241_/_92%)] sm:text-lg">
            {copy.body}
          </p>
        </div>
      </Container>
    </section>
  );
}
