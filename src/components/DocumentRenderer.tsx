import type { AnyDoc } from "../types/doc";
import { DynamicDocView } from "../templates/DynamicDocView";

export function DocumentRenderer({ doc }: { doc: AnyDoc }) {
  return <DynamicDocView doc={doc} />;
}
