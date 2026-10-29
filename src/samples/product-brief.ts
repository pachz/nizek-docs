import type { AnyDoc } from "../types/doc";

export const sampleProductBrief: AnyDoc = {
  kind: "product-brief",
  meta: {
    title: "Guest waitlist for fully booked venues",
    subtitle:
      "Let guests join a waitlist when preferred slots are full; notify when inventory frees up.",
    project: "VenueBook GCC",
    version: "0.2",
    date: "20 Oct 2026",
    author: "Product · VenueBook",
    status: "proposed",
    classification: "Internal · Product",
    tags: ["waitlist", "bookings", "growth"],
  },
  cover: {
    enabled: true,
    eyebrow: "Product Brief",
    headline: "Guest waitlist for fully booked venues",
    description:
      "Problem, users, success metrics, and MVP scope for waitlist v1.",
  },
  kicker: "Product brief",
  sections: [
    {
      type: "paragraph",
      title: "Problem",
      body: "Peak Friday slots sell out early. Guests bounce when search returns empty; venues lose demand that could fill cancellations within 2 hours.",
    },
    {
      type: "paragraph",
      title: "Target users",
      body: "Primary: app guests searching Kuwait City venues. Secondary: venue ops who want cancellation fill without manual WhatsApp lists.",
    },
    {
      type: "list",
      title: "Goals",
      items: [
        "Capture intent when inventory is zero for a slot",
        "Notify within 5 minutes of a cancellation release",
        "Convert ≥15% of waitlist offers to confirmed bookings in pilot",
      ],
    },
    {
      type: "two-col-lists",
      left: {
        title: "In scope (MVP)",
        items: [
          "Join waitlist from empty search results",
          "SMS + push when slot opens",
          "15-minute claim window",
          "Venue opt-in flag",
        ],
      },
      right: {
        title: "Out of scope",
        items: [
          "Paid priority waitlist",
          "Cross-venue substitutes",
          "Agent / call-center tooling",
        ],
      },
    },
    {
      breakBefore: true,
      type: "list",
      title: "Success metrics",
      items: [
        "Waitlist join rate on empty results",
        "Offer → claim conversion",
        "Incremental bookings vs control venues",
      ],
    },
    {
      type: "qa",
      title: "Open questions",
      items: [
        {
          question: "How many guests per slot on the waitlist?",
          answer: "Propose cap of 20; FIFO with optional VIP skip later.",
        },
        {
          question: "Do we hold inventory during claim?",
          answer: "Yes — soft hold 15 minutes, same as checkout hold TTL.",
        },
      ],
    },
  ],
};
