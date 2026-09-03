import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Container } from '@/components/layout/container';
import { EditorialImage } from '@/components/ui/editorial-image';
import { Eyebrow } from '@/components/ui/eyebrow';
import { TextLink } from '@/components/ui/text-link';

describe('visual primitives', () => {
  it('keeps editorial images accessible and reserves their requested aspect ratio', () => {
    render(
      <EditorialImage
        alt="Morning light across a quiet cafe table"
        aspect="3 / 2"
        sizes="(min-width: 768px) 50vw, 100vw"
        src="/images/stitch/cafe-interior.jpg"
      />,
    );

    expect(
      screen.getByRole('img', {
        name: 'Morning light across a quiet cafe table',
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('editorial-image-frame')).toHaveClass(
      'aspect-[var(--editorial-image-aspect)]',
    );
    expect(screen.getByTestId('editorial-image-frame')).toHaveStyle({
      '--editorial-image-aspect': '3 / 2',
    });
  });

  it('prefixes internal text links with the requested locale', () => {
    render(
      <TextLink href="/menu" locale="ko">
        Explore the menu
      </TextLink>,
    );

    expect(
      screen.getByRole('link', { name: 'Explore the menu' }),
    ).toHaveAttribute('href', '/ko/menu');
  });

  it('uses the requested locale when normalizing an already localized href', () => {
    render(
      <TextLink href="/vi/our-space" locale="en">
        Our space
      </TextLink>,
    );

    expect(screen.getByRole('link', { name: 'Our space' })).toHaveAttribute(
      'href',
      '/en/our-space',
    );
  });

  it('provides the shared constrained layout and typography treatments', () => {
    render(
      <Container>
        <Eyebrow>Slow coffee</Eyebrow>
      </Container>,
    );

    expect(screen.getByText('Slow coffee')).toHaveClass('text-[0.75rem]');
    expect(screen.getByText('Slow coffee').parentElement).toHaveClass(
      'max-w-[1200px]',
    );
  });
});
