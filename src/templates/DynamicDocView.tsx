import { DocShell } from "../components/DocShell";
import { MetaChips } from "../components/MetaChips";
import type { AnyDoc } from "../types/doc";
import { KIND_LABELS } from "../types/doc";
import { SectionBlock, paginateSections } from "./SectionBlocks";

export function DynamicDocView({ doc }: { doc: AnyDoc }) {
  const { meta, cover, kicker, sections } = doc;
  const kindLabel = KIND_LABELS[doc.kind];
  const pages = paginateSections(sections);

  return (
    <DocShell
      meta={meta}
      cover={cover}
      kindLabel={kindLabel}
      pages={pages.map((pageSections, pageIndex) => (
        <>
          {pageIndex === 0 ? (
            <>
              {kicker && <p className="doc-kicker">{kicker}</p>}
              <h1 className="doc-title">{meta.title}</h1>
              {meta.subtitle && (
                <p className="doc-subtitle">{meta.subtitle}</p>
              )}
              <MetaChips meta={meta} />
            </>
          ) : (
            <>
              {kicker && (
                <p className="doc-kicker">{kicker} · continued</p>
              )}
              <h1 className="doc-title doc-title--continued">{meta.title}</h1>
            </>
          )}

          {pageSections.map((section, index) => (
            <SectionBlock
              key={section.id ?? `${section.type}-${pageIndex}-${index}`}
              section={section}
            />
          ))}
        </>
      ))}
    />
  );
}
