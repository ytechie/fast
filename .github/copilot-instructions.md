# OMAD Fast — Copilot Instructions

## Project shape

A zero-build, installable PWA for tracking One Meal A Day fasts. Pure static files served from the repo root — no bundler, no package.json, no test suite, no lint config. The entire app is:

- `index.html` — markup for both views (Timer + History) and all modals; everything is pre-rendered and toggled via `.hidden` / `.active` classes.
- `app.js` — single IIFE (`(() => { "use strict"; ... })()`), vanilla JS, no dependencies.
- `styles.css` — all styling; design tokens live in `:root` CSS variables (`--bg`, `--accent`, etc.).
- `service-worker.js` — offline cache-first shell; `ASSETS` array must list every file the app needs offline.
- `manifest.json`, `icon.svg` — PWA install metadata.

## Run / debug

No build step. Serve the directory over HTTP (service workers don't run from `file://`):

```
python3 -m http.server 8000
# then open http://localhost:8000
```

Iterate by editing files and hard-reloading. There are no tests, linters, or formatters configured — don't add them unless asked.

## Shipping changes that affect cached assets

The service worker is cache-first, so users won't see updates until the SW activates a new cache. **Whenever you change `index.html`, `app.js`, `styles.css`, `manifest.json`, or `icon.svg`, bump `CACHE_NAME` in `service-worker.js`** (e.g. `omad-v18` → `omad-v19`). The activate handler deletes any cache whose name doesn't match, which is how old assets get evicted. If you add a new top-level asset, also append it to the `ASSETS` array.

The app already wires an "update available" banner (`#update-banner` + `btn-update-refresh`) via the SW lifecycle in `app.js` — reuse it, don't roll a new update flow.

## State & data model

- All persistent state lives in `localStorage` under the key `omad-data`, shape:
  `{ currentFast: {id, startTime} | null, history: [{id, startTime, endTime}], lastBackupAt: ISOString | null, version: 1 }`
- `loadData()` is defensive about missing fields — when adding a new top-level field, add a backfill line there too (see how `lastBackupAt` is handled).
- Times are stored as ISO strings; arithmetic is done in ms via `Date.parse` / `new Date(...).getTime()`.
- The in-memory `state` object is the single source of truth; mutate it then call `saveData(state)` then re-render. Don't read from `localStorage` outside `loadData()`.
- Backup/restore is JSON export/import of the whole `state` blob; bumping `DATA_VERSION` implies you also need a migration in `loadData`.

## UI conventions

- DOM is grabbed once into the `refs` object near the top of `app.js` — add new elements there rather than calling `getElementById` ad-hoc.
- Visibility is toggled with the `.hidden` class (defined in `styles.css`), not inline `style.display`.
- View switching (Timer vs History) toggles `.active` on `.tab` and `.view` elements and the `hidden` attribute on `<section>`s.
- User-visible strings interpolated into HTML must go through `escapeHtml()`.
- Transient feedback goes through `showToast(msg)` (single shared `#toast` element, ~2.2s).
- Modals follow a shared pattern: `.modal` + `.modal-backdrop` (closed via `data-close` / `data-close-deck` / `data-close-edit-history` attributes) + `.modal-panel`.

## Fasting domain logic

- `STAGES` is the canonical timeline (Fed → Early Fasting → Metabolic Switch → Ketogenesis Rising → Sustained Ketosis). The final stage uses `endHours: Infinity` and is handled specially in stage progress rendering — preserve that pattern if you add stages.
- `getStageForElapsed(ms)` is the only function that maps elapsed time → stage; reuse it.
- `BOOST_MESSAGES` and `TIPS` are flat arrays of `{emoji, text}` shown via the shared "deck" modal (`#deck-modal`) with an "Another" button that picks a new random entry.
- A 1Hz `setInterval` (`tick()`) drives both the active-fast timer and the idle "since last fast" timer; don't spin up additional intervals — extend `tick()`.

## Style

- Vanilla JS only, no frameworks, no build tooling, no npm. If a change tempts you to add a dependency, push back or ask first.
- Match existing formatting (2-space indent, double quotes, semicolons, `const`/`let`).
- Keep `app.js` as a single IIFE — nothing should leak onto `window`.
