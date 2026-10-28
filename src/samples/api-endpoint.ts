import type { AnyDoc } from "../types/doc";

export const sampleApiEndpoint: AnyDoc = {
  kind: "api-endpoint",
  meta: {
    title: "Merchant payouts API",
    subtitle:
      "Create, confirm, and poll payout intents for connected merchants in Gear Pay v1.2.",
    project: "Gear Pay",
    version: "1.2.0",
    date: "29 Oct 2026",
    author: "Nizek Engineering",
    status: "approved",
    classification: "Internal · API",
    tags: ["payments", "payouts", "v1"],
  },
  cover: {
    enabled: true,
    eyebrow: "API Spec",
    headline: "Merchant payouts API",
    description:
      "Multi-endpoint reference for payout intents: create, confirm, and status polling.",
  },
  kicker: "Endpoint specification",
  sections: [
    {
      type: "paragraph",
      title: "Overview",
      body: "This package covers the payout intent lifecycle. Clients create an intent (idempotent), optionally confirm it, and poll until funds leave the merchant wallet. All three endpoints require KYC-approved merchants and `payouts:write` (mutations) or `payouts:read` (GET).",
    },
    {
      type: "endpoint-table",
      title: "Endpoints in this package",
      rows: [
        {
          method: "POST",
          path: "/v1/merchants/{merchantId}/payout-intents",
          purpose: "Create a payout intent and reserve balance",
        },
        {
          method: "POST",
          path: "/v1/payout-intents/{id}/confirm",
          purpose: "Confirm a pending intent and start settlement",
        },
        {
          method: "GET",
          path: "/v1/payout-intents/{id}",
          purpose: "Fetch intent status and settlement timestamps",
        },
      ],
    },
    {
      type: "list",
      title: "Shared conventions",
      items: [
        "Amounts are minor units (fils); currency currently KWD only.",
        "Idempotency-Key required on POST create and confirm (24h window).",
        "Webhooks: payout_intent.confirmed, payout_intent.failed.",
      ],
    },
    {
      breakBefore: true,
      type: "endpoint",
      endpoint: {
        method: "POST",
        path: "/v1/merchants/{merchantId}/payout-intents",
        baseUrl: "https://api.gearpay.example",
        summary: "Create a payout intent for a merchant wallet balance.",
        description:
          "Reserves funds from available balance and returns a client-safe confirmation payload. Retries with the same Idempotency-Key and body return the original intent.",
        auth: "Bearer JWT with scope `payouts:write`. Merchant must be KYC-approved.",
        params: [
          {
            name: "merchantId",
            in: "path",
            type: "string (uuid)",
            required: true,
            description: "Target merchant identifier.",
            example: "mrc_8f2a1c",
          },
          {
            name: "Idempotency-Key",
            in: "header",
            type: "string",
            required: true,
            description: "Unique key for safe retries within 24 hours.",
            example: "payout-2026-10-29-001",
          },
          {
            name: "amount",
            in: "body",
            type: "integer",
            required: true,
            description: "Amount in minor units (fils).",
            example: "25000",
          },
          {
            name: "currency",
            in: "body",
            type: "string",
            required: true,
            description: "ISO-4217 currency code. Currently KWD only.",
            example: "KWD",
          },
          {
            name: "destinationAccountId",
            in: "body",
            type: "string",
            required: true,
            description: "Verified bank account on the merchant profile.",
          },
          {
            name: "memo",
            in: "body",
            type: "string",
            required: false,
            description: "Optional statement descriptor (max 64 chars).",
          },
        ],
        requestExample: `POST /v1/merchants/mrc_8f2a1c/payout-intents
Idempotency-Key: payout-2026-10-29-001
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json

{
  "amount": 25000,
  "currency": "KWD",
  "destinationAccountId": "ba_91kd",
  "memo": "Weekly settlement"
}`,
        responseExample: `{
  "id": "poi_3n9xq",
  "status": "pending_confirmation",
  "amount": 25000,
  "currency": "KWD",
  "createdAt": "2026-10-29T08:14:22Z",
  "expiresAt": "2026-10-29T08:44:22Z"
}`,
        statusCodes: [
          { code: 201, meaning: "Payout intent created." },
          {
            code: 400,
            meaning: "Validation failed (amount, currency, or destination).",
          },
          { code: 401, meaning: "Missing or invalid authentication." },
          {
            code: 409,
            meaning: "Idempotency conflict with a different payload.",
          },
          { code: 422, meaning: "Insufficient available balance." },
        ],
        notes: [
          "Intents expire after 30 minutes if not confirmed.",
          "Use GET /v1/payout-intents/{id} to poll status.",
        ],
      },
    },
    {
      breakBefore: true,
      type: "endpoint",
      endpoint: {
        method: "POST",
        path: "/v1/payout-intents/{id}/confirm",
        baseUrl: "https://api.gearpay.example",
        summary: "Confirm a pending payout intent and start settlement.",
        description:
          "Moves the intent from `pending_confirmation` to `processing`. Settlement is asynchronous; clients should poll or listen for webhooks.",
        auth: "Bearer JWT with scope `payouts:write`.",
        params: [
          {
            name: "id",
            in: "path",
            type: "string",
            required: true,
            description: "Payout intent id from create.",
            example: "poi_3n9xq",
          },
          {
            name: "Idempotency-Key",
            in: "header",
            type: "string",
            required: true,
            description: "Unique key for safe confirm retries.",
          },
        ],
        requestExample: `POST /v1/payout-intents/poi_3n9xq/confirm
Idempotency-Key: confirm-poi_3n9xq
Authorization: Bearer eyJhbGciOi...`,
        responseExample: `{
  "id": "poi_3n9xq",
  "status": "processing",
  "confirmedAt": "2026-10-29T08:16:01Z"
}`,
        statusCodes: [
          { code: 200, meaning: "Intent confirmed; settlement started." },
          { code: 404, meaning: "Unknown intent id." },
          { code: 409, meaning: "Intent already confirmed or expired." },
          { code: 422, meaning: "Intent not in pending_confirmation." },
        ],
      },
    },
    {
      breakBefore: true,
      type: "endpoint",
      endpoint: {
        method: "GET",
        path: "/v1/payout-intents/{id}",
        baseUrl: "https://api.gearpay.example",
        summary: "Fetch payout intent status and settlement timestamps.",
        description:
          "Read-only status endpoint for polling. Prefer webhooks in production; use GET for recovery and support tools.",
        auth: "Bearer JWT with scope `payouts:read`.",
        params: [
          {
            name: "id",
            in: "path",
            type: "string",
            required: true,
            description: "Payout intent id.",
            example: "poi_3n9xq",
          },
        ],
        responseExample: `{
  "id": "poi_3n9xq",
  "status": "settled",
  "amount": 25000,
  "currency": "KWD",
  "createdAt": "2026-10-29T08:14:22Z",
  "confirmedAt": "2026-10-29T08:16:01Z",
  "settledAt": "2026-10-29T08:21:44Z"
}`,
        statusCodes: [
          { code: 200, meaning: "Intent found." },
          { code: 401, meaning: "Missing or invalid authentication." },
          { code: 404, meaning: "Unknown intent id." },
        ],
        notes: [
          "Statuses: pending_confirmation → processing → settled | failed | expired.",
          "Rate limit: 60 req/min per merchant.",
        ],
      },
    },
  ],
};
