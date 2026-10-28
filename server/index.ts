import { readFileSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { buildGenerationMessages } from "../src/generate/systemPrompt.ts";
import { parseGeneratedDoc } from "../src/generate/parseDoc.ts";
import type { DocKind } from "../src/types/doc.ts";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile();

const PORT = Number(process.env.DOCS_API_PORT ?? 8787);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(
  /\/$/,
  "",
);
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

type GenerateBody = {
  kind?: DocKind;
  brief?: string;
  coverEnabled?: boolean;
  projectHint?: string;
  authorHint?: string;
};

function sendJson(res: import("node:http").ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  });
  res.end(payload);
}

async function readJson(req: import("node:http").IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

async function callOpenAi(system: string, user: string): Promise<string> {
  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
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

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      llmConfigured: Boolean(OPENAI_API_KEY),
      model: OPENAI_API_KEY ? OPENAI_MODEL : null,
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/generate/prompt") {
    try {
      const body = (await readJson(req)) as GenerateBody;
      if (!body.kind || !body.brief?.trim()) {
        sendJson(res, 400, { error: "kind and brief are required." });
        return;
      }
      const messages = buildGenerationMessages({
        kind: body.kind,
        brief: body.brief,
        coverEnabled: body.coverEnabled ?? true,
        projectHint: body.projectHint,
        authorHint: body.authorHint,
      });
      sendJson(res, 200, messages);
    } catch (error) {
      sendJson(res, 400, {
        error: error instanceof Error ? error.message : "Failed to build prompt.",
      });
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/generate") {
    try {
      const body = (await readJson(req)) as GenerateBody;
      if (!body.kind || !body.brief?.trim()) {
        sendJson(res, 400, { error: "kind and brief are required." });
        return;
      }

      const coverEnabled = body.coverEnabled ?? true;
      const messages = buildGenerationMessages({
        kind: body.kind,
        brief: body.brief,
        coverEnabled,
        projectHint: body.projectHint,
        authorHint: body.authorHint,
      });

      if (!OPENAI_API_KEY) {
        sendJson(res, 503, {
          error:
            "No OPENAI_API_KEY configured. Copy the assembled prompt, run it in your AI tool, then paste the JSON back.",
          messages,
          llmConfigured: false,
        });
        return;
      }

      const raw = await callOpenAi(messages.system, messages.user);
      const doc = parseGeneratedDoc(raw, body.kind, coverEnabled);
      sendJson(res, 200, { doc, raw, llmConfigured: true });
    } catch (error) {
      sendJson(res, 500, {
        error: error instanceof Error ? error.message : "Generation failed.",
      });
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/generate/parse") {
    try {
      const body = (await readJson(req)) as {
        kind?: DocKind;
        raw?: string;
        coverEnabled?: boolean;
      };
      if (!body.kind || !body.raw?.trim()) {
        sendJson(res, 400, { error: "kind and raw are required." });
        return;
      }
      const doc = parseGeneratedDoc(body.raw, body.kind, body.coverEnabled ?? true);
      sendJson(res, 200, { doc });
    } catch (error) {
      sendJson(res, 400, {
        error: error instanceof Error ? error.message : "Invalid document JSON.",
      });
    }
    return;
  }

  sendJson(res, 404, { error: "Not found." });
});

server.listen(PORT, () => {
  console.log(`[nizek-docs-api] http://127.0.0.1:${PORT}`);
  console.log(
    `[nizek-docs-api] LLM ${OPENAI_API_KEY ? `ready (${OPENAI_MODEL})` : "not configured — paste-JSON mode available"}`,
  );
});
