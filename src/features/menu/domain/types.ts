import type { LocalizedText } from '@/i18n/types';

export type MenuCategory = {
  id: string;
  name: LocalizedText;
  sortOrder: number;
  sourceCategoryCodes: readonly string[];
};

export type DisplayMenuItem = {
  id: string;
  categoryId: string;
  name: LocalizedText;
  priceVnd: number;
  sortOrder: number;
  isAvailable?: boolean;
  netWeightGram?: number;
};

export type MenuItem = DisplayMenuItem & {
  sourceCategoryCode: string;
  sourceName: string;
  sourceRow: number;
  needsReview: boolean;
  reviewNotes: readonly string[];
};

export type MenuAnomalyType =
  | 'exact-duplicate'
  | 'likely-duplicate'
  | 'generated-translation'
  | 'suspicious-record'
  | 'mixed-language-name'
  | 'source-encoding-repaired';

export type MenuAnomaly = {
  type: MenuAnomalyType;
  sourceRow: number;
  message: string;
  relatedSourceRow?: number;
};

export type NormalizationResult = {
  categories: readonly MenuCategory[];
  items: readonly MenuItem[];
  anomalies: readonly MenuAnomaly[];
};
