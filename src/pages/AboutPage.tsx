import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import specSource from "../content/wim-spec.md?raw";
import { StickerCard } from "../components/StickerCard";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-content px-4 pb-8 pt-12 sm:px-6 lg:px-8 lg:pt-16">
      <header className="mb-10 max-w-3xl">
        <p className="mb-2 inline-block rounded-full border-2 border-foreground bg-accent/15 px-3 py-1 font-jakarta text-xs font-bold uppercase tracking-widest text-foreground">
          Specification
        </p>
        <h1 className="font-outfit text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">WIM v5 Equation</h1>
        <p className="mt-3 font-jakarta text-sm font-medium text-mutedForeground">
          Rendered from <code className="rounded border border-border bg-muted px-1.5 py-0.5 text-foreground">src/content/wim-spec.md</code> — aligned
          with <code className="rounded border border-border bg-muted px-1.5 py-0.5 text-foreground">equation.tex</code> and{" "}
          <code className="rounded border border-border bg-muted px-1.5 py-0.5 text-foreground">src/lib/wim.ts</code>. Math uses KaTeX.
        </p>
      </header>

      <StickerCard
        title="Full spec"
        accent="accent"
        featured
        icon={<span className="material-symbols-outlined text-[22px] text-white">functions</span>}
      >
        <article className="wim-spec-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
            {specSource}
          </ReactMarkdown>
        </article>
      </StickerCard>
    </div>
  );
}
