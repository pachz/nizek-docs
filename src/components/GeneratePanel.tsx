import { useEffect, useState } from "react";
import {
  buildGenerationMessages,
  KIND_PROMPT_HINTS,
} from "../generate/systemPrompt";
import { parseGeneratedDoc } from "../generate/parseDoc";
import type { AnyDoc, DocKind } from "../types/doc";
import { templateOptions } from "../samples";

type GeneratePanelProps = {
  kind: DocKind;
  coverEnabled: boolean;
  onGenerated: (doc: AnyDoc) => void;
};

type Health = {
  ok: boolean;
  llmConfigured: boolean;
  model: string | null;
};

export function GeneratePanel({
  kind,
  coverEnabled,
  onGenerated,
}: GeneratePanelProps) {
  const [brief, setBrief] = useState("");
  const [projectHint, setProjectHint] = useState("");
  const [authorHint, setAuthorHint] = useState("Nizek Engineering");
  const [pasteJson, setPasteJson] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assembled, setAssembled] = useState<{ system: string; user: string } | null>(
    null,
  );
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data: Health) => setHealth(data))
      .catch(() =>
        setHealth({ ok: false, llmConfigured: false, model: null }),
      );
  }, []);

  const hint = KIND_PROMPT_HINTS[kind];
  const kindLabel = templateOptions.find((t) => t.kind === kind)?.title ?? kind;

  async function copyAssembledPrompt() {
    const messages = buildGenerationMessages({
      kind,
      brief: brief || "(paste your brief here)",
      coverEnabled,
      projectHint: projectHint || undefined,
      authorHint: authorHint || undefined,
    });
    setAssembled(messages);
    const text = `SYSTEM\n${messages.system}\n\nUSER\n${messages.user}`;
    await navigator.clipboard.writeText(text);
    setStatus("Full system + user prompt copied.");
    setError(null);
  }

  async function generateWithApi() {
    if (!brief.trim()) {
      setError("Add a brief first.");
      return;
    }
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          brief,
          coverEnabled,
          projectHint: projectHint || undefined,
          authorHint: authorHint || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.messages) setAssembled(data.messages);
        throw new Error(data.error || "Generation failed.");
      }
      onGenerated(data.doc as AnyDoc);
      setStatus("Document generated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setBusy(false);
    }
  }

  function applyPastedJson() {
    try {
      const doc = parseGeneratedDoc(pasteJson, kind, coverEnabled);
      onGenerated(doc);
      setStatus("JSON applied.");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON.");
    }
  }

  return (
    <div className="generate-panel no-print">
      <div className="generate-panel__intro">
        <h2>Generate</h2>
        <p>
          Describe what you need. The backend assembles the Nizek Docs system
          prompt + schema, then an AI returns JSON the renderer understands.
        </p>
        <p className="generate-panel__health">
          {!health
            ? "Checking backend…"
            : !health.ok
              ? "Backend unreachable — start with npm run dev (web + api)."
              : health.llmConfigured
                ? `LLM ready · ${health.model}`
                : "Backend has no OPENAI_API_KEY — add it to .env.local and restart, or copy the prompt / paste JSON."}
        </p>
      </div>

      <label className="field">
        <span>Template</span>
        <strong>{kindLabel}</strong>
        <em>{hint}</em>
      </label>

      <label className="field">
        <span>Brief</span>
        <textarea
          rows={8}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder={hint}
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Project hint</span>
          <input
            value={projectHint}
            onChange={(e) => setProjectHint(e.target.value)}
            placeholder="e.g. VenueBook GCC"
          />
        </label>
        <label className="field">
          <span>Author hint</span>
          <input
            value={authorHint}
            onChange={(e) => setAuthorHint(e.target.value)}
            placeholder="Nizek Engineering"
          />
        </label>
      </div>

      <div className="generate-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy}
          onClick={() => void generateWithApi()}
        >
          {busy ? "Generating…" : "Generate with AI"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => void copyAssembledPrompt()}
        >
          Copy AI prompt
        </button>
      </div>

      <label className="field">
        <span>Or paste AI JSON</span>
        <textarea
          rows={6}
          value={pasteJson}
          onChange={(e) => setPasteJson(e.target.value)}
          placeholder='{ "kind": "...", "meta": { ... } }'
          spellCheck={false}
        />
      </label>
      <button type="button" className="btn btn-ghost" onClick={applyPastedJson}>
        Apply JSON
      </button>

      {status && <p className="generate-status">{status}</p>}
      {error && <p className="generate-error">{error}</p>}

      {assembled && (
        <details className="generate-assembled">
          <summary>Assembled prompt preview</summary>
          <pre className="code-block generate-assembled__pre">
            {`SYSTEM\n${assembled.system}\n\nUSER\n${assembled.user}`}
          </pre>
        </details>
      )}
    </div>
  );
}
