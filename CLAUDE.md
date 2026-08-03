# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A build scaffold for a Chrome extension (Vite + TypeScript + `@types/chrome`). It contains
build configuration only — **there is no application source in the repo.**

## Critical: `src/` does not exist

Every build config points at a `src/` directory that is absent from the working tree and
has never existed in git history (`git log --all --diff-filter=A -- 'src/*'` returns nothing).
Missing entry points referenced by config:

| Referenced by | Path |
|---|---|
| `tsconfig.json` (`rootDir`, `baseUrl`, `include`) | `src/` |
| `vite.config.js` (popup input) | `src/hello.html` |
| `vite.config.content_scripts.js` (input) | `src/content_scripts.ts` |
| `popup.js` (import) | `./src/constants.js` (exports `HELLO`) |

`npm run build` therefore cannot succeed on a clean checkout. Before any build task, confirm
whether the user intends to create these files or restore them from elsewhere — do not
silently rewrite the configs to work around the absence.

Also absent: `manifest.json`. Nothing in this repo is loadable as a Chrome extension without one.

`popup.js` sits at the repo root and is not an input to either Vite config. It is orphaned
relative to the build.

## Commands

```bash
npm run build   # tsc && vite build && vite build --config=vite.config.content_scripts.js
npm test        # not configured — exits 1
```

There is no lint step and no test framework.

## Build pipeline

Three sequential stages, all under the single `build` script:

1. **`tsc`** — typecheck only. `noEmit: true`, so it never produces output; Vite does all
   emitting. Strict mode is on with `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`,
   and `checkJs: true` (so `.js` files under `src/` are typechecked too).
2. **`vite build`** (`vite.config.js`) — builds the popup from `src/hello.html`.
   `emptyOutDir: true` — this stage wipes `dist/`.
3. **`vite build --config=vite.config.content_scripts.js`** — builds `src/content_scripts.ts`
   as a single `iife` bundle (`inlineDynamicImports: true`), which is what Chrome content
   scripts require. `emptyOutDir: false` so it appends to what stage 2 produced.

**Stage order is load-bearing.** Running the content-scripts config first, or flipping
`emptyOutDir`, destroys the popup output. Both configs use `root: 'src'` with
`outDir: '../dist'`, so output lands in `dist/` at the repo root, with
`entryFileNames: '[name].js'` (no content hashes).

## Repository history

Every commit on `main` is a Dependabot version bump (`.github/dependabot.yml`, weekly npm
updates). There is no feature history to consult for intent.

`.node-version` pins `17.1.0`, which is far below what the current `devDependencies`
(vite `^8`, typescript `^7`) support. Treat it as stale rather than authoritative.
