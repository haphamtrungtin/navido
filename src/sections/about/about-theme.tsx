import { Container } from '@/components/layout/container';
import { EditorialImage } from '@/components/ui/editorial-image';
import { Eyebrow } from '@/components/ui/eyebrow';

type ThemeKey = 'coffee' | 'food' | 'space' | 'community';

type AboutThemeProps = Readonly<{
  theme: {
    body: string;
    eyebrow: string;
    imageAlt: string;
    imageSrc: string;
    key: ThemeKey;
    title: string;
  };
}>;

const layouts: Record<
  ThemeKey,
  { aspect: string; content: string; image: string; objectPosition: string }
> = {
  coffee: {
    aspect: '4 / 5',
    content: 'md:col-span-3 md:col-start-6 lg:col-span-4 lg:col-start-8',
    image: 'md:col-span-4 md:col-start-1 lg:col-span-5 lg:col-start-1',
    objectPosition: 'center',
  },
  food: {
    aspect: '5 / 4',
    content: 'md:col-span-3 md:col-start-1 lg:col-span-4 lg:col-start-2',
    image: 'md:col-span-4 md:col-start-5 lg:col-span-5 lg:col-start-7',
    objectPosition: 'center',
  },
  space: {
    aspect: '4 / 5',
    content: 'md:col-span-3 md:col-start-6 lg:col-span-4 lg:col-start-8',
    image: 'md:col-span-4 md:col-start-1 lg:col-span-5 lg:col-start-2',
    objectPosition: 'center',
  },
  community: {
    aspect: '5 / 4',
    content: 'md:col-span-3 md:col-start-1 lg:col-span-4 lg:col-start-2',
    image: 'md:col-span-4 md:col-start-5 lg:col-span-6 lg:col-start-7',
    objectPosition: 'center',
  },
};

export function AboutTheme({ theme }: AboutThemeProps) {
  const layout = layouts[theme.key];

  return (
    <section
      className="py-[var(--section-gap)]"
      data-about-section={theme.key}
      data-about-theme={theme.key}
    >
      <Container>
        <div
          className="grid gap-8 md:grid-cols-8 md:items-center md:gap-8 lg:grid-cols-12 lg:gap-12"
          data-about-grid={theme.key}
        >
          <div className={['order-1', layout.image].join(' ')}>
            <EditorialImage
              alt={theme.imageAlt}
              aspect={layout.aspect}
              objectPosition={layout.objectPosition}
              sizes="(min-width: 1024px) 48vw, (min-width: 768px) 50vw, 100vw"
              src={theme.imageSrc}
            />
          </div>
          <div
            className={['order-2', layout.content].join(' ')}
            data-about-copy
          >
            <Eyebrow>{theme.eyebrow}</Eyebrow>
            <h2 className="mt-4 text-3xl font-light leading-tight sm:text-4xl">
              {theme.title}
            </h2>
            <p
              className="mt-5 max-w-lg text-base leading-8 text-[var(--navido-muted-ink)]"
              data-about-body
            >
              {theme.body}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
