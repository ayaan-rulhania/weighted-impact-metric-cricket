import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-content px-4 pb-8 pt-16 sm:px-6 lg:px-8 lg:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-4 inline-block rounded-full border-2 border-foreground bg-secondary/25 px-4 py-1.5 font-jakarta text-xs font-bold uppercase tracking-widest text-foreground">
          Cricket analytics
        </p>
        <h1 className="font-outfit text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          <span className="relative inline-block">
            <span className="relative z-10">WIM</span>
            <span className="absolute -bottom-1 left-0 right-0 -z-0 h-4 bg-accent/35" aria-hidden />
          </span>
        </h1>
        <p className="mt-2 font-outfit text-xl font-extrabold text-mutedForeground sm:text-2xl">Weighted Impact Metric</p>
        <p className="mx-auto mt-8 max-w-xl font-jakarta text-base font-medium leading-relaxed text-mutedForeground">
          Turn career <strong className="text-foreground">batting</strong>, <strong className="text-foreground">bowling</strong>, and{" "}
          <strong className="text-foreground">fielding</strong> totals into comparable run-equivalent impact — with soft elite tails, workload-aware
          bowling, and a transparent formula you can read end-to-end.
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
          <Link
            to="/engine"
            className="inline-flex min-h-14 items-center justify-center rounded-full border-2 border-foreground bg-accent px-8 font-outfit text-base font-extrabold text-accentForeground shadow-[4px_4px_0_0_#1E293B] transition-all duration-300 ease-bounce hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#1E293B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_#1E293B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Compare/Rate Players
          </Link>
          <Link
            to="/about"
            className="inline-flex min-h-14 items-center justify-center rounded-full border-2 border-foreground bg-card px-8 font-outfit text-base font-extrabold text-foreground shadow-[4px_4px_0_0_#1E293B] transition-all duration-300 ease-bounce hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-muted/80 hover:shadow-[6px_6px_0_0_#1E293B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_#1E293B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Get the Equation
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-20 grid max-w-4xl gap-6 sm:grid-cols-3">
        {[
          { icon: "bolt", title: "Live RE", body: "Bat, bowl, and field blocks update as you type — sticker cards, chunky borders, no surprises." },
          { icon: "balance", title: "Fair blend", body: "Geom + arithmetic batting mix, Σ opportunity for bowlers, catches + run-outs in the field." },
          { icon: "verified", title: "Documented", body: "The About page mirrors equation.tex with rendered math — same definitions as src/lib/wim.ts." },
        ].map((c) => (
          <div
            key={c.title}
            className="rounded-2xl border-2 border-foreground bg-quaternary/20 p-5 text-left shadow-[6px_6px_0_0_#1E293B]"
          >
            <span className="material-symbols-outlined mb-3 block text-3xl text-foreground" aria-hidden>
              {c.icon}
            </span>
            <h2 className="font-outfit text-lg font-extrabold text-foreground">{c.title}</h2>
            <p className="mt-2 font-jakarta text-sm font-medium text-mutedForeground">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
