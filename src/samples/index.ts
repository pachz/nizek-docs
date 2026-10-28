import type { AnyDoc, DocKind } from "../types/doc";
import { sampleApiEndpoint } from "./api-endpoint";
import { sampleApiFlow } from "./api-flow";
import { sampleChangeRequest } from "./change-request";

export const samples: Record<DocKind, AnyDoc> = {
  "api-endpoint": sampleApiEndpoint,
  "change-request": sampleChangeRequest,
  "api-flow": sampleApiFlow,
};

export const templateOptions: {
  kind: DocKind;
  title: string;
  description: string;
}[] = [
  {
    kind: "api-endpoint",
    title: "API Endpoint",
    description: "Method, path, params, examples, and status codes.",
  },
  {
    kind: "change-request",
    title: "Change Request Review",
    description: "Scope, impact, rollout, and Q&A for a CR.",
  },
  {
    kind: "api-flow",
    title: "API Flow Proposal",
    description: "Third-party sequence, contracts, and next steps.",
  },
];
