import type { AnyDoc } from "../types/doc";

export const sampleTechDesign: AnyDoc = {
  kind: "tech-design",
  meta: {
    title: "Waitlist service design",
    subtitle:
      "Service boundaries, data model, and notify path for VenueBook waitlist MVP.",
    project: "VenueBook GCC",
    version: "0.1",
    date: "21 Oct 2026",
    author: "Nizek Engineering",
    status: "review",
    classification: "Internal · Design",
    tags: ["waitlist", "design"],
  },
  cover: {
    enabled: true,
    eyebrow: "Technical Design",
    headline: "Waitlist service design",
    description:
      "How join, release, and claim flows work across booking and notify services.",
  },
  kicker: "Tech design",
  sections: [
    {
      type: "paragraph",
      title: "Overview",
      body: "A new `waitlist` service owns entries and claim tokens. Booking emits `slot.freed` events; waitlist ranks FIFO and asks notify to send offer links. Claim calls booking create with a one-time token.",
    },
    {
      type: "sequence",
      title: "Happy path",
      steps: [
        {
          actor: "Guest app",
          action: "Join waitlist on empty slot",
          detail: "POST /waitlist/entries with venueId + slotId",
        },
        {
          actor: "Booking",
          action: "Emit slot.freed on cancel",
        },
        {
          actor: "Waitlist",
          action: "Select next entry and create claim token",
        },
        {
          actor: "Notify",
          action: "SMS + push with deep link",
        },
        {
          actor: "Guest app",
          action: "Claim within 15 minutes",
          detail: "Creates booking with waitlistToken",
        },
      ],
    },
    {
      breakBefore: true,
      type: "data-contract",
      contract: {
        name: "WaitlistEntry",
        fields: [
          { name: "id", type: "uuid" },
          { name: "venueId", type: "uuid" },
          { name: "slotId", type: "string" },
          { name: "guestId", type: "uuid" },
          { name: "status", type: "enum", notes: "queued | offered | claimed | expired" },
          { name: "createdAt", type: "datetime" },
        ],
      },
    },
    {
      type: "endpoint-table",
      title: "API surface",
      rows: [
        {
          method: "POST",
          path: "/waitlist/entries",
          purpose: "Join waitlist",
          owner: "nizek",
        },
        {
          method: "POST",
          path: "/waitlist/claims/{token}",
          purpose: "Claim offered slot",
          owner: "nizek",
        },
        {
          method: "DELETE",
          path: "/waitlist/entries/{id}",
          purpose: "Leave waitlist",
          owner: "nizek",
        },
      ],
    },
    {
      type: "list",
      title: "Risks",
      items: [
        "Double-offer if two workers race — use row lock on entry",
        "Notify delay — measure p95 offer latency",
      ],
    },
  ],
};
