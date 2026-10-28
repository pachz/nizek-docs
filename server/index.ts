import { readFileSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { resolve } from "node:path";
import {
  handleGenerate,
  handleHealth,
  handleParse,
  handlePrompt,
  type GenerateBody,
  type ParseBody,
} from "../api/_lib/handlers.ts";

function loadEnvFile(filename: string, override = false) {
  const envPath = resolve(process.cwd(), filename);
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = truncatedKey(trimmed, eq);
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    const existing = process.env[key];
    if (override || existing === undefined || existing === "") {
      process.env[key] = value;
    }
  }
}

function truncatedKey(line: string, eq: number) {
  return line.slice(0, eq).trim();
}

loadEnvFile(".env");
loadEnvFile(".env.local", true);

const PORT = Number(process.env.DOCS_API_PORT ?? 8787);

function sendJson(
  res: import("node:http").ServerResponse,
  status: number,
  body: unknown,
) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  });
  res.end(JSON.stringify(body));
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

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      const result = handleHealth();
      sendJson(res, result.status, result.body);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/generate/prompt") {
      const result = handlePrompt((await readJson(req)) as GenerateBody);
      sendJson(res, result.status, result.body);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/generate") {
      const result = await handleGenerate((await readJson(req)) as GenerateBody);
      sendJson(res, result.status, result.body);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/generate/parse") {
      const result = handleParse((await readJson(req)) as ParseBody);
      sendJson(res, result.status, result.body);
      return;
    }

    sendJson(res, 404, { error: "Not found." });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Server error.",
    });
  }
});

server.listen(PORT, () => {
  const key = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  console.log(`[nizek-docs-api] http://127.0.0.1:${PORT}`);
  console.log(
    `[nizek-docs-api] LLM ${key ? `ready (${model})` : "not configured — paste-JSON mode available"}`,
  );
});
