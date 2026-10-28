import type {
  AnyDoc,
  ApiEndpointDoc,
  ApiFlowDoc,
  ChangeRequestDoc,
  DocKind,
  HttpMethod,
} from "../types/doc";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      return JSON.parse(fenced[1].trim());
    }
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("Model response was not valid JSON.");
  }
}

function parseMeta(raw: unknown) {
  if (!isObject(raw)) throw new Error("meta is required.");
  const title = asString(raw.title).trim();
  const project = asString(raw.project).trim();
  const date = asString(raw.date).trim();
  const author = asString(raw.author).trim();
  if (!title || !project || !date || !author) {
    throw new Error("meta.title, meta.project, meta.date, and meta.author are required.");
  }
  return {
    title,
    subtitle: asString(raw.subtitle) || undefined,
    project,
    version: asString(raw.version) || undefined,
    date,
    author,
    reviewers: asStringArray(raw.reviewers),
    status: raw.status as AnyDoc["meta"]["status"],
    classification: asString(raw.classification) || undefined,
    tags: asStringArray(raw.tags),
  };
}

function parseCover(raw: unknown, fallbackEnabled: boolean) {
  if (!isObject(raw)) {
    return { enabled: fallbackEnabled };
  }
  return {
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : fallbackEnabled,
    eyebrow: asString(raw.eyebrow) || undefined,
    headline: asString(raw.headline) || undefined,
    description: asString(raw.description) || undefined,
    recipient: asString(raw.recipient) || undefined,
  };
}

function parseApiEndpoint(raw: Record<string, unknown>, coverEnabled: boolean): ApiEndpointDoc {
  if (!isObject(raw.endpoint)) throw new Error("endpoint is required.");
  const ep = raw.endpoint;
  const method = asString(ep.method).toUpperCase() as HttpMethod;
  if (!METHODS.includes(method)) throw new Error(`Invalid method: ${method}`);
  if (!Array.isArray(ep.params)) throw new Error("endpoint.params must be an array.");
  if (!Array.isArray(ep.statusCodes)) throw new Error("endpoint.statusCodes must be an array.");

  return {
    kind: "api-endpoint",
    meta: parseMeta(raw.meta),
    cover: parseCover(raw.cover, coverEnabled),
    endpoint: {
      method,
      path: asString(ep.path),
      baseUrl: asString(ep.baseUrl) || undefined,
      summary: asString(ep.summary),
      description: asString(ep.description),
      auth: asString(ep.auth) || undefined,
      params: ep.params.filter(isObject).map((param) => ({
        name: asString(param.name),
        in: asString(param.in) as "path" | "query" | "header" | "body",
        type: asString(param.type),
        required: Boolean(param.required),
        description: asString(param.description),
        example: asString(param.example) || undefined,
      })),
      requestExample: asString(ep.requestExample) || undefined,
      responseExample: asString(ep.responseExample) || undefined,
      statusCodes: ep.statusCodes.filter(isObject).map((row) => ({
        code: Number(row.code),
        meaning: asString(row.meaning),
      })),
      notes: asStringArray(ep.notes),
    },
  };
}

function parseChangeRequest(raw: Record<string, unknown>, coverEnabled: boolean): ChangeRequestDoc {
  if (!isObject(raw.change)) throw new Error("change is required.");
  const change = raw.change;
  if (!Array.isArray(change.scope)) throw new Error("change.scope must be an array.");
  if (!Array.isArray(change.impact)) throw new Error("change.impact must be an array.");
  if (!Array.isArray(change.qa)) throw new Error("change.qa must be an array.");

  return {
    kind: "change-request",
    meta: parseMeta(raw.meta),
    cover: parseCover(raw.cover, coverEnabled),
    change: {
      crId: asString(change.crId),
      summary: asString(change.summary),
      motivation: asString(change.motivation),
      scope: asStringArray(change.scope),
      outOfScope: asStringArray(change.outOfScope),
      impact: change.impact.filter(isObject).map((row) => ({
        area: asString(row.area),
        level: asString(row.level) as "low" | "medium" | "high",
        notes: asString(row.notes),
      })),
      risks: asStringArray(change.risks),
      rollout: asStringArray(change.rollout),
      qa: change.qa.filter(isObject).map((item) => ({
        question: asString(item.question),
        answer: asString(item.answer),
      })),
      decision: asString(change.decision) || undefined,
    },
  };
}

function parseApiFlow(raw: Record<string, unknown>, coverEnabled: boolean): ApiFlowDoc {
  if (!isObject(raw.proposal)) throw new Error("proposal is required.");
  const proposal = raw.proposal;
  if (!Array.isArray(proposal.sequence)) throw new Error("proposal.sequence must be an array.");
  if (!Array.isArray(proposal.endpoints)) throw new Error("proposal.endpoints must be an array.");

  return {
    kind: "api-flow",
    meta: parseMeta(raw.meta),
    cover: parseCover(raw.cover, coverEnabled),
    proposal: {
      partner: asString(proposal.partner),
      objective: asString(proposal.objective),
      context: asString(proposal.context),
      assumptions: asStringArray(proposal.assumptions),
      sequence: proposal.sequence.filter(isObject).map((step) => ({
        actor: asString(step.actor),
        action: asString(step.action),
        detail: asString(step.detail) || undefined,
      })),
      endpoints: proposal.endpoints.filter(isObject).map((ep) => ({
        method: asString(ep.method).toUpperCase() as HttpMethod,
        path: asString(ep.path),
        purpose: asString(ep.purpose),
        owner: asString(ep.owner) as "nizek" | "partner" | "shared",
      })),
      dataContracts: Array.isArray(proposal.dataContracts)
        ? proposal.dataContracts.filter(isObject).map((contract) => ({
            name: asString(contract.name),
            fields: Array.isArray(contract.fields)
              ? contract.fields.filter(isObject).map((field) => ({
                  name: asString(field.name),
                  type: asString(field.type),
                  notes: asString(field.notes) || undefined,
                }))
              : [],
          }))
        : undefined,
      security: asStringArray(proposal.security),
      openQuestions: asStringArray(proposal.openQuestions),
      nextSteps: asStringArray(proposal.nextSteps),
    },
  };
}

export function parseGeneratedDoc(
  rawText: string,
  expectedKind: DocKind,
  coverEnabled: boolean,
): AnyDoc {
  const data = extractJson(rawText);
  if (!isObject(data)) throw new Error("Root value must be a JSON object.");
  const kind = asString(data.kind) as DocKind;
  if (kind !== expectedKind) {
    throw new Error(`Expected kind "${expectedKind}" but got "${kind || "missing"}".`);
  }

  let doc: AnyDoc;
  switch (kind) {
    case "api-endpoint":
      doc = parseApiEndpoint(data, coverEnabled);
      break;
    case "change-request":
      doc = parseChangeRequest(data, coverEnabled);
      break;
    case "api-flow":
      doc = parseApiFlow(data, coverEnabled);
      break;
    default:
      throw new Error(`Unsupported kind: ${kind}`);
  }

  doc.cover.enabled = coverEnabled;
  return doc;
}
