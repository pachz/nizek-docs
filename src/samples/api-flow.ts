import type { ApiFlowDoc } from "../types/doc";

export const sampleApiFlow: ApiFlowDoc = {
  kind: "api-flow",
  meta: {
    title: "Loyalty points settlement with PartnerCo",
    subtitle:
      "Proposed real-time earn/burn flow between Nizek-built merchant apps and PartnerCo Loyalty Cloud.",
    project: "Dabdoob Loyalty",
    version: "0.1",
    date: "27 Oct 2026",
    author: "Nizek Integrations",
    status: "proposed",
    classification: "External · Proposal",
    tags: ["loyalty", "partner", "settlement"],
  },
  cover: {
    enabled: true,
    eyebrow: "Third-party API Flow",
    headline: "Loyalty points settlement with PartnerCo",
    description:
      "A concise proposal for how earn, burn, and reconciliation should work across both platforms.",
    recipient: "PartnerCo Integrations Team",
  },
  proposal: {
    partner: "PartnerCo",
    objective:
      "Enable merchants on the Nizek platform to earn and burn PartnerCo loyalty points at checkout with near-real-time balance updates and next-day reconciliation.",
    context:
      "PartnerCo already exposes member lookup and points mutation APIs. Nizek will orchestrate checkout-side calls, own idempotency, and push a daily settlement file for finance. This proposal aligns sequence, ownership, and payload contracts before sandbox build.",
    assumptions: [
      "PartnerCo sandbox credentials available within 5 business days.",
      "Member identity is phone E.164 matched to PartnerCo `memberExternalId`.",
      "Points are integer-only; no fractional balances.",
      "Kuwait timezone (Asia/Kuwait) for settlement cutoffs.",
    ],
    sequence: [
      {
        actor: "Guest app",
        action: "Checkout begins with optional loyalty toggle",
        detail: "If enabled, app requests a points quote for the cart total.",
      },
      {
        actor: "Nizek API",
        action: "Resolve member + request hold",
        detail: "Looks up PartnerCo member, then creates a points hold for burn amount.",
      },
      {
        actor: "PartnerCo",
        action: "Accept or reject hold",
        detail: "Returns holdId and expiresAt. Balance shown to guest is hold-aware.",
      },
      {
        actor: "Nizek API",
        action: "Capture payment, then commit hold",
        detail: "On payment success, commit burn + post earn for eligible lines.",
      },
      {
        actor: "PartnerCo",
        action: "Confirm ledger entries",
        detail: "Returns transactionIds used later in settlement.",
      },
      {
        actor: "Both parties",
        action: "Daily reconciliation",
        detail: "Nizek uploads CSV; PartnerCo ACK with mismatches within T+1.",
      },
    ],
    endpoints: [
      {
        method: "GET",
        path: "/loyalty/v1/members/{phone}",
        purpose: "Resolve PartnerCo member by phone",
        owner: "partner",
      },
      {
        method: "POST",
        path: "/loyalty/v1/holds",
        purpose: "Create points hold for burn",
        owner: "partner",
      },
      {
        method: "POST",
        path: "/loyalty/v1/holds/{holdId}/commit",
        purpose: "Commit burn after payment capture",
        owner: "partner",
      },
      {
        method: "POST",
        path: "/loyalty/v1/earn",
        purpose: "Post earn for eligible basket lines",
        owner: "partner",
      },
      {
        method: "POST",
        path: "/v1/webhooks/partnerco/loyalty",
        purpose: "Receive async adjustment notifications",
        owner: "nizek",
      },
      {
        method: "POST",
        path: "/v1/settlements/loyalty/daily",
        purpose: "Internal job that builds and uploads settlement file",
        owner: "nizek",
      },
    ],
    dataContracts: [
      {
        name: "PointsHoldRequest",
        fields: [
          { name: "memberExternalId", type: "string", notes: "PartnerCo member id" },
          { name: "merchantId", type: "string", notes: "Nizek merchant uuid" },
          { name: "orderId", type: "string", notes: "Idempotent order reference" },
          { name: "points", type: "integer", notes: "Burn amount > 0" },
          { name: "currency", type: "string", notes: "Order currency, informational" },
        ],
      },
      {
        name: "EarnRequest",
        fields: [
          { name: "memberExternalId", type: "string" },
          { name: "orderId", type: "string" },
          { name: "points", type: "integer", notes: "Computed by Nizek rules engine" },
          { name: "channel", type: "string", notes: "`app` | `pos`" },
        ],
      },
    ],
    security: [
      "mTLS between Nizek and PartnerCo in production.",
      "OAuth2 client credentials; token TTL ≤ 30 minutes.",
      "Idempotency-Key required on hold, commit, and earn.",
      "PII limited to phone + memberExternalId; no full card data shared.",
    ],
    openQuestions: [
      "Does PartnerCo support partial commit if payment is partially captured?",
      "What is the maximum hold TTL in production?",
      "Preferred SFTP vs HTTPS PUT for settlement files?",
    ],
    nextSteps: [
      "PartnerCo confirms endpoint readiness in sandbox",
      "Align field names in a joint OpenAPI snippet",
      "Schedule kickoff for certificate exchange",
      "Target first sandbox end-to-end by 12 Nov 2026",
    ],
  },
};
