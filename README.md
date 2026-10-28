# Nizek Docs

Document generator for **Nizek Startups** — shared design language for quick internal and partner-facing docs.

## Templates

| Template | Use when |
| --- | --- |
| **API Endpoint** | Speccing a new endpoint (method, params, examples, status codes) |
| **Change Request Review** | CR review with scope, impact, rollout, and Q&A |
| **API Flow Proposal** | Proposing an integration sequence to a third party |

All templates share the same chrome: Nizek mark, “Nizek Startups” lockup, optional dark cover page. Page size is fixed **A4** (`210×297mm`) for preview and print.

## Run

```bash
npm install
npm run dev
```

Open the local URL, pick a template, toggle the cover page, then **Print / Save PDF**.

## Design tokens

- Purple `#5439AA` · Pink accent `#FF3366` (logo dot) · Ink `#08090A` · Paper `#F7F6FB`
- Official wordmark SVGs (same assets as tadawi/ebh/aljabri backends): `public/nizek-logo.svg` (ink) and `public/nizek-logo-white.svg` (covers)
- Display / UI: Outfit · Body: Source Serif 4 · Code: IBM Plex Mono

## Extending

1. Add a type in `src/types/doc.ts`
2. Add a sample in `src/samples/`
3. Add a view in `src/templates/`
4. Wire it in `DocumentRenderer` and `templateOptions`
