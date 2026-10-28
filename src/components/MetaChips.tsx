import type { DocMeta } from "../types/doc";

export function MetaChips({ meta }: { meta: DocMeta }) {
  return (
    <div className="meta-row">
      {meta.status && (
        <span className={`chip chip--status-${meta.status}`}>
          {meta.status}
        </span>
      )}
      {meta.version && <span className="chip">v{meta.version}</span>}
      <span className="chip">{meta.date}</span>
      <span className="chip">{meta.author}</span>
      {meta.tags?.map((tag) => (
        <span className="chip" key={tag}>
          {tag}
        </span>
      ))}
    </div>
  );
}
