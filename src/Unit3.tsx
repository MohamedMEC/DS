import { useMemo, useState } from "react";
import { Activity, Dices, Eye, Hash, Play, Repeat, RotateCcw, TrendingUp } from "lucide-react";
import { Chapter, LabShell, MiniRange, Stat, StudioShell, f } from "./studio-kit";
import { binomialPMF, makeGaussianRng, makeRng, normalCDF, normalPDF, poissonPMF } from "./stats-kit";

const chapters: Chapter[] = [
  {
    id: "discrete-continuous", number: "3.1", title: "Discrete vs continuous random variables", short: "Discrete vs continuous", icon: Hash,
    meaning: "A discrete random variable takes separate, countable values (0, 1, 2, …) each with its own probability. A continuous random variable can take any value in a range, and probability only makes sense over an interval — any single exact point has probability zero.",
    example: "The number of defective items in a batch of 10 is discrete: P(X=3) is a real bar you can read off a chart. A person's exact height is continuous: P(height = 170.00000...cm) is zero, but P(169cm < height < 171cm) is a real, computable area.",
    formula: "Discrete: P(X=k) = pmf(k), Σ pmf(k) = 1   •   Continuous: P(a<X<b) = ∫ₐᵇ f(x)dx, area under the curve",
    ml: "Classification models output discrete label probabilities (softmax); regression models often assume a continuous error distribution — the same distinction shapes which loss function and evaluation metric fits a problem.",
    check: { q: "For a continuous variable, P(X = exactly 5.000...) is…", options: ["A large positive number", "Exactly zero", "Always 1"], answer: 1, why: "Continuous probability lives in area under a curve; a single point has zero width and therefore zero area." },
  },
  {
    id: "binomial", number: "3.2", title: "The binomial distribution: counting successes", short: "Binomial", icon: Dices,
    meaning: "The binomial distribution models the number of successes in n independent yes/no trials, each with the same success probability p.",
    example: "Ten students each independently pass a quiz with probability 0.7. The number who pass follows Binomial(n=10, p=0.7); the most likely outcome is around 7 passes, but 6 or 8 are also quite plausible.",
    formula: "P(X=k) = C(n,k)·pᵏ·(1−p)ⁿ⁻ᵏ   •   E[X]=np   •   Var(X)=np(1−p)",
    ml: "A/B test conversion counts, click-through counts and any 'how many of n independent binary events happened' question is modelled with the binomial distribution before deciding statistical significance.",
    check: { q: "Binomial(n, p) requires which condition on the trials?", options: ["They must be dependent", "They must be independent with the same success probability", "n must equal p"], answer: 1, why: "Each trial must be an independent yes/no event sharing one fixed success probability p." },
  },
  {
    id: "poisson", number: "3.3", title: "The Poisson distribution: counting rare events over time", short: "Poisson", icon: Hash,
    meaning: "The Poisson distribution models the count of events that happen independently at a constant average rate λ over a fixed interval — useful when n is huge and p is tiny (many opportunities, rare individual chance).",
    example: "A website receives on average λ=4 server errors per hour. The actual number of errors in any given hour follows Poisson(λ=4); it could be 0, 2, 4, 7… each with a computable probability.",
    formula: "P(X=k) = λᵏe⁻λ / k!   •   E[X]=λ   •   Var(X)=λ",
    ml: "Queueing systems, server-error monitoring, and rare-event anomaly detection often model event counts per interval with a Poisson distribution to set alerting thresholds.",
    check: { q: "In the Poisson distribution, what is true about mean and variance?", options: ["They are always different", "They are both equal to λ", "Variance is always zero"], answer: 1, why: "A defining property of Poisson(λ) is that its mean and its variance are the same number, λ." },
  },
  {
    id: "normal", number: "3.4", title: "The normal distribution and z-scores", short: "Normal & z-scores", icon: Activity,
    meaning: "The normal (Gaussian) distribution is a symmetric bell curve fully described by its mean μ and standard deviation σ. A z-score rescales any value to 'how many standard deviations from the mean', letting you compare different normal distributions on one universal scale.",
    example: "Exam scores are Normal(μ=70, σ=10). A score of 85 has z=(85−70)/10=1.5 — one and a half standard deviations above average, which by the empirical rule is a fairly high score.",
    formula: "z = (x−μ)/σ   •   Empirical rule: ~68% within ±1σ, ~95% within ±2σ, ~99.7% within ±3σ",
    ml: "Z-score standardisation is a standard preprocessing step before training many models, and the normal distribution underlies confidence intervals, hypothesis tests and residual-error assumptions.",
    check: { q: "A z-score of 2 means a value is…", options: ["2 units above the mean", "2 standard deviations above the mean", "Always the maximum possible value"], answer: 1, why: "A z-score measures distance from the mean in units of standard deviation, not raw units." },
  },
  {
    id: "clt", number: "3.5", title: "The Central Limit Theorem: order from chaos", short: "Central Limit Theorem", icon: TrendingUp,
    meaning: "The Central Limit Theorem says that if you repeatedly take random samples of size n and compute their means, the distribution of those sample means becomes approximately normal as n grows — even when the original data is heavily skewed.",
    example: "Individual wait times at a shop are heavily right-skewed (many short waits, a few very long ones). But the average wait time across 30 randomly sampled customers, repeated many times, forms a distribution that looks close to a bell curve.",
    formula: "As n grows: mean of sample means → μ   •   SD of sample means (standard error) = σ/√n",
    ml: "The CLT is why so many statistical tests (t-tests, confidence intervals, A/B testing) can assume approximate normality for averages and sums, even when raw per-observation data is skewed.",
    check: { q: "As sample size n increases, the spread of the sampling distribution of the mean…", options: ["Stays exactly the same", "Shrinks, following σ/√n", "Always grows"], answer: 1, why: "The standard error σ/√n shrinks as n grows, so sample means cluster more tightly around the true mean." },
  },
  {
    id: "lln", number: "3.6", title: "The Law of Large Numbers: simulation converges to truth", short: "Law of Large Numbers", icon: Repeat,
    meaning: "The Law of Large Numbers says that as you repeat a random experiment more and more times, the observed average (or proportion) converges to the true theoretical expectation.",
    example: "A fair coin's true P(heads)=0.5. After 5 flips you might see 80% heads by chance, but after 5,000 flips the running proportion settles very close to 0.5.",
    formula: "As number of trials n → ∞: sample average → E[X]   (this is exactly why simulation-based estimates become trustworthy with enough trials)",
    ml: "Monte Carlo methods, bootstrap confidence intervals and reinforcement-learning value estimates all lean on the Law of Large Numbers: enough repeated random trials converge to a stable, trustworthy estimate.",
    check: { q: "Why can early results in a simulation be misleading?", options: ["Randomness disappears after many trials", "With few trials, chance fluctuations dominate before the average has time to converge", "The Law of Large Numbers is only theoretical"], answer: 1, why: "Small samples are noisy; the theorem specifically describes what happens as the number of trials grows large." },
  },
];

const missions: Record<string, string[]> = {
  "discrete-continuous": ["Select a single binomial bar and read its exact probability.", "Shade a zero-width interval on the normal curve and confirm the area is 0.", "Shade a wide interval on the normal curve and read the resulting probability."],
  binomial: ["Set n=10, p=0.5 and find the most likely outcome.", "Raise p toward 1 and watch the bars shift right.", "Compare E[X]=np against the tallest bar's position."],
  poisson: ["Set λ=1 and note how often 0 events occur.", "Raise λ to 15 and watch the shape become more symmetric.", "Confirm the mean and variance are equal at your chosen λ."],
  normal: ["Find the z-score of a value one SD above the mean.", "Use presets to verify the 68-95-99.7 empirical rule.", "Shade an interval with the same probability as a binomial bar from an earlier lab."],
  clt: ["Draw sample means with n=1 and note the skewed shape.", "Increase n to 30 and draw again — describe the change.", "Compare the spread of the histogram at n=2 vs n=30."],
  lln: ["Flip 10 times and note the running proportion.", "Flip up to 2,000 total and watch convergence.", "Set a biased coin (p=0.8) and confirm convergence toward 0.8, not 0.5."],
};

const pythonByChapter: Record<string, { code: string; output: string }> = {
  "discrete-continuous": { code: "from math import comb\nn, p, k = 10, 0.5, 5\nprint(comb(n, k) * p**k * (1-p)**(n-k))  # exact P(X=5), discrete\n# a continuous variable has no single-point probability to compute", output: "0.24609375" },
  binomial: { code: "from math import comb\nn, p = 10, 0.7\npmf = [comb(n, k) * p**k * (1-p)**(n-k) for k in range(n+1)]\nprint([round(v, 3) for v in pmf])\nprint(sum(k*pmf[k] for k in range(n+1)))  # E[X]", output: "[0.0, 0.0, 0.001, 0.009, 0.037, 0.103, 0.2, 0.267, 0.233, 0.121, 0.028]\n7.0" },
  poisson: { code: "import math\nlam = 4\npmf = [lam**k * math.exp(-lam) / math.factorial(k) for k in range(10)]\nprint([round(v, 3) for v in pmf])", output: "[0.018, 0.073, 0.147, 0.195, 0.195, 0.156, 0.104, 0.06, 0.03, 0.013]" },
  normal: { code: "from statistics import NormalDist\nd = NormalDist(mu=70, sigma=10)\nz = (85 - 70) / 10\nprint(z, d.cdf(85) - d.cdf(55))  # z-score, P(55<X<85)", output: "1.5 0.8663856349132732" },
  clt: { code: "import numpy as np\nrng = np.random.default_rng(0)\nskewed = rng.exponential(scale=1.0, size=(2000, 30))  # 2000 samples of size 30\nsample_means = skewed.mean(axis=1)\nprint(sample_means.mean(), sample_means.std())  # close to 1.0 and 1/sqrt(30)", output: "approximately 1.0 and 0.183" },
  lln: { code: "import numpy as np\nrng = np.random.default_rng(0)\nflips = rng.random(5000) < 0.5\nrunning = np.cumsum(flips) / np.arange(1, 5001)\nprint(running[9], running[-1])  # early vs long-run proportion", output: "an early value that can be far from 0.5, and a final value very close to 0.5" },
};

function DistributionShapeLab() {
  const [mode, setMode] = useState<"discrete" | "continuous">("discrete");
  const { k, pmf } = useMemo(() => binomialPMF(10, 0.5), []);
  const [selectedK, setSelectedK] = useState<number | null>(5);
  const [lo, setLo] = useState(-1), [hi, setHi] = useState(1);
  const maxPmf = Math.max(...pmf);
  const px = (x: number) => 40 + (x + 4) * 42, py = (d: number) => 210 - (d / 0.42) * 180;
  const xs = Array.from({ length: 161 }, (_, i) => -4 + i * 0.05);
  const area = normalCDF(hi) - normalCDF(lo);
  return <LabShell title="Countable bars vs a continuous curve" goal="Toggle between a discrete bar chart (exact point probabilities) and a continuous curve (probability only over an interval).">
    <div className="u1-presets"><button className={mode === "discrete" ? "active" : ""} onClick={() => setMode("discrete")}>Discrete: Binomial(10, 0.5)</button><button className={mode === "continuous" ? "active" : ""} onClick={() => setMode("continuous")}>Continuous: Standard normal</button></div>
    {mode === "discrete" ? <div className="u1-lab-grid"><div className="u1-controls"><div className="u1-stats"><Stat label={selectedK !== null ? `P(X = ${selectedK})` : "Click a bar"} value={selectedK !== null ? f(pmf[selectedK], 4) : "—"} good /></div></div>
      <div className="u1-visual"><svg viewBox="0 0 420 230" width="100%" height="230"><line x1="30" y1="210" x2="400" y2="210" className="axis" />{k.map(ki => <g key={ki}><rect x={40 + ki * 34} y={210 - (pmf[ki] / maxPmf) * 180} width="26" height={(pmf[ki] / maxPmf) * 180} className="bar" opacity={selectedK === ki ? 1 : 0.45} onClick={() => setSelectedK(ki)} style={{ cursor: "pointer" }} /><text x={40 + ki * 34 + 13} y="222" textAnchor="middle" fontSize="9" fill="#7a8496">{ki}</text></g>)}</svg></div></div>
      : <div className="u1-lab-grid"><div className="u1-controls"><MiniRange label="interval start" value={lo} min={-4} max={4} step={0.1} onChange={v => setLo(Math.min(v, hi))} /><MiniRange label="interval end" value={hi} min={-4} max={4} step={0.1} onChange={v => setHi(Math.max(v, lo))} /><div className="u1-stats"><Stat label={`P(${f(lo, 1)} < Z < ${f(hi, 1)})`} value={f(area, 4)} good /></div></div>
        <div className="u1-visual"><svg viewBox="0 0 420 230" width="100%" height="230"><line x1="30" y1="210" x2="400" y2="210" className="axis" /><polygon points={`${px(lo)},210 ` + xs.filter(x => x >= lo && x <= hi).map(x => `${px(x)},${py(normalPDF(x, 0, 1))}`).join(" ") + ` ${px(hi)},210`} fill="#6d4aff33" stroke="none" /><polyline points={xs.map(x => `${px(x)},${py(normalPDF(x, 0, 1))}`).join(" ")} fill="none" stroke="#6d4aff" strokeWidth="2.5" /></svg></div></div>}
    <div className="u1-observation"><Eye /><p><b>Observe:</b> {mode === "discrete" ? "each bar is a real probability you can read directly; the bars for all k sum to exactly 1." : `the shaded area is the probability — narrow the interval toward zero width and the area (and probability) shrinks toward 0, even though the curve's height stays positive.`}</p></div>
  </LabShell>;
}

function BinomialLab() {
  const [n, setN] = useState(10), [p, setP] = useState(0.5), [selectedK, setSelectedK] = useState<number | null>(null);
  const { k, pmf } = useMemo(() => binomialPMF(n, p), [n, p]);
  const meanX = n * p, varX = n * p * (1 - p), maxPmf = Math.max(...pmf);
  const cdf = selectedK !== null ? pmf.slice(0, selectedK + 1).reduce((a, b) => a + b, 0) : null;
  const barW = Math.max(8, Math.min(34, 380 / (n + 1)));
  return <LabShell title="Count successes across independent trials" goal="Change n and p, then click a bar to read its exact probability and cumulative probability.">
    <div className="u1-lab-grid"><div className="u1-controls">
      <MiniRange label="number of trials n" value={n} min={1} max={30} step={1} onChange={v => { setN(v); setSelectedK(null); }} />
      <MiniRange label="success probability p" value={p} min={0.01} max={0.99} step={0.01} onChange={v => { setP(v); setSelectedK(null); }} />
      <div className="u1-stats"><Stat label="E[X] = np" value={f(meanX)} /><Stat label="Var(X) = np(1−p)" value={f(varX)} />{selectedK !== null && <><Stat label={`P(X = ${selectedK})`} value={f(pmf[selectedK], 4)} good /><Stat label={`P(X ≤ ${selectedK})`} value={f(cdf!, 4)} /></>}</div>
    </div>
      <div className="u1-visual"><svg viewBox="0 0 420 230" width="100%" height="230"><line x1="30" y1="210" x2="400" y2="210" className="axis" />{k.map(ki => <rect key={ki} x={38 + ki * barW} y={210 - (pmf[ki] / maxPmf) * 180} width={barW - 3} height={(pmf[ki] / maxPmf) * 180} className="bar" opacity={selectedK === ki ? 1 : 0.5} onClick={() => setSelectedK(ki)} style={{ cursor: "pointer" }} />)}</svg></div></div>
    <div className="u1-observation"><Dices /><p><b>Shape:</b> the distribution peaks near E[X]={f(meanX, 1)} and becomes more symmetric as n grows, whatever p is set to.</p></div>
  </LabShell>;
}

function PoissonLab() {
  const [lambda, setLambda] = useState(4), [selectedK, setSelectedK] = useState<number | null>(null);
  const kMax = Math.min(30, Math.max(10, Math.ceil(lambda + 4 * Math.sqrt(lambda))));
  const { k, pmf } = useMemo(() => poissonPMF(lambda, kMax), [lambda, kMax]);
  const maxPmf = Math.max(...pmf), barW = Math.max(6, Math.min(30, 380 / (kMax + 1)));
  return <LabShell title="Count rare independent events over an interval" goal="Raise λ (the average rate) and watch the whole shape shift and widen.">
    <div className="u1-lab-grid"><div className="u1-controls">
      <MiniRange label="rate λ (events per interval)" value={lambda} min={0.2} max={20} step={0.2} onChange={v => { setLambda(v); setSelectedK(null); }} />
      <div className="u1-stats"><Stat label="E[X] = λ" value={f(lambda)} /><Stat label="Var(X) = λ" value={f(lambda)} />{selectedK !== null && <Stat label={`P(X = ${selectedK})`} value={f(pmf[selectedK], 4)} good />}</div>
    </div>
      <div className="u1-visual"><svg viewBox="0 0 420 230" width="100%" height="230"><line x1="30" y1="210" x2="400" y2="210" className="axis" />{k.map(ki => <rect key={ki} x={38 + ki * barW} y={210 - (pmf[ki] / maxPmf) * 180} width={barW - 2} height={(pmf[ki] / maxPmf) * 180} className="bar" opacity={selectedK === ki ? 1 : 0.5} onClick={() => setSelectedK(ki)} style={{ cursor: "pointer" }} />)}</svg></div></div>
    <div className="u1-observation"><Hash /><p><b>Mean = variance:</b> both equal λ={f(lambda)} — a signature property that distinguishes Poisson from most other distributions.</p></div>
  </LabShell>;
}

function NormalCurveLab() {
  const [mu, setMu] = useState(70), [sigma, setSigma] = useState(10), [x, setX] = useState(85);
  const z = sigma ? (x - mu) / sigma : 0;
  const px = (v: number) => 40 + ((v - (mu - 4 * sigma)) / (8 * sigma)) * 360, py = (d: number, maxD: number) => 210 - (d / maxD) * 180;
  const xs = Array.from({ length: 161 }, (_, i) => mu - 4 * sigma + i * (8 * sigma / 160));
  const maxD = normalPDF(mu, mu, sigma);
  const preset = (kSD: number) => { const area = normalCDF(kSD) - normalCDF(-kSD); return area; };
  return <LabShell title="Standardise any value with a z-score" goal="Move μ, σ and a target value x. The z-score tells you how many standard deviations x sits from the mean.">
    <div className="u1-lab-grid"><div className="u1-controls">
      <MiniRange label="mean μ" value={mu} min={0} max={100} step={1} onChange={setMu} />
      <MiniRange label="standard deviation σ" value={sigma} min={1} max={25} step={0.5} onChange={setSigma} />
      <MiniRange label="value x" value={x} min={mu - 4 * sigma} max={mu + 4 * sigma} step={0.5} onChange={setX} />
      <div className="u1-equation-stack"><span>z = (x−μ)/σ = ({f(x)}−{f(mu)})/{f(sigma)} = <b>{f(z)}</b></span></div>
      <div className="u1-stats"><Stat label="Within ±1σ" value={`${f(preset(1) * 100, 1)}%`} note="empirical rule ≈68%" /><Stat label="Within ±2σ" value={`${f(preset(2) * 100, 1)}%`} note="empirical rule ≈95%" /><Stat label="Within ±3σ" value={`${f(preset(3) * 100, 1)}%`} note="empirical rule ≈99.7%" /></div>
    </div>
      <div className="u1-visual"><svg viewBox="0 0 420 230" width="100%" height="230"><line x1="30" y1="210" x2="400" y2="210" className="axis" /><polyline points={xs.map(v => `${px(v)},${py(normalPDF(v, mu, sigma), maxD)}`).join(" ")} fill="none" stroke="#6d4aff" strokeWidth="2.5" /><line x1={px(x)} y1="20" x2={px(x)} y2="210" stroke="#ec5d67" strokeWidth="2" strokeDasharray="5" /><text x={px(x)} y="16" textAnchor="middle" fontSize="10" fill="#ec5d67">x={f(x)}</text></svg></div></div>
    <div className="u1-observation"><Activity /><p><b>Reading z:</b> {Math.abs(z) < 1 ? "this value sits within one standard deviation of the mean — unremarkable." : Math.abs(z) < 2 ? "this value is moderately far from the mean (between 1 and 2 SDs)." : "this value is quite unusual — more than 2 standard deviations from the mean."}</p></div>
  </LabShell>;
}

function CLTLab() {
  const [n, setN] = useState(1), [draws, setDraws] = useState<number[]>([]);
  const rng = useMemo(() => makeRng(7), []);
  const drawMeans = (count: number) => {
    const next: number[] = [];
    for (let d = 0; d < count; d++) { let s = 0; for (let i = 0; i < n; i++) s += -Math.log(1 - rng()); next.push(s / n); }
    setDraws(v => [...v, ...next].slice(-2000));
  };
  const reset = () => setDraws([]);
  const meanOfMeans = draws.length ? draws.reduce((a, b) => a + b, 0) / draws.length : 0;
  const sdOfMeans = draws.length ? Math.sqrt(draws.reduce((a, b) => a + (b - meanOfMeans) ** 2, 0) / draws.length) : 0;
  const maxVal = 5, bins = 24, counts = new Array(bins).fill(0);
  draws.forEach(v => { const bi = Math.min(bins - 1, Math.max(0, Math.floor((v / maxVal) * bins))); counts[bi]++; });
  const maxCount = Math.max(1, ...counts);
  return <LabShell title="Watch averages become bell-shaped" goal="The source distribution (exponential — many small values, a few large ones) is heavily skewed. Draw sample means and watch their own distribution change shape.">
    <div className="u1-presets"><button onClick={() => setN(1)} className={n === 1 ? "active" : ""}>n=1</button><button onClick={() => setN(2)} className={n === 2 ? "active" : ""}>n=2</button><button onClick={() => setN(5)} className={n === 5 ? "active" : ""}>n=5</button><button onClick={() => setN(30)} className={n === 30 ? "active" : ""}>n=30</button></div>
    <div className="u1-lab-grid"><div className="u1-controls">
      <button className="u1-preset" onClick={() => drawMeans(500)}><Play />Draw 500 sample means</button>
      <button className="u1-preset" onClick={reset}><RotateCcw />Reset</button>
      <div className="u1-stats"><Stat label="Sample means drawn" value={`${draws.length}`} /><Stat label="Mean of sample means" value={f(meanOfMeans)} note="true mean = 1.0" /><Stat label="SD of sample means" value={f(sdOfMeans)} note={`theory ≈ ${f(1 / Math.sqrt(n))}`} /></div>
    </div>
      <div className="u1-visual"><svg viewBox="0 0 420 230" width="100%" height="230"><line x1="30" y1="210" x2="400" y2="210" className="axis" />{counts.map((c, i) => <rect key={i} x={38 + i * 15} y={210 - (c / maxCount) * 180} width="12" height={(c / maxCount) * 180} className="bar" />)}</svg></div></div>
    <div className="u1-observation"><TrendingUp /><p><b>{n === 1 ? "At n=1:" : "At n=" + n + ":"}</b> {n === 1 ? "the sampling distribution just is the original skewed distribution — no averaging has happened yet." : "averaging " + n + " skewed values already looks noticeably more symmetric and narrower than the raw data."}</p></div>
  </LabShell>;
}

function LLNLab() {
  const [p, setP] = useState(0.5), [history, setHistory] = useState<number[]>([]);
  const rng = useMemo(() => makeRng(3), []);
  const flip = (count: number) => { setHistory(v => { const out = [...v]; let heads = out.length ? Math.round(out[out.length - 1] * out.length) : 0; for (let i = 0; i < count; i++) { const n = out.length + 1; if (rng() < p) heads++; out.push(heads / n); } return out.slice(-3000); }); };
  const reset = () => setHistory([]);
  const current = history.length ? history[history.length - 1] : 0;
  const sampled = history.filter((_, i) => i % Math.max(1, Math.ceil(history.length / 200)) === 0);
  const px = (i: number) => 40 + (i / Math.max(1, sampled.length - 1)) * 350, py = (v: number) => 210 - v * 180;
  return <LabShell title="Watch a running average converge to the truth" goal="Flip a coin many times and track the running proportion of heads. Early runs are noisy; long runs settle near the true probability.">
    <div className="u1-lab-grid"><div className="u1-controls">
      <MiniRange label="true P(heads)" value={p} min={0.05} max={0.95} step={0.05} onChange={v => { setP(v); reset(); }} />
      <button className="u1-preset" onClick={() => flip(10)}><Play />Flip 10</button>
      <button className="u1-preset" onClick={() => flip(500)}><Play />Flip 500</button>
      <button className="u1-preset" onClick={reset}><RotateCcw />Reset</button>
      <div className="u1-stats"><Stat label="Total flips" value={`${history.length}`} /><Stat label="Running proportion of heads" value={f(current, 4)} good={Math.abs(current - p) < 0.03} /><Stat label="True probability" value={f(p)} /></div>
    </div>
      <div className="u1-visual"><svg viewBox="0 0 420 230" width="100%" height="230"><line x1="30" y1={py(p)} x2="400" y2={py(p)} stroke="#0e9f6e" strokeWidth="1.5" strokeDasharray="4" /><line x1="30" y1="210" x2="400" y2="210" className="axis" /><polyline points={sampled.map((v, i) => `${px(i)},${py(v)}`).join(" ")} fill="none" stroke="#6d4aff" strokeWidth="2" /></svg></div></div>
    <div className="u1-observation"><Repeat /><p><b>Convergence:</b> {history.length < 50 ? "with only a few flips, the running proportion can wander far from the true value by chance." : "with many flips, the green line (truth) and the purple running average are now close together."}</p></div>
  </LabShell>;
}

function ChapterLab({ id }: { id: string }) {
  if (id === "discrete-continuous") return <DistributionShapeLab />;
  if (id === "binomial") return <BinomialLab />;
  if (id === "poisson") return <PoissonLab />;
  if (id === "normal") return <NormalCurveLab />;
  if (id === "clt") return <CLTLab />;
  return <LLNLab />;
}

const misconceptions = [
  { s: "A continuous random variable assigns a positive probability to every exact value.", truth: false, why: "Any single exact point has zero width and therefore zero probability; only intervals have positive probability." },
  { s: "The binomial distribution requires each trial to have the same success probability.", truth: true, why: "That is one of its defining assumptions, along with independence and a fixed number of trials." },
  { s: "In a Poisson distribution, the mean and variance are always equal.", truth: true, why: "This is a defining property: both equal λ." },
  { s: "A z-score tells you the raw distance from the mean in the original units.", truth: false, why: "A z-score is distance measured in standard deviations, not in the original units." },
  { s: "The Central Limit Theorem requires the original data to already be normally distributed.", truth: false, why: "The theorem's power is that it works even when the original data is skewed — the sample means still trend toward normal as n grows." },
  { s: "A larger sample size always narrows the sampling distribution of the mean.", truth: true, why: "The standard error σ/√n shrinks as n grows, so sample means cluster more tightly." },
  { s: "The Law of Large Numbers guarantees any single small sample will match the true probability.", truth: false, why: "It describes what happens as the number of trials grows large — small samples can still show large chance deviations." },
  { s: "Simulation-based estimates become more trustworthy with more trials.", truth: true, why: "This is exactly the practical consequence of the Law of Large Numbers." },
];

const quiz = [
  { q: "Which is an example of a discrete random variable?", o: ["Exact height in cm", "Number of heads in 10 coin flips", "Exact temperature"], a: 1 },
  { q: "For a continuous variable, probability is computed as…", o: ["A single bar height", "Area under the curve over an interval", "Always exactly 1"], a: 1 },
  { q: "Binomial(n,p) models…", o: ["The count of successes across n independent trials", "A single continuous measurement", "The rate of rare events over time"], a: 0 },
  { q: "The Poisson distribution is most appropriate when…", o: ["Trials are dependent", "Events are rare and occur independently at a constant average rate", "p is close to 0.5 and n is small"], a: 1 },
  { q: "A z-score of −1.5 means a value is…", o: ["1.5 standard deviations below the mean", "1.5 units below zero", "The minimum possible value"], a: 0 },
  { q: "By the empirical rule, roughly what % of a normal distribution lies within ±2σ?", o: ["68%", "95%", "50%"], a: 1 },
  { q: "The Central Limit Theorem describes the behaviour of…", o: ["Individual raw observations", "The distribution of sample means as n grows", "Only normal source data"], a: 1 },
  { q: "As sample size n grows, the standard error of the mean…", o: ["Grows without bound", "Shrinks, proportional to 1/√n", "Stays constant"], a: 1 },
  { q: "The Law of Large Numbers is the reason…", o: ["Small samples are always accurate", "Simulation estimates improve with more trials", "Probabilities can exceed 1"], a: 1 },
  { q: "Mean equals variance is a signature property of…", o: ["The normal distribution", "The Poisson distribution", "The binomial distribution"], a: 1 },
];

export default function Unit3Studio() {
  return <StudioShell
    unitKey="unit3"
    eyebrow="UNIT 3 · COMPLETE LEARNING STUDIO"
    heading={<>Distributions and simulation you can <em>run and watch converge</em></>}
    description="From counting discrete outcomes to the bell curve, and from one simulated trial to thousands — six connected topics building toward why averages behave predictably even when raw data doesn't."
    objectives={["Tell discrete and continuous variables apart", "Model counts with Binomial and Poisson", "Standardise values with z-scores", "Explain why averages become normal and stable"]}
    chapters={chapters}
    missions={missions}
    pythonByChapter={pythonByChapter}
    renderLab={id => <ChapterLab id={id} />}
    summarySentence="Discrete variables count outcomes, continuous variables use area under a curve → Binomial and Poisson model specific counting situations → the normal distribution and z-scores give a universal comparison scale → the Central Limit Theorem explains why sample means trend normal → the Law of Large Numbers is why more simulated trials converge to the truth."
    misconceptions={misconceptions}
    quiz={quiz}
    quizTitle="Can you connect the whole unit?"
    quizSubtitle="Ten questions test meaning — not memorised notation."
  />;
}
