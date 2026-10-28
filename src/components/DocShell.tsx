import type { ReactNode } from "react";
import type { CoverConfig, DocMeta } from "../types/doc";
import { CoverPage } from "./CoverPage";
import { PageChrome, PageFooter } from "./PageChrome";

type DocShellProps = {
  meta: DocMeta;
  cover: CoverConfig;
  kindLabel: string;
  /** Each entry becomes one fixed A4 content sheet. */
  pages: ReactNode[];
};

export function DocShell({ meta, cover, kindLabel, pages }: DocShellProps) {
  const contentCount = pages.length;
  const total = cover.enabled ? contentCount + 1 : contentCount;
  const firstContent = cover.enabled ? 2 : 1;

  return (
    <article className="doc-root">
      {cover.enabled && (
        <CoverPage meta={meta} cover={cover} kindLabel={kindLabel} />
      )}
      {pages.map((page, index) => (
        <section className="doc-page" key={index}>
          <PageChrome meta={meta} pageLabel={kindLabel} />
          <div className="doc-page__body">{page}</div>
          <PageFooter
            meta={meta}
            page={firstContent + index}
            total={total}
          />
        </section>
      ))}
    </article>
  );
}
