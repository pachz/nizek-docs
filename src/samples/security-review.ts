import type { AnyDoc } from "../types/doc";

export const sampleSecurityReview: AnyDoc = {
  kind: "security-review",
  meta: {
    title: "Security review — merchant payout intents API",
    subtitle:
      "Authz, abuse, and data-handling checklist before Gear Pay 1.2 GA.",
    project: "Gear Pay",
    version: "SR-31",
    date: "25 Oct 2026",
    author: "Nizek Security",
    reviewers: ["Payments", "Platform"],
    status: "review",
    classification: "Internal · Security",
    tags: ["security", "payouts"],
  },
  cover: {
    enabled: true,
    eyebrow: "Security Review",
    headline: "Merchant payout intents API",
    description:
      "Threat notes, controls, and residual risks for payout intent create/confirm.",
  },
  kicker: "SR-31",
  sections: [
    {
      type: "paragraph",
      title: "Scope",
      body: "POST create, POST confirm, GET status for payout intents. Excludes bank-rail connectors and admin force-payout tools.",
    },
    {
      type: "list",
      title: "Assets & trust boundaries",
      items: [
        "Merchant JWT (`payouts:write` / `payouts:read`)",
        "Idempotency-Key header store (24h)",
        "Bank account identifiers on merchant profile",
      ],
    },
    {
      type: "impact",
      title: "Threat × residual risk",
      items: [
        {
          area: "Authz bypass",
          level: "low",
          notes: "MerchantId from token; path id must match — covered by tests",
        },
        {
          area: "Replay / double payout",
          level: "medium",
          notes: "Mitigated by idempotency + intent expiry; monitor 409 rate",
        },
        {
          area: "Data exposure in logs",
          level: "low",
          notes: "Account numbers redacted; memo free-text length capped",
        },
      ],
    },
    {
      breakBefore: true,
      type: "list",
      title: "Required controls before GA",
      ordered: true,
      items: [
        "Rate limit confirm to 30/min/merchant",
        "WAF rule on payout path anomalies",
        "Security regression tests for cross-merchant access",
      ],
    },
    {
      type: "callout",
      title: "Recommendation",
      body: "Approve with controls above tracked in SR-31 checklist. No blocking findings.",
    },
  ],
};
