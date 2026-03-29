/**
 * Aggregates male ODI career stats from Cricsheet JSON (ball-by-ball),
 * runs WIM (equation.tex / wim.ts), writes test.md with tables + Mermaid charts.
 *
 * Usage: CRICSHEET_ODI_DIR=/path/to/json/dir npx tsx scripts/generate-wim-test-report.ts
 * Default CRICSHEET_ODI_DIR: /tmp/cricsheet_odi
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { computeWim, type MainRole, type WimPlayerStats } from "../src/lib/wim.ts";
import { defaultGlobal } from "../src/lib/defaults.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BOWLER_WICKET_KINDS = new Set([
  "bowled",
  "caught",
  "caught and bowled",
  "lbw",
  "stumped",
  "hit wicket",
]);

const BATTING_DISMISSAL_KINDS = new Set([
  "bowled",
  "caught",
  "caught and bowled",
  "lbw",
  "stumped",
  "hit wicket",
  "run out",
  "obstructing the field",
  "timed out",
  "retired out",
]);

type Agg = {
  name: string;
  matches: Set<string>;
  R: number;
  BF: number;
  dismissals: number;
  wickets: number;
  runsConceded: number;
  catches: number;
  runouts: number;
};

function regId(registry: Record<string, string>, name: string): string {
  return registry[name] ?? `name:${name}`;
}

function ensureAgg(map: Map<string, Agg>, id: string, name: string): Agg {
  let a = map.get(id);
  if (!a) {
    a = {
      name,
      matches: new Set(),
      R: 0,
      BF: 0,
      dismissals: 0,
      wickets: 0,
      runsConceded: 0,
      catches: 0,
      runouts: 0,
    };
    map.set(id, a);
  }
  return a;
}

function isWideOnlyNoBallFacing(d: { extras?: Record<string, number>; runs: { batter: number } }): boolean {
  if (!d.extras) return false;
  if (d.extras.wides && !d.extras.noballs) {
    return d.runs.batter === 0;
  }
  return false;
}

function bowlerRunsConceded(d: {
  extras?: Record<string, number>;
  runs: { batter: number };
}): number {
  const e = d.extras ?? {};
  return d.runs.batter + (e.wides ?? 0) + (e.noballs ?? 0);
}

function inferMainRole(a: Agg): MainRole {
  const m = Math.max(a.matches.size, 1);
  const rpm = a.R / m;
  const wpm = a.wickets / m;
  if (wpm >= 1.0 && rpm < 22) return "bowler";
  if (rpm >= 32 && wpm < 0.45) return "batter";
  return "allrounder";
}

function processMatchFile(filePath: string, map: Map<string, Agg>): void {
  const raw = fs.readFileSync(filePath, "utf8");
  let doc: {
    info: {
      players: Record<string, string[]>;
      registry?: { people: Record<string, string> };
      teams: string[];
    };
    innings: {
      team: string;
      overs: { deliveries: Record<string, unknown>[] }[];
    }[];
  };
  try {
    doc = JSON.parse(raw);
  } catch {
    return;
  }

  const matchKey = path.basename(filePath, ".json");
  const reg = doc.info.registry?.people ?? {};

  for (const team of doc.info.teams ?? []) {
    const xi = doc.info.players?.[team] ?? [];
    for (const name of xi) {
      const id = regId(reg, name);
      const a = ensureAgg(map, id, name);
      a.matches.add(matchKey);
    }
  }

  for (const inn of doc.innings ?? []) {
    for (const over of inn.overs ?? []) {
      for (const d of over.deliveries ?? []) {
        const del = d as {
          batter: string;
          bowler: string;
          extras?: Record<string, number>;
          runs: { batter: number; extras: number; total: number };
          wickets?: { kind: string; player_out: string; fielders?: { name: string }[] }[];
        };

        const batter = del.batter;
        const bowler = del.bowler;
        const bId = regId(reg, batter);
        const bwId = regId(reg, bowler);

        const bAgg = ensureAgg(map, bId, batter);
        bAgg.R += del.runs.batter;
        if (!isWideOnlyNoBallFacing(del)) {
          bAgg.BF += 1;
        }

        const bwAgg = ensureAgg(map, bwId, bowler);
        bwAgg.runsConceded += bowlerRunsConceded(del);

        if (del.wickets?.length) {
          for (const w of del.wickets) {
            const outId = regId(reg, w.player_out);
            const outAgg = ensureAgg(map, outId, w.player_out);
            if (BATTING_DISMISSAL_KINDS.has(w.kind)) {
              outAgg.dismissals += 1;
            }

            if (BOWLER_WICKET_KINDS.has(w.kind)) {
              bwAgg.wickets += 1;
            }

            if (w.kind === "caught" || w.kind === "caught and bowled") {
              if (w.kind === "caught and bowled") {
                bwAgg.catches += 1;
              } else if (w.fielders?.length) {
                for (const f of w.fielders) {
                  const fId = regId(reg, f.name);
                  ensureAgg(map, fId, f.name).catches += 1;
                }
              }
            }

            if (w.kind === "run out" && w.fielders?.length) {
              const n = w.fielders.length;
              const credit = 1 / n;
              for (const f of w.fielders) {
                const fId = regId(reg, f.name);
                ensureAgg(map, fId, f.name).runouts += credit;
              }
            }
          }
        }
      }
    }
  }
}

function histogram(values: number[], bins: number, lo: number, hi: number): number[] {
  const h = Array.from({ length: bins }, () => 0);
  const w = (hi - lo) / bins;
  for (const v of values) {
    if (v < lo || v > hi) continue;
    const i = Math.min(bins - 1, Math.floor((v - lo) / w));
    h[i] += 1;
  }
  return h;
}

function main(): void {
  const dir =
    process.env.CRICSHEET_ODI_DIR ?? "/tmp/cricsheet_odi";
  if (!fs.existsSync(dir)) {
    console.error(`Missing Cricsheet dir: ${dir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const map = new Map<string, Agg>();
  let n = 0;
  for (const f of files) {
    processMatchFile(path.join(dir, f), map);
    n += 1;
    if (n % 500 === 0) process.stderr.write(`Processed ${n}/${files.length} matches\r`);
  }
  process.stderr.write(`Processed ${n}/${files.length} matches\n`);

  const global = defaultGlobal();
  const rows: {
    stats: WimPlayerStats;
    rating: number;
    batRE: number;
    bowlRE: number;
    fieldRE: number;
    M: number;
    matches: number;
  }[] = [];

  for (const a of map.values()) {
    const m = a.matches.size;
    if (m < 25) continue;
    if (a.R < 200 && a.wickets < 15) continue;

    const mainRole = inferMainRole(a);
    const stats: WimPlayerStats = {
      name: a.name,
      matches: m,
      R: a.R,
      dismissals: Math.max(1, a.dismissals),
      BF: Math.max(1, a.BF),
      wickets: a.wickets,
      runsConceded: a.runsConceded,
      catches: Math.round(a.catches * 10) / 10,
      runouts: Math.round(a.runouts * 100) / 100,
      mainRole,
    };

    const b = computeWim(global, stats);
    rows.push({
      stats,
      rating: b.rating,
      batRE: b.batRE,
      bowlRE: b.bowlRE,
      fieldRE: b.fieldRE,
      M: b.M,
      matches: m,
    });
  }

  rows.sort((x, y) => y.rating - x.rating);
  const top = rows.slice(0, 120);

  const ratings = top.map((r) => r.rating);
  const lo = 0;
  const hi = Math.max(0.85, Math.ceil(Math.max(...ratings) * 20) / 20);
  const bins = 10;
  const hist = histogram(ratings, bins, lo, hi);
  const binLabels: string[] = [];
  const bw = (hi - lo) / bins;
  for (let i = 0; i < bins; i++) {
    const a = lo + i * bw;
    const b = a + bw;
    binLabels.push(`${a.toFixed(2)}–${b.toFixed(2)}`);
  }

  const roleCount = { batter: 0, bowler: 0, allrounder: 0 } as Record<MainRole, number>;
  for (const r of top) roleCount[r.stats.mainRole] += 1;

  const esc = (s: string) => s.replace(/\|/g, "\\|");

  let md = `# WIM model test report (real ODI data)

This report tests the **WIM v5** equations in \`equation.tex\` using \`computeWim\` from \`src/lib/wim.ts\` with \`defaultGlobal()\` from \`src/lib/defaults.ts\` (includes \`ratingPerMatchBonus\`).

## Data source

- **Cricsheet** male ODI ball-by-ball JSON ([cricsheet.org](https://cricsheet.org/)), aggregated to career totals per player registry id.
- **Coverage:** ${files.length} ODI matches; players included below have **≥25** matches and either **≥200 runs** or **≥15 wickets** (career, in this dataset).
- **Caveats:** Bowling runs use batter runs + wides + no-balls per ball (leg-byes/byes excluded). Match count = appearances in official XI in each file. Fielding credits: catches as listed; run-outs split **1/n** across *n* fielders on the dismissal.

---

## Parameters required to evaluate the model

### Per-player inputs (\`WimPlayerStats\` — map from notation in \`equation.tex\`)

| Symbol / concept | Code field | Notes |
|------------------|------------|--------|
| Career matches | \`matches\` | \\(M_{\\mathrm{ch}}\\) in \\(M\\) |
| Batting runs | \`R\` | |
| Batting dismissals | \`dismissals\` | “Out” for \\(r_a\\) |
| Balls faced | \`BF\` | For \\(r_s\\) |
| Wickets | \`wickets\` | \\(W\\); drives \\(\\Sigma\\), \\(R^{(f)}_{pw}\\)-style terms |
| Runs conceded (bowling) | \`runsConceded\` | With estimated balls bowled \\(BB = 22 \\times \\text{wickets}\\) |
| Catches | \`catches\` | Fielding numerator |
| Run-outs (fractional OK) | \`runouts\` | Fielding numerator |
| Primary role | \`mainRole\` | \`batter\` / \`bowler\` / \`allrounder\` (scales non-primary discipline by 0.98) |

### Global tuning parameters (\`WimGlobalParams\` / defaults)

Baselines \\(\\text{Base}^\\*\\), winsor bounds \\(\\ell_b,h_b,\\ell_w,h_w,\\ell_f,h_f\\), \\(B_{\\min}\\) (\`Bmin\`, \\(\\lambda_{bb}\\)), \`bowlingSigmaWorkloadMinBalls\`, \\(\\rho_{\\mathrm{thresh}}\\), \\(\\epsilon\\), \\(C_{\\mathrm{legend}}\\), \`ratingPerMatchBonus\` (\\(b_m\\)), \\(R^{(f)}_{pw}\\) as \`rpw\`, field scale, expected catches/run-outs per match, \\(\\gamma_M,\\gamma_\\lambda,\\gamma_f\\), \\(\\beta\\) as \`batGeoWeight\`, \\(\\Sigma\\) weights, wicket knee, and softplus elite \\((\\tau,\\delta,B_{\\max},s)\\) for bat and bowl — see \`src/lib/defaults.ts\` for numeric values used here.

---

## Summary (${top.length} players)

| Metric | Value |
|--------|------:|
| Mean WIM rating | ${(ratings.reduce((s, v) => s + v, 0) / ratings.length).toFixed(4)} |
| Median | ${[...ratings].sort((a, b) => a - b)[Math.floor(ratings.length / 2)]!.toFixed(4)} |
| Min / Max | ${Math.min(...ratings).toFixed(4)} / ${Math.max(...ratings).toFixed(4)} |
| Batters / Bowlers / All-rounders (inferred) | ${roleCount.batter} / ${roleCount.bowler} / ${roleCount.allrounder} |

### Rating distribution (histogram)

\`\`\`mermaid
xychart-beta
    title "WIM rating (default global params)"
    x-axis [${binLabels.map((l) => `"${l}"`).join(", ")}]
    y-axis "players" 0 --> ${Math.max(...hist) + 2}
    bar [${hist.join(", ")}]
\`\`\`

### Inferred main role mix

\`\`\`mermaid
pie showData
    title Players by inferred mainRole
    "batter" : ${roleCount.batter}
    "bowler" : ${roleCount.bowler}
    "allrounder" : ${roleCount.allrounder}
\`\`\`

### Top 15 by rating (bat RE vs bowl RE; x = rank within this table)

\`\`\`mermaid
xychart-beta
    title "Top 15: batting vs bowling RE (fielding excluded for scale)"
    x-axis [${top
      .slice(0, 15)
      .map((_, i) => `"#${i + 1}"`)
      .join(", ")}]
    y-axis "RE" 0 --> ${Math.ceil(Math.max(...top.slice(0, 15).map((r) => Math.max(r.batRE, r.bowlRE))) * 1.1)}
    bar [${top.slice(0, 15).map((r) => r.batRE.toFixed(2)).join(", ")}]
    line [${top.slice(0, 15).map((r) => r.bowlRE.toFixed(2)).join(", ")}]
\`\`\`

| # | Player | BatRE | BowlRE |
|---|--------|------:|-------:|
${top
  .slice(0, 15)
  .map((r, i) => `| ${i + 1} | ${esc(r.stats.name)} | ${r.batRE.toFixed(2)} | ${r.bowlRE.toFixed(2)} |`)
  .join("\n")}

### Experience cap \\(M\\) and final rating by rank (top 40)

\`\`\`mermaid
xychart-beta
    title "M (experience multiplier) for top 40 by rating rank"
    x-axis [${top
      .slice(0, 40)
      .map((_, i) => `"${i + 1}"`)
      .join(", ")}]
    y-axis "M" 0 --> 1
    line [${top.slice(0, 40).map((r) => r.M.toFixed(3)).join(", ")}]
\`\`\`

\`\`\`mermaid
xychart-beta
    title "WIM rating (same order as above)"
    x-axis [${top
      .slice(0, 40)
      .map((_, i) => `"${i + 1}"`)
      .join(", ")}]
    y-axis "rating" 0 --> ${Math.ceil(Math.max(...top.slice(0, 40).map((r) => r.rating)) * 20) / 20}
    line [${top.slice(0, 40).map((r) => r.rating.toFixed(3)).join(", ")}]
\`\`\`

---

## Full results table (${top.length} players)

| Rank | Player | Mat | R | Out | BF | Wkts | Runs conc. | Ct | RO | Role | Rating | BatRE | BowlRE | FieldRE | M |
|-----:|--------|----:|--:|---:|---:|-----:|-----------:|---:|---:|------|-------:|------:|-------:|--------:|--:|
`;

  top.forEach((r, i) => {
    const s = r.stats;
    md += `| ${i + 1} | ${esc(s.name)} | ${s.matches} | ${s.R} | ${s.dismissals} | ${s.BF} | ${s.wickets} | ${s.runsConceded} | ${s.catches} | ${s.runouts} | ${s.mainRole} | ${r.rating.toFixed(4)} | ${r.batRE.toFixed(2)} | ${r.bowlRE.toFixed(2)} | ${r.fieldRE.toFixed(2)} | ${r.M.toFixed(3)} |\n`;
  });

  md += `
---

## ASCII sparkline — ratings (top ${Math.min(40, top.length)} players, high → low)

\`\`\`
${sparkline(ratings.slice(0, 40))}
\`\`\`
`;

  const outPath = path.join(__dirname, "..", "test.md");
  fs.writeFileSync(outPath, md, "utf8");
  console.log(`Wrote ${outPath}`);
}

function sparkline(vals: number[]): string {
  const blocks = "▁▂▃▄▅▆▇█";
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  if (hi === lo) return blocks[4]!.repeat(vals.length);
  return vals
    .map((v) => {
      const t = (v - lo) / (hi - lo);
      const i = Math.round(t * (blocks.length - 1));
      return blocks[i]!;
    })
    .join("");
}

main();
