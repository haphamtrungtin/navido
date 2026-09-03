import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type ContainerProps = Readonly<
  ComponentPropsWithoutRef<'div'> & {
    children: ReactNode;
  }
>;

export function Container({ children, className, ...props }: ContainerProps) {
  const classes = ['mx-auto w-full max-w-[1200px] px-5 md:px-6', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
