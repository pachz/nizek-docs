# Nizek Docs — AI system prompt

**Source of truth:** `api/_lib/systemPrompt.ts` (also used by `/api/generate`).

Cursor skill (any project): `~/.cursor/skills/nizek-docs/` — same schema; PDF via `scripts/render.mjs`.

## Template / kind

`kind` is a **voice + structure hint only** — not a fixed layout. Every doc is `meta` + `cover` + `sections[]`.

Kinds: `api-endpoint` | `change-request` | `api-flow` | `adr` | `product-brief` | `tech-design` | `postmortem` | `runbook` | `security-review` | `release-notes`

For the full prompt text and section catalog, copy from `api/_lib/systemPrompt.ts` or the skill’s `schema.md`.
