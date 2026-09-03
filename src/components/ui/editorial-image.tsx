import type { CSSProperties } from 'react';

import Image, { type ImageProps } from 'next/image';

type EditorialImageProps = Readonly<
  Omit<ImageProps, 'alt' | 'fill' | 'height' | 'sizes' | 'width'> & {
    alt: string;
    aspect: string;
    objectPosition?: string;
    sizes: string;
  }
>;

export function EditorialImage({
  alt,
  aspect,
  className,
  objectPosition = 'center',
  sizes,
  style,
  ...props
}: EditorialImageProps) {
  return (
    <div
      className="relative overflow-hidden aspect-[var(--editorial-image-aspect)]"
      data-testid="editorial-image-frame"
      style={
        {
          '--editorial-image-aspect': aspect,
          ...style,
        } as CSSProperties & Record<'--editorial-image-aspect', string>
      }
    >
      <Image
        {...props}
        alt={alt}
        className={['object-cover', className].filter(Boolean).join(' ')}
        fill
        sizes={sizes}
        style={{ objectPosition }}
      />
    </div>
  );
}
