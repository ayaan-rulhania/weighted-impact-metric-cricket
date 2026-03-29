import { useEffect, useRef, useState } from "react";

let mermaidInit = false;
let renderSeq = 0;

async function ensureMermaid() {
  const mermaid = (await import("mermaid")).default;
  if (!mermaidInit) {
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      themeVariables: {
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        primaryColor: "#F5E6C8",
        primaryTextColor: "#1E293B",
        primaryBorderColor: "#1E293B",
        lineColor: "#64748B",
        secondaryColor: "#E8D4A8",
        tertiaryColor: "#fffdf5",
        background: "#ffffff",
        mainBkg: "#ffffff",
        textColor: "#1E293B",
        pie1: "#8B5CF6",
        pie2: "#34D399",
        pie3: "#F472B6",
        pie4: "#FBBF24",
        pie5: "#38BDF8",
        pie6: "#A78BFA",
        pie7: "#2DD4BF",
        pie8: "#FB7185",
        pie9: "#FACC15",
        pie10: "#818CF8",
        pie11: "#4ADE80",
        pie12: "#F9A8D4",
      },
      securityLevel: "loose",
    });
    mermaidInit = true;
  }
  return mermaid;
}

type Props = { chart: string };

export function MermaidBlock({ chart }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    host.innerHTML = "";

    void (async () => {
      try {
        const mermaid = await ensureMermaid();
        const id = `wim-mermaid-${++renderSeq}`;
        const { svg } = await mermaid.render(id, chart.trim());
        if (!cancelled && hostRef.current) {
          hostRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="my-6 rounded-xl border-2 border-dashed border-border bg-muted/40 p-4">
        <p className="mb-2 font-jakarta text-xs font-bold uppercase tracking-wider text-mutedForeground">Chart could not render</p>
        <pre className="overflow-x-auto font-mono text-[0.7rem] leading-relaxed text-foreground">{chart}</pre>
      </div>
    );
  }

  return (
    <div className="mermaid-chart-shell my-6 min-w-0 max-w-full overflow-x-auto rounded-xl border-2 border-foreground bg-white/95 p-4 shadow-[4px_4px_0_0_#1E293B]">
      <div ref={hostRef} className="flex min-w-0 justify-center [&_svg]:max-w-none [&_svg]:min-w-0" />
    </div>
  );
}
