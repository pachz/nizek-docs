import { DocShell } from "../components/DocShell";
import { MetaChips } from "../components/MetaChips";
import type { ApiFlowDoc } from "../types/doc";

export function ApiFlowProposalView({ doc }: { doc: ApiFlowDoc }) {
  const { meta, cover, proposal } = doc;

  return (
    <DocShell
      meta={meta}
      cover={cover}
      kindLabel="API Flow Proposal"
      pages={[
        <>
          <p className="doc-kicker">
            Partner integration · {proposal.partner}
          </p>
          <h1 className="doc-title">{meta.title}</h1>
          {meta.subtitle && <p className="doc-subtitle">{meta.subtitle}</p>}
          <MetaChips meta={meta} />

          <section className="section">
            <h2 className="section__title">Objective</h2>
            <p>{proposal.objective}</p>
          </section>

          <section className="section">
            <h2 className="section__title">Context</h2>
            <p>{proposal.context}</p>
          </section>

          {proposal.assumptions && proposal.assumptions.length > 0 && (
            <section className="section">
              <h2 className="section__title">Assumptions</h2>
              <ul className="list-clean">
                {proposal.assumptions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}
        </>,
        <>
          <p className="doc-kicker">
            Partner integration · {proposal.partner} · continued
          </p>
          <h1 className="doc-title doc-title--continued">Proposed sequence</h1>

          <section className="section">
            <ol className="flow-timeline">
              {proposal.sequence.map((step, index) => (
                <li className="flow-step" key={`${step.actor}-${step.action}`}>
                  <div className="flow-step__index">{index + 1}</div>
                  <div>
                    <p className="flow-step__actor">{step.actor}</p>
                    <p className="flow-step__action">{step.action}</p>
                    {step.detail && (
                      <p className="flow-step__detail">{step.detail}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </>,
        <>
          <p className="doc-kicker">
            Partner integration · {proposal.partner} · continued
          </p>
          <h1 className="doc-title doc-title--continued">
            Contracts &amp; next steps
          </h1>

          <section className="section">
            <h2 className="section__title">Endpoints</h2>
            <div className="table-wrap">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Path</th>
                    <th>Purpose</th>
                    <th>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.endpoints.map((ep) => (
                    <tr key={`${ep.method}-${ep.path}`}>
                      <td>
                        <span
                          className={`method method--${ep.method}`}
                          style={{ display: "inline-block" }}
                        >
                          {ep.method}
                        </span>
                      </td>
                      <td>
                        <code>{ep.path}</code>
                      </td>
                      <td>{ep.purpose}</td>
                      <td>
                        <span className={`owner-tag owner-tag--${ep.owner}`}>
                          {ep.owner}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {proposal.dataContracts?.map((contract) => (
            <section className="section" key={contract.name}>
              <h2 className="section__title">
                Data contract · {contract.name}
              </h2>
              <div className="table-wrap">
                <table className="doc-table">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Type</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contract.fields.map((field) => (
                      <tr key={field.name}>
                        <td>
                          <code>{field.name}</code>
                        </td>
                        <td>
                          <code>{field.type}</code>
                        </td>
                        <td>{field.notes ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          {proposal.security && proposal.security.length > 0 && (
            <section className="section">
              <h2 className="section__title">Security</h2>
              <ul className="list-clean">
                {proposal.security.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          <div className="two-col">
            {proposal.openQuestions && proposal.openQuestions.length > 0 && (
              <section className="section">
                <h2 className="section__title">Open questions</h2>
                <ul className="list-clean">
                  {proposal.openQuestions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
            {proposal.nextSteps && proposal.nextSteps.length > 0 && (
              <section className="section">
                <h2 className="section__title">Next steps</h2>
                <ul className="list-clean">
                  {proposal.nextSteps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </>,
      ]}
    />
  );
}
