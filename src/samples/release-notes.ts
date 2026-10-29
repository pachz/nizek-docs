import type { AnyDoc } from "../types/doc";

export const sampleReleaseNotes: AnyDoc = {
  kind: "release-notes",
  meta: {
    title: "Gear Pay 1.2.0 release notes",
    subtitle: "Payout intents GA, webhook reliability, and dashboard polish.",
    project: "Gear Pay",
    version: "1.2.0",
    date: "29 Oct 2026",
    author: "Nizek Product",
    status: "approved",
    classification: "External · Release",
    tags: ["release", "1.2.0"],
  },
  cover: {
    enabled: true,
    eyebrow: "Release Notes",
    headline: "Gear Pay 1.2.0",
    description:
      "What shipped for merchants and integrators in this release.",
    recipient: "Merchant engineering partners",
  },
  kicker: "Release 1.2.0",
  sections: [
    {
      type: "paragraph",
      title: "Highlights",
      body: "Payout intents move to GA with idempotent create/confirm, durable webhooks via outbox, and clearer status in the merchant dashboard.",
    },
    {
      type: "list",
      title: "New",
      items: [
        "POST /v1/merchants/{id}/payout-intents (GA)",
        "POST /v1/payout-intents/{id}/confirm",
        "Webhooks: payout_intent.confirmed, payout_intent.failed",
      ],
    },
    {
      type: "list",
      title: "Improvements",
      items: [
        "Dashboard shows pending vs settled payouts",
        "Idempotency conflict responses include original intent id",
      ],
    },
    {
      type: "list",
      title: "Fixes",
      items: [
        "Rare double-email on payout failure",
        "CSV export timezone off-by-one for Asia/Kuwait",
      ],
    },
    {
      breakBefore: true,
      type: "list",
      title: "Breaking / action required",
      items: [
        "Clients must send Idempotency-Key on create and confirm",
        "Remove reliance on legacy sync payout endpoint (sunset 15 Dec 2026)",
      ],
    },
    {
      type: "callout",
      title: "Support",
      body: "Questions: partners@gearpay.example · status page for incidents.",
    },
  ],
};
