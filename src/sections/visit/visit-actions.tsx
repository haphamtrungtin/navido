import type { VisitBusinessConfig } from '@/lib/site-config';

type VisitActionsProps = Readonly<{
  config: VisitBusinessConfig;
  copy: {
    directions: string;
    directionsPending: string;
    facebook: string;
    facebookPending: string;
    grab: string;
    grabPending: string;
    instagram: string;
    instagramPending: string;
    title: string;
  };
}>;

type Action = Readonly<{
  href: string | null;
  label: string;
  pending: string;
}>;

export function VisitActions({ config, copy }: VisitActionsProps) {
  const actions: readonly Action[] = [
    {
      href: config.mapsUrl,
      label: copy.directions,
      pending: copy.directionsPending,
    },
    { href: config.grabUrl, label: copy.grab, pending: copy.grabPending },
    {
      href: config.instagramUrl,
      label: copy.instagram,
      pending: copy.instagramPending,
    },
    {
      href: config.facebookUrl,
      label: copy.facebook,
      pending: copy.facebookPending,
    },
  ];

  return (
    <section data-visit-section="actions">
      <h2 className="text-2xl font-light leading-tight sm:text-3xl">
        {copy.title}
      </h2>
      <ul className="mt-6 divide-y divide-[var(--navido-rule)] border-y border-[var(--navido-rule)]">
        {actions.map((action) => (
          <li className="py-4" key={action.label}>
            {action.href ? (
              <a
                className="inline-flex text-base text-[var(--navido-ink)] underline decoration-[var(--navido-rule)] underline-offset-4 hover:decoration-current"
                href={action.href}
                rel="noreferrer"
                target="_blank"
              >
                {action.label}
              </a>
            ) : (
              <p className="text-base text-[var(--navido-muted-ink)]">
                {action.pending}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
