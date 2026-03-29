/** Implements WIM v5 (see `equation.tex`, §1 “Implementation correspondence”). */

export function winsor(x: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, x));
}

/** Base*(x) = x·η_V·η_E / max(η_O, ε_η); ε_η avoids divide-by-zero (see \texttt{etaODenominatorMin}). */
export function baseStar(
  base: number,
  etaV: number,
  etaE: number,
  etaO: number,
  etaODenominatorMin: number,
): number {
  const o = Math.max(etaO, etaODenominatorMin);
  return (base * etaV * etaE) / o;
}

/** Log sample cap with exponent γ∈(0,1]: γ<1 eases shrinkage (less compression than pure log cap). */
export function logExperienceCap(n: number, threshold: number, gamma: number): number {
  const raw = Math.log10(n + 1) / Math.log10(threshold);
  const capped = Math.min(1, raw);
  return Math.pow(Math.max(capped, 0), Math.max(gamma, 1e-6));
}

export function dismissalsClamp(d: number): number {
  return Math.max(d, 1);
}

/** log(1+e^x); stable for large |x|. */
export function softplus(x: number): number {
  if (x > 35) return x;
  if (x < -35) return Math.exp(x);
  return Math.log1p(Math.exp(x));
}

/**
 * Smooth elite bonus: 0 at combined = τ, grows for combined > τ, capped.
 * B = min(B_max, max(0, δ · (softplus((combined−τ)/s) − softplus(0)))).
 */
export function eliteBonusSoftplus(
  combined: number,
  tau: number,
  softness: number,
  delta: number,
  maxBonus: number,
): number {
  const z = (combined - tau) / Math.max(softness, 1e-6);
  const raw = delta * (softplus(z) - softplus(0));
  return Math.min(maxBonus, Math.max(0, raw));
}

export const MAIN_ROLES = ["batter", "bowler", "allrounder"] as const;
export type MainRole = (typeof MAIN_ROLES)[number];

export type WimGlobalParams = {
  baseAvg: number;
  baseSr: number;
  baseBowlAvg: number;
  baseEcon: number;
  etaV: number;
  etaE: number;
  etaO: number;
  /** ε_η: floor on η_O in \texttt{baseStar} denominator. */
  etaODenominatorMin: number;
  Bmin: number;
  rhoThresh: number;
  epsilon: number;
  lb: number;
  hb: number;
  lw: number;
  hw: number;
  lf: number;
  hf: number;
  cLegend: number;
  /** $b_m$: additive rating per career match (applied to raw \texttt{matches}, $\ge 0$). */
  ratingPerMatchBonus: number;
  rpw: number;
  fScale: number;
  Imin: number;
  expectedCatchesPerMatch: number;
  expectedRunoutsPerMatch: number;
  ballsPerWicketPar: number;
  /** Prior weights for (w_a,w_s) after normalization (batting Q_geom / Q_arith / \bar r). */
  batWeightAvg: number;
  batWeightSr: number;
  /** Weight on geometric r_a^{w_a}r_s^{w_s}; (1−β) on arithmetic blend. */
  batGeoWeight: number;
  /** Prior weights for (w_a^{(k)},w_e^{(k)}) after normalization (bowling \bar q). */
  bowlWeightAvg: number;
  bowlWeightEcon: number;
  /** N_0 for M = LogCap(M_ch; N_0, γ_M) (matches threshold in equation.tex §2). */
  experienceMatchThreshold: number;
  /** Experience multiplier exponent (γ_M); <1 raises M faster → less harsh sample shrink. */
  experienceGamma: number;
  /** Bowling BB sample shrinkage exponent (γ_λ). */
  bowlingSampleGamma: number;
  /** Fielding innings exponent (γ_f) for M_f. */
  fieldSampleGamma: number;
  /** Σ = w_b·σ_ball + w_w·σ_wkt (normalized weights). */
  sigmaBallWeight: number;
  sigmaWktWeight: number;
  /** Career wickets at which wicket track reaches 1 for Σ. */
  wicketSigmaKnee: number;
  /**
   * Caps small-sample inflation on Bowl_RE: Σ_bowl = Σ × min(1, (BF+BB)/N_min^wl).
   * BB is estimated balls bowled; tune N_min^wl by format (code: bowlingSigmaWorkloadMinBalls).
   */
  bowlingSigmaWorkloadMinBalls: number;
  /** Batting elite: on \bar r = W_a r_a + W_s r_s, softplus vs τ, softness s_b. */
  batEliteThreshold: number;
  batEliteSoftness: number;
  batEliteDelta: number;
  batEliteMaxBonus: number;
  /** Bowling elite: on \bar q = W_a q_{avg} + W_e q_{econ}, same smooth shape. */
  bowlEliteThreshold: number;
  bowlEliteSoftness: number;
  bowlEliteDelta: number;
  bowlEliteMaxBonus: number;
  /** φ: multiplier on non-primary discipline raw RE (batter → bowl, bowler → bat). */
  roleDisciplinePhi: number;
};

export type WimPlayerStats = {
  name: string;
  matches: number;
  R: number;
  dismissals: number;
  BF: number;
  wickets: number;
  runsConceded: number;
  catches: number;
  runouts: number;
  mainRole: MainRole;
};

export type WimDerivedStats = {
  rpm: number;
  battingAverage: number;
  strikeRate: number;
  wicketsPerMatch: number;
  bowlingAverage: number;
  economy: number;
  ballsBowledEstimated: number;
};

export type WimBreakdown = {
  M: number;
  batRE: number;
  bowlRE: number;
  fieldRE: number;
  totalRE: number;
  /** $M\cdot\min(1,\mathrm{RE}_{\mathrm{tot}}/C_{\mathrm{legend}})$ before per-match add-on. */
  ratingPerformance: number;
  /** $b_m\cdot\max(0,M_{\mathrm{ch}})$ from input \texttt{matches}. */
  ratingMatchBonus: number;
  rating: number;
  ra: number;
  rs: number;
  lambdaBb: number;
  sigma: number;
  sigmaBall: number;
  sigmaWkt: number;
  /** ω_Σ = min(1, (BF+BB)/bowlingSigmaWorkloadMinBalls); multiplies Σ only on Bowl_RE. */
  bowlSigmaWorkloadScale: number;
  /** Σ_bowl = Σ·ω_Σ (used for Bowl_RE^raw). */
  sigmaBowl: number;
  batQualityGeom: number;
  batQualityArith: number;
  batQualityBlend: number;
  /** 1 + smooth elite bonus from high \bar r = W_a r_a + W_s r_s. */
  batEliteMult: number;
  /** Weighted mean of winsorized batting ratios (same weights as Q_arith). */
  rBar: number;
  qAvg: number;
  qEcon: number;
  /** 1 + smooth elite bonus from high \bar q = W_a q_{avg} + W_e q_{econ}. */
  bowlEliteMult: number;
  qBar: number;
  Mf: number;
  mainRole: MainRole;
  derived: WimDerivedStats;
};

function normalizePair(a: number, b: number): [number, number] {
  const s = a + b;
  if (s <= 0) return [0.5, 0.5];
  return [a / s, b / s];
}

function applyMainRole(
  batRE: number,
  bowlRE: number,
  role: MainRole,
  phi: number,
): [number, number] {
  if (role === "batter") return [batRE, bowlRE * phi];
  if (role === "bowler") return [batRE * phi, bowlRE];
  return [batRE, bowlRE];
}

function normalizeSigmaWeights(b: number, w: number): [number, number] {
  const s = b + w;
  if (s <= 0) return [0.5, 0.5];
  return [b / s, w / s];
}

export function computeWim(
  g: WimGlobalParams,
  p: WimPlayerStats,
): WimBreakdown {
  const M = logExperienceCap(p.matches, g.experienceMatchThreshold, g.experienceGamma);
  const [wAvg, wSr] = normalizePair(g.batWeightAvg, g.batWeightSr);
  const [wBa, wBe] = normalizePair(g.bowlWeightAvg, g.bowlWeightEcon);
  const [swBall, swWkt] = normalizeSigmaWeights(g.sigmaBallWeight, g.sigmaWktWeight);

  const matchCount = Math.max(p.matches, 1);
  const rpm = p.R / matchCount;

  const out = dismissalsClamp(p.dismissals);
  const batAvg = p.R / out;
  const batSr = (100 * p.R) / Math.max(p.BF, 1);

  const baseAvgS = baseStar(g.baseAvg, g.etaV, g.etaE, g.etaO, g.etaODenominatorMin);
  const baseSrS = baseStar(g.baseSr, g.etaV, g.etaE, g.etaO, g.etaODenominatorMin);
  const ra = winsor(batAvg / Math.max(baseAvgS, 1e-9), g.lb, g.hb);
  const rs = winsor(batSr / Math.max(baseSrS, 1e-9), g.lb, g.hb);

  const batQualityGeom = Math.pow(ra, wAvg) * Math.pow(rs, wSr);
  const batQualityArith = wAvg * ra + wSr * rs;
  const beta = Math.min(1, Math.max(0, g.batGeoWeight));
  const batQualityBlend = beta * batQualityGeom + (1 - beta) * batQualityArith;
  const rBar = wAvg * ra + wSr * rs;
  const batEliteBonus = eliteBonusSoftplus(
    rBar,
    g.batEliteThreshold,
    g.batEliteSoftness,
    g.batEliteDelta,
    g.batEliteMaxBonus,
  );
  const batEliteMult = 1 + batEliteBonus;
  const batREraw = rpm * batQualityBlend * batEliteMult;

  const wk = Math.max(0, p.wickets);
  const BB = wk * Math.max(g.ballsPerWicketPar, 1e-9);
  const wpm = wk / matchCount;

  const bowlAvg = wk > 0 ? p.runsConceded / wk : g.baseBowlAvg;
  const econ =
    BB > 0 ? (6 * Math.max(0, p.runsConceded)) / Math.max(BB, g.epsilon) : g.baseEcon;

  const rawLam = Math.log10(BB + 1) / Math.log10(Math.max(g.Bmin, 2));
  const lam = Math.min(1, Math.pow(Math.min(1, rawLam), g.bowlingSampleGamma));

  const bowlEffAvg = lam * bowlAvg + (1 - lam) * g.baseBowlAvg;
  const econEff = lam * econ + (1 - lam) * g.baseEcon;

  const denom = BB + p.BF + g.epsilon;
  const shareBalls = denom > 0 ? BB / denom : 0;
  const sigmaBall = Math.min(1, shareBalls / Math.max(g.rhoThresh, 1e-9));
  const sigmaWkt = wk > 0 ? Math.min(1, wk / Math.max(g.wicketSigmaKnee, 1)) : 0;
  const sigma = Math.min(1, swBall * sigmaBall + swWkt * sigmaWkt);

  const ballsCareer = p.BF + BB;
  const bowlSigmaWorkloadScale = Math.min(
    1,
    ballsCareer / Math.max(g.bowlingSigmaWorkloadMinBalls, 1),
  );
  const sigmaBowl = sigma * bowlSigmaWorkloadScale;

  const baseBwlS = baseStar(g.baseBowlAvg, g.etaV, g.etaE, g.etaO, g.etaODenominatorMin);
  const baseEconS = baseStar(g.baseEcon, g.etaV, g.etaE, g.etaO, g.etaODenominatorMin);
  const qAvg = winsor(baseBwlS / Math.max(bowlEffAvg, 1), g.lw, g.hw);
  const qEcon = winsor(baseEconS / Math.max(econEff, 1), g.lw, g.hw);
  const bowlQLinear = wBa * qAvg + wBe * qEcon;
  const qBar = bowlQLinear;
  const bowlEliteBonus = eliteBonusSoftplus(
    qBar,
    g.bowlEliteThreshold,
    g.bowlEliteSoftness,
    g.bowlEliteDelta,
    g.bowlEliteMaxBonus,
  );
  const bowlEliteMult = 1 + bowlEliteBonus;
  const bowlREraw = sigmaBowl * wpm * g.rpw * bowlQLinear * bowlEliteMult;

  const [batRE, bowlRE] = applyMainRole(batREraw, bowlREraw, p.mainRole, g.roleDisciplinePhi);

  const catchRate = Math.max(0, p.catches) / matchCount;
  const runoutRate = Math.max(0, p.runouts) / matchCount;
  const rCatch = winsor(
    catchRate / Math.max(g.expectedCatchesPerMatch, 1e-9),
    g.lf,
    g.hf,
  );
  const rRunout = winsor(
    runoutRate / Math.max(g.expectedRunoutsPerMatch, 1e-9),
    g.lf,
    g.hf,
  );
  const fieldSum = 0.5 * rCatch + 0.5 * rRunout;
  const Mf = logExperienceCap(p.matches, g.Imin, g.fieldSampleGamma);
  const fieldRE = Mf * g.fScale * fieldSum;

  const totalRE = batRE + bowlRE + fieldRE;
  const ratingPerformance = M * Math.min(1, totalRE / Math.max(g.cLegend, 1e-9));
  const matchesForBonus = Math.max(0, p.matches);
  const ratingMatchBonus = matchesForBonus * g.ratingPerMatchBonus;
  const rating = Math.min(1, ratingPerformance + ratingMatchBonus);

  const derived: WimDerivedStats = {
    rpm,
    battingAverage: batAvg,
    strikeRate: batSr,
    wicketsPerMatch: wpm,
    bowlingAverage: bowlAvg,
    economy: econ,
    ballsBowledEstimated: BB,
  };

  return {
    M,
    batRE,
    bowlRE,
    fieldRE,
    totalRE,
    ratingPerformance,
    ratingMatchBonus,
    rating,
    ra,
    rs,
    lambdaBb: lam,
    sigma,
    sigmaBall,
    sigmaWkt,
    bowlSigmaWorkloadScale,
    sigmaBowl,
    batQualityGeom,
    batQualityArith,
    batQualityBlend,
    batEliteMult,
    rBar,
    qAvg,
    qEcon,
    bowlEliteMult,
    qBar,
    Mf,
    mainRole: p.mainRole,
    derived,
  };
}
