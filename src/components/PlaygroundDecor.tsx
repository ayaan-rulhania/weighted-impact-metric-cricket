/** Background shapes — “Stable grid, wild decoration”. Hidden on small screens partially via overflow. */

export function PlaygroundDecor() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden motion-reduce:hidden"
      aria-hidden
    >
      <div className="absolute -left-16 top-24 h-72 w-72 rounded-full bg-tertiary/35 shadow-pop sm:shadow-pop" />
      <div className="absolute right-[-4rem] top-40 h-56 w-56 rotate-12 rounded-2xl border-[3px] border-foreground bg-secondary/25 sm:right-8" />
      <div className="absolute bottom-32 left-1/3 h-0 w-0 border-x-[42px] border-b-[72px] border-x-transparent border-b-quaternary/40 sm:left-1/2" />
      <svg
        className="absolute bottom-20 right-[12%] hidden w-48 text-accent/30 md:block"
        viewBox="0 0 200 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <path d="M4 28 Q40 4 76 28 T148 28 T196 20" />
      </svg>
      {/* 1% twist: seam-inspired micro accent (stays on-brand, geometric) */}
      <svg
        className="absolute left-[8%] top-[38%] hidden h-16 w-16 text-foreground/10 lg:block"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden
      >
        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" />
        <path
          d="M32 6 C44 20 44 44 32 58 C20 44 20 20 32 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
