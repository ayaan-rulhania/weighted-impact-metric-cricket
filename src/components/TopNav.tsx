import { Link, NavLink } from "react-router-dom";
import { CricketBatMark } from "./CricketBatMark";

const REPO_URL = "https://github.com/ayaan-rulhania/weighted-impact-metric-cricket";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "font-jakarta text-sm font-bold tracking-tight transition-colors sm:text-base",
    isActive
      ? "text-accent underline decoration-wavy decoration-accent decoration-2 underline-offset-[10px]"
      : "text-foreground hover:text-accent/90",
  ].join(" ");

export function TopNav() {
  return (
    <header
      className="sticky top-0 z-50 border-b-2 border-foreground bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/90"
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      <div className="mx-auto flex w-full max-w-content items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <Link
          to="/"
          className="group flex min-w-0 shrink-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 border-foreground bg-tertiary shadow-[4px_4px_0_0_#1E293B] transition-transform duration-300 ease-bounce group-hover:-rotate-6 group-hover:-translate-y-0.5 motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:translate-y-0"
            aria-hidden
          >
            <CricketBatMark className="h-[22px] w-[22px] text-foreground" />
          </span>
          <span className="min-w-0 truncate font-outfit text-base font-extrabold tracking-tight text-foreground sm:text-lg">
            WIM Cricket Engine
          </span>
        </Link>

        <nav
          className="ml-2 flex shrink-0 items-center gap-5 sm:ml-6 sm:gap-8"
          aria-label="Main navigation"
        >
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/engine" className={navLinkClass}>
            Engine
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
        </nav>

        <span className="min-h-px min-w-0 flex-1" aria-hidden />

        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-foreground bg-[#181717] shadow-[4px_4px_0_0_#1E293B] transition-all duration-300 ease-bounce hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#1E293B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_#1E293B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0"
          aria-label="View source on GitHub"
        >
          <img
            src="/github-mark.png"
            alt=""
            width={40}
            height={40}
            className="h-full w-full object-cover"
            decoding="async"
          />
        </a>
      </div>
    </header>
  );
}
