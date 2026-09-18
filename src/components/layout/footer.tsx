import { Container } from './container';
import type { BusinessProfile } from '@/lib/business-profile';
import type { ConversionLinks } from '@/lib/conversion-links';
import type { FooterCopy } from '@/lib/site-config';

type FooterProps = Readonly<{
  businessProfile: BusinessProfile;
  conversionLinks: ConversionLinks;
  copy: FooterCopy;
}>;

export function Footer({
  businessProfile,
  conversionLinks,
  copy,
}: FooterProps) {
  const externalLinks = [
    { href: conversionLinks.maps, label: copy.maps },
    { href: conversionLinks.grabFood, label: copy.grabFood },
    { href: conversionLinks.facebook, label: copy.facebook },
    { href: conversionLinks.instagram, label: copy.instagram },
    { href: conversionLinks.zalo, label: copy.zalo },
  ];

  return (
    <footer className="mt-[var(--section-gap)] border-t border-[var(--navido-rule)] py-10">
      <Container className="grid gap-8 text-sm text-[var(--navido-muted-ink)] md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-12">
        <address className="grid gap-5 not-italic sm:grid-cols-2">
          <div>
            <p className="font-semibold tracking-[0.08em] text-[var(--navido-ink)]">
              {businessProfile.displayName}
            </p>
            <p className="mt-2 max-w-md">
              <span className="sr-only">{copy.address}: </span>
              {businessProfile.address}
            </p>
          </div>

          <dl className="grid gap-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--navido-ink)]">
                {copy.hours}
              </dt>
              <dd>
                {businessProfile.openingHours.openDaily
                  ? `${copy.daily} `
                  : null}
                {businessProfile.openingHours.timeRange}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--navido-ink)]">
                {copy.phone}
              </dt>
              <dd>
                <a
                  className="hover:text-[var(--navido-ink)]"
                  href={conversionLinks.call}
                >
                  {businessProfile.phoneDisplay}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--navido-ink)]">
                {copy.email}
              </dt>
              <dd>
                <a
                  className="hover:text-[var(--navido-ink)]"
                  href={conversionLinks.email}
                >
                  {businessProfile.email}
                </a>
              </dd>
            </div>
          </dl>
        </address>

        <ul className="flex flex-wrap content-start gap-x-5 gap-y-3 md:justify-end">
          {externalLinks.map((link) => (
            <li key={link.href}>
              <a
                className="border-b border-transparent pb-1 hover:border-current hover:text-[var(--navido-ink)]"
                href={link.href}
                rel="noreferrer"
                target="_blank"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </footer>
  );
}
