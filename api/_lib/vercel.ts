import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { ApiResult } from "./handlers.js";

export function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

export function sendResult(res: VercelResponse, result: ApiResult) {
  setCors(res);
  res.status(result.status).json(result.body);
}

export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === "OPTIONS") {
    setCors(res);
    res.status(204).end();
    return true;
  }
  return false;
}

export function readBody<T>(req: VercelRequest): T {
  return (req.body ?? {}) as T;
}
