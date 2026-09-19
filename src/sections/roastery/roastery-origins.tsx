import { Container } from '@/components/layout/container';
import { Eyebrow } from '@/components/ui/eyebrow';

import type { RoasteryOrigin } from '@/features/roastery/domain/types';

type RoasteryOriginsProps = Readonly<{
  copy: Readonly<{ empty: string; title: string }>;
  origins: readonly RoasteryOrigin[];
}>;

export function RoasteryOrigins({ copy, origins }: RoasteryOriginsProps) {
  return (
    <section
      className="bg-[var(--navido-paper)] py-[var(--section-gap)]"
      data-roastery-section="origins"
      data-testid="roastery-origins"
    >
      <Container>
        <Eyebrow>Origins</Eyebrow>
        <h2 className="mt-4 text-3xl font-light sm:text-5xl">{copy.title}</h2>
        {origins.length > 0 ? (
          <ul className="mt-10 grid gap-px overflow-hidden border border-[var(--navido-rule)] bg-[var(--navido-rule)] sm:grid-cols-2 lg:grid-cols-3">
            {origins.map((origin) => (
              <li className="bg-[var(--navido-paper)] p-6" key={origin.label}>
                <p className="text-lg">{origin.label}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[var(--navido-muted-ink)]">
                  {origin.sourceCategoryCode}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 max-w-lg text-base leading-8 text-[var(--navido-muted-ink)]">
            {copy.empty}
          </p>
        )}
      </Container>
    </section>
  );
}
