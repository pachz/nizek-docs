import type { DocMeta } from "../types/doc";
import { Logo } from "./Logo";

type PageChromeProps = {
  meta: DocMeta;
  pageLabel?: string;
};

export function PageChrome({ meta, pageLabel }: PageChromeProps) {
  return (
    <header className="page-chrome">
      <div className="page-chrome__left">
        <Logo theme="onLight" className="page-chrome__logo" />
        <span className="page-chrome__startups">Startups</span>
      </div>
      <div className="page-chrome__right">
        {pageLabel ?? meta.project}
        {meta.version ? ` · v${meta.version}` : ""}
      </div>
    </header>
  );
}

type PageFooterProps = {
  meta: DocMeta;
  page?: number;
  total?: number;
};

export function PageFooter({ meta, page, total }: PageFooterProps) {
  return (
    <footer className="page-footer">
      <span>
        {meta.title}
        {meta.classification ? ` · ${meta.classification}` : ""}
      </span>
      <span>
        {meta.date}
        {page && total ? ` · ${page} / ${total}` : ""}
      </span>
    </footer>
  );
}
