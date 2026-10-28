import { useMemo, useState } from "react";
import { DocumentRenderer } from "./components/DocumentRenderer";
import { GeneratePanel } from "./components/GeneratePanel";
import { Logo } from "./components/Logo";
import { samples, templateOptions } from "./samples";
import type { AnyDoc, DocKind } from "./types/doc";
import "./styles/app.css";

type AppMode = "samples" | "generate";

export default function App() {
  const [mode, setMode] = useState<AppMode>("samples");
  const [kind, setKind] = useState<DocKind>("api-endpoint");
  const [coverEnabled, setCoverEnabled] = useState(true);
  const [generatedDoc, setGeneratedDoc] = useState<AnyDoc | null>(null);

  const sampleDoc: AnyDoc = useMemo(() => {
    const base = samples[kind];
    return {
      ...base,
      cover: {
        ...base.cover,
        enabled: coverEnabled,
      },
    } as AnyDoc;
  }, [kind, coverEnabled]);

  const activeDoc =
    mode === "generate" && generatedDoc
      ? ({
          ...generatedDoc,
          cover: { ...generatedDoc.cover, enabled: coverEnabled },
        } as AnyDoc)
      : sampleDoc;

  const active = templateOptions.find((t) => t.kind === kind)!;
  const showingGenerated = mode === "generate" && generatedDoc !== null;

  return (
    <div className="app">
      <aside className="sidebar no-print">
        <div className="sidebar__brand">
          <Logo theme="onLight" className="sidebar__logo" />
          <div>
            <h1>Docs</h1>
            <p>Startups</p>
          </div>
        </div>

        <div className="sidebar__section">
          <h2>Section</h2>
          <div className="mode-tabs">
            <button
              type="button"
              className={`mode-tab${mode === "samples" ? " is-active" : ""}`}
              onClick={() => setMode("samples")}
            >
              Samples
            </button>
            <button
              type="button"
              className={`mode-tab${mode === "generate" ? " is-active" : ""}`}
              onClick={() => setMode("generate")}
            >
              Generate
            </button>
          </div>
        </div>

        <div className="sidebar__section">
          <h2>Templates</h2>
          <div className="template-list">
            {templateOptions.map((option) => (
              <button
                key={option.kind}
                type="button"
                className={`template-btn${kind === option.kind ? " is-active" : ""}`}
                onClick={() => {
                  setKind(option.kind);
                  if (mode === "generate") setGeneratedDoc(null);
                }}
              >
                <strong>{option.title}</strong>
                <span>{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar__section">
          <h2>Options</h2>
          <label className="toggle-row">
            <span>Cover page</span>
            <button
              type="button"
              className={`toggle${coverEnabled ? " is-on" : ""}`}
              aria-pressed={coverEnabled}
              onClick={() => setCoverEnabled((v) => !v)}
            />
          </label>
        </div>

        <div className="actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.print()}
            disabled={mode === "generate" && !generatedDoc}
          >
            Print / Save PDF
          </button>
          <p className="hint">
            Use your browser print dialog → Save as PDF. Margins: default or
            none.
          </p>
        </div>
      </aside>

      <main className="workspace">
        {mode === "generate" && (
          <GeneratePanel
            kind={kind}
            coverEnabled={coverEnabled}
            onGenerated={(doc) => {
              setGeneratedDoc(doc);
            }}
          />
        )}

        <div className="workspace__bar no-print">
          <div>
            <h2>{active.title}</h2>
            <p>
              {showingGenerated
                ? `${activeDoc.meta.project} · generated`
                : mode === "generate"
                  ? "Waiting for generation"
                  : `${activeDoc.meta.project} · sample preview`}
              {coverEnabled ? " · with cover" : " · no cover"}
            </p>
          </div>
        </div>

        {(mode === "samples" || generatedDoc) && (
          <DocumentRenderer doc={activeDoc} />
        )}

        {mode === "generate" && !generatedDoc && (
          <div className="generate-empty no-print">
            <p>
              Write a brief above, then generate — or copy the AI prompt and
              paste JSON back.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
