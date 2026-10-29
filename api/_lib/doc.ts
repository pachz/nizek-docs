export type DocKind =
  | "api-endpoint"
  | "change-request"
  | "api-flow"
  | "adr"
  | "product-brief"
  | "tech-design"
  | "postmortem"
  | "runbook"
  | "security-review"
  | "release-notes";

export type DocMeta = {
  title: string;
  subtitle?: string;
  project: string;
  version?: string;
  date: string;
  author: string;
  reviewers?: string[];
  status?: "draft" | "review" | "approved" | "proposed";
  classification?: string;
  tags?: string[];
};

export type CoverConfig = {
  enabled: boolean;
  eyebrow?: string;
  headline?: string;
  description?: string;
  recipient?: string;
};

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiParam = {
  name: string;
  in: "path" | "query" | "header" | "body";
  type: string;
  required?: boolean;
  description: string;
  example?: string;
};

export type FlowStep = {
  actor: string;
  action: string;
  detail?: string;
};

export type ChangeQa = {
  question: string;
  answer: string;
};

export type ImpactRow = {
  area: string;
  level: "low" | "medium" | "high";
  notes: string;
};

export type EndpointSummaryRow = {
  method: HttpMethod;
  path: string;
  purpose: string;
  owner?: "nizek" | "partner" | "shared";
};

/** Full HTTP endpoint block — use one section per endpoint. */
export type EndpointSpec = {
  method: HttpMethod;
  path: string;
  summary: string;
  description?: string;
  auth?: string;
  baseUrl?: string;
  params?: ApiParam[];
  requestExample?: string;
  responseExample?: string;
  statusCodes?: { code: number; meaning: string }[];
  notes?: string[];
};

export type DataContract = {
  name: string;
  fields: { name: string; type: string; notes?: string }[];
};

type SectionBase = {
  /** Stable key for React; optional. */
  id?: string;
  /** Start a new A4 page before this section. */
  breakBefore?: boolean;
};

export type DocSection =
  | (SectionBase & { type: "paragraph"; title?: string; body: string })
  | (SectionBase & {
      type: "list";
      title: string;
      items: string[];
      ordered?: boolean;
    })
  | (SectionBase & {
      type: "two-col-lists";
      left: { title: string; items: string[] };
      right: { title: string; items: string[] };
    })
  | (SectionBase & { type: "qa"; title?: string; items: ChangeQa[] })
  | (SectionBase & { type: "impact"; title?: string; items: ImpactRow[] })
  | (SectionBase & { type: "callout"; title?: string; body: string })
  | (SectionBase & { type: "endpoint"; endpoint: EndpointSpec })
  | (SectionBase & {
      type: "endpoint-table";
      title?: string;
      rows: EndpointSummaryRow[];
    })
  | (SectionBase & { type: "sequence"; title?: string; steps: FlowStep[] })
  | (SectionBase & { type: "data-contract"; contract: DataContract })
  | (SectionBase & { type: "code"; title?: string; code: string })
  | (SectionBase & {
      type: "status-codes";
      title?: string;
      items: { code: number; meaning: string }[];
    })
  | (SectionBase & {
      type: "params";
      title?: string;
      params: ApiParam[];
    });

/**
 * Unified document model. `kind` is only a template/voice hint for generation
 * and chrome labels — content is always an ordered list of sections.
 */
export type NizekDoc = {
  kind: DocKind;
  meta: DocMeta;
  cover: CoverConfig;
  /** Line above the title on the first content page. */
  kicker?: string;
  sections: DocSection[];
};

export type AnyDoc = NizekDoc;

export const KIND_LABELS: Record<DocKind, string> = {
  "api-endpoint": "API Spec",
  "change-request": "Change Request Review",
  "api-flow": "API Flow Proposal",
  adr: "Architecture Decision",
  "product-brief": "Product Brief",
  "tech-design": "Technical Design",
  postmortem: "Incident Postmortem",
  runbook: "Runbook",
  "security-review": "Security Review",
  "release-notes": "Release Notes",
};

/** All valid kind values (for parsers / skill sync). */
export const DOC_KINDS = Object.keys(KIND_LABELS) as DocKind[];
