# Bactiverse codebase

How the site is built today. The original product spec is [2026-11-25-bactiverse-design.md](./2026-11-25-bactiverse-design.md). This file wins when they disagree.

## What it is

A dark, static gallery of bacteria. Each specimen has a visual and a plain-language science pack. A visitor can browse, open a specimen, and copy a grounded prompt for study or writing.

Educational and prompt use only. The site does not give culturing, isolation, weaponization, or home-lab instructions. That stance is on `/about`, in each entry’s disclaimer, and inside every copied prompt.

## Stack

- Astro 7, static output (`output` stays static; no server adapter)
- React islands for the copy button and the 3D viewer (`@astrojs/react`)
- Three.js for the colony viewer
- Content collection of Markdown files
- Hosted as static files (Cloudflare Pages). Node.js 22+

There is no database, no accounts, and no light theme.

## Routes

| URL | File | What it does |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Browse grid, search, category filters |
| `/b/:slug` | `src/pages/b/[slug].astro` | Specimen detail |
| `/about` | `src/pages/about.astro` | Product explanation and safety stance |

The shell is `src/layouts/BaseLayout.astro`: header, category rail, main. Category links are `/?category=<id>`.

## Content

Specimens live in `src/content/bacteria/*.md`. The schema is `bacteriaSchema` in `src/content.config.ts`. The slug is the filename without `.md`.

| Field | Role |
| --- | --- |
| `commonName`, `scientificName` | Names shown in the UI |
| `description` | One-sentence summary and aside copy |
| `caption` | What the visual shows; also the image alt text |
| `image` | SVG still in `public/media/`, used on browse cards that are not live 3D |
| `shape` | `rod`, `spherical`, `spiral`, or `other`. Drives filters and the 3D mesh |
| `tags` | Category chips. Known buckets: `extreme`, `human-related`, `biotech`, plus the shape name |
| `traits` | `shape`, `habitat`, `famousFor` |
| `usefulFor` | Study and writing ideas. Not lab steps |
| `sources` | `{ title, url }` links shown in the aside |
| `disclaimer` | Falls back to `DEFAULT_DISCLAIMER` |

Adding a specimen: add the Markdown file, add `public/media/<slug>.svg`, and give it a color list in `PALETTES` inside `src/components/SpecimenViewer.tsx`. Put the slug in `src/lib/live-specimens.ts` only if that browse card should be 3D.

## Browse

`src/lib/filters.ts` is the category and search logic. The rail and the toolbar both use it. `SearchFilter.astro` repeats the same checks in the browser so filtering does not reload the page.

`src/components/BacteriumCard.astro` renders one card. If `isLiveSpecimen(slug)` is true, the preview is `SpecimenViewer` (`client:visible`). Otherwise it is the SVG.

Live browse slugs, one of each shape:

- `escherichia-coli` (rod)
- `staphylococcus-epidermidis` (spherical)
- `helicobacter-pylori` (spiral)
- `streptomyces-coelicolor` (other)

Those cards idle, and hovering the card speeds the turn a little. `prefers-reduced-motion` freezes motion.

## Detail

`src/pages/b/[slug].astro` builds the page from the content entry.

- Title row: common name, initials avatar, scientific name, and static `21K` / `1.4K` stand-ins.
- Stage: `PreviewStage.astro` mounts `SpecimenViewer` with `quality="detail"`. The camera pulls back so the colony stays inside the stage and does not run under the category rail.
- Panel: `DetailTabs.astro` — Agent (default), Prompt, Facts. Agent includes the real Copy prompt button and a non-link upsell placeholder.
- Action bar (desktop): Save to favorites, Copy to Figma, Export, React. These are visual only. They have no handlers.
- Below: up to six related cards, then an aside with the description, tag links, sources (`#sources`), and `SafetyBanner`.

## 3D viewer

`src/components/SpecimenViewer.tsx` builds one colony from `shape` and paints it from the slug’s palette. Lights are neutral so the colors stay bright on the black stage. Detail pages use a sharper pixel ratio than cards.

Colors are a gallery choice so each specimen reads clearly. They are not Gram-stain colors and they are not a claim about the organism’s real pigment.

## Copy prompt

`src/lib/prompt.ts` (`buildCopyPrompt`) turns a content entry into the clipboard string: identity, traits, study ideas, refusal rules, and the blank `I'm using this for: ___`.

`src/components/CopyPromptButton.tsx` writes that string with the Clipboard API. It is the only working copy action.

## Styles

Global tokens are in `src/styles/tokens.css` (dark only). Page CSS is `global.css`, `browse.css`, `detail.css`, and `about.css`. Components that need their own rules keep a `<style>` block.

## Commands

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
npm run preview
```

`AGENTS.md` tells the dev server to be started with `astro dev --background` when an agent is driving it.
