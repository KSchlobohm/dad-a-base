# Architecture decisions

Dad-A-Base was compared with Packback and checklist-map before migration. The goal was to reuse their proven delivery patterns without importing domain complexity that this small application does not need.

| Pattern | Source | Decision | Rationale |
|---|---|---|---|
| Root-level Vite project | Both | Adopt | Produces a deterministic static artifact and development server. |
| TypeScript and strict checking | checklist-map | Adopt | Protects state transitions and DOM wiring during refactoring. |
| Framework-free ES modules | Both | Adopt | The interaction model does not justify a UI framework. |
| Pure domain modules | checklist-map | Adopt | Joke navigation can be tested without a browser. |
| Flat ESLint configuration | Both | Adopt | Provides one consistent static-analysis command. |
| Unified quality gate | Both | Adopt | Local and CI validation use the same command. |
| GitHub Pages artifact deployment | Both | Adopt | Pull requests validate; successful `main` pushes deploy. |
| Generated manifest and offline shell | Both | Adopt | The complete static experience is small and useful offline. |
| Prompted service-worker updates | Both | Adopt | Prevents an update from unexpectedly reloading the app. |
| Versioned browser persistence | Both | Reject | Dad-A-Base has no mutable user data. |
| Backup/import and QR sharing | Both | Reject | There is no user-owned state or deep-link workflow to transfer. |
| Accounts, sync, analytics, or telemetry | Both | Reject | They add privacy and operational costs without supporting the product. |

## Responsibilities

- `src/jokes.ts` is the canonical, typed joke data.
- `src/domain/jokeDeck.ts` contains immutable navigation and reveal transitions.
- `src/main.ts` owns DOM rendering, event handling, and service-worker update UI.
- `src/style.css` owns presentation.
- `tests/` exercises the production artifact and `/dad-a-base/` path.

The existing joke order, exact text, reveal behavior, navigation wrapping, link behavior, responsive layout, and load-bearing DOM IDs remain compatibility contracts.
