import { useState } from "react";
import { Copy, Trash2, Trophy, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { CandyButton } from "../components/CandyButton";
import { LabeledInput } from "../components/LabeledInput";
import { SecondaryButton } from "../components/SecondaryButton";
import { StickerCard } from "../components/StickerCard";
import { MainRolePicker } from "../components/MainRolePicker";
import { defaultPlayer, wimModelDefaults } from "../lib/defaults";
import { STRESS_TEST_PROFILES } from "../lib/presets";
import { computeWim, type MainRole, type WimPlayerStats } from "../lib/wim";

const ROLE_LABEL: Record<MainRole, string> = {
  batter: "Batter",
  bowler: "Bowler",
  allrounder: "All-rounder",
};

type PlayerRow = { id: string } & WimPlayerStats;

function num(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

export default function EnginePage() {
  const [players, setPlayers] = useState<PlayerRow[]>(() => [
    { id: crypto.randomUUID(), ...defaultPlayer("A. Batter", "batter") },
    { id: crypto.randomUUID(), ...defaultPlayer("B. Bowler", "bowler") },
  ]);

  const rows = players.map((p) => ({
    player: p,
    ...computeWim(wimModelDefaults, p),
  }));
  const sorted = [...rows].sort((a, b) => b.rating - a.rating);
  const rowById = new Map(rows.map((r) => [r.player.id, r]));

  const setP = (id: string, patch: Partial<WimPlayerStats>) => {
    setPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const addPlayer = () => {
    setPlayers((ps) => [
      ...ps,
      { id: crypto.randomUUID(), ...defaultPlayer(`Player ${ps.length + 1}`, "allrounder") },
    ]);
  };

  const removePlayer = (id: string) => {
    setPlayers((ps) => (ps.length <= 1 ? ps : ps.filter((p) => p.id !== id)));
  };

  const duplicatePlayer = (p: PlayerRow) => {
    setPlayers((ps) => [
      ...ps,
      {
        ...p,
        id: crypto.randomUUID(),
        name: `${p.name} (copy)`,
      },
    ]);
  };

  const loadStressTestTrio = () => {
    setPlayers(
      STRESS_TEST_PROFILES.map(({ stats }) => ({
        id: crypto.randomUUID(),
        ...stats,
      })),
    );
  };

  return (
    <>
      <header className="mx-auto max-w-content px-4 pb-8 pt-12 sm:px-6 lg:px-8 lg:pb-10 lg:pt-16">
        <div className="relative max-w-2xl">
          <p className="mb-2 inline-block rounded-full border-2 border-foreground bg-quaternary/30 px-3 py-1 font-jakarta text-xs font-bold uppercase tracking-widest text-foreground">
            WIM engine
          </p>
          <h1 className="font-outfit text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Weighted Impact{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Metric</span>
              <span className="absolute -bottom-1 left-0 right-0 -z-0 h-3 bg-tertiary/70" aria-hidden />
            </span>
          </h1>
          <p className="mt-4 max-w-xl font-jakarta text-base font-medium text-mutedForeground">
            Enter career stats — get <strong className="text-foreground">Bat</strong>,{" "}
            <strong className="text-foreground">Bowl</strong>, and <strong className="text-foreground">Field</strong> run
            equivalents, then compare players side by side. Full math on the{" "}
            <Link to="/about" className="font-bold text-accent underline decoration-2 underline-offset-2">
              About
            </Link>{" "}
            page.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-mutedForeground">Stress test</span>
            <div className="flex flex-wrap gap-2">
              <SecondaryButton type="button" onClick={loadStressTestTrio} className="!min-h-10 !px-4 !text-xs">
                Load Bradman · Kohli · Bumrah
              </SecondaryButton>
            </div>
            <span className="font-jakarta text-xs text-mutedForeground">
              Illustrative profiles — not official aggregates. Smooth elite tails on{" "}
              <code className="text-foreground">{"\\bar r"}</code> and <code className="text-foreground">{"\\bar q"}</code>.
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-content space-y-16 px-4 pb-8 sm:px-6 lg:space-y-24 lg:px-8">
        <section aria-labelledby="players-heading" className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="players-heading" className="font-outfit text-3xl font-extrabold text-foreground">
              Players
            </h2>
            <CandyButton type="button" onClick={addPlayer}>
              Add player
            </CandyButton>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            {players.map((p, idx) => (
              <StickerCard
                key={p.id}
                title={p.name || `Player ${idx + 1}`}
                accent={idx % 3 === 0 ? "accent" : idx % 3 === 1 ? "secondary" : "tertiary"}
                featured={idx === 0}
                icon={<UserRound className="h-5 w-5 text-white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />}
              >
                <div className="flex flex-wrap gap-2">
                  <SecondaryButton type="button" onClick={() => duplicatePlayer(p)}>
                    <span className="flex items-center gap-2">
                      <Copy className="h-4 w-4" strokeWidth={2.5} />
                      Duplicate
                    </span>
                  </SecondaryButton>
                  <SecondaryButton type="button" onClick={() => removePlayer(p.id)} disabled={players.length <= 1}>
                    <span className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" strokeWidth={2.5} />
                      Remove
                    </span>
                  </SecondaryButton>
                </div>

                <LabeledInput
                  id={`${p.id}-name`}
                  label="Name"
                  value={p.name}
                  onChange={(e) => setP(p.id, { name: e.target.value })}
                />

                <div className="space-y-2">
                  <MainRolePicker value={p.mainRole} onChange={(mainRole: MainRole) => setP(p.id, { mainRole })} />
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={`${p.id}-matches`}
                      className="shrink-0 text-[0.65rem] font-bold uppercase tracking-widest text-foreground"
                    >
                      Matches
                    </label>
                    <input
                      id={`${p.id}-matches`}
                      type="number"
                      min={1}
                      inputMode="numeric"
                      className="h-8 w-[3.75rem] rounded-md border-2 border-slate-300 bg-input px-1.5 font-jakarta text-sm font-medium tabular-nums text-foreground outline-none transition-all focus:border-accent focus:shadow-input-focus"
                      value={p.matches}
                      onInput={(e) => setP(p.id, { matches: num(e.currentTarget.value) })}
                    />
                  </div>
                </div>

                <h4 className="border-b-2 border-border pb-1 font-outfit text-sm font-extrabold uppercase tracking-wide text-foreground">
                  Batting
                </h4>
                <p className="text-xs text-mutedForeground">
                  Average and strike rate come from runs, dismissals, and balls faced. Runs per match uses career matches above.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <LabeledInput id={`${p.id}-r`} label="Runs (R)" type="number" value={p.R} onChange={(e) => setP(p.id, { R: num(e.target.value) })} />
                  <LabeledInput id={`${p.id}-dismissals`} label="Dismissals" type="number" value={p.dismissals} onChange={(e) => setP(p.id, { dismissals: num(e.target.value) })} />
                  <LabeledInput id={`${p.id}-bf`} label="Balls faced (BF)" type="number" value={p.BF} onChange={(e) => setP(p.id, { BF: num(e.target.value) })} />
                </div>

                <h4 className="border-b-2 border-border pb-1 font-outfit text-sm font-extrabold uppercase tracking-wide text-foreground">
                  Bowling
                </h4>
                <p className="text-xs text-mutedForeground">
                  Wickets/m, average, economy, and implied balls bowled use matches (above) and the totals below.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <LabeledInput
                    id={`${p.id}-wickets`}
                    label="Wickets (total)"
                    type="number"
                    min={0}
                    value={p.wickets}
                    onChange={(e) => setP(p.id, { wickets: num(e.target.value) })}
                  />
                  <LabeledInput
                    id={`${p.id}-runs-conceded`}
                    label="Runs conceded"
                    type="number"
                    min={0}
                    value={p.runsConceded}
                    onChange={(e) => setP(p.id, { runsConceded: num(e.target.value) })}
                  />
                </div>

                <h4 className="border-b-2 border-border pb-1 font-outfit text-sm font-extrabold uppercase tracking-wide text-foreground">
                  Fielding
                </h4>
                <p className="text-xs text-mutedForeground">
                  Totals across the career sample; compared to par per match inside the model.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <LabeledInput
                    id={`${p.id}-catches`}
                    label="Catches"
                    type="number"
                    min={0}
                    value={p.catches}
                    onChange={(e) => setP(p.id, { catches: num(e.target.value) })}
                  />
                  <LabeledInput
                    id={`${p.id}-runouts`}
                    label="Run-outs"
                    type="number"
                    min={0}
                    value={p.runouts}
                    onChange={(e) => setP(p.id, { runouts: num(e.target.value) })}
                  />
                </div>

                {(() => {
                  const b = rowById.get(p.id)!;
                  return (
                    <div
                      className="rounded-xl border-2 border-foreground bg-tertiary/25 p-4 shadow-pop sm:shadow-pop"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      <p className="text-[0.65rem] font-bold uppercase tracking-widest text-foreground">Live breakdown</p>
                      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 font-jakarta text-sm sm:grid-cols-3">
                        <div>
                          <dt className="text-mutedForeground">Rating</dt>
                          <dd className="font-outfit text-lg font-extrabold text-foreground">{b.rating.toFixed(4)}</dd>
                        </div>
                        <div>
                          <dt className="text-mutedForeground">Rating (perf.)</dt>
                          <dd className="text-xs font-medium">{b.ratingPerformance.toFixed(4)}</dd>
                        </div>
                        <div>
                          <dt className="text-mutedForeground">Match bonus</dt>
                          <dd className="text-xs font-medium">{b.ratingMatchBonus.toFixed(4)}</dd>
                        </div>
                        <div>
                          <dt className="text-mutedForeground">M</dt>
                          <dd className="font-bold">{b.M.toFixed(4)}</dd>
                        </div>
                        <div>
                          <dt className="text-mutedForeground">Total RE</dt>
                          <dd className="font-bold">{b.totalRE.toFixed(2)}</dd>
                        </div>
                        <div>
                          <dt className="text-mutedForeground">Bat RE</dt>
                          <dd>{b.batRE.toFixed(2)}</dd>
                        </div>
                        <div>
                          <dt className="text-mutedForeground">Bowl RE</dt>
                          <dd>{b.bowlRE.toFixed(2)}</dd>
                        </div>
                        <div>
                          <dt className="text-mutedForeground">Field RE</dt>
                          <dd>{b.fieldRE.toFixed(2)}</dd>
                        </div>
                        <div>
                          <dt className="text-mutedForeground">Σ (role cap)</dt>
                          <dd className="font-medium">{b.sigma.toFixed(3)}</dd>
                        </div>
                        <div>
                          <dt className="text-mutedForeground">Σ bowl ω (BF+BB / N_min^wl)</dt>
                          <dd className="font-medium">{b.bowlSigmaWorkloadScale.toFixed(3)}</dd>
                        </div>
                        <div>
                          <dt className="text-mutedForeground">Σ_bowl (Σ·ω)</dt>
                          <dd className="font-medium">{b.sigmaBowl.toFixed(3)}</dd>
                        </div>
                        <div>
                          <dt className="text-mutedForeground">Σ ball / Σ wkt</dt>
                          <dd className="text-xs">
                            {b.sigmaBall.toFixed(2)} / {b.sigmaWkt.toFixed(2)}
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-mutedForeground">Bat Q (geom / arith / blend)</dt>
                          <dd className="text-xs">
                            {b.batQualityGeom.toFixed(3)} / {b.batQualityArith.toFixed(3)} / {b.batQualityBlend.toFixed(3)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-mutedForeground">Elite bat ×</dt>
                          <dd className="font-medium text-foreground">{b.batEliteMult.toFixed(3)}</dd>
                        </div>
                        <div>
                          <dt className="text-mutedForeground">r̄ bat</dt>
                          <dd className="text-xs text-foreground">{b.rBar.toFixed(3)}</dd>
                        </div>
                        <div>
                          <dt className="text-mutedForeground">Elite bowl ×</dt>
                          <dd className="font-medium text-foreground">{b.bowlEliteMult.toFixed(3)}</dd>
                        </div>
                        <div>
                          <dt className="text-mutedForeground">q̄ bowl</dt>
                          <dd className="text-xs text-foreground">{b.qBar.toFixed(3)}</dd>
                        </div>
                      </dl>
                      <p className="mt-3 border-t border-border pt-2 text-[0.65rem] font-bold uppercase tracking-widest text-foreground">
                        Derived (for your reference)
                      </p>
                      <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 font-jakarta text-xs text-mutedForeground sm:grid-cols-3">
                        <div>
                          <dt>R/m</dt>
                          <dd className="font-medium text-foreground">{b.derived.rpm.toFixed(2)}</dd>
                        </div>
                        <div>
                          <dt>Bat avg</dt>
                          <dd className="font-medium text-foreground">{b.derived.battingAverage.toFixed(2)}</dd>
                        </div>
                        <div>
                          <dt>SR</dt>
                          <dd className="font-medium text-foreground">{b.derived.strikeRate.toFixed(2)}</dd>
                        </div>
                        <div>
                          <dt>Wkts/m</dt>
                          <dd className="font-medium text-foreground">{b.derived.wicketsPerMatch.toFixed(3)}</dd>
                        </div>
                        <div>
                          <dt>Bowl avg</dt>
                          <dd className="font-medium text-foreground">{b.derived.bowlingAverage.toFixed(2)}</dd>
                        </div>
                        <div>
                          <dt>Econ</dt>
                          <dd className="font-medium text-foreground">{b.derived.economy.toFixed(2)}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt>BB est. (balls)</dt>
                          <dd className="font-medium text-foreground">{Math.round(b.derived.ballsBowledEstimated)}</dd>
                        </div>
                      </dl>
                    </div>
                  );
                })()}
              </StickerCard>
            ))}
          </div>
        </section>

        <section aria-labelledby="compare-heading">
          <StickerCard
            title="Compare"
            accent="tertiary"
            icon={<Trophy className="h-5 w-5 text-white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />}
          >
            <h2 id="compare-heading" className="sr-only">
              Comparison table
            </h2>
            <div className="overflow-x-auto rounded-xl border-2 border-foreground bg-card shadow-card-sticker">
              <table className="w-full min-w-[720px] border-collapse text-left font-jakarta text-sm">
                <thead>
                  <tr className="border-b-2 border-foreground bg-muted">
                    <th className="p-3 font-outfit text-xs font-extrabold uppercase tracking-wider">Rank</th>
                    <th className="p-3 font-outfit text-xs font-extrabold uppercase tracking-wider">Player</th>
                    <th className="p-3 font-outfit text-xs font-extrabold uppercase tracking-wider">Role</th>
                    <th className="p-3 font-outfit text-xs font-extrabold uppercase tracking-wider">Rating</th>
                    <th className="p-3 font-outfit text-xs font-extrabold uppercase tracking-wider">Bat RE</th>
                    <th className="p-3 font-outfit text-xs font-extrabold uppercase tracking-wider">Bowl RE</th>
                    <th className="p-3 font-outfit text-xs font-extrabold uppercase tracking-wider">Field RE</th>
                    <th className="p-3 font-outfit text-xs font-extrabold uppercase tracking-wider">M</th>
                  </tr>
                </thead>
                <tbody aria-live="polite" aria-relevant="text">
                  {sorted.map((r, i) => (
                    <tr
                      key={r.player.id}
                      className={[
                        "border-b border-border transition-colors",
                        i === 0 ? "bg-quaternary/15" : "hover:bg-muted/80",
                      ].join(" ")}
                    >
                      <td className="p-3 font-outfit font-extrabold">{i + 1}</td>
                      <td className="p-3 font-medium">{r.player.name}</td>
                      <td className="p-3 text-mutedForeground">{ROLE_LABEL[r.mainRole]}</td>
                      <td className="p-3 font-outfit font-extrabold text-accent">{r.rating.toFixed(4)}</td>
                      <td className="p-3">{r.batRE.toFixed(2)}</td>
                      <td className="p-3">{r.bowlRE.toFixed(2)}</td>
                      <td className="p-3">{r.fieldRE.toFixed(2)}</td>
                      <td className="p-3 text-mutedForeground">{r.M.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-mutedForeground">
              <strong className="text-foreground">Bat elite</strong>: smooth bonus on{" "}
              <code className="rounded bg-muted px-1">{"\\bar r = W_a r_a + W_s r_s"}</code> via softplus (no hard kink at τ).{" "}
              <strong className="text-foreground">Bowl elite</strong>: same on{" "}
              <code className="rounded bg-muted px-1">{"\\bar q = W_a q_avg + W_e q_econ"}</code>.{" "}
              Geom+arith <strong className="text-foreground">Q_bat</strong>, softened γ on <strong className="text-foreground">M</strong>/λ/
              <strong className="text-foreground">M_f</strong>, <strong className="text-foreground">Σ</strong> blend;{" "}
              <strong className="text-foreground">Bowl_RE</strong> uses <strong className="text-foreground">Σ_bowl = Σ·ω</strong> with ω =
              min(1,(BF+BB)/N_min^wl). <strong className="text-foreground">Rating</strong> = min(1, M·min(1, RE_tot/C_legend) + b_m·matches). See{" "}
              <Link to="/about" className="font-bold text-accent underline">
                About
              </Link>{" "}
              for the full spec.
            </p>
          </StickerCard>
        </section>
      </main>

      <footer className="mx-auto max-w-content px-4 py-6 text-center font-jakarta text-xs text-mutedForeground sm:px-6 lg:px-8">
        Canonical LaTeX: <code className="text-foreground">equation.tex</code> in the repo.
      </footer>
    </>
  );
}
