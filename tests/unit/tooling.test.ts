import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import RedirectRootLayout from '@/app/(root)/layout';

test('provides jsdom and renders the root redirect document layout', () => {
  expect(document.defaultView).toBe(window);

  const markup = renderToStaticMarkup(
    createElement(
      RedirectRootLayout,
      null,
      createElement('p', null, 'Harness child'),
    ),
  );

  expect(markup).toBe(
    '<html lang="vi"><head></head><body><p>Harness child</p></body></html>',
  );
});
