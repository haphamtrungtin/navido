import { EditorialImage } from '@/components/ui/editorial-image';

type MenuEditorialImageProps = Readonly<{
  alt: string;
  aspect: string;
  className?: string;
  desktopSrc: string;
  eager?: boolean;
  mobileSrc?: string;
  objectPosition?: string;
}>;

export function MenuEditorialImage({
  alt,
  aspect,
  className,
  desktopSrc,
  eager = false,
  mobileSrc,
  objectPosition,
}: MenuEditorialImageProps) {
  return (
    <div className={className} data-menu-editorial-image>
      {mobileSrc ? (
        <div className="md:hidden" data-menu-mobile-media>
          <EditorialImage
            alt={alt}
            aspect={aspect}
            loading={eager ? 'eager' : 'lazy'}
            objectPosition={objectPosition}
            sizes="calc(100vw - 40px)"
            src={mobileSrc}
          />
        </div>
      ) : null}
      <div
        className={mobileSrc ? 'hidden md:block' : undefined}
        data-menu-desktop-media
      >
        <EditorialImage
          alt={alt}
          aspect={aspect}
          loading={eager && !mobileSrc ? 'eager' : 'lazy'}
          objectPosition={objectPosition}
          sizes="(min-width: 768px) 75vw, 100vw"
          src={desktopSrc}
        />
      </div>
    </div>
  );
}
