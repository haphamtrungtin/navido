import type { MenuAnomaly, MenuAnomalyType } from './types';

const suspiciousSpellings =
  /\b(?:cappucino|creamchesse|ganola|nuttella|mapple|aghilio|pumkin|hibicus)\b/i;

export function isSuspiciousMenuRecord(
  name: string,
  categoryCode: string,
): boolean {
  return categoryCode === 'MOCK_BEANS' || suspiciousSpellings.test(name);
}

export function createAnomaly(
  type: MenuAnomalyType,
  sourceRow: number,
  message: string,
  relatedSourceRow?: number,
): MenuAnomaly {
  return {
    type,
    sourceRow,
    message,
    ...(relatedSourceRow === undefined ? {} : { relatedSourceRow }),
  };
}

export function canonicalName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Mark}/gu, '')
    .toLocaleLowerCase('en-US')
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim();
}

export function similarity(left: string, right: string): number {
  const leftValue = canonicalName(left);
  const rightValue = canonicalName(right);
  if (leftValue === rightValue) return 1;

  const columns = Array.from(
    { length: rightValue.length + 1 },
    (_, index) => index,
  );
  for (let row = 1; row <= leftValue.length; row += 1) {
    let previous = columns[0] ?? 0;
    columns[0] = row;
    for (let column = 1; column <= rightValue.length; column += 1) {
      const above = columns[column] ?? 0;
      const cost = leftValue[row - 1] === rightValue[column - 1] ? 0 : 1;
      columns[column] = Math.min(
        (columns[column - 1] ?? 0) + 1,
        above + 1,
        previous + cost,
      );
      previous = above;
    }
  }

  const distance = columns[rightValue.length] ?? 0;
  return 1 - distance / Math.max(leftValue.length, rightValue.length, 1);
}
