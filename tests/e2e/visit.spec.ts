import { expect, test } from '@playwright/test';

import { businessProfile } from '../../src/lib/business-profile';
import { conversionLinks } from '../../src/lib/conversion-links';

const locales = ['vi', 'en', 'ko'] as const;

const localizedCopy = {
  vi: {
    actions: {
      call: 'Gọi điện',
      directions: 'Chỉ đường',
      email: 'Email',
      facebook: 'Facebook',
      grabFood: 'GrabFood',
      instagram: 'Instagram',
      zalo: 'Zalo',
    },
    daily: 'Mỗi ngày',
    mapLink: 'Mở Google Maps',
  },
  en: {
    actions: {
      call: 'Call',
      directions: 'Directions',
      email: 'Email',
      facebook: 'Facebook',
      grabFood: 'GrabFood',
      instagram: 'Instagram',
      zalo: 'Zalo',
    },
    daily: 'Daily',
    mapLink: 'Open Google Maps',
  },
  ko: {
    actions: {
      call: '전화하기',
      directions: '길 안내',
      email: '이메일',
      facebook: 'Facebook',
      grabFood: 'GrabFood',
      instagram: 'Instagram',
      zalo: 'Zalo',
    },
    daily: '매일',
    mapLink: 'Google 지도 열기',
  },
} as const;

for (const locale of locales) {
  test(`renders complete verified Visit details for ${locale}`, async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    const response = await page.goto(`/${locale}/visit`);

    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('[data-visit-pending]')).toHaveCount(0);

    const images = page.locator('main img');
    await expect(images).toHaveCount(2);
    for (const image of await images.all()) {
      await expect
        .poll(() =>
          image.evaluate((element) => {
            const nativeImage = element as HTMLImageElement;
            return nativeImage.complete && nativeImage.naturalWidth > 0;
          }),
        )
        .toBe(true);
    }

    const information = page.locator('[data-visit-section="information"]');
    await expect(information).toContainText(businessProfile.address);
    await expect(information).toContainText(
      `${localizedCopy[locale].daily} ${businessProfile.openingHours.timeRange}`,
    );
    await expect(information).toContainText(businessProfile.phoneDisplay);

    const addressLink = information.getByRole('link', {
      name: businessProfile.address,
    });
    await expect(addressLink).toHaveAttribute('href', conversionLinks.maps);
    await expect(addressLink).toHaveAttribute('target', '_blank');
    await expect(addressLink).toHaveAttribute('rel', 'noreferrer');

    const phoneLink = information.getByRole('link', {
      name: businessProfile.phoneDisplay,
    });
    await expect(phoneLink).toHaveAttribute('href', conversionLinks.call);
    expect(await phoneLink.getAttribute('target')).toBeNull();
    expect(await phoneLink.getAttribute('rel')).toBeNull();

    const actions = page.locator('[data-visit-section="actions"]');
    const actionLinks = actions.getByRole('link');
    await expect(actionLinks).toHaveCount(7);

    const expectedActions = [
      [localizedCopy[locale].actions.directions, conversionLinks.maps, true],
      [localizedCopy[locale].actions.call, conversionLinks.call, false],
      [localizedCopy[locale].actions.grabFood, conversionLinks.grabFood, true],
      [localizedCopy[locale].actions.zalo, conversionLinks.zalo, true],
      [
        localizedCopy[locale].actions.instagram,
        conversionLinks.instagram,
        true,
      ],
      [localizedCopy[locale].actions.facebook, conversionLinks.facebook, true],
      [localizedCopy[locale].actions.email, conversionLinks.email, false],
    ] as const;

    for (const [name, href, external] of expectedActions) {
      const link = actions.getByRole('link', { exact: true, name });
      await expect(link).toHaveAttribute('href', href);

      if (external) {
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', 'noreferrer');
      } else {
        expect(await link.getAttribute('target')).toBeNull();
        expect(await link.getAttribute('rel')).toBeNull();
      }
    }

    const actionHrefs = await actionLinks.evaluateAll((links) =>
      links.map((link) => link.getAttribute('href')),
    );
    expect(new Set(actionHrefs).size).toBe(actionHrefs.length);

    const mapLink = page
      .locator('[data-visit-section="map"]')
      .getByRole('link', { name: localizedCopy[locale].mapLink });
    await expect(mapLink).toHaveAttribute('href', conversionLinks.maps);
    await expect(mapLink).toHaveAttribute('target', '_blank');
    await expect(mapLink).toHaveAttribute('rel', 'noreferrer');

    await expect(
      page.locator(`main a[href="${conversionLinks.maps}"]`),
    ).toHaveCount(3);
  });
}
