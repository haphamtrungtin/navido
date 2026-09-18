import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { siteBaseline } from '../src/lib/site-baseline';

const arguments_ = process.argv.slice(2);
const checkOnly = arguments_.length === 1 && arguments_[0] === '--check';

if (arguments_.length !== 0 && !checkOnly) {
  throw new Error('Usage: pnpm generate:baseline [--check]');
}

const outputPath = resolve('artifacts/visual-qa/baseline.json');
const output = `${JSON.stringify(siteBaseline, null, 2)}\n`;

if (checkOnly) {
  const current = await readFile(outputPath, 'utf8');
  if (current !== output) {
    throw new Error(
      'Visual baseline is out of date. Run pnpm generate:baseline.',
    );
  }
} else {
  await writeFile(outputPath, output, 'utf8');
}
