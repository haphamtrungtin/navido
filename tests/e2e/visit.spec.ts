import { expect, test } from '@playwright/test';

const localizedPending = {
  en: {
    address: 'The address is being confirmed.',
    hours: 'Opening hours are being confirmed.',
    phone: 'A phone number is being confirmed.',
    directions: 'Directions are being confirmed.',
    grab: 'Grab availability is being confirmed.',
    instagram: 'Instagram is being confirmed.',
    facebook: 'Facebook is being confirmed.',
    map: 'The map will be available once the location is confirmed.',
  },
  ko: {
    address: '주소를 확인 중입니다.',
    hours: '영업 시간을 확인 중입니다.',
    phone: '전화번호를 확인 중입니다.',
    directions: '길 안내를 확인 중입니다.',
    grab: 'Grab 정보를 확인 중입니다.',
    instagram: 'Instagram을 확인 중입니다.',
    facebook: 'Facebook을 확인 중입니다.',
    map: '위치가 확정되면 지도를 안내하겠습니다.',
  },
  vi: {
    address: 'Địa chỉ đang được xác nhận.',
    hours: 'Giờ mở cửa đang được xác nhận.',
    phone: 'Số điện thoại đang được xác nhận.',
    directions: 'Chỉ đường đang được xác nhận.',
    grab: 'Thông tin Grab đang được xác nhận.',
    instagram: 'Instagram đang được xác nhận.',
    facebook: 'Facebook đang được xác nhận.',
    map: 'Bản đồ sẽ hiển thị khi địa điểm được xác nhận.',
  },
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

    const pendingStates = Object.entries(localizedPending[locale]);
    await expect(page.locator('[data-visit-pending]')).toHaveCount(
      pendingStates.length,
    );
    for (const [id, text] of pendingStates) {
      await expect(page.locator(`[data-visit-pending="${id}"]`)).toHaveText(
        text,
      );
    }
    expect(
      await page
        .locator('[data-visit-pending]')
        .evaluateAll((nodes) => nodes.map((node) => node.dataset.visitPending)),
    ).toEqual(pendingStates.map(([id]) => id));

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
