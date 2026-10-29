import type { AnyDoc } from "../types/doc";

export const sampleRunbook: AnyDoc = {
  kind: "runbook",
  meta: {
    title: "Rotate PartnerCo loyalty credentials",
    subtitle:
      "Step-by-step for sandbox and production client-credential rotation.",
    project: "Dabdoob Loyalty",
    version: "RB-07",
    date: "15 Oct 2026",
    author: "Nizek Integrations",
    status: "approved",
    classification: "Internal · Ops",
    tags: ["runbook", "loyalty", "credentials"],
  },
  cover: {
    enabled: true,
    eyebrow: "Runbook",
    headline: "Rotate PartnerCo loyalty credentials",
    description:
      "Safe rotation without dropping in-flight holds.",
  },
  kicker: "RB-07",
  sections: [
    {
      type: "callout",
      title: "When to use",
      body: "Scheduled 90-day rotation, suspected leak, or PartnerCo-initiated revoke. Do not rotate mid-settlement window (cutover after 02:00 Asia/Kuwait).",
    },
    {
      type: "list",
      title: "Prerequisites",
      items: [
        "Access to secrets manager path `loyalty/partnerco/oauth`",
        "PartnerCo portal admin",
        "Feature flag `loyalty.dual_credentials` available",
      ],
    },
    {
      breakBefore: true,
      type: "list",
      title: "Procedure",
      ordered: true,
      items: [
        "Create new client in PartnerCo portal (do not disable old yet)",
        "Store new secret as version N+1; leave N active",
        "Enable dual_credentials so workers try N+1 then N",
        "Run canary hold+commit in sandbox, then 1% prod traffic",
        "After 24h with zero auth failures, disable version N",
        "Revoke old client in PartnerCo portal",
      ],
    },
    {
      type: "list",
      title: "Rollback",
      items: [
        "Turn off dual_credentials and pin secret version N",
        "Page integrations if auth error rate >1% for 5 minutes",
      ],
    },
    {
      type: "qa",
      title: "Checks",
      items: [
        {
          question: "How do we verify success?",
          answer:
            "Auth success rate ≥99.9% and hold create latency p95 within SLO for 1 hour.",
        },
        {
          question: "Who to notify?",
          answer: "#integrations-loyalty and PartnerCo TAM after prod revoke.",
        },
      ],
    },
  ],
};
