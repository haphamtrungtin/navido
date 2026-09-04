import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { VisitActions } from '@/sections/visit/visit-actions';
import { VisitInformation } from '@/sections/visit/visit-information';
import {
  initialVisitBusinessConfig,
  type VisitBusinessConfig,
} from '@/lib/site-config';

const copy = {
  directions: 'Directions',
  directionsPending: 'Directions are being confirmed.',
  facebook: 'Facebook',
  facebookPending: 'Facebook is being confirmed.',
  grab: 'Grab',
  grabPending: 'Grab is being confirmed.',
  instagram: 'Instagram',
  instagramPending: 'Instagram is being confirmed.',
  title: 'Plan your visit',
};

const verifiedConfig: VisitBusinessConfig = {
  address: '1 Verified Street',
  facebookUrl: 'https://www.facebook.com/navido.verified',
  grabUrl: 'https://food.grab.com/verified-navido',
  hours: '08:00 - 18:00',
  instagramUrl: 'https://www.instagram.com/navido.verified',
  mapsUrl: 'https://maps.google.com/?q=verified-navido',
  phone: '+84123456789',
  siteUrl: 'https://navido.example',
};

const informationCopy = {
  address: 'Address',
  addressPending: 'The address is being confirmed.',
  hours: 'Opening hours',
  hoursPending: 'Opening hours are being confirmed.',
  phone: 'Phone',
  phonePending: 'A phone number is being confirmed.',
  title: 'Visit information',
};

const actionFields = [
  {
    href: 'https://maps.google.com/?q=partial-navido',
    key: 'mapsUrl',
    label: copy.directions,
    pending: copy.directionsPending,
  },
  {
    href: 'https://food.grab.com/partial-navido',
    key: 'grabUrl',
    label: copy.grab,
    pending: copy.grabPending,
  },
  {
    href: 'https://www.instagram.com/partial-navido',
    key: 'instagramUrl',
    label: copy.instagram,
    pending: copy.instagramPending,
  },
  {
    href: 'https://www.facebook.com/partial-navido',
    key: 'facebookUrl',
    label: copy.facebook,
    pending: copy.facebookPending,
  },
] as const;

describe('VisitActions', () => {
  it('starts with no verified visit business details', () => {
    expect(initialVisitBusinessConfig).toEqual({
      address: null,
      facebookUrl: null,
      grabUrl: null,
      hours: null,
      instagramUrl: null,
      mapsUrl: null,
      phone: null,
      siteUrl: null,
    });
  });

  it('keeps every action non-navigable while visit details are unverified', () => {
    render(<VisitActions config={initialVisitBusinessConfig} copy={copy} />);

    expect(
      screen.getByRole('heading', { name: copy.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.directionsPending)).toBeInTheDocument();
    expect(screen.getByText(copy.grabPending)).toBeInTheDocument();
    expect(screen.getByText(copy.instagramPending)).toBeInTheDocument();
    expect(screen.getByText(copy.facebookPending)).toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('emits each verified external action with a safe target relationship', () => {
    render(<VisitActions config={verifiedConfig} copy={copy} />);

    for (const [name, href] of [
      [copy.directions, verifiedConfig.mapsUrl],
      [copy.grab, verifiedConfig.grabUrl],
      [copy.instagram, verifiedConfig.instagramUrl],
      [copy.facebook, verifiedConfig.facebookUrl],
    ] as const) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
      expect(screen.getByRole('link', { name })).toHaveAttribute(
        'rel',
        'noreferrer',
      );
      expect(screen.getByRole('link', { name })).toHaveAttribute(
        'target',
        '_blank',
      );
    }
  });

  it.each(actionFields)(
    'emits only $label when $key is the sole verified action URL',
    (field) => {
      const config: VisitBusinessConfig = {
        ...initialVisitBusinessConfig,
        [field.key]: field.href,
      };
      const { container } = render(
        <VisitActions config={config} copy={copy} />,
      );

      const link = within(container).getByRole('link', { name: field.label });
      expect(container.querySelectorAll('a')).toHaveLength(1);
      expect(link).toHaveAttribute('href', field.href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noreferrer');

      for (const otherField of actionFields.filter(
        (candidate) => candidate.key !== field.key,
      )) {
        expect(
          within(container).getByText(otherField.pending, { exact: true }),
        ).toBeInTheDocument();
      }
    },
  );
});

describe('VisitInformation', () => {
  it('does not fabricate contact details or a telephone action while pending', () => {
    const { container } = render(
      <VisitInformation
        config={initialVisitBusinessConfig}
        copy={informationCopy}
      />,
    );

    expect(
      screen.getByText(informationCopy.addressPending),
    ).toBeInTheDocument();
    expect(screen.getByText(informationCopy.hoursPending)).toBeInTheDocument();
    expect(screen.getByText(informationCopy.phonePending)).toBeInTheDocument();
    expect(container.querySelector('a')).toBeNull();
    expect(screen.queryByText('1 Verified Street')).not.toBeInTheDocument();
    expect(screen.queryByText('08:00 - 18:00')).not.toBeInTheDocument();
    expect(screen.queryByText('+84123456789')).not.toBeInTheDocument();
  });

  it('renders verified address, hours, and phone with only a telephone link', () => {
    const { container } = render(
      <VisitInformation config={verifiedConfig} copy={informationCopy} />,
    );

    expect(
      within(container).getByText(verifiedConfig.hours!),
    ).toBeInTheDocument();
    expect(within(container).getByText(verifiedConfig.address!)).toBeInstanceOf(
      HTMLElement,
    );
    expect(container.querySelector('address')).toHaveTextContent(
      verifiedConfig.address!,
    );

    const phone = within(container).getByRole('link', {
      name: verifiedConfig.phone!,
    });
    expect(container.querySelectorAll('a')).toHaveLength(1);
    expect(phone).toHaveAttribute('href', `tel:${verifiedConfig.phone}`);
    expect(
      container.querySelector('[data-visit-section="actions"]'),
    ).toBeNull();
  });
});
