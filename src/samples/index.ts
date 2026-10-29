import type { AnyDoc, DocKind } from "../types/doc";
import { sampleAdr } from "./adr";
import { sampleApiEndpoint } from "./api-endpoint";
import { sampleApiFlow } from "./api-flow";
import { sampleChangeRequest } from "./change-request";
import { samplePostmortem } from "./postmortem";
import { sampleProductBrief } from "./product-brief";
import { sampleReleaseNotes } from "./release-notes";
import { sampleRunbook } from "./runbook";
import { sampleSecurityReview } from "./security-review";
import { sampleTechDesign } from "./tech-design";

export const samples: Record<DocKind, AnyDoc> = {
  "api-endpoint": sampleApiEndpoint,
  "change-request": sampleChangeRequest,
  "api-flow": sampleApiFlow,
  adr: sampleAdr,
  "product-brief": sampleProductBrief,
  "tech-design": sampleTechDesign,
  postmortem: samplePostmortem,
  runbook: sampleRunbook,
  "security-review": sampleSecurityReview,
  "release-notes": sampleReleaseNotes,
};

export const templateOptions: {
  kind: DocKind;
  title: string;
  description: string;
}[] = [
  {
    kind: "api-endpoint",
    title: "API Spec",
    description: "One or many endpoints — params, examples, status codes.",
  },
  {
    kind: "change-request",
    title: "Change Request Review",
    description: "Scope, impact, rollout, Q&A, decision.",
  },
  {
    kind: "api-flow",
    title: "API Flow Proposal",
    description: "Partner sequence, contracts, security, next steps.",
  },
  {
    kind: "adr",
    title: "Architecture Decision",
    description: "Context, decision, consequences, alternatives.",
  },
  {
    kind: "product-brief",
    title: "Product Brief",
    description: "Problem, users, goals, MVP scope, metrics.",
  },
  {
    kind: "tech-design",
    title: "Technical Design",
    description: "Flows, data contracts, API surface, risks.",
  },
  {
    kind: "postmortem",
    title: "Incident Postmortem",
    description: "Impact, timeline, root cause, action items.",
  },
  {
    kind: "runbook",
    title: "Runbook",
    description: "When to use, procedure, rollback, checks.",
  },
  {
    kind: "security-review",
    title: "Security Review",
    description: "Scope, threats, controls, recommendation.",
  },
  {
    kind: "release-notes",
    title: "Release Notes",
    description: "Highlights, new/fixes, breaking changes.",
  },
];
