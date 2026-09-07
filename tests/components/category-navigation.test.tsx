import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CategoryNavigation } from '@/features/menu/components/category-navigation';

const categories = [
  {
    id: 'signature',
    name: { vi: 'Dac biet', en: 'Signature', ko: 'Signature' },
    sortOrder: 0,
    sourceCategoryCodes: ['SIG'],
  },
  {
    id: 'coffee',
    name: { vi: 'Ca phe', en: 'Coffee', ko: 'Coffee' },
    sortOrder: 1,
    sourceCategoryCodes: ['CF'],
  },
] as const;

describe('CategoryNavigation', () => {
  it('marks the observed category link as the current location', () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    let callback: IntersectionObserverCallback | undefined;

    class IntersectionObserverMock {
      constructor(nextCallback: IntersectionObserverCallback) {
        callback = nextCallback;
      }

      disconnect = disconnect;
      observe = observe;
      takeRecords = vi.fn();
      unobserve = vi.fn();
      root = null;
      rootMargin = '0px';
      thresholds = [0];
    }

    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

    render(
      <CategoryNavigation
        categories={categories}
        label="Menu categories"
        locale="en"
      />,
    );

    expect(screen.getByRole('link', { name: 'Signature' })).toHaveAttribute(
      'aria-current',
      'location',
    );

    act(() => {
      callback?.(
        [
          {
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRatio: 1,
            intersectionRect: {} as DOMRectReadOnly,
            isIntersecting: true,
            rootBounds: null,
            target: Object.assign(document.createElement('section'), {
              id: 'coffee',
            }),
            time: 0,
          },
        ],
        {} as IntersectionObserver,
      );
    });

    expect(screen.getByRole('link', { name: 'Coffee' })).toHaveAttribute(
      'aria-current',
      'location',
    );
    expect(observe).toHaveBeenCalledTimes(2);
    expect(disconnect).not.toHaveBeenCalled();
  });

  it('keeps long category labels contained without changing mobile navigation height', () => {
    render(
      <CategoryNavigation
        categories={[
          {
            id: 'long-category',
            name: {
              vi: 'Danh muc co ten rat dai',
              en: 'An intentionally long category name for wrapping',
              ko: 'Long category',
            },
            sortOrder: 0,
            sourceCategoryCodes: ['INTERNAL_CODE'],
          },
        ]}
        locale="en"
        label="Menu categories"
        variant="mobile"
      />,
    );

    expect(
      screen.getByRole('link', {
        name: 'An intentionally long category name for wrapping',
      }),
    ).toHaveClass('h-12', 'truncate');
  });
});
