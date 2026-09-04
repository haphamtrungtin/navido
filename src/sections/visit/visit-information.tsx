import type { VisitBusinessConfig } from '@/lib/site-config';

type VisitInformationProps = Readonly<{
  config: VisitBusinessConfig;
  copy: {
    address: string;
    addressPending: string;
    hours: string;
    hoursPending: string;
    phone: string;
    phonePending: string;
    title: string;
  };
}>;

export function VisitInformation({ config, copy }: VisitInformationProps) {
  const details = [
    {
      label: copy.address,
      pending: copy.addressPending,
      pendingId: 'address',
      value: config.address,
    },
    {
      label: copy.hours,
      pending: copy.hoursPending,
      pendingId: 'hours',
      value: config.hours,
    },
    {
      label: copy.phone,
      pending: copy.phonePending,
      pendingId: 'phone',
      value: config.phone,
    },
  ] as const;

  return (
    <section data-visit-section="information">
      <h2 className="text-2xl font-light leading-tight sm:text-3xl">
        {copy.title}
      </h2>
      <dl className="mt-6 divide-y divide-[var(--navido-rule)] border-y border-[var(--navido-rule)]">
        {details.map((detail) => (
          <div className="py-4" key={detail.label}>
            <dt className="text-sm font-semibold uppercase tracking-[0.1em] text-[var(--navido-espresso)]">
              {detail.label}
            </dt>
            <dd className="mt-2 text-base text-[var(--navido-muted-ink)]">
              {detail.value ? (
                detail.label === copy.phone ? (
                  <a
                    className="underline decoration-[var(--navido-rule)] underline-offset-4 hover:decoration-current"
                    href={`tel:${detail.value}`}
                  >
                    {detail.value}
                  </a>
                ) : detail.label === copy.address ? (
                  <address className="not-italic">{detail.value}</address>
                ) : (
                  detail.value
                )
              ) : (
                <span data-visit-pending={detail.pendingId}>
                  {detail.pending}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
