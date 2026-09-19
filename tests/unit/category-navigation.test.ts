import { describe, expect, it } from 'vitest';

import { selectActiveCategoryId } from '@/features/menu/components/category-navigation';

function entry(id: string, top: number, isIntersecting = true) {
  return {
    isIntersecting,
    target: { id },
    boundingClientRect: { top },
  } as IntersectionObserverEntry;
}

describe('menu category navigation', () => {
  it('selects the top-most intersecting category independent of callback entry order', () => {
    expect(
      selectActiveCategoryId([
        entry('brunch', 620),
        entry('coffee', 180),
        entry('signature', 40, false),
      ]),
    ).toBe('coffee');
  });
});
