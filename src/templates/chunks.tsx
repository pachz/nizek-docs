import type { ReactNode } from "react";
import type { ApiParam, DocSection, EndpointSpec } from "../types/doc";
import { SectionBlock } from "./SectionBlocks";

export type ContentChunk = {
  key: string;
  /** Force a new page before this chunk (from section.breakBefore). */
  hardBreakBefore: boolean;
  node: ReactNode;
};

function ParamsPart({
  params,
  title,
}: {
  params: ApiParam[];
  title: string;
}) {
  return (
    <section className="section">
      <h2 className="section__title">{title}</h2>
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
    </section>
  );
}

function expandEndpoint(
  endpoint: EndpointSpec,
  keyPrefix: string,
  hardBreakBefore: boolean,
): ContentChunk[] {
  const chunks: ContentChunk[] = [];
  let first = true;
  const push = (key: string, node: ReactNode) => {
    chunks.push({
      key: `${keyPrefix}-${key}`,
      hardBreakBefore: first ? hardBreakBefore : false,
      node,
    });
    first = false;
  };

  push(
    "hero",
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
    </div>,
  );

  if (endpoint.description || endpoint.auth) {
    push(
      "overview",
      <section className="section">
        <h2 className="section__title">Overview</h2>
        {endpoint.description && <p>{endpoint.description}</p>}
        {endpoint.auth && (
          <div
            className="callout"
            style={{ marginTop: endpoint.description ? 12 : 0 }}
          >
            <strong>Auth:</strong> {endpoint.auth}
          </div>
        )}
      </section>,
    );
  }

  const params = endpoint.params ?? [];
  const PARAM_BATCH = 4;
  for (let i = 0; i < params.length; i += PARAM_BATCH) {
    const slice = params.slice(i, i + PARAM_BATCH);
    const title =
      i === 0 ? "Parameters" : `Parameters · continued`;
    push(`params-${i}`, <ParamsPart params={slice} title={title} />);
  }

  if (endpoint.requestExample) {
    push(
      "request",
      <section className="section">
        <h2 className="section__title">Request example</h2>
        <pre className="code-block">{endpoint.requestExample}</pre>
      </section>,
    );
  }

  if (endpoint.responseExample) {
    push(
      "response",
      <section className="section">
        <h2 className="section__title">Response example</h2>
        <pre className="code-block">{endpoint.responseExample}</pre>
      </section>,
    );
  }

  if (endpoint.statusCodes && endpoint.statusCodes.length > 0) {
    push(
      "status",
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
      </section>,
    );
  }

  if (endpoint.notes && endpoint.notes.length > 0) {
    push(
      "notes",
      <section className="section">
        <h2 className="section__title">Notes</h2>
        <ul className="list-clean">
          {endpoint.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>,
    );
  }

  return chunks;
}

function expandSequence(section: Extract<DocSection, { type: "sequence" }>, keyPrefix: string): ContentChunk[] {
  const steps = section.steps;
  const BATCH = 4;
  const chunks: ContentChunk[] = [];
  for (let i = 0; i < steps.length; i += BATCH) {
    const slice = steps.slice(i, i + BATCH);
    const title =
      i === 0
        ? section.title
        : section.title
          ? `${section.title} · continued`
          : undefined;
    chunks.push({
      key: `${keyPrefix}-seq-${i}`,
      hardBreakBefore: i === 0 ? Boolean(section.breakBefore) : false,
      node: (
        <section className="section">
          {title && <h2 className="section__title">{title}</h2>}
          <ol className="flow-timeline" start={i + 1}>
            {slice.map((step, index) => (
              <li
                className="flow-step"
                key={`${step.actor}-${step.action}-${i + index}`}
              >
                <div className="flow-step__index">{i + index + 1}</div>
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
      ),
    });
  }
  return chunks;
}

function expandQa(section: Extract<DocSection, { type: "qa" }>, keyPrefix: string): ContentChunk[] {
  const items = section.items;
  const BATCH = 3;
  const chunks: ContentChunk[] = [];
  for (let i = 0; i < items.length; i += BATCH) {
    const slice = items.slice(i, i + BATCH);
    chunks.push({
      key: `${keyPrefix}-qa-${i}`,
      hardBreakBefore: i === 0 ? Boolean(section.breakBefore) : false,
      node: (
        <SectionBlock
          section={{
            type: "qa",
            title:
              i === 0
                ? section.title
                : `${section.title ?? "Review Q&A"} · continued`,
            items: slice,
          }}
        />
      ),
    });
  }
  return chunks;
}

/** Flatten doc sections into measurable page chunks (endpoints/sequences/Q&A split). */
export function buildContentChunks(sections: DocSection[]): ContentChunk[] {
  const chunks: ContentChunk[] = [];

  sections.forEach((section, index) => {
    const keyPrefix = section.id ?? `s${index}`;

    if (section.type === "endpoint") {
      chunks.push(
        ...expandEndpoint(
          section.endpoint,
          keyPrefix,
          Boolean(section.breakBefore),
        ),
      );
      return;
    }

    if (section.type === "sequence" && section.steps.length > 4) {
      chunks.push(...expandSequence(section, keyPrefix));
      return;
    }

    if (section.type === "qa" && section.items.length > 3) {
      chunks.push(...expandQa(section, keyPrefix));
      return;
    }

    chunks.push({
      key: keyPrefix,
      hardBreakBefore: Boolean(section.breakBefore),
      node: <SectionBlock section={section} />,
    });
  });

  return chunks;
}

/** Pack chunk heights into pages that fit `available` px (after header). */
export function packChunksIntoPages(
  heights: number[],
  hardBreaks: boolean[],
  available: number,
  firstHeader: number,
  continuedHeader: number,
): number[][] {
  if (heights.length === 0) return [[]];

  const pages: number[][] = [];
  let current: number[] = [];
  let used = firstHeader;
  let pageIndex = 0;

  const headerFor = (idx: number) =>
    idx === 0 ? firstHeader : continuedHeader;

  for (let i = 0; i < heights.length; i++) {
    const h = heights[i];
    const hard = hardBreaks[i];

    if (hard && current.length > 0) {
      pages.push(current);
      current = [];
      pageIndex += 1;
      used = headerFor(pageIndex);
    }

    const fits = used + h <= available + 1;
    if (!fits && current.length > 0) {
      pages.push(current);
      current = [];
      pageIndex += 1;
      used = headerFor(pageIndex);
    }

    current.push(i);
    used += h;
  }

  if (current.length > 0) pages.push(current);
  return pages;
}
