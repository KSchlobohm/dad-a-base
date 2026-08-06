# Copilot Instructions

## Commands

```bash
npm ci                  # install locked dependencies
npm run dev             # serve the Vite development app
npm test                # run unit tests
npm run test:e2e        # build and run Playwright tests
npm run check           # run the complete quality gate
```

Playwright tests run against Chromium and exercise the production build beneath `/dad-a-base/`.

## Architecture

This is a framework-free, client-only Vite and TypeScript progressive web app:

- **`index.html`** — markup and layout
- **`src/jokes.ts`** — canonical joke data
- **`src/domain/jokeDeck.ts`** — DOM-independent navigation and reveal state
- **`src/main.ts`** — DOM rendering and event wiring
- **`src/style.css`** — all styles
- **`vite.config.ts`** — `/dad-a-base/` build path and generated PWA

There is no framework, backend, account, remote persistence, analytics, or telemetry.

## Key Conventions

**Jokes must work verbally.** All jokes must land when spoken aloud — no visual or written-only punchlines (e.g. a punchline that only works because of spelling). When adding jokes, verify the punchline makes sense heard out loud.

**Jokes are hardcoded in two places.** `src/jokes.ts` holds the canonical runtime array. `tests/dad-a-base.spec.ts` has an independent copy used to characterize exact production output. When changing jokes, update both.

**State transitions are pure.** Navigation and reveal changes belong in `src/domain/jokeDeck.ts`; navigation must always reset the punchline to hidden.

**Setup and punchline are separate DOM elements.** `#setup-text` is always visible; `#punchline-text` starts hidden and is toggled by tapping the card. Navigation through `nextJoke` or `previousJoke` always resets the punchline to hidden. Use `.hidden` (a `display:none` utility class) to control punchline visibility.

**Tests use `#setup-text` and `#punchline-text`** — these IDs are load-bearing compatibility contracts.
