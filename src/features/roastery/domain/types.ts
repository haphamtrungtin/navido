import type { DisplayMenuItem } from '@/features/menu/domain/types';

export type RoasteryMediaKey =
  'roaster-machine' | 'roasting-process' | 'roasting-team' | 'packaging';

export type RoasteryMediaAsset = Readonly<{
  src: string;
  altKey: string;
  replacementKey: RoasteryMediaKey;
  replacementStatus: 'temporary';
}>;

export type RoasteryOrigin = Readonly<{
  label: string;
  itemId: string;
}>;

export type RoasteryBeanProduct = DisplayMenuItem;
