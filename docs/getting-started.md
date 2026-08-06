# Getting started

Dad-A-Base requires Node.js 22 and npm.

## Setup

```sh
npm ci
npx playwright install chromium
```

## Run the app

```sh
npm run dev
```

Vite serves the app at `http://localhost:5173`.

## Validate changes

```sh
npm run check
```

This runs linting, unit tests, strict type-checking, a production build, and Playwright journeys against the built `/dad-a-base/` application.
