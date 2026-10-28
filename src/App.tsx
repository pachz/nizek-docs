import { useMemo, useState } from "react";
import { DocumentRenderer } from "./components/DocumentRenderer";
import { Logo } from "./components/Logo";
import { samples, templateOptions } from "./samples";
import type { AnyDoc, DocKind } from "./types/doc";
import "./styles/app.css";

export default function App() {
  const [kind, setKind] = useState<DocKind>("api-endpoint");
  const [coverEnabled, setCoverEnabled] = useState(true);

  const doc: AnyDoc = useMemo(() => {
    const base = samples[kind];
    return {
      ...base,
      cover: {
        ...base.cover,
        enabled: coverEnabled,
      },
    } as AnyDoc;
  }, [kind, coverEnabled]);

  const active = templateOptions.find((t) => t.kind === kind)!;

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
          <h2>Templates</h2>
          <div className="template-list">
            {templateOptions.map((option) => (
              <button
                key={option.kind}
                type="button"
                className={`template-btn${kind === option.kind ? " is-active" : ""}`}
                onClick={() => setKind(option.kind)}
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
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>
            Print / Save PDF
          </button>
          <p className="hint">
            Use your browser print dialog → Save as PDF. Margins: default or none.
          </p>
        </div>
      </aside>

      <main className="workspace">
        <div className="workspace__bar no-print">
          <div>
            <h2>{active.title}</h2>
            <p>
              {doc.meta.project} · sample preview
              {coverEnabled ? " · with cover" : " · no cover"}
            </p>
          </div>
        </div>
        <DocumentRenderer doc={doc} />
      </main>
    </div>
  );
}
