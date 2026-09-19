import { describe, expect, it } from 'vitest';

import { getConfiguredSiteUrl } from '@/lib/site-url';

describe('verified production site URL', () => {
  it('normalizes a verified HTTPS origin', () => {
    expect(getConfiguredSiteUrl('https://navido.example/')).toBe(
      'https://navido.example',
    );
  });

  it('rejects preview, local, malformed, and non-HTTPS origins', () => {
    for (const value of [
      undefined,
      '',
      'http://navido.example',
      'https://navido-website.vercel.app',
      'http://localhost:3000',
      'not-a-url',
    ]) {
      expect(getConfiguredSiteUrl(value)).toBeNull();
    }
  });
});
