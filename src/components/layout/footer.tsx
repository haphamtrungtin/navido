import { Container } from './container';
import { siteName, type FooterCopy } from '@/lib/site-config';

type FooterProps = Readonly<{
  copy: FooterCopy;
}>;

export function Footer({ copy }: FooterProps) {
  return (
    <footer className="mt-[var(--section-gap)] border-t border-[var(--navido-rule)] py-10">
      <Container className="flex flex-col gap-6 text-sm text-[var(--navido-muted-ink)] md:flex-row md:items-end md:justify-between">
        <p className="font-semibold tracking-[0.08em] text-[var(--navido-ink)]">
          {siteName}
        </p>
        <p className="max-w-prose">{copy.informationPending}</p>
      </Container>
    </footer>
  );
}
