import { expect, test } from '@playwright/test';

const locales = ['vi', 'en', 'ko'] as const;
const routes = ['/', '/menu', '/our-space', '/about', '/visit'] as const;
const viewports = [
  { name: 'desktop', size: { height: 900, width: 1440 } },
  { name: 'mobile', size: { height: 844, width: 390 } },
] as const;
const expected = {
  call: 'tel:+84368979361',
  maps: 'https://www.google.com/maps/search/?api=1&query=NAVIDO%20Specialty%20Coffee%20Nam%20Quang%201',
} as const;

function localizedPath(locale: (typeof locales)[number], route: string) {
  return route === '/' ? `/${locale}` : `/${locale}${route}`;
}

for (const locale of locales) {
  for (const route of routes) {
    for (const viewport of viewports) {
      test(`${locale}${route} exposes ${viewport.name} conversion actions`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport.size);
        const response = await page.goto(localizedPath(locale, route));

        expect(response?.status()).toBe(200);

        const headerMaps = page
          .locator('header nav')
          .first()
          .locator('..')
          .locator(`a[href="${expected.maps}"]`);
        const mobileBar = page.getByTestId('mobile-conversion-bar');

        if (viewport.name === 'desktop') {
          await expect(headerMaps).toBeVisible();
          await expect(headerMaps).toHaveAttribute('target', '_blank');
          await expect(headerMaps).toHaveAttribute('rel', 'noreferrer');
          await expect(mobileBar).toBeHidden();
          return;
        }

        await expect(headerMaps).toBeHidden();
        await expect(mobileBar).toBeVisible();

        const call = mobileBar.locator(`a[href="${expected.call}"]`);
        const maps = mobileBar.locator(`a[href="${expected.maps}"]`);
        await expect(call).toBeVisible();
        await expect(maps).toBeVisible();
        await expect(maps).toHaveAttribute('target', '_blank');
        await expect(maps).toHaveAttribute('rel', 'noreferrer');

        const [callBounds, mapsBounds] = await Promise.all([
          call.boundingBox(),
          maps.boundingBox(),
        ]);
        expect(callBounds).not.toBeNull();
        expect(mapsBounds).not.toBeNull();
        expect(callBounds!.height).toBeGreaterThanOrEqual(44);
        expect(mapsBounds!.height).toBeGreaterThanOrEqual(44);
        expect(
          Math.abs(callBounds!.width - mapsBounds!.width),
        ).toBeLessThanOrEqual(1);

        await page.evaluate(() =>
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'instant',
          }),
        );
        const footerClearance = await page.evaluate(() => {
          const bar = document.querySelector<HTMLElement>(
            '[data-testid="mobile-conversion-bar"]',
          );
          const footerLinks =
            document.querySelectorAll<HTMLAnchorElement>('footer a');
          const finalLink = footerLinks.item(footerLinks.length - 1);

          if (!bar || !finalLink) return null;
          return Math.floor(
            bar.getBoundingClientRect().top -
              finalLink.getBoundingClientRect().bottom,
          );
        });
        expect(footerClearance).not.toBeNull();
        expect(footerClearance!).toBeGreaterThanOrEqual(0);

        const menuButton = page.locator('header button[aria-controls]');
        await menuButton.click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(mobileBar).toHaveCount(0);

        await dialog.getByRole('button').click();
        await expect(dialog).toHaveCount(0);
        await expect(mobileBar).toBeVisible();
      });
    }
  }
}
