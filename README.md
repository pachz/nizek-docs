# Nizek Docs

Document generator for **Nizek Startups** — shared design language for quick internal and partner-facing docs.

## Templates

| Template | Use when |
| --- | --- |
| **API Endpoint** | Speccing a new endpoint (method, params, examples, status codes) |
| **Change Request Review** | CR review with scope, impact, rollout, and Q&A |
| **API Flow Proposal** | Proposing an integration sequence to a third party |

All templates share the same chrome: Nizek mark, “Nizek Startups” lockup, optional dark cover page. Page size is fixed **A4** (`210×297mm`) for preview and print.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional: add OPENAI_API_KEY
npm run dev
```

Runs Vite (UI) + the generate API on `:8787` (proxied as `/api`).

Open the local URL → **Samples** or **Generate**, pick a template, toggle cover, then **Print / Save PDF**.

### Generate (AI)

1. Open **Generate**, choose a template, write a brief.
2. If `OPENAI_API_KEY` is set, click **Generate with AI**.
3. Otherwise **Copy AI prompt** → run in Cursor/ChatGPT/Claude → **Apply JSON**.

System prompt source of truth:
- `src/generate/systemPrompt.ts`
- `prompts/NIZEK_DOCS_SYSTEM.md`

API:
- `GET /api/health`
- `POST /api/generate` `{ kind, brief, coverEnabled, projectHint?, authorHint? }`
- `POST /api/generate/prompt` — assembled system + user messages
- `POST /api/generate/parse` — validate pasted JSON

## Deploy on Vercel

This repo is ready for Vercel (Vite static UI + serverless `/api/*`).

1. Push to GitHub and import the repo in [Vercel](https://vercel.com/new).
2. Framework preset: **Vite** (or leave auto-detect). Build uses `npm run build` → `dist`.
3. Add environment variables (Production + Preview as needed):

| Name | Required | Notes |
| --- | --- | --- |
| `OPENAI_API_KEY` | for Generate with AI | Without it, copy-prompt + paste-JSON still works |
| `OPENAI_BASE_URL` | no | Default `https://api.openai.com/v1` |
| `OPENAI_MODEL` | no | Default `gpt-4.1-mini` |

4. Deploy. UI is at `/`, APIs at `/api/health`, `/api/generate`, etc.

`vercel.json` sets SPA rewrites and `maxDuration: 60` for generation.

```bash
npx vercel          # preview
npx vercel --prod   # production
```

## Design tokens

- Purple `#5439AA` · Pink accent `#FF3366` (logo dot) · Ink `#08090A` · Paper `#F7F6FB`
- Official wordmark SVGs: `public/nizek-logo.svg` (ink) and `public/nizek-logo-white.svg` (covers)
- Display / UI: Outfit · Body: Source Serif 4 · Code: IBM Plex Mono

## Extending

1. Add a type in `src/types/doc.ts`
2. Add a sample in `src/samples/`
3. Add a view in `src/templates/`
4. Update `src/generate/systemPrompt.ts` + `parseDoc.ts`
5. Wire it in `DocumentRenderer` and `templateOptions`
