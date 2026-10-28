import { DocShell } from "../components/DocShell";
import { MetaChips } from "../components/MetaChips";
import type { ApiEndpointDoc as ApiEndpointDocType } from "../types/doc";

export function ApiEndpointDocView({ doc }: { doc: ApiEndpointDocType }) {
  const { meta, cover, endpoint } = doc;

  return (
    <DocShell
      meta={meta}
      cover={cover}
      kindLabel="API Endpoint"
      pages={[
        <>
          <p className="doc-kicker">Endpoint specification</p>
          <h1 className="doc-title">{meta.title}</h1>
          {meta.subtitle && <p className="doc-subtitle">{meta.subtitle}</p>}
          <MetaChips meta={meta} />

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

          <section className="section">
            <h2 className="section__title">Overview</h2>
            <p>{endpoint.description}</p>
            {endpoint.auth && (
              <div className="callout" style={{ marginTop: 12 }}>
                <strong>Auth:</strong> {endpoint.auth}
              </div>
            )}
          </section>

          <section className="section">
            <h2 className="section__title">Parameters</h2>
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
                  {endpoint.params.map((param) => (
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
          </section>
        </>,
        <>
          <p className="doc-kicker">Endpoint specification · continued</p>
          <h1 className="doc-title doc-title--continued">{meta.title}</h1>

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
        </>,
      ]}
    />
  );
}
