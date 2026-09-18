type VisitInformationProps = Readonly<{
  address: string;
  callHref: string;
  daily: string;
  hours: string;
  mapsHref: string;
  phoneDisplay: string;
  copy: { address: string; hours: string; phone: string; title: string };
}>;

const linkClassName =
  'underline decoration-[var(--navido-rule)] underline-offset-4 hover:decoration-current';

export function VisitInformation({
  address,
  callHref,
  copy,
  daily,
  hours,
  mapsHref,
  phoneDisplay,
}: VisitInformationProps) {
  return (
    <section data-visit-section="information">
      <h2 className="text-2xl font-light leading-tight sm:text-3xl">
        {copy.title}
      </h2>
      <dl className="mt-6 divide-y divide-[var(--navido-rule)] border-y border-[var(--navido-rule)]">
        <div className="py-4">
          <dt className="text-sm font-semibold uppercase tracking-[0.1em] text-[var(--navido-espresso)]">
            {copy.address}
          </dt>
          <dd className="mt-2 text-base text-[var(--navido-muted-ink)]">
            <address className="not-italic">
              <a
                className={linkClassName}
                href={mapsHref}
                rel="noreferrer"
                target="_blank"
              >
                {address}
              </a>
            </address>
          </dd>
        </div>
        <div className="py-4">
          <dt className="text-sm font-semibold uppercase tracking-[0.1em] text-[var(--navido-espresso)]">
            {copy.hours}
          </dt>
          <dd className="mt-2 text-base text-[var(--navido-muted-ink)]">
            {daily} {hours}
          </dd>
        </div>
        <div className="py-4">
          <dt className="text-sm font-semibold uppercase tracking-[0.1em] text-[var(--navido-espresso)]">
            {copy.phone}
          </dt>
          <dd className="mt-2 text-base text-[var(--navido-muted-ink)]">
            <a className={linkClassName} href={callHref}>
              {phoneDisplay}
            </a>
          </dd>
        </div>
      </dl>
    </section>
  );
}
