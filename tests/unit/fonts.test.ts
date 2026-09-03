import { describe, expect, it } from 'vitest';

import { documentFontClassName } from '@/app/fonts';

describe('NAVIDO font contract', () => {
  it('ships both Noto font variables to the localized document shell', () => {
    expect(documentFontClassName).toBe(
      '--font-noto-sans__loaded --font-noto-sans-kr__loaded',
    );
  });
});
