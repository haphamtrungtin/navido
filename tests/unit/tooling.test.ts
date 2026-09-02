import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import RootLayout from '@/app/layout';

test('provides jsdom and renders the root document layout', () => {
  expect(document.defaultView).toBe(window);

  const markup = renderToStaticMarkup(
    createElement(RootLayout, null, createElement('p', null, 'Harness child')),
  );

  expect(markup).toBe(
    '<html><head></head><body><p>Harness child</p></body></html>',
  );
});
