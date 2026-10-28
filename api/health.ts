import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleHealth } from "../src/server/handlers";
import { handleOptions, sendResult } from "./_lib/vercel";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  if (req.method !== "GET") {
    sendResult(res, { status: 405, body: { error: "Method not allowed." } });
    return;
  }
  sendResult(res, handleHealth());
}
