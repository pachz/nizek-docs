export type DocKind = "api-endpoint" | "change-request" | "api-flow";

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

export type DocBase = {
  kind: DocKind;
  meta: DocMeta;
  cover: CoverConfig;
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

export type ApiEndpointDoc = DocBase & {
  kind: "api-endpoint";
  endpoint: {
    method: HttpMethod;
    path: string;
    summary: string;
    description: string;
    auth?: string;
    baseUrl?: string;
    params: ApiParam[];
    requestExample?: string;
    responseExample?: string;
    statusCodes: { code: number; meaning: string }[];
    notes?: string[];
  };
};

export type ChangeQa = {
  question: string;
  answer: string;
};

export type ChangeRequestDoc = DocBase & {
  kind: "change-request";
  change: {
    crId: string;
    summary: string;
    motivation: string;
    scope: string[];
    outOfScope?: string[];
    impact: {
      area: string;
      level: "low" | "medium" | "high";
      notes: string;
    }[];
    risks?: string[];
    rollout?: string[];
    qa: ChangeQa[];
    decision?: string;
  };
};

export type FlowStep = {
  actor: string;
  action: string;
  detail?: string;
};

export type ApiFlowDoc = DocBase & {
  kind: "api-flow";
  proposal: {
    partner: string;
    objective: string;
    context: string;
    assumptions?: string[];
    sequence: FlowStep[];
    endpoints: {
      method: HttpMethod;
      path: string;
      purpose: string;
      owner: "nizek" | "partner" | "shared";
    }[];
    dataContracts?: {
      name: string;
      fields: { name: string; type: string; notes?: string }[];
    }[];
    security?: string[];
    openQuestions?: string[];
    nextSteps?: string[];
  };
};

export type AnyDoc = ApiEndpointDoc | ChangeRequestDoc | ApiFlowDoc;
