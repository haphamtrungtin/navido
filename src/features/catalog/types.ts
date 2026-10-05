import type { z } from 'zod';
import type { CategoryInputSchema, ItemInputSchema } from './schemas';
export type CategoryInput = z.infer<typeof CategoryInputSchema>;
export type ItemInput = z.infer<typeof ItemInputSchema>;
export type PublicationStatus = ItemInput['publicationStatus'];
export type CatalogCategory = CategoryInput & {
  id: string;
  version: number;
  sourceCategoryCodes: string[];
  updatedAt: string;
};
export type CatalogItem = ItemInput & {
  id: string;
  version: number;
  sourceRow: number | null;
  sourceName: string | null;
  sourceCategoryCode: string | null;
  reviewNotes: string[];
  updatedAt: string;
  updatedBy: string | null;
};
export type CatalogFilters = {
  query?: string;
  categoryId?: string;
  publicationStatus?: PublicationStatus;
  needsReview?: boolean;
};
export type CatalogActionState = {
  error:
    | 'invalid_input'
    | 'forbidden'
    | 'not_found'
    | 'conflict'
    | 'unavailable'
    | null;
  fieldErrors?: Record<string, string>;
};
export class CatalogError extends Error {
  constructor(
    public readonly code: Exclude<CatalogActionState['error'], null>,
  ) {
    super('Catalog request failed');
  }
}
