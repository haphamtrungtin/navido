import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { RoasteryOrigin } from '@/features/roastery/domain/types';
import { businessProfile } from '@/lib/business-profile';
import { conversionLinks } from '@/lib/conversion-links';
import { RoasteryBeans } from '@/sections/roastery/roastery-beans';
import { RoasteryHero } from '@/sections/roastery/roastery-hero';
import { RoasteryOrigins } from '@/sections/roastery/roastery-origins';
import { RoasteryProcess } from '@/sections/roastery/roastery-process';
import { RoasteryVisit } from '@/sections/roastery/roastery-visit';

const locale = 'vi' as const;
const media = {
  altKey: 'roasterMachine',
  replacementKey: 'roaster-machine' as const,
  replacementStatus: 'temporary' as const,
  src: '/images/navido/coffee/navido_coffee_table_setting_01.jpg',
};

describe('Roastery sections', () => {
  it('renders one page heading and localized menu/visit links', () => {
    render(
      <>
        <RoasteryHero
          copy={{
            action: 'Ghé NAVIDO',
            description: 'Cà phê được rang tại chỗ.',
            eyebrow: 'Xưởng rang',
            title: 'Roasted in-house',
          }}
          locale={locale}
          media={media}
        />
        <RoasteryVisit
          address={businessProfile.address}
          callHref={conversionLinks.call}
          copy={{
            address: 'Địa chỉ',
            call: 'Gọi điện',
            directions: 'Chỉ đường',
            hours: 'Giờ mở cửa',
            title: 'Ghé NAVIDO',
          }}
          daily="Mỗi ngày"
          hours={businessProfile.openingHours.timeRange}
          mapsHref={conversionLinks.maps}
          phone={businessProfile.phoneDisplay}
        />
      </>,
    );

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Ghé NAVIDO' })).toHaveAttribute(
      'href',
      '/vi/visit',
    );
    expect(screen.getByRole('link', { name: 'Chỉ đường' })).toHaveAttribute(
      'target',
      '_blank',
    );
    expect(screen.getByRole('link', { name: 'Chỉ đường' })).toHaveAttribute(
      'rel',
      'noreferrer',
    );
    expect(
      screen.getByRole('link', { name: businessProfile.phoneDisplay }),
    ).toHaveAttribute('href', conversionLinks.call);
  });

  it('renders process items and exposes temporary media status', () => {
    render(
      <RoasteryProcess
        copy={{
          eyebrow: 'Từ hạt đến tách',
          mediaAlt: 'Ảnh placeholder cho việc rang',
          title: 'Một nhịp rang tại NAVIDO',
          steps: [
            { body: 'Chọn hạt.', title: 'Nguồn gốc' },
            { body: 'Rang tại quán.', title: 'Rang' },
            { body: 'Phục vụ và đóng gói.', title: 'Mang về' },
          ],
        }}
        media={media}
      />,
    );

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByTestId('roastery-temporary-media')).toHaveAttribute(
      'data-roastery-media-status',
      'temporary',
    );
  });

  it('uses semantic lists and an intentional empty state for optional data', () => {
    const origins: readonly RoasteryOrigin[] = [];

    render(
      <>
        <RoasteryOrigins
          copy={{
            empty: 'Thông tin origin sẽ được cập nhật.',
            title: 'Nguồn hạt',
          }}
          origins={origins}
        />
        <RoasteryBeans
          copy={{
            action: 'Xem thực đơn',
            empty: 'Hạt rang đóng gói hiện có tại quán.',
            title: 'Mang hạt về nhà',
          }}
          items={[]}
          locale={locale}
        />
      </>,
    );

    expect(
      screen.getByText('Thông tin origin sẽ được cập nhật.'),
    ).toBeVisible();
    expect(
      screen.getByText('Hạt rang đóng gói hiện có tại quán.'),
    ).toBeVisible();
    expect(
      screen.getByTestId('roastery-origins').querySelector('ul'),
    ).toBeNull();
    expect(screen.getByTestId('roastery-beans').querySelector('ul')).toBeNull();
  });
});
