import { z } from 'zod';
const integer = z.number().int().min(-2147483648).max(2147483647);
const name = z
  .object({
    vi: z.string().trim().min(1).max(300),
    en: z.string().trim().max(300),
    ko: z.string().trim().max(300),
  })
  .strict();
const id = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/);
const ChoiceSchema = z
  .object({
    id,
    name,
    priceVnd: integer.nonnegative(),
    sortOrder: integer,
    active: z.boolean(),
  })
  .strict();
const GroupSchema = z
  .object({
    id,
    name,
    minSelections: z.number().int().min(0).max(20),
    maxSelections: z.number().int().min(1).max(20),
    sortOrder: integer,
    active: z.boolean(),
    choices: z.array(ChoiceSchema).max(20),
  })
  .strict()
  .superRefine((group, ctx) => {
    if (
      group.minSelections > group.maxSelections ||
      (group.active &&
        group.maxSelections > group.choices.filter((c) => c.active).length) ||
      new Set(group.choices.map((c) => c.id)).size !== group.choices.length
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Giới hạn lựa chọn không hợp lệ hoặc ID trùng.',
      });
  });
export const OptionGroupsSchema = z
  .array(GroupSchema)
  .max(10)
  .superRefine((groups, ctx) => {
    if (new Set(groups.map((g) => g.id)).size !== groups.length)
      ctx.addIssue({ code: 'custom', message: 'ID nhóm trùng.' });
  });
export type OptionGroup = z.infer<typeof GroupSchema>;
export const DescriptionSchema = z.object({
  vi: z.string().trim().max(4000),
  en: z.string().trim().max(4000),
  ko: z.string().trim().max(4000),
});
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const day = z
  .object({
    day: z.number().int().min(0).max(6),
    enabled: z.boolean(),
    start: time,
    lastOrder: time,
    end: time,
  })
  .strict();
export function timeMinutes(value: string) {
  const [h = NaN, m = NaN] = value.split(':').map(Number);
  return h * 60 + m;
}
export const OrderSettingsSchema = z
  .object({
    preparationMinutes: z.number().int().min(1).max(180),
    paused: z.boolean(),
    days: z.array(day).length(7),
  })
  .strict()
  .superRefine((settings, ctx) => {
    if (
      new Set(settings.days.map((d) => d.day)).size !== 7 ||
      settings.days.some(
        (d) =>
          d.enabled &&
          (timeMinutes(d.start) >= timeMinutes(d.lastOrder) ||
            timeMinutes(d.lastOrder) + settings.preparationMinutes >
              timeMinutes(d.end)),
      )
    )
      ctx.addIssue({
        code: 'custom',
        message:
          'Giờ nhận cuối và thời gian chuẩn bị phải nằm trong giờ phục vụ.',
      });
  });
export type OrderSettings = z.infer<typeof OrderSettingsSchema> & {
  version: number;
};
