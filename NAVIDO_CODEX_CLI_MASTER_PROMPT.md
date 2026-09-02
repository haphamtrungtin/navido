# NAVIDO Website — Codex CLI Master Prompt

Copy the prompt below into Codex CLI from the root directory that contains the supplied assets and `menu.json`.

---

## Prompt

You are implementing a production-ready website for **NAVIDO Specialty Coffee** from a new, empty project.

Work autonomously within the requirements below, but do not invent business facts or silently guess when an essential input is unavailable. Inspect all available inputs before writing implementation code.

### Inputs and source-of-truth priority

You have access to:

1. A NAVIDO design through the configured **Stitch MCP**.
2. A raw `menu.json` file in the working directory.
3. Real NAVIDO image assets in the working directory or in a clearly named assets folder.

Use this priority when sources differ:

1. **Stitch MCP** is the source of truth for visual design, layout, responsive intent, components, and page composition.
2. **`menu.json`** is the source of truth for menu items, categories, prices, source rows, and existing names.
3. Supplied real images are the source of truth for NAVIDO photography and brand atmosphere.
4. This prompt is the source of truth for architecture, behavior, quality gates, and implementation constraints.

Never modify the original `menu.json`. Never change a price, add a menu item, invent a review, fabricate history, or create business information that is not supported by the provided sources.

### Required discovery before implementation

Before creating the app:

1. Confirm that Stitch MCP is available.
2. Locate the NAVIDO Stitch project and enumerate its screens/pages and available viewport variants.
3. Retrieve and inspect every relevant screen, including component details and exportable assets when available.
4. Inspect `menu.json` completely, not just its first records.
5. Inventory all supplied image files and determine where each can be used appropriately.
6. Extract and document the Stitch design system:
   - colors;
   - typography;
   - content/container widths;
   - grid and alignment;
   - spacing rhythm;
   - borders, radii, and shadows;
   - image aspect ratios and crop behavior;
   - navigation behavior;
   - responsive breakpoints and layout changes;
   - interactions and motion.
7. Map Stitch screens to the five required pages: Home, Menu, Our Space, About, and Visit.
8. Present a concise implementation plan and file structure before coding.

If Stitch MCP is unavailable, the NAVIDO project cannot be identified, or multiple candidate screens make the intended design ambiguous, stop and request the missing project/screen identifier. Do not replace the missing design with a generic café template.

### Product scope

Build these pages:

- Home
- Menu
- Our Space
- About
- Visit

The first version is an informational website. It includes:

- navigation between pages;
- a working Vietnamese/English/Korean language switcher;
- menu browsing and category navigation;
- links to Google Maps, Grab, and supplied social profiles when those URLs exist in the inputs;
- responsive desktop, tablet, and mobile layouts.

Do not add:

- authentication;
- e-commerce;
- checkout;
- table reservation;
- online ordering logic;
- contact forms;
- CMS integration;
- a database;
- dashboards or administration interfaces.

### Technology

Use:

- the current stable Next.js release;
- Next.js App Router;
- TypeScript with strict mode;
- Tailwind CSS;
- `pnpm`;
- `next/image` and `next/font` where appropriate;
- a maintained Next.js-compatible internationalization solution suitable for App Router;
- Zod or an equivalently lightweight schema validator for normalized menu data;
- Vitest and React Testing Library for focused unit/component tests;
- Playwright for browser smoke tests and visual verification;
- ESLint and Prettier.

Target Vercel deployment. The completed repository must build and run locally without relying on undocumented global tools.

Use Server Components by default. Add Client Components only where browser state or interaction requires them, such as the mobile menu, language switcher, and interactive sticky category navigation. Do not turn the entire app into a Client Component.

### Architecture and design patterns

Apply patterns only where they simplify change and testing. Do not create enterprise-style abstractions merely to claim that a pattern was used.

Required architectural boundaries:

1. **Raw data boundary**
   - Preserve the original `menu.json` unchanged.
   - UI components must never import or parse the raw file directly.

2. **Adapter/normalizer**
   - Convert raw records into a clean domain model.
   - Normalize category identifiers, stable item IDs, prices, sorting, and localized names.
   - Detect duplicates, suspicious spellings, mixed-language names, missing translations, and malformed records.
   - Preserve traceability through `sourceRow` or an equivalent source reference.

3. **Repository/data-source boundary**
   - Expose a small read-only interface through which pages obtain menu categories and items.
   - Implement it with local normalized JSON/data now.
   - Keep the boundary replaceable by a future CMS/API without implementing that CMS/API today.

4. **Localization strategy**
   - Centralize locale validation, localized value selection, fallback behavior, and formatting.
   - Do not scatter locale conditionals throughout presentation components.

5. **Composition**
   - Compose pages from focused sections and shared primitives.
   - Avoid giant page components, boolean-driven multi-purpose components, and repeated markup.
   - Prefer explicit variants or separate components when behavior is meaningfully different.

6. **Design tokens**
   - Translate Stitch values into centralized CSS custom properties and Tailwind theme tokens.
   - Do not hard-code recurring colors, widths, typography, or spacing throughout components.

Suggested domain types may resemble:

```ts
type Locale = 'vi' | 'en' | 'ko';

interface LocalizedText {
  vi: string;
  en: string;
  ko: string;
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: LocalizedText;
  priceVnd: number;
  sortOrder: number;
  sourceRow: number;
  needsReview: boolean;
  reviewNotes?: string[];
}
```

Adapt names to the final architecture, but preserve these responsibilities.

### Menu normalization rules

Treat `menu.json` as raw source data.

- Create a normalized menu dataset/model outside the raw file.
- Never alter prices or add/remove products without explicit source evidence.
- Correct obvious spelling and whitespace problems only in the normalized display data.
- Detect exact and likely duplicates. Do not silently delete uncertain duplicates; flag them for review.
- Split mixed Vietnamese, English, and Korean names into separate localized fields where the source supports it.
- When a translation cannot be reliably extracted, create a reasonable translation and mark that item `needsReview` with an explanation.
- Use a documented fallback chain when a translation is missing.
- Never expose internal `categoryCode` values in the UI.
- Format all prices as Vietnamese đồng consistently.
- Produce a human-readable review report listing every correction, generated translation, suspected duplicate, and unresolved ambiguity, including source rows.
- Add automated validation so invalid normalized data fails clearly during development/build or a dedicated validation command.

The website must render from the normalized domain data, not runtime string parsing of the raw multilingual names.

### Internationalization and routing

Implement full i18n for:

- Vietnamese: `vi`;
- English: `en`;
- Korean: `ko`.

Requirements:

- Use locale-prefixed routes such as `/vi`, `/en`, and `/ko`.
- Vietnamese is the default locale.
- All navigation, headings, controls, metadata, alt text, and menu content change with the selected locale.
- Display only the active language, never all three translations together.
- Preserve the equivalent page when switching languages.
- Invalid locales must produce an appropriate not-found or redirect behavior.
- Generate localized metadata, canonical URLs, and `hreflang` alternates.
- Do not use country flags as language controls.
- Ensure Vietnamese and Korean glyph coverage in the chosen font stack.
- Test locale switching and fallback behavior.

### Visual implementation rules

Reproduce Stitch faithfully. Do not substitute generic Tailwind components or a prebuilt component library aesthetic.

- Do not use shadcn/ui or another UI kit unless a very small accessible primitive is genuinely necessary and its visual styling is fully adapted.
- Match the actual Stitch typography, grid, whitespace, colors, image treatment, borders, radii, and responsive composition.
- Avoid SaaS-style rounded cards, excessive pills, heavy shadows, gradients, glassmorphism, and generic coffee imagery unless they appear in Stitch.
- Use supplied NAVIDO photography wherever it matches the design.
- When a required image is missing, use an intentional placeholder with a clear code comment and a documented replacement note. Do not download random copyrighted images.
- Preserve aspect ratios and intentional crops with responsive `sizes` and `object-position`.
- Keep animation restrained and honor `prefers-reduced-motion`.
- Implement visible keyboard focus states, semantic landmarks, accessible navigation, adequate contrast, and meaningful alt text.

Stitch is authoritative, but exported code is not. Rebuild the design using maintainable Next.js components rather than blindly pasting low-quality generated markup.

### Required implementation phases

Proceed in this order:

#### Phase 1 — Foundation

- Scaffold the Next.js TypeScript project with `pnpm`.
- Configure Tailwind, linting, formatting, tests, and strict TypeScript.
- Establish design tokens from Stitch.
- Establish locale routing and dictionaries.
- Create shared layout, header, footer, typography, links/buttons, image treatment, and layout primitives.
- Implement the raw-data, normalization, validation, and repository boundaries.
- Add tests for normalization, duplicate detection, locale fallback, sorting, and price formatting.

Verify the shared header/footer at desktop and mobile sizes before proceeding.

#### Phase 2 — Pages

Implement and visually verify one page at a time in this order:

1. Home
2. Menu
3. Our Space
4. About
5. Visit

Do not implement all pages and postpone visual checking until the end. Each page must pass the visual quality gate below before starting the next page.

#### Phase 3 — Cross-page validation

- Run navigation, locale, responsive, and accessibility smoke tests.
- Check shared component consistency across every route and locale.
- Run menu data validation.
- Run the complete verification suite.
- Build the production app and confirm it is Vercel-ready.

### Mandatory per-page visual quality gate

After implementing **each page or substantial shared UI**, perform this loop:

1. Start a stable local server. Prefer a production build and production server for final page verification; a development server is acceptable during iteration.
2. Open the implemented route with browser automation.
3. Capture full-page screenshots at:
   - desktop: `1440 × 900`;
   - tablet: `768 × 1024`;
   - mobile: `390 × 844`.
4. Retrieve the corresponding Stitch reference through Stitch MCP.
5. Compare implementation and reference systematically:
   - section order and content hierarchy;
   - container widths and alignment;
   - grid, columns, and wrapping;
   - typography family, size, weight, line height, letter spacing, and wrapping;
   - colors, borders, radii, and shadows;
   - vertical rhythm and whitespace;
   - image aspect ratio, crop, size, and position;
   - header/navigation behavior;
   - responsive transformations;
   - overflow, clipping, layout shift, and broken assets;
   - interactive, hover, focus, and active states where applicable.
6. Record concrete discrepancies. Do not use an unsupported statement such as “looks close.”
7. Fix the discrepancies and capture new screenshots.
8. Repeat for up to three correction rounds, or until there are no material differences.
9. Run the relevant functional tests for that page.
10. Save the final screenshots and a short comparison record under a predictable project folder such as `artifacts/visual-qa/<page>/<viewport>/`. Exclude transient artifacts from production output when appropriate.

A page passes only when:

- structure and hierarchy match Stitch;
- major elements align and size correctly;
- typography and wrapping are materially consistent;
- spacing and colors are materially consistent;
- supplied images use the intended crop and placement;
- there is no horizontal overflow, accidental clipping, broken image, or obvious layout shift;
- desktop and mobile behavior are intentional;
- any remaining mismatch is documented with a reason, not ignored.

If Stitch provides no reference for a required viewport, state that explicitly. Use the available Stitch design as the primary reference and derive the missing breakpoint consistently from its design system. Do not claim a direct match where no reference exists.

Do not move to the next page before the current page passes this gate. Do not claim visual fidelity based solely on reviewing source code.

### Testing and quality requirements

At minimum, implement:

- unit tests for raw-menu normalization;
- schema validation tests;
- duplicate and suspicious-data detection tests;
- locale selection and fallback tests;
- price formatting and menu sorting tests;
- focused component tests for language switching and menu category behavior;
- Playwright smoke tests for all five pages;
- Playwright checks for locale navigation and representative mobile/desktop layouts.

Before completion, run and report the exact outcomes of:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

If scripts use different names, document them clearly in `package.json` and README. Do not report success if a command failed. Fix failures within scope before completion.

### SEO and performance

- Use semantic heading hierarchy and landmarks.
- Generate localized page titles and descriptions from verified content.
- Include canonical and alternate locale metadata.
- Provide `robots.txt` and a sitemap appropriate to localized routes.
- Optimize images and fonts without degrading visual fidelity.
- Avoid unnecessary client-side JavaScript and dependencies.
- Prevent obvious cumulative layout shift by reserving image dimensions.
- Use static generation where suitable for this informational site.

Do not invent schema.org facts that are not present in supplied sources.

### Content rules

- Use copy found in Stitch and the supplied brief/assets.
- Missing business content must be represented by an explicit placeholder/TODO and listed in the final handoff.
- Do not fabricate owner stories, awards, reviews, statistics, opening hours, phone numbers, addresses, social links, or ordering URLs.
- Use authentic provided NAVIDO images first.
- Do not fetch or generate replacement photography without explicit approval.

### Documentation and handoff

Create a concise README covering:

- prerequisites and `pnpm` commands;
- local development;
- project structure and architectural boundaries;
- locale routing and how to edit translations;
- how raw menu data becomes normalized data;
- how to run menu validation;
- how to replace image placeholders;
- testing and visual-QA workflow;
- how to deploy to Vercel.

Also produce:

- the menu normalization review report;
- a list of missing business content/assets;
- the final visual-QA screenshot index;
- a page-by-page comparison summary;
- any known visual differences and their reasons.

### Definition of done

The work is complete only when:

- all five pages exist and work in `vi`, `en`, and `ko`;
- language switching preserves the equivalent route;
- the UI reads only normalized menu data;
- the raw `menu.json` remains unchanged;
- uncertain translations, corrections, and duplicates are reported;
- every page has passed its screenshot-based visual quality gate;
- desktop, tablet, and mobile layouts are functional and intentional;
- supplied real images are used appropriately and remaining placeholders are documented;
- accessibility fundamentals are implemented;
- lint, type-check, unit/component tests, Playwright tests, and production build pass;
- the project is ready to deploy to Vercel;
- the README and handoff reports are complete.

At the end, summarize:

1. what was implemented;
2. the final project structure;
3. verification command results;
4. visual-QA results and screenshot locations;
5. menu items requiring owner review;
6. remaining placeholders or missing facts;
7. Vercel deployment instructions.

Do not mark the task complete until you have current evidence for every required verification step.

