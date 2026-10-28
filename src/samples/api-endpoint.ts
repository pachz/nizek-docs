import type { ApiEndpointDoc } from "../types/doc";

export const sampleApiEndpoint: ApiEndpointDoc = {
  kind: "api-endpoint",
  meta: {
    title: "Create payout intent",
    subtitle:
      "Creates a payout intent for a connected merchant and returns a client-safe confirmation payload.",
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
    eyebrow: "API Endpoint Spec",
    headline: "Create payout intent",
    description:
      "Quick reference for the new payout intent endpoint shipping in Gear Pay v1.2.",
  },
  endpoint: {
    method: "POST",
    path: "/v1/merchants/{merchantId}/payout-intents",
    baseUrl: "https://api.gearpay.example",
    summary: "Create a payout intent for a merchant wallet balance.",
    description:
      "This endpoint reserves funds from a merchant’s available balance and creates a payout intent that can be confirmed asynchronously. Idempotency is required via the Idempotency-Key header so retries do not double-create intents.",
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
      { code: 400, meaning: "Validation failed (amount, currency, or destination)." },
      { code: 401, meaning: "Missing or invalid authentication." },
      { code: 409, meaning: "Idempotency conflict with a different payload." },
      { code: 422, meaning: "Insufficient available balance." },
    ],
    notes: [
      "Intents expire after 30 minutes if not confirmed.",
      "Use GET /v1/payout-intents/{id} to poll status.",
      "Webhooks: payout_intent.confirmed, payout_intent.failed.",
    ],
  },
};
