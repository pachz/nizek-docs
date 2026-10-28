import { buildGenerationMessages } from "./systemPrompt.js";
import { parseGeneratedDoc } from "./parseDoc.js";
import type { DocKind } from "./doc.js";

export type GenerateBody = {
  kind?: DocKind;
  brief?: string;
  coverEnabled?: boolean;
  projectHint?: string;
  authorHint?: string;
};

export type ParseBody = {
  kind?: DocKind;
  raw?: string;
  coverEnabled?: boolean;
};

export type ApiResult = {
  status: number;
  body: unknown;
};

function llmConfig() {
  const apiKey = process.env.OPENAI_API_KEY ?? "";
  const baseUrl = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  return { apiKey, baseUrl, model };
}

async function callOpenAi(system: string, user: string): Promise<string> {
  const { apiKey, baseUrl, model } = llmConfig();
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LLM request failed (${response.status}): ${errText.slice(0, 400)}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("LLM returned an empty response.");
  return content;
}

export function handleHealth(): ApiResult {
  const { apiKey, model } = llmConfig();
  return {
    status: 200,
    body: {
      ok: true,
      llmConfigured: Boolean(apiKey),
      model: apiKey ? model : null,
    },
  };
}

export function handlePrompt(body: GenerateBody): ApiResult {
  if (!body.kind || !body.brief?.trim()) {
    return { status: 400, body: { error: "kind and brief are required." } };
  }

  const messages = buildGenerationMessages({
    kind: body.kind,
    brief: body.brief,
    coverEnabled: body.coverEnabled ?? true,
    projectHint: body.projectHint,
    authorHint: body.authorHint,
  });

  return { status: 200, body: messages };
}

export async function handleGenerate(body: GenerateBody): Promise<ApiResult> {
  if (!body.kind || !body.brief?.trim()) {
    return { status: 400, body: { error: "kind and brief are required." } };
  }

  const coverEnabled = body.coverEnabled ?? true;
  const messages = buildGenerationMessages({
    kind: body.kind,
    brief: body.brief,
    coverEnabled,
    projectHint: body.projectHint,
    authorHint: body.authorHint,
  });

  const { apiKey } = llmConfig();
  if (!apiKey) {
    return {
      status: 503,
      body: {
        error:
          "No OPENAI_API_KEY configured. Copy the assembled prompt, run it in your AI tool, then paste the JSON back.",
        messages,
        llmConfigured: false,
      },
    };
  }

  try {
    const raw = await callOpenAi(messages.system, messages.user);
    const doc = parseGeneratedDoc(raw, body.kind, coverEnabled);
    return { status: 200, body: { doc, raw, llmConfigured: true } };
  } catch (error) {
    return {
      status: 500,
      body: {
        error: error instanceof Error ? error.message : "Generation failed.",
      },
    };
  }
}

export function handleParse(body: ParseBody): ApiResult {
  if (!body.kind || !body.raw?.trim()) {
    return { status: 400, body: { error: "kind and raw are required." } };
  }

  try {
    const doc = parseGeneratedDoc(body.raw, body.kind, body.coverEnabled ?? true);
    return { status: 200, body: { doc } };
  } catch (error) {
    return {
      status: 400,
      body: {
        error: error instanceof Error ? error.message : "Invalid document JSON.",
      },
    };
  }
}
