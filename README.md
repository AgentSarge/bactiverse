# Bactiverse

An open gallery of bacteria where each entry is a specimen visual plus a plain-language science pack you can copy as a prompt into your own study notes or writing tools.

**Educational / prompt use only.** Not for culturing, isolation, weaponization, or home-lab recipes. The live `/about` page spells out the full safety stance.

## Run locally

```sh
npm install
npm run dev
```

| Command           | Action                                      |
| ----------------- | ------------------------------------------- |
| `npm install`     | Install dependencies                        |
| `npm run dev`     | Dev server at `http://localhost:4321`       |
| `npm run build`   | Production build → `./dist/`                |
| `npm run preview` | Preview the production build locally        |

Requires **Node.js 22+** (see `package.json` `engines` and `.node-version`).

## Cloudflare Pages

Static Astro site — **no** `@astrojs/cloudflare` adapter. Pages serves the built files from `dist`.

| Setting        | Value            |
| -------------- | ---------------- |
| Framework      | Astro (or None)  |
| Build command  | `npm run build`  |
| Build output   | `dist`           |
| Root directory | `/` (repo root)  |
| Node version   | `22` (`NODE_VERSION=22` env, or rely on `.node-version`) |
| Production branch | `main`        |

`wrangler.toml` sets `pages_build_output_dir = "dist"` for local `wrangler pages` workflows. Optional local check after a build:

```sh
npm run build
npx wrangler pages dev dist
```

Do not add a Cloudflare Astro adapter for this MVP — output stays fully static.

## Project map

- `/` — Browse (search + category filters + card grid)
- `/b/:slug` — Detail (preview, Prompt / Facts / Sources, Copy prompt)
- `/about` — Product explanation and safety stance
