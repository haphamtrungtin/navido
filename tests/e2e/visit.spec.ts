import { expect, test } from '@playwright/test';

const localizedPending = {
  en: [
    'The address is being confirmed.',
    'Opening hours are being confirmed.',
    'A phone number is being confirmed.',
    'Directions are being confirmed.',
    'Grab availability is being confirmed.',
    'Instagram is being confirmed.',
    'Facebook is being confirmed.',
  ],
  ko: [
    '주소를 확인 중입니다.',
    '영업 시간을 확인 중입니다.',
    '전화번호를 확인 중입니다.',
    '길 안내를 확인 중입니다.',
    'Grab 정보를 확인 중입니다.',
    'Instagram을 확인 중입니다.',
    'Facebook을 확인 중입니다.',
  ],
  vi: [
    'Địa chỉ đang được xác nhận.',
    'Giờ mở cửa đang được xác nhận.',
    'Số điện thoại đang được xác nhận.',
    'Chỉ đường đang được xác nhận.',
    'Thông tin Grab đang được xác nhận.',
    'Instagram đang được xác nhận.',
    'Facebook đang được xác nhận.',
  ],
} as const;

const locales = ['vi', 'en', 'ko'] as const;
const forbiddenActionHref =
  /^(tel:|https?:\/\/(?:[^/]+\.)?(?:google\.com|googleapis\.com|grab\.com|instagram\.com|facebook\.com))/i;

for (const locale of locales) {
  test(`renders localized pending Visit information for ${locale}`, async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    const response = await page.goto(`/${locale}/visit`);

    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('h1')).toHaveCount(1);

    for (const text of localizedPending[locale]) {
      await expect(page.getByText(text, { exact: true })).toHaveCount(1);
    }

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

    const forbiddenAnchors = await page
      .locator('main a')
      .evaluateAll(
        (anchors, pattern) =>
          anchors.filter((anchor) =>
            new RegExp(pattern, 'i').test(anchor.getAttribute('href') ?? ''),
          ).length,
        forbiddenActionHref.source,
      );
    expect(forbiddenAnchors).toBe(0);
    await expect(page.locator('main a')).toHaveCount(0);
    await expect(
      page.locator('main [disabled], main [aria-disabled="true"]'),
    ).toHaveCount(0);
  });
}
