import { DocShell } from "../components/DocShell";
import { MetaChips } from "../components/MetaChips";
import type { ChangeRequestDoc as ChangeRequestDocType } from "../types/doc";

export function ChangeRequestDocView({ doc }: { doc: ChangeRequestDocType }) {
  const { meta, cover, change } = doc;

  return (
    <DocShell
      meta={meta}
      cover={cover}
      kindLabel="Change Request Review"
      pages={[
        <>
          <p className="doc-kicker">{change.crId}</p>
          <h1 className="doc-title">{meta.title}</h1>
          {meta.subtitle && <p className="doc-subtitle">{meta.subtitle}</p>}
          <MetaChips meta={meta} />

          <section className="section">
            <h2 className="section__title">Summary</h2>
            <p>{change.summary}</p>
          </section>

          <section className="section">
            <h2 className="section__title">Motivation</h2>
            <p>{change.motivation}</p>
          </section>

          <div className="two-col">
            <section className="section">
              <h2 className="section__title">In scope</h2>
              <ul className="list-clean">
                {change.scope.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            {change.outOfScope && change.outOfScope.length > 0 && (
              <section className="section">
                <h2 className="section__title">Out of scope</h2>
                <ul className="list-clean">
                  {change.outOfScope.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <section className="section">
            <h2 className="section__title">Impact assessment</h2>
            <div className="impact-grid">
              {change.impact.map((row) => (
                <div className="impact-row" key={row.area}>
                  <strong>{row.area}</strong>
                  <span className={`level level--${row.level}`}>{row.level}</span>
                  <span>{row.notes}</span>
                </div>
              ))}
            </div>
          </section>
        </>,
        <>
          <p className="doc-kicker">{change.crId} · continued</p>
          <h1 className="doc-title doc-title--continued">{meta.title}</h1>

          {change.risks && change.risks.length > 0 && (
            <section className="section">
              <h2 className="section__title">Risks</h2>
              <ul className="list-clean">
                {change.risks.map((risk) => (
                  <li key={risk}>{risk}</li>
                ))}
              </ul>
            </section>
          )}

          {change.rollout && change.rollout.length > 0 && (
            <section className="section">
              <h2 className="section__title">Rollout plan</h2>
              <ul className="list-clean">
                {change.rollout.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="section">
            <h2 className="section__title">Review Q&amp;A</h2>
            <div className="qa-list">
              {change.qa.map((item) => (
                <div className="qa-item" key={item.question}>
                  <p className="qa-item__q">{item.question}</p>
                  <p className="qa-item__a">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {change.decision && (
            <section className="section">
              <h2 className="section__title">Decision</h2>
              <div className="callout">{change.decision}</div>
            </section>
          )}
        </>,
      ]}
    />
  );
}
