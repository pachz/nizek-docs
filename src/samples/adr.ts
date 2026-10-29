import type { AnyDoc } from "../types/doc";

export const sampleAdr: AnyDoc = {
  kind: "adr",
  meta: {
    title: "Use outbox pattern for payout webhooks",
    subtitle:
      "ADR-042 — reliably deliver merchant webhooks without dual-write races.",
    project: "Gear Pay",
    version: "ADR-042",
    date: "22 Oct 2026",
    author: "Nizek Platform",
    status: "approved",
    classification: "Internal · Architecture",
    tags: ["webhooks", "outbox", "reliability"],
  },
  cover: {
    enabled: true,
    eyebrow: "Architecture Decision Record",
    headline: "Use outbox pattern for payout webhooks",
    description:
      "Decision record for durable webhook delivery after payout state changes.",
  },
  kicker: "ADR-042",
  sections: [
    {
      type: "paragraph",
      title: "Context",
      body: "Payout status changes must notify merchants. Today we publish to the bus inside the same DB transaction as the status update. When the broker is down, we roll back business state or drop events — both are unacceptable for settlement.",
    },
    {
      type: "paragraph",
      title: "Decision",
      body: "Adopt the transactional outbox: write domain row + outbox row in one transaction; a worker polls/publishes and marks rows sent. At-least-once delivery with idempotent consumers.",
    },
    {
      type: "two-col-lists",
      left: {
        title: "Consequences · positive",
        items: [
          "No dual-write race between DB and broker",
          "Replayable failed deliveries",
          "Clear ops metrics on outbox lag",
        ],
      },
      right: {
        title: "Consequences · tradeoffs",
        items: [
          "Extra table + worker to operate",
          "Consumers must be idempotent",
          "Slight delay vs in-process publish",
        ],
      },
    },
    {
      breakBefore: true,
      type: "list",
      title: "Alternatives considered",
      items: [
        "Sync HTTP to merchant in request path — rejected (latency + coupling)",
        "Broker transaction + DB — rejected (not portable across brokers)",
        "Change-data-capture only — deferred; outbox is simpler for v1",
      ],
    },
    {
      type: "callout",
      title: "Status",
      body: "Accepted. Target rollout behind flag `webhooks.outbox` in Gear Pay 1.3.",
    },
  ],
};
