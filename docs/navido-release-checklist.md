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

- Verified production domain (still pending for canonical/hreflang activation).
- Deployment confirmation: complete; production alias is live.
- Final Roastery machine/process/team/packaging photography when available.

## Deployment evidence — 2026-09-19

- Production deployment: `https://navido-website.vercel.app`
- Vercel deployment ID: `dpl_HbUBf6ow75nTfEqZGDW8uae2Q6ww`
- Build state: READY; all 23 static outputs generated.
- Live smoke: 18 localized routes plus `robots.txt` and `sitemap.xml` returned HTTP 200; each content route exposed one H1 and one title.
- Expected pre-domain state: `robots.txt` has no sitemap URL, `sitemap.xml` is empty, and localized canonical tags are absent because `NEXT_PUBLIC_SITE_URL` is intentionally unset and the Vercel alias is not a canonical origin.
