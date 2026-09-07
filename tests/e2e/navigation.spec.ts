import { expect, test, type Page } from '@playwright/test';

const locales = ['vi', 'en', 'ko'] as const;
const routes = [
  { key: 'home', pathname: '/' },
  { key: 'menu', pathname: '/menu' },
  { key: 'our-space', pathname: '/our-space' },
  { key: 'about', pathname: '/about' },
  { key: 'visit', pathname: '/visit' },
] as const;
const viewports = [
  { name: 'desktop', size: { height: 900, width: 1440 } },
  { name: 'mobile', size: { height: 844, width: 390 } },
] as const;

function localizedPath(locale: (typeof locales)[number], pathname: string) {
  return pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
}

function isNextDevelopmentTransportError(message: string) {
  return (
    message.includes('/_next/hmr') && message.includes('WebSocket connection')
  );
}

async function expectAccessibleImages(page: Page) {
  const images = page.locator('img');

  for (const image of await images.all()) {
    await expect(image).toHaveAttribute('alt');
  }

  for (const image of await page.locator('img:visible').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(async (element) => {
          const nativeImage = element as HTMLImageElement;

          await nativeImage.decode();
          return nativeImage.complete && nativeImage.naturalWidth > 0;
        }),
      )
      .toBe(true);
  }
}

async function expectNoVisibleTextOverflow(page: Page) {
  const overflowingText = await page.locator('main').evaluate(
    (main) =>
      Array.from(main.querySelectorAll('h1, h2, h3, p, li, a, button')).filter(
        (element) => {
          const styles = getComputedStyle(element);
          const bounds = element.getBoundingClientRect();

          return (
            styles.display !== 'none' &&
            styles.visibility !== 'hidden' &&
            bounds.width > 0 &&
            element.scrollWidth > element.clientWidth + 1
          );
        },
      ).length,
  );

  expect(overflowingText).toBe(0);
}

for (const [localeIndex, locale] of locales.entries()) {
  const alternateLocale = locales[(localeIndex + 1) % locales.length]!;

  for (const route of routes) {
    for (const viewport of viewports) {
      test(`${locale}${route.pathname} ${viewport.name} navigation matrix`, async ({
        page,
      }) => {
        const consoleErrors: string[] = [];
        const failedRequests: string[] = [];
        const failedResponses: string[] = [];

        page.on('console', (message) => {
          if (
            message.type() === 'error' &&
            !isNextDevelopmentTransportError(message.text())
          ) {
            consoleErrors.push(message.text());
          }
        });
        page.on('pageerror', (error) => consoleErrors.push(error.message));
        page.on('requestfailed', (request) =>
          failedRequests.push(`${request.method()} ${request.url()}`),
        );
        page.on('response', (response) => {
          if (response.status() >= 400) {
            failedResponses.push(`${response.status()} ${response.url()}`);
          }
        });

        await page.setViewportSize(viewport.size);
        const response = await page.goto(localizedPath(locale, route.pathname));

        expect(response?.status()).toBe(200);
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        await expect(page.getByRole('main')).toHaveCount(1);
        await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
        await expect.poll(() => page.title()).toMatch(/\S/);
        await expect(page.locator('meta[name="description"]')).toHaveAttribute(
          'content',
          /\S/,
        );

        if (viewport.name === 'desktop') {
          const primaryLink = page
            .locator('header nav')
            .first()
            .getByRole('link')
            .first();

          await primaryLink.focus();
          await expect(primaryLink).toBeFocused();
        } else {
          const menuButton = page.locator('header button[aria-controls]');

          await menuButton.focus();
          await expect(menuButton).toBeFocused();
          await menuButton.click();
          await expect(page.getByRole('dialog')).toBeVisible();
          await expect(
            page
              .getByRole('dialog')
              .getByRole('navigation')
              .getByRole('link')
              .first(),
          ).toBeFocused();
        }

        const languageLink = page
          .getByRole('link', {
            exact: true,
            name: alternateLocale.toUpperCase(),
          })
          .last();
        await languageLink.focus();
        await expect(languageLink).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(
          localizedPath(alternateLocale, route.pathname),
        );
        await expect(page.locator('html')).toHaveAttribute(
          'lang',
          alternateLocale,
        );

        await expectAccessibleImages(page);
        await expectNoVisibleTextOverflow(page);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(viewport.size.width + 1);
        expect(consoleErrors).toEqual([]);
        expect(failedRequests).toEqual([]);
        expect(failedResponses).toEqual([]);
      });
    }
  }
}
