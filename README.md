# Dad-A-Base

A framework-free progressive web app that presents a curated set of dad jokes in a tap-to-reveal card.

## Features

- Reveal or hide each punchline by tapping the card.
- Move through the joke collection with buttons or arrow keys.
- Install the app and reopen its cached app shell offline.
- Receive an explicit prompt before activating an updated service worker.

## Development

Requires Node.js 22 and npm.

```sh
npm ci
npm run dev
```

Vite serves the development app at `http://localhost:5173`.

Run the same quality gate used by GitHub Actions:

```sh
npx playwright install chromium
npm run check
```

The quality gate runs ESLint, unit tests, a strict TypeScript production build, and Playwright journeys against the built application.

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm test` | Run DOM-independent unit tests |
| `npm run test:e2e` | Build and run Chromium journeys |
| `npm run build` | Type-check and create `dist` |
| `npm run preview` | Preview the current production build |
| `npm run check` | Run the complete quality gate |
| `npm run evidence -- <directory>` | Write a local evidence manifest and logs |

## Architecture

Dad-A-Base remains a client-only, framework-free application:

- `src/jokes.ts` owns the canonical joke collection.
- `src/domain/jokeDeck.ts` owns DOM-independent navigation and reveal state.
- `src/main.ts` renders the browser UI and wires browser events.
- `src/style.css` preserves the card presentation.
- `vite-plugin-pwa` generates the manifest, offline app shell, and update lifecycle.

See [Architecture decisions](docs/architecture.md) for the comparison with Packback and checklist-map.

## GitHub Pages

Vite builds all production assets for the `/dad-a-base/` project path. Pull requests targeting `main` run the quality gate without deploying. Successful pushes to `main` deploy the `dist` artifact through GitHub Pages.

See the [manual smoke checklist](docs/manual-smoke-checklist.md) for post-deployment checks.

## Local evidence package

The evidence command stores logs, screenshots, hashes, acceptance-criterion mappings, and a source fingerprint outside the repository:

```sh
npm run evidence -- C:\path\to\local\evidence
```

The session-scoped evidence canvas reads `evidence-manifest.json` from that directory. Evidence is marked stale whenever the recorded source fingerprint no longer matches the current workspace.
