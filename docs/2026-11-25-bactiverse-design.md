# Bactiverse (working name) — Design Spec

Date: 2026-11-25  
Status: Original product spec. The shipped site has moved on.  
Current architecture: [codebase.md](./codebase.md)

The sections below are the spec this repo was built from. Where they disagree with the code, trust `docs/codebase.md` and the source. Notable shipped differences:

- The site is Astro (static) with a React island for clipboard copy and a Three.js colony viewer. It is dark only.
- Every detail page renders a live 3D colony. Four browse cards do too (`src/lib/live-specimens.ts`). The other browse cards use SVG stills in `public/media/`.
- The detail panel is Agent / Prompt / Facts. Sources and the safety note sit in the aside, not in a fourth tab.
- The action bar (Save to favorites, Copy to Figma, Export, React) and the 21K / 1.4K counts are visual placeholders. Copy prompt in the Agent panel is the working clipboard action.

## 1. Problem and goal

People browsing science often want a **visual hook** plus a **reusable text pack** they can drop into their own writing, study planning, or LLM chats — without needing a full textbook or a wet-lab manual.

**Bactiverse** is an open catalogue of bacteria in the shape of Uiverse: browse visuals → open one → inspect what makes it → **copy a prompt** for use in the user’s own projects, experiments (as thought/study design), or LLM workflows.

## 2. Product one-liner

An open gallery of bacteria where each entry is a cool scientific 3D visual plus a plain-language science pack you can copy as a prompt into your own work.

## 3. Audience

**Anyone** for v1 (students, hobbyists, creators, curious adults). Keep language plain. Do not assume the visitor is a professional scientist.

## 4. Approach (chosen)

**Approach 1 — Gallery + fact packs + pre-made 3D**

- Uiverse-shaped static site
- Curated entries with pre-rendered 3D stills or short animation loops
- Client-side **Copy prompt** built from each entry’s science pack
- No accounts, no community uploads, no live molecule viewer in v1

Deferred: other kingdoms’ catalogs, MCP/connector + subscription, community submissions, accounts/favorites, interactive WebGL structure viewers, deep wet-lab protocol generation.

## 5. User journey

1. Land on **Browse** — dark grid of 3D microbe cards; search, tags, simple filters
2. Click an entry → **Detail** page
3. Inspect preview (still or loop) + facts + sources
4. Click **Copy prompt** → clipboard text for an LLM / personal notes
5. User pastes into their own tool and fills “I’m using this for: …”

Optional later: submit new organisms (community).

## 6. Entry (card) model

Each entry includes (v1 values are bacteria-only; schema stays kingdom-agnostic):

### Identity
- `domain` / clade tag for future catalogs: `bacteria` | `archaea` | `animals` | `fungi` | `plants` | `algae_other` (v1 ships only `bacteria`)
- Common name + scientific name
- Slug and tags

### Visual
- Hero 3D render or short loop (scientific / specimen-gallery look, e.g. molecular or whole-cell 3D style)
- Plain-language caption of what the image shows

### Science pack
- One-sentence description
- Key traits (shape, habitat, “famous for…”)
- “Useful for studying…” ideas aimed at writing, simulations, learning, thought experiments — **not** wet-lab steps
- Source links (public, citable references used while curating)
- Safety disclaimer: educational / prompt use only

### Copy prompt payload
Generated client-side from the pack, including:
- Identity and traits
- Instruction: do not invent facts; state uncertainty; refuse dangerous lab instructions
- User blank: `I’m using this for: ___`
- Ask for help with study planning or writeups, **not** culturing / weaponization / home lab recipes

### Gallery metadata (v1)
- Tags, category filters
- Search by name
- Skip accounts, view counts, and saves unless trivial later

## 7. Site map

| Page | Purpose |
| --- | --- |
| `/` Browse | Grid, search, filters, tags |
| `/b/:slug` Detail | Preview + Prompt / Facts / Sources tabs; Copy prompt CTA |
| `/about` | Product explanation, how prompts work, safety stance |

Later: `/submit` or similar for community.

## 8. UI direction

- Dark gallery shell inspired by Uiverse’s browse/detail split
- **3D visuals are the hero**, not decorative gradients
- Browse: left category rail + main grid of cards (thumbnail, name, tags)
- Detail: large preview stage; right panel tabs **Prompt** (default), **Facts**, **Sources**; primary **Copy prompt**
- Brand name is a strong first-viewport signal
- Avoid generic purple-glow “AI product” aesthetics; lean clean lab / specimen-gallery atmosphere

Starter filter ideas (can shrink for MVP): All, Rod-shaped, Spherical, Spiral, Extreme environments, Human-related, Useful in biotech; plus optional Animated / Still.

## 9. Content pipeline (v1)

1. Select organism from public, license-safe, citable sources
2. Rewrite a short plain-language science pack (curator-owned wording)
3. Attach a 3D still or loop (original render, properly licensed asset, or credited public scientific visualization)
4. Store as a content record (Markdown or JSON front matter) + asset files
5. Build step includes the entry in the static catalog

**Volume target:** 12–24 curated entries for MVP.

**Sources:** curator pulls from public science references; site does not claim to be a primary taxonomic authority. Always show outbound source links.

**Community (later):** submission + review flow after the curated core is solid.

## 10. Safety and trust

On-site and inside every copied prompt:

- Educational and research-writing aid only
- No culturing, isolation, weaponization, or “grow this at home” guidance
- LLM instructed to refuse dangerous lab instructions and not invent facts beyond the pack
- Sources visible on the detail page

This product helps people **think and write with grounded organism context**, not perform wet-lab work.

## 11. Technical architecture

- **Stack:** static frontend (Vite + React **or** Astro — choose at implementation plan time)
- **Hosting:** Cloudflare Pages
- **Workers:** none required for v1 (add later only if needed)
- **Data:** local content files + static media in the repo (or Pages-compatible asset pipeline)
- **No** user accounts, database, or auth in v1
- **Copy prompt:** pure client-side string build + clipboard API

### Data flow

```
Content files + 3D assets
        → static build
        → Browse catalog
        → Detail page (visual + pack)
        → Copy prompt (clipboard)
```

## 12. MVP definition of done

- [ ] 12–24 curated bacteria entries with visuals + science packs + sources
- [ ] Browse page with search and basic filters/tags
- [ ] Detail page with preview, Prompt/Facts/Sources, working Copy prompt
- [ ] About page with usage + safety
- [ ] Deployed on Cloudflare Pages
- [ ] Prompt template includes guardrails and “I’m using this for” blank

## 13. Non-goals (v1)

- Shipping Archaea / Animals / Fungi / Plants / Algae catalogs (schema only; see §16)
- MCP server, billing, or subscription gates
- Community uploads and moderation
- User accounts, favorites, challenges
- Live interactive molecular viewers (Mol*/WebGL)
- Generating real wet-lab protocols
- Paid APIs required for normal browsing

## 14. Open decisions (non-blocking for spec approval)

- Final product name (working name: Bactiverse)
- Vite+React vs Astro
- Exact public source list and media licensing checklist per asset
- Whether animated loops ship in the first 12 or start still-only

## 15. Success criteria

A visitor can find a bacterium visually, open it, understand it in plain language, copy a grounded prompt, and paste that into an LLM or personal notes to support their own study or project — without the site becoming a lab manual.

## 16. Future platform — multi-kingdom + MCP (not in MVP)

Bacteria is the first catalog. The same product loop is meant to cover the tree of life over time:

```
Life
├── Bacteria      ← v1 (this spec)
├── Archaea
└── Eukarya
    ├── Animals
    ├── Fungi
    ├── Plants
    └── Algae / other
```

### Product shape
- **One platform, many catalogs** — shared UI and entry schema; routes like `/bacteria`, `/archaea`, `/fungi`, etc.
- **Do not** build six separate apps. Expand content under one content model so tools can query across kingdoms later.
- MVP remains **bacteria-only** in the UI; other clades are empty until curated.

### MCP / connector (later)
- An MCP server (or similar agent connector) that can search and fetch organism packs across catalogs
- Example use: “pull rock-boring bacteria + Cliona + Ostreobium for this study prompt”
- Returns grounded packs (identity, traits, sources, guardrails) — not wet-lab protocols

### Monetization sketch (later, after the free loop works)
- Public site stays the top of funnel: browse + single-entry copy prompt
- Subscription more naturally fits **cross-catalog agent access**, larger libraries, private/team collections, higher rate limits — not charging just to look at cards
- No paid gate in v1

### Explicitly out of bacteria MVP
- Extra kingdom browse pages (beyond a placeholder “more coming” if desired)
- MCP server, auth, billing, API keys
- Cross-catalog search UI

### Design rule for implementation
Keep the content schema and prompt builder **kingdom-agnostic** from day one so adding Archaea/Animals/etc. is mostly new content + filters, not a rewrite.
