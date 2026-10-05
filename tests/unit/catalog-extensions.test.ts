import { describe, expect, it } from 'vitest';
import {
  OptionGroupsSchema,
  OrderSettingsSchema,
} from '@/features/catalog/extensions/schemas';

const choice = {
  id: 'small',
  name: { vi: 'Nhỏ', en: '', ko: '' },
  priceVnd: 0,
  sortOrder: 0,
  active: true,
};
const group = {
  id: 'size',
  name: { vi: 'Cỡ', en: '', ko: '' },
  minSelections: 1,
  maxSelections: 1,
  sortOrder: 0,
  active: true,
  choices: [choice],
};
const days = Array.from({ length: 7 }, (_, day) => ({
  day,
  enabled: true,
  start: '07:00',
  lastOrder: '21:30',
  end: '22:00',
}));
const settings = { preparationMinutes: 20, paused: true, days };
describe('catalog extensions validation', () => {
  it('accepts required and optional groups with integer surcharges', () => {
    expect(
      OptionGroupsSchema.parse([
        group,
        { ...group, id: 'extra', minSelections: 0 },
      ]),
    ).toHaveLength(2);
  });
  it.each([
    { minSelections: 2 },
    { maxSelections: 0 },
    { choices: [{ ...choice, active: false }] },
    { choices: [choice, choice] },
    { choices: [{ ...choice, priceVnd: -1 }] },
    { choices: [{ ...choice, priceVnd: 1.2 }] },
    { choices: [{ ...choice, priceVnd: 2147483648 }] },
  ])('rejects impossible or ambiguous choices %j', (patch) => {
    expect(OptionGroupsSchema.safeParse([{ ...group, ...patch }]).success).toBe(
      false,
    );
  });
  it('rejects duplicate group IDs and unbounded payloads', () => {
    expect(OptionGroupsSchema.safeParse([group, group]).success).toBe(false);
    expect(
      OptionGroupsSchema.safeParse(
        Array.from({ length: 11 }, (_, n) => ({ ...group, id: `g-${n}` })),
      ).success,
    ).toBe(false);
    expect(
      OptionGroupsSchema.safeParse([
        {
          ...group,
          choices: Array.from({ length: 21 }, (_, n) => ({
            ...choice,
            id: `c-${n}`,
          })),
        },
      ]).success,
    ).toBe(false);
  });
  it('permits inactive incomplete groups for later editing', () => {
    expect(
      OptionGroupsSchema.safeParse([{ ...group, active: false, choices: [] }])
        .success,
    ).toBe(true);
  });
  it('accepts a full local weekly schedule', () => {
    expect(OrderSettingsSchema.parse(settings)).toMatchObject({
      preparationMinutes: 20,
      paused: true,
    });
  });
  it.each([
    { preparationMinutes: 0 },
    { preparationMinutes: 181 },
    { preparationMinutes: 1.5 },
    { days: days.slice(1) },
    { days: days.map((d) => ({ ...d, day: 0 })) },
    { days: days.map((d) => ({ ...d, lastOrder: '21:50' })) },
    { days: days.map((d) => ({ ...d, start: '22:00', end: '07:00' })) },
    { days: days.map((d) => ({ ...d, start: '7:00' })) },
  ])('rejects invalid operational schedule %j', (patch) => {
    expect(
      OrderSettingsSchema.safeParse({ ...settings, ...patch }).success,
    ).toBe(false);
  });
});
