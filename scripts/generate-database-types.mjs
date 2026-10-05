import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { format } from 'prettier';

const cli = fileURLToPath(
  new URL('../node_modules/supabase/dist/supabase.js', import.meta.url),
);
const result = spawnSync(
  process.execPath,
  [cli, 'gen', 'types', 'typescript', '--local'],
  { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 },
);
if (result.status !== 0 || !result.stdout.includes('admin_memberships')) {
  throw new Error(
    'Database type generation failed. Start the local database and apply migrations first.',
  );
}
mkdirSync('src/lib/supabase', { recursive: true });
writeFileSync(
  'src/lib/supabase/database.types.ts',
  await format(result.stdout, { parser: 'typescript', singleQuote: true }),
  'utf8',
);
console.log('Generated local database types.');
