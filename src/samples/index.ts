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
    title: "API Spec",
    description:
      "One or many endpoints — overview, params, examples, status codes.",
  },
  {
    kind: "change-request",
    title: "Change Request Review",
    description: "Composable sections: scope, impact, rollout, Q&A, decision.",
  },
  {
    kind: "api-flow",
    title: "API Flow Proposal",
    description:
      "Sequence, multi-endpoint table, contracts, security, next steps.",
  },
];
