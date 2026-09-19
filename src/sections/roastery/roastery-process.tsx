import { Container } from '@/components/layout/container';
import { EditorialImage } from '@/components/ui/editorial-image';
import { Eyebrow } from '@/components/ui/eyebrow';

import type { RoasteryMediaAsset } from '@/features/roastery/domain/types';

type RoasteryProcessProps = Readonly<{
  copy: Readonly<{
    eyebrow: string;
    mediaAlt: string;
    title: string;
    steps: ReadonlyArray<Readonly<{ body: string; title: string }>>;
  }>;
  media: RoasteryMediaAsset;
}>;

export function RoasteryProcess({ copy, media }: RoasteryProcessProps) {
  return (
    <section
      className="bg-[#1d241e] py-[var(--section-gap)] text-[var(--navido-paper)]"
      data-roastery-section="process"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <Eyebrow className="text-[color:rgb(216_224_205_/_85%)]">
              {copy.eyebrow}
            </Eyebrow>
            <h2 className="mt-4 text-3xl font-light leading-tight sm:text-5xl">
              {copy.title}
            </h2>
          </div>
          <div className="lg:col-span-8">
            <ol className="grid gap-0 border-t border-[color:rgb(252_249_241_/_25%)] md:grid-cols-3">
              {copy.steps.map((step, index) => (
                <li
                  className="border-b border-[color:rgb(252_249_241_/_25%)] py-7 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
                  key={step.title}
                >
                  <span className="text-sm text-[color:rgb(216_224_205_/_72%)]">
                    0{index + 1}
                  </span>
                  <h3 className="mt-8 text-xl font-medium">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[color:rgb(252_249_241_/_72%)]">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div
          className="mt-12 max-w-2xl"
          data-testid="roastery-temporary-media"
          data-roastery-media-status={media.replacementStatus}
        >
          <EditorialImage
            alt={copy.mediaAlt}
            aspect="16 / 7"
            sizes="(min-width: 1024px) 70vw, 100vw"
            src={media.src}
          />
          <p className="mt-3 text-xs text-[color:rgb(252_249_241_/_55%)]">
            NAVIDO image placeholder — replace with roaster photography.
          </p>
        </div>
      </Container>
    </section>
  );
}
