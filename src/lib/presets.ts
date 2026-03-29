import type { WimPlayerStats } from "./wim";

/**
 * Illustrative career-shaped profiles for model sanity checks (not official stats).
 * Bradman: Test-heavy batting outlier. Kohli: long white-ball career. Bumrah: specialist quick.
 */
export const STRESS_TEST_PROFILES: { label: string; stats: WimPlayerStats }[] = [
  {
    label: "Bradman",
    stats: {
      name: "D. Bradman (stress test)",
      matches: 52,
      R: 6996,
      dismissals: 70,
      BF: 12040,
      wickets: 1,
      runsConceded: 40,
      catches: 32,
      runouts: 0,
      mainRole: "batter",
    },
  },
  {
    label: "Kohli",
    stats: {
      name: "V. Kohli (stress test)",
      matches: 280,
      R: 13848,
      dismissals: 292,
      BF: 14840,
      wickets: 5,
      runsConceded: 210,
      catches: 168,
      runouts: 18,
      mainRole: "batter",
    },
  },
  {
    label: "Bumrah",
    stats: {
      name: "J. Bumrah (stress test)",
      matches: 172,
      R: 372,
      dismissals: 78,
      BF: 820,
      wickets: 312,
      runsConceded: 6288,
      catches: 34,
      runouts: 4,
      mainRole: "bowler",
    },
  },
];
