import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { DocShell } from "../components/DocShell";
import { MetaChips } from "../components/MetaChips";
import { PageChrome, PageFooter } from "../components/PageChrome";
import type { AnyDoc } from "../types/doc";
import { KIND_LABELS } from "../types/doc";
import {
  buildContentChunks,
  packChunksIntoPages,
  type ContentChunk,
} from "./chunks";

type MeasureResult = {
  available: number;
  firstHeader: number;
  continuedHeader: number;
  heights: number[];
};

function PageHeader({
  doc,
  continued,
}: {
  doc: AnyDoc;
  continued: boolean;
}) {
  const { meta, kicker } = doc;
  if (!continued) {
    return (
      <>
        {kicker && <p className="doc-kicker">{kicker}</p>}
        <h1 className="doc-title">{meta.title}</h1>
        {meta.subtitle && <p className="doc-subtitle">{meta.subtitle}</p>}
        <MetaChips meta={meta} />
      </>
    );
  }
  return (
    <>
      {kicker && <p className="doc-kicker">{kicker} · continued</p>}
      <h1 className="doc-title doc-title--continued">{meta.title}</h1>
    </>
  );
}

function MeasureRail({
  doc,
  kindLabel,
  chunks,
  onMeasured,
}: {
  doc: AnyDoc;
  kindLabel: string;
  chunks: ContentChunk[];
  onMeasured: (result: MeasureResult) => void;
}) {
  useLayoutEffect(() => {
    const root = document.querySelector(".doc-measure");
    if (!root) return;

    const probeBody = root.querySelector<HTMLElement>(
      "[data-doc-measure-available]",
    );
    const firstHeader = root.querySelector<HTMLElement>(
      "[data-doc-measure-header='first']",
    );
    const contHeader = root.querySelector<HTMLElement>(
      "[data-doc-measure-header='continued']",
    );
    const chunkEls = [
      ...root.querySelectorAll<HTMLElement>("[data-doc-measure-chunk]"),
    ];

    if (!probeBody || !firstHeader || !contHeader) return;
    if (chunkEls.length !== chunks.length) return;

    onMeasured({
      available: probeBody.clientHeight,
      firstHeader: firstHeader.getBoundingClientRect().height,
      continuedHeader: contHeader.getBoundingClientRect().height,
      heights: chunkEls.map((el) => el.getBoundingClientRect().height),
    });
  }, [chunks, doc, kindLabel, onMeasured]);

  return (
    <div className="doc-measure" aria-hidden>
      <section className="doc-page">
        <PageChrome meta={doc.meta} pageLabel={kindLabel} />
        <div className="doc-page__body" data-doc-measure-available />
        <PageFooter meta={doc.meta} page={1} total={1} />
      </section>

      <div className="doc-measure__column">
        <div className="doc-measure__chunk" data-doc-measure-header="first">
          <PageHeader doc={doc} continued={false} />
        </div>
        <div
          className="doc-measure__chunk"
          data-doc-measure-header="continued"
        >
          <PageHeader doc={doc} continued />
        </div>
        {chunks.map((chunk) => (
          <div
            className="doc-measure__chunk"
            data-doc-measure-chunk
            key={chunk.key}
          >
            {chunk.node}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DynamicDocView({ doc }: { doc: AnyDoc }) {
  const kindLabel = KIND_LABELS[doc.kind];
  const chunks = useMemo(
    () => buildContentChunks(doc.sections),
    [doc.sections],
  );

  const [pageIndexes, setPageIndexes] = useState<number[][] | null>(null);
  const [chunkEpoch, setChunkEpoch] = useState(chunks);

  if (chunks !== chunkEpoch) {
    setChunkEpoch(chunks);
    setPageIndexes(null);
  }

  const handleMeasured = useCallback(
    (result: MeasureResult) => {
      if (result.available <= 0 || result.heights.length !== chunks.length) {
        return;
      }
      // Leave a few px slack so border/subpixel rounding doesn't clip.
      const available = Math.max(0, result.available - 4);
      setPageIndexes(
        packChunksIntoPages(
          result.heights,
          chunks.map((c) => c.hardBreakBefore),
          available,
          result.firstHeader,
          result.continuedHeader,
        ),
      );
    },
    [chunks],
  );

  return (
    <>
      <MeasureRail
        doc={doc}
        kindLabel={kindLabel}
        chunks={chunks}
        onMeasured={handleMeasured}
      />
      {pageIndexes && (
        <DocShell
          meta={doc.meta}
          cover={doc.cover}
          kindLabel={kindLabel}
          pages={pageIndexes.map((indexes, pageIndex) => (
            <>
              <PageHeader doc={doc} continued={pageIndex > 0} />
              {indexes.map((chunkIndex) => (
                <div key={chunks[chunkIndex]?.key ?? chunkIndex}>
                  {chunks[chunkIndex]?.node}
                </div>
              ))}
            </>
          ))}
        />
      )}
    </>
  );
}
