import type {
  AnyDoc,
  ApiParam,
  ChangeQa,
  DataContract,
  DocKind,
  DocSection,
  EndpointSpec,
  EndpointSummaryRow,
  FlowStep,
  HttpMethod,
  ImpactRow,
} from "./doc.js";

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const SECTION_TYPES = new Set([
  "paragraph",
  "list",
  "two-col-lists",
  "qa",
  "impact",
  "callout",
  "endpoint",
  "endpoint-table",
  "sequence",
  "data-contract",
  "code",
  "status-codes",
  "params",
]);

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

function parseMethod(value: unknown): HttpMethod {
  const method = asString(value).toUpperCase() as HttpMethod;
  if (!METHODS.includes(method)) throw new Error(`Invalid method: ${method || "(empty)"}`);
  return method;
}

function parseParams(raw: unknown): ApiParam[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isObject).map((param) => ({
    name: asString(param.name),
    in: asString(param.in) as ApiParam["in"],
    type: asString(param.type),
    required: Boolean(param.required),
    description: asString(param.description),
    example: asString(param.example) || undefined,
  }));
}

function parseEndpoint(raw: unknown): EndpointSpec {
  if (!isObject(raw)) throw new Error("endpoint object is required.");
  return {
    method: parseMethod(raw.method),
    path: asString(raw.path),
    summary: asString(raw.summary),
    description: asString(raw.description) || undefined,
    auth: asString(raw.auth) || undefined,
    baseUrl: asString(raw.baseUrl) || undefined,
    params: parseParams(raw.params),
    requestExample: asString(raw.requestExample) || undefined,
    responseExample: asString(raw.responseExample) || undefined,
    statusCodes: Array.isArray(raw.statusCodes)
      ? raw.statusCodes.filter(isObject).map((row) => ({
          code: Number(row.code),
          meaning: asString(row.meaning),
        }))
      : undefined,
    notes: asStringArray(raw.notes),
  };
}

function parseEndpointRows(raw: unknown): EndpointSummaryRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isObject).map((ep) => ({
    method: parseMethod(ep.method),
    path: asString(ep.path),
    purpose: asString(ep.purpose),
    owner: asString(ep.owner)
      ? (asString(ep.owner) as EndpointSummaryRow["owner"])
      : undefined,
  }));
}

function parseSteps(raw: unknown): FlowStep[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isObject).map((step) => ({
    actor: asString(step.actor),
    action: asString(step.action),
    detail: asString(step.detail) || undefined,
  }));
}

function parseImpact(raw: unknown): ImpactRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isObject).map((row) => ({
    area: asString(row.area),
    level: asString(row.level) as ImpactRow["level"],
    notes: asString(row.notes),
  }));
}

function parseQa(raw: unknown): ChangeQa[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isObject).map((item) => ({
    question: asString(item.question),
    answer: asString(item.answer),
  }));
}

function parseContract(raw: unknown): DataContract {
  if (!isObject(raw)) throw new Error("data-contract.contract is required.");
  return {
    name: asString(raw.name),
    fields: Array.isArray(raw.fields)
      ? raw.fields.filter(isObject).map((field) => ({
          name: asString(field.name),
          type: asString(field.type),
          notes: asString(field.notes) || undefined,
        }))
      : [],
  };
}

function parseSection(raw: unknown, index: number): DocSection {
  if (!isObject(raw)) throw new Error(`sections[${index}] must be an object.`);
  const type = asString(raw.type);
  if (!SECTION_TYPES.has(type)) {
    throw new Error(`sections[${index}] has unknown type "${type}".`);
  }

  const base = {
    id: asString(raw.id) || undefined,
    breakBefore: Boolean(raw.breakBefore) || undefined,
  };

  switch (type) {
    case "paragraph":
      return {
        ...base,
        type: "paragraph",
        title: asString(raw.title) || undefined,
        body: asString(raw.body),
      };
    case "list":
      return {
        ...base,
        type: "list",
        title: asString(raw.title) || "List",
        items: asStringArray(raw.items),
        ordered: Boolean(raw.ordered) || undefined,
      };
    case "two-col-lists": {
      const left = isObject(raw.left) ? raw.left : {};
      const right = isObject(raw.right) ? raw.right : {};
      return {
        ...base,
        type: "two-col-lists",
        left: {
          title: asString(left.title) || "Left",
          items: asStringArray(left.items),
        },
        right: {
          title: asString(right.title) || "Right",
          items: asStringArray(right.items),
        },
      };
    }
    case "qa":
      return {
        ...base,
        type: "qa",
        title: asString(raw.title) || undefined,
        items: parseQa(raw.items),
      };
    case "impact":
      return {
        ...base,
        type: "impact",
        title: asString(raw.title) || undefined,
        items: parseImpact(raw.items),
      };
    case "callout":
      return {
        ...base,
        type: "callout",
        title: asString(raw.title) || undefined,
        body: asString(raw.body),
      };
    case "endpoint":
      return {
        ...base,
        type: "endpoint",
        endpoint: parseEndpoint(raw.endpoint),
      };
    case "endpoint-table":
      return {
        ...base,
        type: "endpoint-table",
        title: asString(raw.title) || undefined,
        rows: parseEndpointRows(raw.rows),
      };
    case "sequence":
      return {
        ...base,
        type: "sequence",
        title: asString(raw.title) || undefined,
        steps: parseSteps(raw.steps),
      };
    case "data-contract":
      return {
        ...base,
        type: "data-contract",
        contract: parseContract(raw.contract),
      };
    case "code":
      return {
        ...base,
        type: "code",
        title: asString(raw.title) || undefined,
        code: asString(raw.code),
      };
    case "status-codes":
      return {
        ...base,
        type: "status-codes",
        title: asString(raw.title) || undefined,
        items: Array.isArray(raw.items)
          ? raw.items.filter(isObject).map((row) => ({
              code: Number(row.code),
              meaning: asString(row.meaning),
            }))
          : [],
      };
    case "params":
      return {
        ...base,
        type: "params",
        title: asString(raw.title) || undefined,
        params: parseParams(raw.params),
      };
    default:
      throw new Error(`sections[${index}] unsupported type.`);
  }
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
  if (!Array.isArray(data.sections) || data.sections.length === 0) {
    throw new Error("sections must be a non-empty array.");
  }

  const doc: AnyDoc = {
    kind,
    meta: parseMeta(data.meta),
    cover: parseCover(data.cover, coverEnabled),
    kicker: asString(data.kicker) || undefined,
    sections: data.sections.map((section, index) => parseSection(section, index)),
  };

  doc.cover.enabled = coverEnabled;
  return doc;
}
