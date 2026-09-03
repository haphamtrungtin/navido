import type { ComponentPropsWithoutRef } from 'react';

type EyebrowProps = Readonly<ComponentPropsWithoutRef<'p'>>;

export function Eyebrow({ className, ...props }: EyebrowProps) {
  const classes = [
    'text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[var(--navido-espresso)]',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <p className={classes} {...props} />;
}
