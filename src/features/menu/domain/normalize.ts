import type { Locale, LocalizedText } from '@/i18n/types';

import {
  canonicalName,
  createAnomaly,
  isSuspiciousMenuRecord,
  similarity,
} from './anomalies';
import { RawMenuSchema } from './schemas';
import type {
  MenuAnomaly,
  MenuCategory,
  MenuItem,
  NormalizationResult,
} from './types';

const categoryDefinitions = {
  SIG: {
    id: 'signature',
    name: { vi: 'Đặc biệt', en: 'Signature', ko: '시그니처' },
  },
  CF: { id: 'coffee', name: { vi: 'Cà phê', en: 'Coffee', ko: '커피' } },
  BREW: {
    id: 'brew-coffee',
    name: { vi: 'Cà phê ủ', en: 'Brew Coffee', ko: '브루 커피' },
  },
  'ITEM_TYPE-MVIF': {
    id: 'phin',
    name: { vi: 'Cà phê phin', en: 'Phin', ko: '핀 커피' },
  },
  NCF: {
    id: 'non-coffee',
    name: { vi: 'Không cà phê', en: 'Non-Coffee', ko: '논커피' },
  },
  FRAP: {
    id: 'frappuccino',
    name: { vi: 'Đá xay', en: 'Frappuccino', ko: '프라푸치노' },
  },
  'ITEM_TYPE-1SX6': {
    id: 'fruit-juices',
    name: { vi: 'Nước ép', en: 'Fruit & Juices', ko: '과일 주스' },
  },
  RON: {
    id: 'tea-pot-cup',
    name: { vi: 'Trà', en: 'Tea Pot & Cup', ko: '티팟 & 컵' },
  },
  'ITEM_TYPE-1ICS': {
    id: 'brunch',
    name: { vi: 'Brunch', en: 'Brunch', ko: '브런치' },
  },
  'ITEM_TYPE-IGMS': {
    id: 'cake',
    name: { vi: 'Bánh ngọt', en: 'Cake', ko: '케이크' },
  },
  'ITEM_TYPE-MNZP': {
    id: 'desserts',
    name: { vi: 'Tráng miệng', en: 'Desserts', ko: '디저트' },
  },
  'ITEM_TYPE-7918': {
    id: 'extras',
    name: { vi: 'Thêm', en: 'Extras', ko: '추가' },
  },
  ITEMTYPE_H4EA: {
    id: 'specialty-coffee',
    name: { vi: 'Cà phê đặc sản', en: 'Specialty Coffee', ko: '스페셜티 커피' },
  },
  ITEM_TYPE_OTHER: {
    id: 'extras',
    name: { vi: 'Thêm', en: 'Extras', ko: '추가' },
  },
  MOCK_BEANS: {
    id: 'coffee-beans',
    name: { vi: 'Hạt cà phê', en: 'Coffee Beans', ko: '커피 원두' },
  },
} as const satisfies Record<string, { id: string; name: LocalizedText }>;

type CategoryDefinition =
  (typeof categoryDefinitions)[keyof typeof categoryDefinitions];

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/gu, ' ').trim();
}

function repairSourceEncoding(value: string): string | undefined {
  const hasMojibakeMarker = /[ÃÂÄÅÆÌÍÎÏìíîï]/u.test(value);
  const containsWideCodePoint = [...value].some(
    (character) => (character.codePointAt(0) ?? 0) > 255,
  );
  if (!hasMojibakeMarker || containsWideCodePoint) return undefined;

  try {
    const bytes = Uint8Array.from(
      [...value],
      (character) => character.codePointAt(0) ?? 0,
    );
    const repaired = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return repaired === value ? undefined : repaired;
  } catch {
    return undefined;
  }
}

function splitKoreanParenthetical(value: string): {
  base: string;
  korean?: string;
} {
  const match = value.match(
    /\s*\(([\p{Script=Hangul}][\p{Script=Hangul}\p{Script=Hani}\p{Punctuation}\p{Separator}\p{Letter}\p{Number}]*?)\)\s*$/u,
  );
  if (!match) return { base: value };

  return {
    base: normalizeWhitespace(value.slice(0, match.index)),
    korean: normalizeWhitespace(match[1] ?? ''),
  };
}

function englishDisplayName(value: string): string {
  return normalizeWhitespace(value.replace(/^cà\s*phê\s+/iu, ''));
}

function localizedName(
  base: string,
  korean: string | undefined,
): { name: LocalizedText; generatedLocales: Locale[] } {
  const english = englishDisplayName(base);
  const generatedLocales: Locale[] = [];
  if (english === base) generatedLocales.push('en');
  if (!korean) generatedLocales.push('ko');

  return {
    name: {
      vi: base,
      en: english,
      ko: korean ?? base,
    },
    generatedLocales,
  };
}

function categoryFor(code: string): CategoryDefinition {
  const category =
    categoryDefinitions[code as keyof typeof categoryDefinitions];
  if (!category) throw new Error(`Unsupported menu category code: ${code}`);
  return category;
}

function addReviewNote(item: MenuItem, note: string): MenuItem {
  return {
    ...item,
    needsReview: true,
    reviewNotes: [...item.reviewNotes, note],
  };
}

export function normalizeMenu(raw: unknown): NormalizationResult {
  const records = RawMenuSchema.parse(raw);
  const anomalies: MenuAnomaly[] = [];
  const items = records.map((record) => {
    const repairedName = repairSourceEncoding(record.name);
    const displaySource = normalizeWhitespace(repairedName ?? record.name);
    const { base, korean } = splitKoreanParenthetical(displaySource);
    const localized = localizedName(base, korean);
    const category = categoryFor(record.categoryCode);
    let item: MenuItem = {
      id: `row-${record.sourceRow}-${category.id}`,
      categoryId: category.id,
      sourceCategoryCode: record.categoryCode,
      sourceName: record.name,
      name: localized.name,
      priceVnd: record.price,
      sortOrder: record.sort,
      sourceRow: record.sourceRow,
      needsReview: false,
      reviewNotes: [],
      ...(record.netWeightGram === undefined
        ? {}
        : { netWeightGram: record.netWeightGram }),
    };

    if (repairedName) {
      anomalies.push(
        createAnomaly(
          'source-encoding-repaired',
          record.sourceRow,
          'Repaired display encoding; sourceName remains unchanged.',
        ),
      );
      item = addReviewNote(item, 'source-encoding-repaired');
    }
    if (korean) {
      anomalies.push(
        createAnomaly(
          'mixed-language-name',
          record.sourceRow,
          'Separated a Korean parenthetical from the display name.',
        ),
      );
    }
    for (const locale of localized.generatedLocales) {
      anomalies.push(
        createAnomaly(
          'generated-translation',
          record.sourceRow,
          `Used normalized source display as a review-required ${locale} fallback.`,
        ),
      );
      item = addReviewNote(item, `generated-translation:${locale}`);
    }
    if (isSuspiciousMenuRecord(displaySource, record.categoryCode)) {
      anomalies.push(
        createAnomaly(
          'suspicious-record',
          record.sourceRow,
          record.categoryCode === 'MOCK_BEANS'
            ? 'Mock source record requires replacement.'
            : 'Source spelling requires review.',
        ),
      );
      item = addReviewNote(
        item,
        record.categoryCode === 'MOCK_BEANS'
          ? 'mock-source-record'
          : 'suspicious-source-spelling',
      );
    }
    return item;
  });

  const itemIndexesBySourceRow = items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => left.item.sourceRow - right.item.sourceRow);

  const seenExact = new Map<string, MenuItem>();
  for (const { index } of itemIndexesBySourceRow) {
    const item = items[index];
    if (!item) continue;
    const key = `${item.categoryId}|${item.priceVnd}|${canonicalName(item.name.vi)}`;
    const previous = seenExact.get(key);
    if (previous) {
      anomalies.push(
        createAnomaly(
          'exact-duplicate',
          item.sourceRow,
          `Matches row ${previous.sourceRow} exactly after normalization.`,
          previous.sourceRow,
        ),
      );
      items[index] = addReviewNote(
        item,
        `exact-duplicate:row-${previous.sourceRow}`,
      );
    } else {
      seenExact.set(key, item);
    }
  }

  for (
    let position = 0;
    position < itemIndexesBySourceRow.length;
    position += 1
  ) {
    const current = itemIndexesBySourceRow[position];
    if (!current) continue;
    const item = items[current.index];
    if (!item) continue;
    for (let priorPosition = 0; priorPosition < position; priorPosition += 1) {
      const priorEntry = itemIndexesBySourceRow[priorPosition];
      const prior = priorEntry ? items[priorEntry.index] : undefined;
      if (
        !prior ||
        item.categoryId !== prior.categoryId ||
        item.priceVnd !== prior.priceVnd
      )
        continue;
      const score = similarity(item.name.vi, prior.name.vi);
      if (score >= 0.8 && score < 1) {
        anomalies.push(
          createAnomaly(
            'likely-duplicate',
            item.sourceRow,
            `Likely duplicates row ${prior.sourceRow} after normalized-name comparison.`,
            prior.sourceRow,
          ),
        );
        items[current.index] = addReviewNote(
          item,
          `likely-duplicate:row-${prior.sourceRow}`,
        );
        break;
      }
    }
  }

  const categoriesById = new Map<string, MenuCategory>();
  for (const item of items) {
    const sourceCategory = categoryFor(item.sourceCategoryCode);
    const existing = categoriesById.get(item.categoryId);
    if (existing) {
      if (!existing.sourceCategoryCodes.includes(item.sourceCategoryCode)) {
        categoriesById.set(item.categoryId, {
          ...existing,
          sourceCategoryCodes: [
            ...existing.sourceCategoryCodes,
            item.sourceCategoryCode,
          ],
        });
      }
      continue;
    }
    categoriesById.set(item.categoryId, {
      id: sourceCategory.id,
      name: sourceCategory.name,
      sortOrder: item.sortOrder,
      sourceCategoryCodes: [item.sourceCategoryCode],
    });
  }

  return {
    categories: [...categoriesById.values()].sort(
      (left, right) =>
        left.sortOrder - right.sortOrder || left.id.localeCompare(right.id),
    ),
    items: [...items].sort(
      (left, right) =>
        left.sortOrder - right.sortOrder || left.sourceRow - right.sourceRow,
    ),
    anomalies: [...anomalies].sort(
      (left, right) =>
        left.sourceRow - right.sourceRow || left.type.localeCompare(right.type),
    ),
  };
}

export function formatPriceVnd(price: number, locale: Locale): string {
  const localeTag: Record<Locale, string> = {
    vi: 'vi-VN',
    en: 'en-US',
    ko: 'ko-KR',
  };
  return new Intl.NumberFormat(localeTag[locale], {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
}
