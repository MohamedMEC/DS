// Probability / statistics engine for Units 3-5 — pure TypeScript, zero
// dependencies (no scipy, no external stats package: keeps the whole app
// free to build and deploy). Ported from the project's own vanilla-JS
// stats.js module, which was validated against scipy.stats to 3-4
// significant figures across multiple t-test/ANOVA cases.

// ---- seeded PRNG (mulberry32) — deterministic, reproducible simulations ----
export function makeRng(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// standard normal via Box-Muller, driven by a seeded uniform rng
export function makeGaussianRng(seed: number) {
  const rng = makeRng(seed);
  let spare: number | null = null;
  return function (mu = 0, sigma = 1) {
    if (spare !== null) { const v = spare; spare = null; return mu + sigma * v; }
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = rng();
    u2 = rng();
    const mag = Math.sqrt(-2 * Math.log(u1));
    const z0 = mag * Math.cos(2 * Math.PI * u2), z1 = mag * Math.sin(2 * Math.PI * u2);
    spare = z1;
    return mu + sigma * z0;
  };
}

export const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
export function variance(arr: number[], ddof = 0) { const m = mean(arr); const s = arr.reduce((a, b) => a + (b - m) * (b - m), 0); return s / (arr.length - ddof); }
export const std = (arr: number[], ddof = 0) => Math.sqrt(variance(arr, ddof));
export function median(arr: number[]) { const s = [...arr].sort((a, b) => a - b), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }

export function comb(n: number, k: number) { if (k < 0 || k > n) return 0; k = Math.min(k, n - k); let result = 1; for (let i = 0; i < k; i++) result = (result * (n - i)) / (i + 1); return result; }
export function binomialPMF(n: number, p: number) { const k: number[] = [], pmf: number[] = []; for (let ki = 0; ki <= n; ki++) { k.push(ki); pmf.push(comb(n, ki) * Math.pow(p, ki) * Math.pow(1 - p, n - ki)); } return { k, pmf }; }

function lnFactorial(n: number) { if (n < 2) return 0; let s = 0; for (let i = 2; i <= n; i++) s += Math.log(i); return s; }
export function poissonPMF(lambda: number, kMax: number) { const k: number[] = [], pmf: number[] = []; for (let ki = 0; ki <= kMax; ki++) { k.push(ki); pmf.push(lambda === 0 ? (ki === 0 ? 1 : 0) : Math.exp(ki * Math.log(lambda) - lambda - lnFactorial(ki))); } return { k, pmf }; }

export function normalPDF(x: number, mu: number, sigma: number) { return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2)); }

// Abramowitz & Stegun 7.1.26 erf approximation (|error| < 1.5e-7)
function erf(x: number) {
  const sign = x < 0 ? -1 : 1; x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}
export function normalCDF(x: number, mu = 0, sigma = 1) { return 0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2))); }

/** Inverse standard normal CDF (quantile function), e.g. for a critical z-value at a
 * given alpha. Found by bisection against normalCDF rather than a second approximation,
 * so it stays consistent with normalCDF above and needs no extra polynomial coefficients. */
export function normalInvCDF(p: number, mu = 0, sigma = 1) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  let lo = -10, hi = 10;
  for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (normalCDF(mid) < p) lo = mid; else hi = mid; }
  return mu + sigma * ((lo + hi) / 2);
}

export function sigmoid(z: number) { return 1 / (1 + Math.exp(-z)); }

// ---- regularized incomplete beta function I_x(a, b) via continued fraction
// (Numerical Recipes / Press et al.), needed for Student's t and F p-values.
function gammaln(x: number) {
  const cof = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x; let tmp = x + 5.5; tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) { y += 1; ser += cof[j] / y; }
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}
function betacf(x: number, a: number, b: number) {
  const MAXIT = 200, EPS = 3e-14, FPMIN = 1e-300;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN; d = 1 / d; let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; const del = d * c; h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}
export function betainc(x: number, a: number, b: number) {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const bt = Math.exp(gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) return (bt * betacf(x, a, b)) / a;
  return 1 - (bt * betacf(1 - x, b, a)) / b;
}
/** Two-tailed p-value for Student's t distribution with `df` degrees of freedom. */
export function tTwoTailedP(t: number, df: number) { const x = df / (df + t * t); return betainc(x, df / 2, 0.5); }
/** Upper-tail p-value for the F distribution (used for ANOVA). */
export function fUpperTailP(fStat: number, d1: number, d2: number) { if (fStat <= 0) return 1; const x = d1 * fStat; const xr = x / (x + d2); return 1 - betainc(xr, d1 / 2, d2 / 2); }

/** Two-sample t-test, pooled/equal-variance (matches scipy.stats.ttest_ind default). */
export function ttestInd(a: number[], b: number[]) {
  const na = a.length, nb = b.length, ma = mean(a), mb = mean(b);
  const va = variance(a, 1), vb = variance(b, 1), df = na + nb - 2;
  const pooled = ((na - 1) * va + (nb - 1) * vb) / df;
  const se = Math.sqrt(pooled * (1 / na + 1 / nb));
  // Zero pooled variance (e.g. every value in each group tightened to its own mean) is a real,
  // reachable edge case in the lab — mirror fOneway's handling instead of silently forcing t=0,p=1,
  // which would falsely read as "no difference" even when the means are clearly separated.
  const t = se > 0 ? (ma - mb) / se : ma === mb ? 0 : ma > mb ? Infinity : -Infinity;
  const p = se > 0 ? tTwoTailedP(t, df) : ma === mb ? 1 : 0;
  return { t, p, df };
}
/** One-way ANOVA across 2+ groups. */
export function fOneway(groups: number[][]) {
  const allValues = groups.flat(), grandMean = mean(allValues), k = groups.length, N = allValues.length;
  let ssBetween = 0; for (const g of groups) ssBetween += g.length * Math.pow(mean(g) - grandMean, 2);
  let ssWithin = 0; for (const g of groups) { const mg = mean(g); for (const v of g) ssWithin += Math.pow(v - mg, 2); }
  const dfBetween = k - 1, dfWithin = N - k;
  const msBetween = ssBetween / dfBetween, msWithin = ssWithin / dfWithin;
  const fStat = msWithin > 0 ? msBetween / msWithin : msBetween > 0 ? Infinity : 0;
  let p: number;
  if (!isFinite(fStat)) p = fStat > 0 ? 0 : 1; else if (fStat === 0) p = 1; else p = fUpperTailP(fStat, dfBetween, dfWithin);
  return { f: fStat, p, dfBetween, dfWithin, ssBetween, ssWithin, msBetween, msWithin };
}

/** Simple linear regression via closed-form least squares, plus R². */
export function linreg(points: { x: number; y: number }[]) {
  const n = points.length, mx = mean(points.map(p => p.x)), my = mean(points.map(p => p.y));
  const num = points.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
  const den = points.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  const m = den ? num / den : 0, b = my - m * mx;
  const ssTot = points.reduce((s, p) => s + (p.y - my) ** 2, 0);
  const ssRes = points.reduce((s, p) => s + (p.y - (m * p.x + b)) ** 2, 0);
  const r2 = ssTot ? 1 - ssRes / ssTot : 1;
  return { m, b, r2, ssRes, ssTot, n };
}
