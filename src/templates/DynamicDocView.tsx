import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
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
  heights: number[];
};

function FirstPageHeader({ doc }: { doc: AnyDoc }) {
  const { meta, kicker } = doc;
  return (
    <>
      {kicker && <p className="doc-kicker">{kicker}</p>}
      <h1 className="doc-title">{meta.title}</h1>
      {meta.subtitle && <p className="doc-subtitle">{meta.subtitle}</p>}
      <MetaChips meta={meta} />
    </>
  );
}

/** Move the last chunk of an overflowing page onto the next page. */
function shiftLastChunk(pages: number[][], pageIndex: number): number[][] | null {
  if (pageIndex < 0 || pageIndex >= pages.length) return null;
  const page = pages[pageIndex];
  if (page.length <= 1) return null;

  const next = pages.map((p) => [...p]);
  const chunk = next[pageIndex].pop();
  if (chunk === undefined) return null;

  if (pageIndex + 1 >= next.length) {
    next.push([chunk]);
  } else {
    next[pageIndex + 1].unshift(chunk);
  }
  return next.filter((p) => p.length > 0);
}

function pageBodyOverflows(body: HTMLElement): boolean {
  // Natural height via clone — scrollHeight is capped by overflow:hidden.
  const clone = body.cloneNode(true) as HTMLElement;
  clone.style.cssText = [
    "position:absolute",
    "visibility:hidden",
    "height:auto",
    "max-height:none",
    "overflow:visible",
    "flex:none",
    `width:${body.clientWidth}px`,
  ].join(";");
  document.body.appendChild(clone);
  const natural = clone.scrollHeight;
  document.body.removeChild(clone);
  return natural - body.clientHeight > 2;
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
    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      const root = document.querySelector(".doc-measure");
      if (!root) return;

      const probeBody = root.querySelector<HTMLElement>(
        "[data-doc-measure-available]",
      );
      const firstHeader = root.querySelector<HTMLElement>(
        "[data-doc-measure-header='first']",
      );
      const chunkEls = [
        ...root.querySelectorAll<HTMLElement>("[data-doc-measure-chunk]"),
      ];

      if (!probeBody || !firstHeader) return;
      if (chunkEls.length !== chunks.length) return;

      onMeasured({
        available: probeBody.clientHeight,
        firstHeader: firstHeader.getBoundingClientRect().height,
        heights: chunkEls.map((el) => el.getBoundingClientRect().height),
      });
    };

    // Remeasure after webfonts settle — serif/display fonts change heights.
    void document.fonts.ready.then(run);
    run();

    return () => {
      cancelled = true;
    };
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
          <FirstPageHeader doc={doc} />
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
  const reflowPasses = useRef(0);

  if (chunks !== chunkEpoch) {
    setChunkEpoch(chunks);
    setPageIndexes(null);
    reflowPasses.current = 0;
  }

  const handleMeasured = useCallback(
    (result: MeasureResult) => {
      if (result.available <= 0 || result.heights.length !== chunks.length) {
        return;
      }
      // Slack for subpixel/border rounding between packed chunks.
      const available = Math.max(0, result.available - 12);
      reflowPasses.current = 0;
      setPageIndexes(
        packChunksIntoPages(
          result.heights,
          chunks.map((c) => c.hardBreakBefore),
          available,
          result.firstHeader,
          0, // no repeated title on follow-on pages
        ),
      );
    },
    [chunks],
  );

  // After paint, push overflowing chunks to the next page until pages fit.
  useLayoutEffect(() => {
    if (!pageIndexes) return;
    if (reflowPasses.current > 40) return;

    const bodies = [
      ...document.querySelectorAll<HTMLElement>(
        ".doc-root .doc-page:not(.cover) .doc-page__body",
      ),
    ];

    for (let i = 0; i < bodies.length; i++) {
      if (!pageBodyOverflows(bodies[i])) continue;
      const next = shiftLastChunk(pageIndexes, i);
      if (!next) continue;
      reflowPasses.current += 1;
      setPageIndexes(next);
      return;
    }
  }, [pageIndexes, chunks]);

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
              {pageIndex === 0 && <FirstPageHeader doc={doc} />}
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
