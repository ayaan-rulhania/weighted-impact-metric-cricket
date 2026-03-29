# WIM Cricket Engine

Web app for **WIM v5 (Weighted Impact Metric)** — turn career batting, bowling, and fielding numbers into comparable run-equivalent impact, with a documented formula aligned to `equation.tex` and `src/lib/wim.ts`.

**Repository:** [github.com/ayaan-rulhania/weighted-impact-metric-cricket](https://github.com/ayaan-rulhania/weighted-impact-metric-cricket)

## Features

- **Engine** — Multi-player table, live WIM rating, compare and sort.
- **About** — Spec rendered from `src/content/wim-spec.md` with KaTeX math.
- **Home** — Landing and navigation.

## Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Stack

- React 19, TypeScript, Vite 6
- Tailwind CSS
- React Router, KaTeX + react-markdown for the equation reference

## Deploy (Vercel)

The repo includes `vercel.json` with SPA fallback rewrites. Static files under `public/` (including `equation.tex` and `favicon.png`) are copied to `dist/` on build. `prebuild` syncs root `equation.tex` into `public/equation.tex` so the About download stays current.

## License

See repository files for license terms if applicable.
