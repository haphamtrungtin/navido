import { Container } from '@/components/layout/container';
import { Eyebrow } from '@/components/ui/eyebrow';

type RoasteryVisitProps = Readonly<{
  address: string;
  callHref: string;
  copy: Readonly<{
    address: string;
    call: string;
    directions: string;
    hours: string;
    title: string;
  }>;
  daily: string;
  hours: string;
  mapsHref: string;
  phone: string;
}>;

export function RoasteryVisit({
  address,
  callHref,
  copy,
  daily,
  hours,
  mapsHref,
  phone,
}: RoasteryVisitProps) {
  return (
    <section
      className="bg-[var(--navido-ink)] py-[var(--section-gap)] text-[var(--navido-paper)]"
      data-roastery-section="visit"
    >
      <Container>
        <Eyebrow className="text-[color:rgb(216_224_205_/_85%)]">
          NAVIDO Specialty Coffee
        </Eyebrow>
        <h2 className="mt-4 max-w-2xl text-3xl font-light leading-tight sm:text-5xl">
          {copy.title}
        </h2>
        <div className="mt-10 grid gap-8 border-t border-[color:rgb(252_249_241_/_22%)] pt-8 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[color:rgb(252_249_241_/_58%)]">
              {copy.address}
            </p>
            <a
              className="mt-3 block max-w-xs text-sm leading-7 underline decoration-[color:rgb(252_249_241_/_35%)] underline-offset-4"
              href={mapsHref}
              rel="noreferrer"
              target="_blank"
            >
              {address}
            </a>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[color:rgb(252_249_241_/_58%)]">
              {copy.hours}
            </p>
            <p className="mt-3 text-sm">
              {daily} {hours}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-[color:rgb(252_249_241_/_58%)]">
              {copy.call}
            </p>
            <a
              className="mt-3 block text-sm underline decoration-[color:rgb(252_249_241_/_35%)] underline-offset-4"
              href={callHref}
            >
              {phone}
            </a>
            <a
              className="mt-2 inline-block text-sm underline decoration-[color:rgb(252_249_241_/_35%)] underline-offset-4"
              href={mapsHref}
              rel="noreferrer"
              target="_blank"
            >
              {copy.directions}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
