import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { buildMenuImport } from './menu-import';

const result = buildMenuImport(
  readFileSync('menu.json', 'utf8'),
  readFileSync('src/features/menu/data/normalized-menu.generated.json', 'utf8'),
);
if (
  result.manifest.categoryCount !== 14 ||
  result.manifest.itemCount !== 130 ||
  result.manifest.items.filter((item) => item.publicationStatus === 'draft')
    .length !== 3
)
  throw new Error(
    'Menu baseline changed; review before creating another import migration.',
  );
const path = 'supabase/migrations/20261005000300_import_initial_menu.sql';
if (existsSync(path) && readFileSync(path, 'utf8') !== result.sql)
  throw new Error(
    'Existing import migration differs; never rewrite a deployed migration.',
  );
writeFileSync(path, result.sql, 'utf8');
writeFileSync(
  'docs/menu-db-import-manifest.json',
  `${JSON.stringify(result.manifest, null, 2)}\n`,
  'utf8',
);
console.log(
  'Generated initial menu migration: 14 categories, 130 items (127 published, 3 draft). No DB connection was made.',
);
