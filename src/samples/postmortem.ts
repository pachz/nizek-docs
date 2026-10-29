import type { AnyDoc } from "../types/doc";

export const samplePostmortem: AnyDoc = {
  kind: "postmortem",
  meta: {
    title: "Payout confirm latency spike — 18 Oct 2026",
    subtitle:
      "SEV-2: confirm API p95 rose above 8s for 47 minutes; no money loss.",
    project: "Gear Pay",
    version: "PM-118",
    date: "19 Oct 2026",
    author: "On-call · Payments",
    status: "approved",
    classification: "Internal · Incident",
    tags: ["sev-2", "payouts", "postmortem"],
  },
  cover: {
    enabled: true,
    eyebrow: "Incident Postmortem",
    headline: "Payout confirm latency spike — 18 Oct 2026",
    description:
      "Timeline, root cause, impact, and follow-ups for PM-118.",
  },
  kicker: "PM-118 · SEV-2",
  sections: [
    {
      type: "paragraph",
      title: "Summary",
      body: "A bad index deploy on the payout intents table caused sequential scans during confirm. Merchants saw slow confirms; no incorrect settlements. Mitigated by rolling back the migration and adding a covering index.",
    },
    {
      type: "impact",
      title: "Impact",
      items: [
        {
          area: "Merchants",
          level: "medium",
          notes: "~12% of confirms >5s; 3 support tickets",
        },
        {
          area: "Data integrity",
          level: "low",
          notes: "No duplicate or lost payouts",
        },
        {
          area: "SLO",
          level: "high",
          notes: "Confirm latency SLO burned 38% of monthly error budget",
        },
      ],
    },
    {
      breakBefore: true,
      type: "sequence",
      title: "Timeline (Asia/Kuwait)",
      steps: [
        {
          actor: "CI",
          action: "Migration 1841 deployed",
          detail: "14:02 — dropped unused index mistakenly still needed",
        },
        {
          actor: "Alerting",
          action: "p95 confirm latency page",
          detail: "14:11",
        },
        {
          actor: "On-call",
          action: "Identified seq scans on payout_intents",
          detail: "14:28",
        },
        {
          actor: "On-call",
          action: "Rollback + recreate covering index",
          detail: "14:49 — latency normalized",
        },
      ],
    },
    {
      type: "paragraph",
      title: "Root cause",
      body: "Migration reviewed as “drop unused index” without confirming confirm-path EXPLAIN. Staging traffic did not exercise confirm volume.",
    },
    {
      type: "list",
      title: "Action items",
      ordered: true,
      items: [
        "Require EXPLAIN for migrations touching payout hot paths",
        "Add staging load check for confirm before prod migrate",
        "Alert on seq scan rate for payout_intents",
      ],
    },
  ],
};
