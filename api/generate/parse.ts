import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleParse, type ParseBody } from "../_lib/handlers.js";
import { handleOptions, readBody, sendResult } from "../_lib/vercel.js";


export default function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  if (req.method !== "POST") {
    sendResult(res, { status: 405, body: { error: "Method not allowed." } });
    return;
  }

  sendResult(res, handleParse(readBody<ParseBody>(req)));
}
