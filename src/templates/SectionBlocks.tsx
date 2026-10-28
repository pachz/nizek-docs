import type {
  ApiParam,
  DataContract,
  DocSection,
  EndpointSpec,
  EndpointSummaryRow,
  FlowStep,
  ImpactRow,
  ChangeQa,
} from "../types/doc";

function ParamsTable({ params }: { params: ApiParam[] }) {
  if (params.length === 0) return null;
  return (
    <div className="table-wrap">
      <table className="doc-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>In</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {params.map((param) => (
            <tr key={`${param.in}-${param.name}`}>
              <td>
                <code>{param.name}</code>
              </td>
              <td>{param.in}</td>
              <td>
                <code>{param.type}</code>
              </td>
              <td>
                {param.required ? (
                  <span className="required">yes</span>
                ) : (
                  "no"
                )}
              </td>
              <td>
                {param.description}
                {param.example && (
                  <>
                    <br />
                    <span className="mono">e.g. {param.example}</span>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EndpointBlock({ endpoint }: { endpoint: EndpointSpec }) {
  return (
    <div className="endpoint-block">
      <div className="endpoint-hero">
        <span className={`method method--${endpoint.method}`}>
          {endpoint.method}
        </span>
        <code className="endpoint-path">
          {endpoint.baseUrl
            ? `${endpoint.baseUrl}${endpoint.path}`
            : endpoint.path}
        </code>
        <p className="endpoint-summary">{endpoint.summary}</p>
      </div>

      {endpoint.description && (
        <section className="section">
          <h2 className="section__title">Overview</h2>
          <p>{endpoint.description}</p>
          {endpoint.auth && (
            <div className="callout" style={{ marginTop: 12 }}>
              <strong>Auth:</strong> {endpoint.auth}
            </div>
          )}
        </section>
      )}

      {endpoint.params && endpoint.params.length > 0 && (
        <section className="section">
          <h2 className="section__title">Parameters</h2>
          <ParamsTable params={endpoint.params} />
        </section>
      )}

      {endpoint.requestExample && (
        <section className="section">
          <h2 className="section__title">Request example</h2>
          <pre className="code-block">{endpoint.requestExample}</pre>
        </section>
      )}

      {endpoint.responseExample && (
        <section className="section">
          <h2 className="section__title">Response example</h2>
          <pre className="code-block">{endpoint.responseExample}</pre>
        </section>
      )}

      {endpoint.statusCodes && endpoint.statusCodes.length > 0 && (
        <section className="section">
          <h2 className="section__title">Status codes</h2>
          <div className="table-wrap">
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                {endpoint.statusCodes.map((row) => (
                  <tr key={row.code}>
                    <td>
                      <code>{row.code}</code>
                    </td>
                    <td>{row.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {endpoint.notes && endpoint.notes.length > 0 && (
        <section className="section">
          <h2 className="section__title">Notes</h2>
          <ul className="list-clean">
            {endpoint.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function EndpointTable({
  title,
  rows,
}: {
  title?: string;
  rows: EndpointSummaryRow[];
}) {
  return (
    <section className="section">
      {title && <h2 className="section__title">{title}</h2>}
      <div className="table-wrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Method</th>
              <th>Path</th>
              <th>Purpose</th>
              {rows.some((r) => r.owner) && <th>Owner</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((ep) => (
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
                {rows.some((r) => r.owner) && (
                  <td>
                    {ep.owner ? (
                      <span className={`owner-tag owner-tag--${ep.owner}`}>
                        {ep.owner}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SequenceBlock({
  title,
  steps,
}: {
  title?: string;
  steps: FlowStep[];
}) {
  return (
    <section className="section">
      {title && <h2 className="section__title">{title}</h2>}
      <ol className="flow-timeline">
        {steps.map((step, index) => (
          <li className="flow-step" key={`${step.actor}-${step.action}-${index}`}>
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
  );
}

function DataContractBlock({ contract }: { contract: DataContract }) {
  return (
    <section className="section">
      <h2 className="section__title">Data contract · {contract.name}</h2>
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
  );
}

function ImpactBlock({ title, items }: { title?: string; items: ImpactRow[] }) {
  return (
    <section className="section">
      <h2 className="section__title">{title ?? "Impact assessment"}</h2>
      <div className="impact-grid">
        {items.map((row) => (
          <div className="impact-row" key={row.area}>
            <strong>{row.area}</strong>
            <span className={`level level--${row.level}`}>{row.level}</span>
            <span>{row.notes}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function QaBlock({ title, items }: { title?: string; items: ChangeQa[] }) {
  // undefined → default label; "" → omit (continuation chunk)
  const heading = title === undefined ? "Review Q&A" : title;
  return (
    <section className="section">
      {heading ? <h2 className="section__title">{heading}</h2> : null}
      <div className="qa-list">
        {items.map((item) => (
          <div className="qa-item" key={item.question}>
            <p className="qa-item__q">{item.question}</p>
            <p className="qa-item__a">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SectionBlock({ section }: { section: DocSection }) {
  switch (section.type) {
    case "paragraph":
      return (
        <section className="section">
          {section.title && (
            <h2 className="section__title">{section.title}</h2>
          )}
          <p>{section.body}</p>
        </section>
      );

    case "list": {
      const ListTag = section.ordered ? "ol" : "ul";
      return (
        <section className="section">
          <h2 className="section__title">{section.title}</h2>
          <ListTag className="list-clean">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ListTag>
        </section>
      );
    }

    case "two-col-lists":
      return (
        <div className="two-col">
          <section className="section">
            <h2 className="section__title">{section.left.title}</h2>
            <ul className="list-clean">
              {section.left.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <section className="section">
            <h2 className="section__title">{section.right.title}</h2>
            <ul className="list-clean">
              {section.right.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      );

    case "qa":
      return <QaBlock title={section.title} items={section.items} />;

    case "impact":
      return <ImpactBlock title={section.title} items={section.items} />;

    case "callout":
      return (
        <section className="section">
          {section.title && (
            <h2 className="section__title">{section.title}</h2>
          )}
          <div className="callout">{section.body}</div>
        </section>
      );

    case "endpoint":
      return <EndpointBlock endpoint={section.endpoint} />;

    case "endpoint-table":
      return <EndpointTable title={section.title} rows={section.rows} />;

    case "sequence":
      return <SequenceBlock title={section.title} steps={section.steps} />;

    case "data-contract":
      return <DataContractBlock contract={section.contract} />;

    case "code":
      return (
        <section className="section">
          {section.title && (
            <h2 className="section__title">{section.title}</h2>
          )}
          <pre className="code-block">{section.code}</pre>
        </section>
      );

    case "status-codes":
      return (
        <section className="section">
          <h2 className="section__title">
            {section.title ?? "Status codes"}
          </h2>
          <div className="table-wrap">
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                {section.items.map((row) => (
                  <tr key={row.code}>
                    <td>
                      <code>{row.code}</code>
                    </td>
                    <td>{row.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      );

    case "params":
      return (
        <section className="section">
          <h2 className="section__title">
            {section.title ?? "Parameters"}
          </h2>
          <ParamsTable params={section.params} />
        </section>
      );

    default:
      return null;
  }
}

/** Split sections into A4 pages using `breakBefore`. */
export function paginateSections(sections: DocSection[]): DocSection[][] {
  if (sections.length === 0) return [[]];

  const pages: DocSection[][] = [];
  let current: DocSection[] = [];

  for (const section of sections) {
    if (section.breakBefore && current.length > 0) {
      pages.push(current);
      current = [];
    }
    current.push(section);
  }

  if (current.length > 0) pages.push(current);
  return pages;
}
