import { Container } from '@/components/layout/container';
import { EditorialImage } from '@/components/ui/editorial-image';
import { Eyebrow } from '@/components/ui/eyebrow';

type Story = Readonly<{
  body: string;
  eyebrow: string;
  imageAlt: string;
  imageSrc: string;
  key: 'morning-light' | 'quiet-table' | 'downstairs' | 'upstairs';
  title: string;
}>;

type SpaceStoryProps = Readonly<{ story: Story; index: number }>;

const layouts = [
  {
    content: 'md:col-span-3 md:col-start-6 lg:col-span-4 lg:col-start-9',
    image: 'md:col-span-5 md:col-start-1 lg:col-span-7 lg:col-start-1',
  },
  {
    content: 'md:col-span-3 md:col-start-1 lg:col-span-4 lg:col-start-2',
    image: 'md:col-span-5 md:col-start-4 lg:col-span-6 lg:col-start-7',
  },
  {
    content: 'md:col-span-3 md:col-start-6 lg:col-span-4 lg:col-start-8',
    image: 'md:col-span-5 md:col-start-1 lg:col-span-5 lg:col-start-2',
  },
  {
    content: 'md:col-span-3 md:col-start-1 lg:col-span-4 lg:col-start-1',
    image: 'md:col-span-5 md:col-start-4 lg:col-span-7 lg:col-start-6',
  },
] as const;

export function SpaceStory({ story, index }: SpaceStoryProps) {
  const layout = layouts[index] ?? layouts[0];

  return (
    <section className="py-[var(--section-gap)]" data-space-story={story.key}>
      <Container>
        <div
          className="grid gap-8 md:grid-cols-8 md:items-center md:gap-8 lg:grid-cols-12 lg:gap-12"
          data-space-grid={story.key}
        >
          <div className={['order-2 md:order-none', layout.content].join(' ')}>
            <Eyebrow>{story.eyebrow}</Eyebrow>
            <h2 className="mt-4 text-3xl font-light leading-tight sm:text-4xl">
              {story.title}
            </h2>
            <p className="mt-5 max-w-lg text-base leading-8 text-[var(--navido-muted-ink)]">
              {story.body}
            </p>
          </div>
          <div className={['order-1 md:order-none', layout.image].join(' ')}>
            <EditorialImage
              alt={story.imageAlt}
              aspect={index % 2 === 0 ? '4 / 5' : '5 / 4'}
              sizes="(min-width: 1024px) 48vw, (min-width: 768px) 60vw, 100vw"
              src={story.imageSrc}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
