# NAVIDO release checklist

## Verified in the repository

- [x] Existing Vercel project linkage is present for `navido-website`.
- [x] `pnpm validate:menu` passes without mutating `menu.json` or generated menu data.
- [x] `pnpm test` passes (90 tests).
- [x] `pnpm typecheck`, `pnpm lint`, and `pnpm format:check` pass.
- [x] `pnpm build` prerenders 18 localized content routes plus framework, robots, and sitemap outputs.
- [x] `pnpm test:e2e --reporter=dot` passes (167 tests).
- [x] Roastery visual evidence is indexed under `artifacts/visual-qa/roastery/`.

## Vercel project settings

1. Set `NEXT_PUBLIC_SITE_URL` to the verified HTTPS production origin, for example `https://navido.vn` only after the domain is confirmed.
2. Do not set it to a Vercel preview, localhost, an HTTP URL, or a URL with a path/query/hash. The application rejects those values.
3. Keep the existing pnpm build command; it runs menu validation before `next build`.
4. Attach the custom domain in Vercel and wait for its certificate to become active.

## Post-deploy smoke checks

Run each locale and page family:

- `/vi`, `/vi/menu`, `/vi/our-space`, `/vi/about`, `/vi/roastery`, `/vi/visit`
- Repeat for `/en` and `/ko`.
- Confirm `robots.txt` points to the production sitemap.
- Confirm `sitemap.xml` contains all 18 localized URLs.
- Confirm each page has a production canonical URL, three locale alternates, and one `CafeOrCoffeeShop` JSON-LD block.
- Click-test Maps, telephone, GrabFood, Facebook, Instagram, Zalo, and email actions.
- Run Lighthouse/Web Vitals on Home, Menu, Roastery, and Visit at desktop and mobile widths.

## Remaining owner inputs

- Verified production domain.
- Confirmation to deploy to the linked Vercel project.
- Final Roastery machine/process/team/packaging photography when available.
