import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handlePrompt, type GenerateBody } from "../_lib/handlers.js";
import { handleOptions, readBody, sendResult } from "../_lib/vercel.js";


export default function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") {
    sendResult(res, { status: 405, body: { error: "Method not allowed." } });
    return;
  }

  sendResult(res, handlePrompt(readBody<GenerateBody>(req)));
}
