import type { ConversionLinks } from '@/lib/conversion-links';

type VisitActionsProps = Readonly<{
  links: ConversionLinks;
  copy: {
    call: string;
    directions: string;
    email: string;
    facebook: string;
    grabFood: string;
    instagram: string;
    title: string;
    zalo: string;
  };
}>;

type Action =
  | Readonly<{
      external: true;
      href: string;
      label: string;
    }>
  | Readonly<{
      external: false;
      href: string;
      label: string;
    }>;

const linkClassName =
  'inline-flex text-base text-[var(--navido-ink)] underline decoration-[var(--navido-rule)] underline-offset-4 hover:decoration-current';

export function VisitActions({ copy, links }: VisitActionsProps) {
  const actions: readonly Action[] = [
    { external: true, href: links.maps, label: copy.directions },
    { external: false, href: links.call, label: copy.call },
    { external: true, href: links.grabFood, label: copy.grabFood },
    { external: true, href: links.zalo, label: copy.zalo },
    { external: true, href: links.instagram, label: copy.instagram },
    { external: true, href: links.facebook, label: copy.facebook },
    { external: false, href: links.email, label: copy.email },
  ];

  return (
    <section data-visit-section="actions">
      <h2 className="text-2xl font-light leading-tight sm:text-3xl">
        {copy.title}
      </h2>
      <ul className="mt-6 divide-y divide-[var(--navido-rule)] border-y border-[var(--navido-rule)]">
        {actions.map((action) => (
          <li className="py-4" key={action.href}>
            {action.external ? (
              <a
                className={linkClassName}
                href={action.href}
                rel="noreferrer"
                target="_blank"
              >
                {action.label}
              </a>
            ) : (
              <a className={linkClassName} href={action.href}>
                {action.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
