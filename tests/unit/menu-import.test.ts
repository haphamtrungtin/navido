import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildMenuImport } from '../../scripts/menu-import';
import { normalizeMenu } from '@/features/menu/domain/normalize';
const raw = readFileSync('menu.json', 'utf8');
const normalized = readFileSync(
  'src/features/menu/data/normalized-menu.generated.json',
  'utf8',
);
describe('immutable initial menu import', () => {
  it('preserves all records and publishes only the existing 127 public items', () => {
    const result = buildMenuImport(raw, normalized);
    expect(result.manifest.categoryCount).toBe(14);
    expect(result.manifest.itemCount).toBe(130);
    expect(
      result.manifest.items.filter(
        (item) => item.publicationStatus === 'draft',
      ),
    ).toHaveLength(3);
    expect(
      result.manifest.items.filter(
        (item) => item.publicationStatus === 'published',
      ),
    ).toHaveLength(127);
    expect(result.sql).toContain('ON CONFLICT (id) DO NOTHING');
    expect(result.sql).not.toMatch(/\b(UPDATE|DELETE)\b/);
    expect(
      result.manifest.items.some((item) => item.id === 'row-78-extras'),
    ).toBe(true);
  });
  it('is deterministic and checks raw/normalized consistency', () => {
    expect(buildMenuImport(raw, normalized)).toEqual(
      buildMenuImport(raw, normalized),
    );
    expect(() =>
      buildMenuImport(raw, normalized.replace('85000', '85001')),
    ).toThrow('normalized menu');
  });
  it('escapes apostrophes and preserves Unicode in SQL values', () => {
    const fixture = JSON.parse(raw).slice(0, 1);
    fixture[0].name = "Chef's cà phê";
    const output = normalizeMenu(fixture);
    const result = buildMenuImport(
      JSON.stringify(fixture),
      JSON.stringify({ categories: output.categories, items: output.items }),
    );
    expect(result.sql).toContain("Chef''s cà phê");
  });
  it('rejects duplicate source identifiers', () => {
    const fixture = JSON.parse(raw);
    fixture.push(fixture[0]);
    const output = normalizeMenu(fixture);
    expect(() =>
      buildMenuImport(
        JSON.stringify(fixture),
        JSON.stringify({ categories: output.categories, items: output.items }),
      ),
    ).toThrow('Duplicate');
  });
});
