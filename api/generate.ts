import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleGenerate, type GenerateBody } from "./_lib/handlers.js";
import { handleOptions, readBody, sendResult } from "./_lib/vercel.js";

export const config = {
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") {
    sendResult(res, { status: 405, body: { error: "Method not allowed." } });
    return;
  }

  const result = await handleGenerate(readBody<GenerateBody>(req));
  sendResult(res, result);
}
