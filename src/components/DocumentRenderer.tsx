import type { AnyDoc } from "../types/doc";
import { ApiEndpointDocView } from "../templates/ApiEndpointDoc";
import { ApiFlowProposalView } from "../templates/ApiFlowProposal";
import { ChangeRequestDocView } from "../templates/ChangeRequestDoc";

export function DocumentRenderer({ doc }: { doc: AnyDoc }) {
  switch (doc.kind) {
    case "api-endpoint":
      return <ApiEndpointDocView doc={doc} />;
    case "change-request":
      return <ChangeRequestDocView doc={doc} />;
    case "api-flow":
      return <ApiFlowProposalView doc={doc} />;
  }
}
