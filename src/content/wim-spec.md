# WIM v5 — Weighted Impact Metric

_Reference implementation — symbols map to `WimGlobalParams` and `WimPlayerStats`; defaults in `src/lib/defaults.ts`._

> **Abstract.** WIM is a career index: expectation-style contributions for batting, bowling, and fielding, plus a linear **longevity add-on** $b_m \cdot \max(0, M_{\mathrm{ch}})$ per career match, then an outer cap so **Rating** $\in [0,1]$. The model is format-aware only through tunable globals (recalibrate for Test / ODI / T20, not different equations).

---

## 1. Player inputs and globals

### Per-player statistics (`WimPlayerStats`)

Let $M_{\mathrm{ch}}$ be career **matches** (floored at $1$ only for **rate denominators** in code: $M_* = \max(M_{\mathrm{ch}}, 1)$).

| Symbol | Code field | Use |
|--------|------------|-----|
| $R$ | `R` | Career runs |
| $O_{\mathrm{raw}}$ | `dismissals` | Batting dismissals |
| $BF$ | `BF` | Balls faced |
| $W$ | `wickets` | Wickets |
| $R_{\mathrm{bwl}}$ | `runsConceded` | Runs conceded bowling |
| $C$ | `catches` | Catches |
| $RO$ | `runouts` | Run-outs (fractional OK) |
| $\rho$ | `mainRole` | `batter` / `bowler` / `allrounder` |

Primary role applies discount $\phi$ (`roleDisciplinePhi`, default $0.98$) to the **non-primary** raw RE block (§6).

### Effective dismissals and rates

$$
\begin{aligned}
O &= \max(O_{\mathrm{raw}}, 1), &
\mathrm{BatAvg} &= \frac{R}{O}, &
\mathrm{SR} &= \frac{100R}{\max(BF,1)}, &
R_{pm} &= \frac{R}{M_{*}}.
\end{aligned}
$$

### Baseline scaling (`baseStar`)

$$
\mathrm{Base}^*(x) = \frac{x\,\eta_V\,\eta_E}{\max(\eta_O, \varepsilon_\eta)}
$$

$\mathrm{Base}^*_{\mathrm{avg}} = \mathrm{Base}^*(\texttt{baseAvg})$, and similarly for SR, bowl avg, and economy baselines. (Default $\eta_V=\eta_E=\eta_O=1$; $\varepsilon_\eta$ is `etaODenominatorMin`.)

### Primitive operators

$$
\operatorname{Winsor}(x;\ell,h) = \min(h, \max(\ell, x))
$$

$$
\operatorname{softplus}(z) = \ln(1 + e^z)
$$

$$
\mathrm{LogCap}(n; N_0, \gamma) = \Bigl(\min\bigl(1, \tfrac{\log_{10}(n+1)}{\log_{10} N_0}\bigr)\Bigr)^{\gamma}
$$

---

## 2. Experience multiplier

$$
M = \mathrm{LogCap}(M_{\mathrm{ch}};\, N_M,\, \gamma_M)
$$

`experienceMatchThreshold` $\equiv N_M$, `experienceGamma` $\equiv \gamma_M$.

---

## 3. Batting

### Normalized ratios

$$
r_a = \operatorname{Winsor}\!\Bigl(\frac{\mathrm{BatAvg}}{\mathrm{Base}^*_{\mathrm{avg}}};\ell_b,h_b\Bigr), \quad
r_s = \operatorname{Winsor}\!\Bigl(\frac{\mathrm{SR}}{\mathrm{Base}^*_{\mathrm{sr}}};\ell_b,h_b\Bigr)
$$

Weights $(w_a, w_s)$ normalize `batWeightAvg`, `batWeightSr` (defaults $0.5/0.5$).

$$
Q_{\mathrm{geom}} = r_a^{w_a} r_s^{w_s}, \quad
Q_{\mathrm{arith}} = w_a r_a + w_s r_s, \quad
\bar r = w_a r_a + w_s r_s
$$

Blend $\beta =$ `batGeoWeight`:

$$
Q_{\mathrm{bat}} = \beta\, Q_{\mathrm{geom}} + (1-\beta)\, Q_{\mathrm{arith}}
$$

### Elite tail (batting)

$$
B_{\mathrm{elite}}^{(b)} = \min\Bigl(B_{\max}^{(b)},\, \max\bigl(0,\, \delta_b\bigl(\operatorname{softplus}\!\bigl(\tfrac{\bar r - \tau_b}{s_b}\bigr) - \operatorname{softplus}(0)\bigr)\bigr)\Bigr)
$$

$$
\mathrm{Bat}_{RE}^{\mathrm{raw}} = R_{pm}\, Q_{\mathrm{bat}}\, \bigl(1 + B_{\mathrm{elite}}^{(b)}\bigr)
$$

---

## 4. Bowling

$BB = W \cdot k_{\mathrm{bw}}$ (`ballsPerWicketPar`). Economy from estimated balls: $\mathrm{Econ} = 6 R_{\mathrm{bwl}} / \max(BB, \varepsilon)$ when $BB>0$.

### Sample shrinkage

$$
\lambda_{bb} = \min\Biggl(1,\biggl(\min\Bigl(1,\tfrac{\log_{10}(BB+1)}{\log_{10} B_{\min}}\Bigr)\biggr)^{\gamma_\lambda}\Biggr)
$$

Effective averages pull toward baselines when $BB$ is small.

### Opportunity $\Sigma$ and workload $\omega_\Sigma$

$D = BB + BF + \varepsilon$.

$$
\sigma_{\mathrm{ball}} = \min\Bigl(1, \frac{BB/D}{\rho_{\mathrm{thresh}}}\Bigr), \quad
\sigma_{\mathrm{wkt}} = \begin{cases} \min(1, W/W_{\mathrm{knee}}) & W>0 \\ 0 & W=0 \end{cases}
$$

$$
\Sigma = \min\bigl(1,\, w_b \sigma_{\mathrm{ball}} + w_w \sigma_{\mathrm{wkt}}\bigr)
$$

$$
\omega_\Sigma = \min\Bigl(1, \frac{BF+BB}{N_{\min}^{\mathrm{wl}}}\Bigr), \quad
\Sigma_{\mathrm{bowl}} = \Sigma\,\omega_\Sigma
$$

`bowlingSigmaWorkloadMinBalls` $\equiv N_{\min}^{\mathrm{wl}}$ (distinct from $B_{\min}$ above).

### Quality and elite (bowling)

$q_{\mathrm{avg}}$, $q_{\mathrm{econ}}$ are winsorized ratios of starred baselines to effective bowl avg / economy. $\bar q = w_a^{(k)} q_{\mathrm{avg}} + w_e^{(k)} q_{\mathrm{econ}}$.

$$
B_{\mathrm{elite}}^{(k)} = \min\Bigl(B_{\max}^{(k)},\, \max\bigl(0,\, \delta_k\bigl(\operatorname{softplus}\!\bigl(\tfrac{\bar q - \tau_k}{s_k}\bigr) - \operatorname{softplus}(0)\bigr)\bigr)\Bigr)
$$

$$
\mathrm{Bowl}_{RE}^{\mathrm{raw}} = \Sigma_{\mathrm{bowl}}\, \frac{W}{M_*}\, R_{pw}^{(f)}\, \bar q\, \bigl(1 + B_{\mathrm{elite}}^{(k)}\bigr)
$$

---

## 5. Fielding

Only **catches** and **run-outs**, weight $\tfrac12$ each:

$$
r_C = \operatorname{Winsor}\!\Bigl(\frac{C/M_*}{\mu_C};\ell_f,h_f\Bigr), \quad
r_{RO} = \operatorname{Winsor}\!\Bigl(\frac{RO/M_*}{\mu_{RO}};\ell_f,h_f\Bigr)
$$

$$
Q_{\mathrm{fld}} = \tfrac12 r_C + \tfrac12 r_{RO}, \quad
M_f = \mathrm{LogCap}(M_{\mathrm{ch}};\, I_{\min},\, \gamma_f)
$$

$$
\mathrm{Field}_{RE} = M_f\, F_s\, Q_{\mathrm{fld}}
$$

---

## 6. Role adjustment and final rating

Let $(B^{\mathrm{raw}}, K^{\mathrm{raw}}) = (\mathrm{Bat}_{RE}^{\mathrm{raw}}, \mathrm{Bowl}_{RE}^{\mathrm{raw}})$.

$$
(\mathrm{Bat}_{RE}, \mathrm{Bowl}_{RE}) =
\begin{cases}
(B^{\mathrm{raw}},\, \phi K^{\mathrm{raw}}) & \rho = \mathrm{batter} \\
(\phi B^{\mathrm{raw}},\, K^{\mathrm{raw}}) & \rho = \mathrm{bowler} \\
(B^{\mathrm{raw}},\, K^{\mathrm{raw}}) & \rho = \mathrm{allrounder}
\end{cases}
$$

$$
\mathrm{RE}_{\mathrm{tot}} = \mathrm{Bat}_{RE} + \mathrm{Bowl}_{RE} + \mathrm{Field}_{RE}
$$

$$
\mathrm{Rating}_{\mathrm{perf}} = M \cdot \min\Bigl(1, \frac{\mathrm{RE}_{\mathrm{tot}}}{C_{\mathrm{legend}}}\Bigr), \quad
\mathrm{Bonus}_m = b_m \cdot \max(0, M_{\mathrm{ch}})
$$

(`ratingPerMatchBonus` $\equiv b_m$, default $0.0004$; bonus uses **raw** input matches, not $M_*$.)

$$
\boxed{
\mathrm{Rating} = \min\Bigl(1,\, \mathrm{Rating}_{\mathrm{perf}} + \mathrm{Bonus}_m\Bigr)
}
$$

---

## 7. ICC-style calibration checklist

- **Baselines** — era/format reference levels for ratios.
- **Winsor bounds** — cap single-number leverage.
- **$B_{\min}$, $\gamma_\lambda$, $k_{\mathrm{bw}}$** — trust in bowling sample; $BB$ imputation.
- **$\rho_{\mathrm{thresh}}$, $W_{\mathrm{knee}}$, $(w_b,w_w)$, $N_{\min}^{\mathrm{wl}}$** — opportunity and workload.
- **Elite $(\tau, s, \delta, B_{\max})$** — smooth separation of elite tails.
- **$C_{\mathrm{legend}}$** — inner cap on the performance term.
- **$b_m$** — longevity credit per match.
- **$(\mu_C, \mu_{RO}, F_s, \gamma_f, I_{\min})$** — fielding magnitude.
- **$N_M$, $\phi$, weight priors, $\varepsilon_\eta$** — experience floor, role shrink, floors.

---

## 8. Known limitations

- No opposition strength, venue, or match leverage.
- $BB$ is inferred from wickets unless real balls bowled are supplied later.
- Same functional form across formats requires **re-tuned globals**.

---

## 9. Wall chart (composite rating)

Let $F_{\mathrm{bat}} = \phi$ if $\rho =$ bowler else $1$; $F_{\mathrm{bwl}} = \phi$ if batter else $1$. With $r_a, r_s, \bar r, \bar q, \Sigma, \omega_\Sigma$ as above, the performance core is:

$$
\begin{aligned}
\mathrm{Rating}_{\mathrm{perf}} = {} & M \cdot \min\Biggl(1,\, \frac{1}{C_{\mathrm{legend}}} \Biggl[
F_{\mathrm{bat}}\, \frac{R}{M_*}\, Q_{\mathrm{bat}}\, \bigl(1 + B_{\mathrm{elite}}^{(b)}\bigr) \\
& {} + F_{\mathrm{bwl}}\, \Sigma\, \omega_\Sigma\, \frac{W}{M_*}\, R_{pw}^{(f)}\, \bar q\, \bigl(1 + B_{\mathrm{elite}}^{(k)}\bigr) \\
& {} + M_f\, F_s\, \tfrac12 (r_C + r_{RO})
\Biggr]\Biggr)
\end{aligned}
$$

Then $\mathrm{Rating} = \min(1,\, \mathrm{Rating}_{\mathrm{perf}} + b_m \max(0, M_{\mathrm{ch}}))$. Substitute full $\operatorname{Winsor}$ / $\lambda_{bb}$ expansions inline for a single expression without abbreviations — see `equation.tex` in the repository for the fully expanded multiline form.
