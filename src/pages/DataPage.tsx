import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import rawTestMd from "../../test.md?raw";
import { StickerCard } from "../components/StickerCard";

/** remark-math expects $…$; test.md uses LaTeX \( … \). */
function texToDollars(src: string): string {
  return src.replaceAll("\\(", "$").replaceAll("\\)", "$");
}

export default function DataPage() {
  const markdown = useMemo(() => texToDollars(rawTestMd), []);

  return (
    <div className="mx-auto max-w-content px-4 pb-8 pt-12 sm:px-6 lg:px-8 lg:pt-16">
      <header className="mb-8 max-w-3xl">
        <p className="mb-2 inline-block rounded-full border-2 border-foreground bg-secondary/25 px-3 py-1 font-jakarta text-xs font-bold uppercase tracking-widest text-foreground">
          Data
        </p>
        <h1 className="font-outfit text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Model test report</h1>
        <p className="mt-3 max-w-2xl font-jakarta text-xs font-medium leading-relaxed text-mutedForeground sm:text-sm">
          Results on this page may be incomplete or inaccurate. We are actively developing <strong className="text-foreground">WIM v5.1</strong>, which
          will ship refined data handling and ratings — expected release soon.
        </p>
      </header>

      <StickerCard
        title="Real ODI sample"
        accent="secondary"
        featured
        disableHoverTilt
        icon={<span className="material-symbols-outlined text-[22px] text-white">table_chart</span>}
      >
        <p className="mb-6 font-jakarta text-xs font-medium text-mutedForeground sm:text-sm">
          Rendered from <code className="rounded border border-border bg-muted px-1.5 py-0.5 text-foreground">test.md</code> (Cricsheet-backed
          aggregates). Mermaid blocks show diagram source; math uses KaTeX.
        </p>
        <article className="wim-spec-prose wim-data-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
            {markdown}
          </ReactMarkdown>
        </article>
      </StickerCard>
    </div>
  );
}
