export type MenuChapter =
  | 'signature'
  | 'typography'
  | 'media-left'
  | 'botanical'
  | 'media-right'
  | 'pastry'
  | 'retail'
  | 'compact';

export type MenuImageKey = 'avocado' | 'brunch' | 'pastries' | 'pour-over';

export type MenuCategoryPresentation = Readonly<{
  chapter: MenuChapter;
  image?: MenuImageKey;
}>;

export const featuredMenuItemIds = [
  'row-2-signature',
  'row-52-coffee',
  'row-105-phin',
  'row-7-brunch',
] as const;

export const menuCategoryPresentations = {
  signature: { chapter: 'signature', image: 'avocado' },
  coffee: { chapter: 'typography' },
  'brew-coffee': { chapter: 'media-left', image: 'pour-over' },
  phin: { chapter: 'botanical' },
  'non-coffee': { chapter: 'botanical' },
  frappuccino: { chapter: 'botanical' },
  'fruit-juices': { chapter: 'botanical' },
  'tea-pot-cup': { chapter: 'botanical' },
  brunch: { chapter: 'media-right', image: 'brunch' },
  cake: { chapter: 'pastry', image: 'pastries' },
  desserts: { chapter: 'pastry' },
  extras: { chapter: 'compact' },
  'specialty-coffee': { chapter: 'retail' },
} as const satisfies Record<string, MenuCategoryPresentation>;

export function getMenuCategoryPresentation(
  categoryId: string,
): MenuCategoryPresentation {
  return (
    menuCategoryPresentations[
      categoryId as keyof typeof menuCategoryPresentations
    ] ?? { chapter: 'typography' }
  );
}
