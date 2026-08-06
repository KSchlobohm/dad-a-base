# Dependencies

Dad-A-Base has no server runtime and no production JavaScript dependencies. Vite bundles the static client and generates its PWA assets.

## Toolchain

| Package | Purpose |
|---|---|
| Vite | Development server and production build |
| TypeScript | Strict static type-checking |
| ESLint and typescript-eslint | JavaScript and TypeScript linting |
| Playwright | Production browser journeys |
| tsx and Node test runner | DOM-independent unit tests |
| vite-plugin-pwa | Manifest and offline app-shell generation |

Use `npm ci` so local and CI installs follow `package-lock.json`.
