import type { CoverConfig, DocMeta } from "../types/doc";
import { Logo } from "./Logo";

type CoverPageProps = {
  meta: DocMeta;
  cover: CoverConfig;
  kindLabel: string;
};

export function CoverPage({ meta, cover, kindLabel }: CoverPageProps) {
  return (
    <section className="doc-page cover">
      <div className="cover__ornament" aria-hidden="true" />
      <header className="cover__top">
        <div className="cover__brand">
          <Logo theme="onDark" className="cover__logo" />
          <div className="cover__brand-sub">Startups</div>
        </div>
        <div className="cover__meta-pill">{kindLabel}</div>
      </header>

      <div className="cover__hero">
        <div className="cover__accent" aria-hidden="true" />
        <div className="cover__eyebrow">{cover.eyebrow ?? kindLabel}</div>
        <h1 className="cover__headline">{cover.headline ?? meta.title}</h1>
        {(cover.description || meta.subtitle) && (
          <p className="cover__description">{cover.description ?? meta.subtitle}</p>
        )}
      </div>

      <footer className="cover__footer">
        <div>
          <div className="cover__footer-label">Project</div>
          <div className="cover__footer-value">{meta.project}</div>
        </div>
        <div>
          <div className="cover__footer-label">Prepared by</div>
          <div className="cover__footer-value">{meta.author}</div>
        </div>
        <div>
          <div className="cover__footer-label">
            {cover.recipient ? "Prepared for" : "Date"}
          </div>
          <div className="cover__footer-value">
            {cover.recipient ?? meta.date}
          </div>
        </div>
      </footer>
    </section>
  );
}
