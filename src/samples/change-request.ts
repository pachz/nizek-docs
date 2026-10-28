import type { ChangeRequestDoc } from "../types/doc";

export const sampleChangeRequest: ChangeRequestDoc = {
  kind: "change-request",
  meta: {
    title: "Delay booking confirmation until payment capture",
    subtitle:
      "Review package for CR-184 — changes booking lifecycle so venues are not held before successful capture.",
    project: "VenueBook GCC",
    version: "0.4",
    date: "28 Oct 2026",
    author: "Payam · Product Engineering",
    reviewers: ["Ops", "Backend", "Support"],
    status: "review",
    classification: "Internal · Change Request",
    tags: ["bookings", "payments", "CR-184"],
  },
  cover: {
    enabled: true,
    eyebrow: "Change Request Review",
    headline: "Delay booking confirmation until payment capture",
    description:
      "Questions, impact, and proposed answers for CR-184 before engineering commit.",
  },
  change: {
    crId: "CR-184",
    summary:
      "Move booking status from `confirmed` to `pending_payment` at create time, and only flip to `confirmed` after a successful payment capture webhook.",
    motivation:
      "Venues currently see soft-holds that never convert when cards fail. Support volume and inventory friction are rising. Aligning confirmation with capture reduces false occupancy and clarifies guest messaging.",
    scope: [
      "Booking create API response + status machine",
      "Payment webhook handler for capture success/failure",
      "Guest email/SMS templates for pending vs confirmed",
      "Admin booking list filters for pending_payment",
    ],
    outOfScope: [
      "Refunds and partial captures",
      "Multi-venue cart checkout",
      "POS offline booking flows",
    ],
    impact: [
      {
        area: "API clients",
        level: "high",
        notes: "Clients must handle new `pending_payment` status and stop treating create as final.",
      },
      {
        area: "Inventory",
        level: "medium",
        notes: "Soft hold TTL remains 15 minutes; no schema change to slot locks.",
      },
      {
        area: "Support",
        level: "low",
        notes: "Fewer false confirmed tickets; macros need one new status label.",
      },
      {
        area: "Analytics",
        level: "medium",
        notes: "Conversion funnel events rename; dashboards need a one-time remap.",
      },
    ],
    risks: [
      "Mobile app versions < 3.2 may show blank status chips for unknown enums.",
      "If capture webhooks are delayed, users may see pending longer than expected.",
    ],
    rollout: [
      "Feature flag `booking.confirm_on_capture` off in production",
      "Enable for 10% of new bookings for 48 hours",
      "Monitor capture→confirm latency and support ticket tags",
      "Full enable after mobile hotfix ships",
    ],
    qa: [
      {
        question: "What happens if payment fails after create?",
        answer:
          "Booking stays `pending_payment` until hold TTL expires, then auto-cancels and releases the slot. Guest receives a failure message with a retry deep link.",
      },
      {
        question: "Do we break existing partner integrations?",
        answer:
          "Partners on API v2 already receive status enums as strings. We will publish the new enum one sprint ahead and keep `confirmed` on create behind a compatibility header until 2026-12-01.",
      },
      {
        question: "Can ops still manually confirm a booking?",
        answer:
          "Yes — admin action `force_confirm` remains for cash/wire exceptions, audited in the activity log.",
      },
      {
        question: "How do we measure success?",
        answer:
          "Primary: ≥30% drop in ‘confirmed but unpaid’ support tickets. Secondary: inventory soft-hold waste rate under 5%.",
      },
    ],
    decision:
      "Recommend approve with staged rollout. Block full release until Android/iOS status chip hotfix is live.",
  },
};
