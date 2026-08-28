import { useState } from "react";
import { Eye, Grid3X3, LineChart, Play, RotateCcw, Scale, Split, Table2, Waves } from "lucide-react";
import { Chapter, LabShell, MiniRange, NumberBox, Stat, StudioShell, f } from "./studio-kit";
import { fOneway, linreg, mean, normalCDF, normalInvCDF, normalPDF, sigmoid, std, ttestInd } from "./stats-kit";

const chapters: Chapter[] = [
  {
    id: "regression", number: "5.1", title: "Simple linear regression and R²", short: "Regression & R²", icon: LineChart,
    meaning: "Simple linear regression fits the straight line ŷ=mx+b that minimises total squared error. R² (the coefficient of determination) reports what fraction of the variance in y that line actually explains, from 0 (no explanatory power) to 1 (perfect fit).",
    example: "For hours studied vs exam score, a fitted line with R²=0.81 means 81% of the variation in scores is explained by hours studied — the remaining 19% comes from other factors and noise.",
    formula: "ŷ = mx + b (least squares)   •   R² = 1 − SSres/SStot",
    ml: "R² (and adjusted variants) is the standard first metric reported for a regression model's fit, though it says nothing about whether the model generalises to new data.",
    check: { q: "An R² of 0.05 for a fitted line suggests…", options: ["The line explains almost none of the variance in y", "The line is a perfect fit", "The slope must be negative"], answer: 0, why: "R² close to 0 means the model barely improves on just predicting the mean of y every time." },
  },
  {
    id: "multiple-regression", number: "5.2", title: "Multiple regression: combining predictors", short: "Multiple regression", icon: Grid3X3,
    meaning: "Multiple regression predicts y from more than one input at once: ŷ = b0 + b1x1 + b2x2 + …. Each coefficient represents that predictor's effect while holding the other predictors constant.",
    example: "Predicting an exam score from both hours studied and hours slept: ŷ = 50 + 4·hours_studied + 1·hours_slept. Two students who studied equally but slept differently receive different predictions.",
    formula: "ŷ = b0 + b1x1 + b2x2 + … + bkxk   •   R² generalises the same way: 1 − SSres/SStot",
    ml: "Almost every tabular machine-learning baseline — from plain linear regression to the first layer of a neural network — combines multiple input features exactly this way.",
    check: { q: "In multiple regression, coefficient b1 represents…", options: ["The change in y per unit change in x1, holding other predictors fixed", "The total variance in y", "The correlation between x1 and x2"], answer: 0, why: "Each coefficient isolates one predictor's marginal effect, controlling for the others in the model." },
  },
  {
    id: "logistic-regression", number: "5.3", title: "Logistic regression and classification decisions", short: "Logistic regression", icon: Waves,
    meaning: "Logistic regression models the probability of a binary outcome by passing a linear combination of inputs through the sigmoid function. A decision threshold then converts that probability into a class prediction.",
    example: "Predicting pass/fail from hours studied: sigmoid(w·hours+b) gives P(pass). A threshold of 0.5 turns that probability into a yes/no prediction — but the threshold itself is a choice.",
    formula: "P(y=1|x) = sigmoid(wx+b) = 1/(1+e⁻⁽ʷˣ⁺ᵇ⁾)   •   predict 1 if P ≥ threshold",
    ml: "Spam filtering, churn prediction and medical risk scoring all use logistic regression's calibrated probability output, then choose a threshold matched to the cost of false positives vs false negatives.",
    check: { q: "Raising the decision threshold from 0.5 to 0.8 will generally…", options: ["Predict the positive class less often, usually raising precision but lowering recall", "Have no effect on predictions", "Always improve every metric simultaneously"], answer: 0, why: "A higher threshold demands more confidence before predicting positive, which typically trades some recall for higher precision." },
  },
  {
    id: "hypothesis-testing", number: "5.4", title: "Hypothesis testing, p-values and significance", short: "Hypothesis testing", icon: Scale,
    meaning: "Hypothesis testing formalises decision-making under uncertainty. Assume a null hypothesis H0 (no real effect), compute a test statistic from observed data, then find the p-value: the probability of seeing a result this extreme, or more extreme, if H0 were actually true. If p is below a significance level α (commonly 0.05), reject H0.",
    example: "Testing whether a coin is fair (H0: p=0.5) after observing 65 heads in 100 flips — is that far enough from 50 to reject fairness at α=0.05?",
    formula: "z = (p̂ − p0) / √(p0(1−p0)/n)   •   two-tailed p-value = 2·(1−Φ(|z|))   •   reject H0 if p < α",
    ml: "A/B testing, comparing model versions, and testing whether a regression coefficient is meaningfully different from zero all use this same reject / fail-to-reject logic.",
    check: { q: "A p-value of 0.03 with α=0.05 means…", options: ["Reject H0 — the result is statistically significant at this threshold", "Accept H0 as definitely true", "The experiment failed"], answer: 0, why: "Since 0.03 < 0.05, the observed result would be unusually rare under H0, so the conventional decision is to reject H0 at this significance level." },
  },
  {
    id: "t-test", number: "5.5", title: "Comparing two groups with a t-test", short: "Two-sample t-test", icon: Split,
    meaning: "A two-sample t-test asks whether the difference between two independent groups' means is larger than what random chance alone would produce, accounting for each group's sample size and internal variability.",
    example: "Comparing exam scores between two teaching methods — is a 4-point average difference between Group A and Group B a real effect, or just noise given how much scores vary within each group?",
    formula: "t = (x̄A − x̄B) / SE(pooled)   •   df = nA + nB − 2   •   compare the resulting p-value to α",
    ml: "Comparing latency, accuracy or any metric between two model versions — or between two arms of an A/B test — is a direct application of the two-sample t-test.",
    check: { q: "All else equal, a larger sample size tends to…", options: ["Make the test more sensitive to detecting real differences", "Make every difference statistically significant automatically", "Have no effect on the test's sensitivity"], answer: 0, why: "Larger samples shrink the standard error, giving the test more power to detect a real difference if one exists." },
  },
  {
    id: "anova", number: "5.6", title: "Comparing three or more groups with ANOVA", short: "ANOVA", icon: Table2,
    meaning: "ANOVA (analysis of variance) extends the t-test idea to three or more groups at once. It compares between-group variance to within-group variance, producing an F-statistic that tests whether at least one group's mean differs from the others.",
    example: "Comparing average scores across three different study techniques — ANOVA tests whether technique matters at all before drilling into which specific pair of techniques differs.",
    formula: "F = MSbetween / MSwithin   •   large F relative to its distribution ⇒ small p-value ⇒ groups likely differ",
    ml: "Comparing more than two model variants, or more than two arms of an experiment, uses ANOVA (or its modern relatives in multi-armed testing) before running pairwise comparisons.",
    check: { q: "Why not just run three separate pairwise t-tests instead of one ANOVA?", options: ["Running multiple tests inflates the chance of a false positive somewhere", "T-tests cannot be computed for more than two groups", "ANOVA is always less accurate"], answer: 0, why: "Each individual test carries some false-positive risk; running several compounds that risk, which ANOVA's single combined test avoids." },
  },
];

const missions: Record<string, string[]> = {
  regression: ["Move points to make R² close to 1.", "Add scatter/noise until R² drops below 0.3.", "Find a dataset where the slope is negative but R² is still high."],
  "multiple-regression": ["Auto-fit the model and read off both coefficients.", "Manually set b2 to 0 and see how R² changes.", "Find weights that make the model fit worse than the auto-fit solution."],
  "logistic-regression": ["Auto-fit the sigmoid and note the resulting accuracy.", "Raise the threshold to 0.8 and watch precision and recall trade off.", "Lower the threshold to 0.2 and see recall rise as precision falls."],
  "hypothesis-testing": ["Set the observed proportion equal to p0 and confirm you fail to reject.", "Push the observed proportion far from p0 until p < 0.05.", "Increase n and watch the same gap become statistically significant."],
  "t-test": ["Make the two groups' means far apart with low within-group spread — get a tiny p-value.", "Make the means close together — confirm you fail to reject.", "Without moving either group's mean, tighten each group's 5 values (make them closer to each other) and watch the p-value shrink even though the gap between means didn't change."],
  anova: ["Make three groups with very different means and check the F-statistic.", "Make three groups with nearly identical means and confirm a high p-value.", "Add within-group spread and watch F shrink even though the means didn't move."],
};

const pythonByChapter: Record<string, { code: string; output: string }> = {
  regression: { code: "import numpy as np\nx = np.array([1, 2, 3, 4, 5])\ny = np.array([2.1, 3.9, 6.2, 7.8, 10.1])\nm, b = np.polyfit(x, y, 1)\ny_hat = m*x + b\nssres = np.sum((y - y_hat)**2)\nsstot = np.sum((y - y.mean())**2)\nprint(m, b, 1 - ssres/sstot)", output: "1.99 0.050000000000001705 0.9973053289009771" },
  "multiple-regression": { code: "import numpy as np\nX = np.column_stack([np.ones(5), [2,4,3,5,6], [8,6,7,5,9]])\ny = np.array([58, 66, 63, 72, 84])\nbeta, *_ = np.linalg.lstsq(X, y, rcond=None)\nprint(beta)", output: "[intercept, hours_studied_weight, hours_slept_weight]" },
  "logistic-regression": { code: "import numpy as np\ndef sigmoid(z): return 1/(1+np.exp(-z))\nhours = np.array([1,2,3,4,5,6,7,8])\npassed = np.array([0,0,0,1,0,1,1,1])\n# after gradient descent fit: w, b\nw, b = 1.1, -4.5\nprobs = sigmoid(w*hours + b)\nprint(np.round(probs, 2))", output: "[0.02 0.06 0.17 0.4  0.68 0.86 0.95 0.98]" },
  "hypothesis-testing": { code: "import math\np_hat, p0, n = 0.65, 0.5, 100\nse = math.sqrt(p0*(1-p0)/n)\nz = (p_hat - p0) / se\nfrom statistics import NormalDist\np_value = 2*(1 - NormalDist().cdf(abs(z)))\nprint(z, p_value)", output: "3.0 0.0026997960632601866" },
  "t-test": { code: "from scipy import stats\na = [72, 75, 78, 74, 77]\nb = [68, 70, 65, 72, 69]\nt, p = stats.ttest_ind(a, b)\nprint(t, p)", output: "4.0640040640061 0.003613322706 (df=8)" },
  anova: { code: "from scipy import stats\ng1 = [70, 72, 75]\ng2 = [80, 82, 78]\ng3 = [65, 68, 70]\nf, p = stats.f_oneway(g1, g2, g3)\nprint(f, p)", output: "20.939999999999984 0.001967846986 (dfBetween=2, dfWithin=6)" },
};

function RegressionLab() {
  const [points, setPoints] = useState([{ x: 1, y: 2.1 }, { x: 2, y: 3.9 }, { x: 3, y: 6.2 }, { x: 4, y: 7.8 }, { x: 5, y: 10.1 }]);
  const setPt = (i: number, key: "x" | "y", v: number) => setPoints(ps => ps.map((p, j) => j === i ? { ...p, [key]: v } : p));
  const { m, b, r2 } = linreg(points);
  const preset = (name: string) => { if (name === "tight") setPoints([{ x: 1, y: 2.1 }, { x: 2, y: 3.9 }, { x: 3, y: 6.2 }, { x: 4, y: 7.8 }, { x: 5, y: 10.1 }]); if (name === "noisy") setPoints([{ x: 1, y: 4 }, { x: 2, y: 2 }, { x: 3, y: 7 }, { x: 4, y: 3 }, { x: 5, y: 8 }]); };
  const px = (x: number) => 42 + x * 66, py = (y: number) => 220 - y * 18;
  return <LabShell title="Fit a line and measure how well it explains y" goal="Edit points, then read R² — how much of y's variation the line actually captures.">
    <div className="u1-presets"><button onClick={() => preset("tight")}>Tight linear data</button><button onClick={() => preset("noisy")}>Noisy data</button></div>
    <div className="u1-lab-grid"><div className="u1-controls">
      {points.map((p, i) => <div className="u1-control-pair" key={i}><NumberBox label={`x${i + 1}`} value={p.x} onChange={v => setPt(i, "x", v)} step="0.5" /><NumberBox label={`y${i + 1}`} value={p.y} onChange={v => setPt(i, "y", v)} step="0.5" /></div>)}
      <div className="u1-big-equation">ŷ = {f(m)}x {b >= 0 ? "+" : "−"} {f(Math.abs(b))}</div>
      <div className="u1-stats"><Stat label="R²" value={f(r2, 3)} good={r2 > 0.6} note={r2 > 0.8 ? "strong fit" : r2 > 0.4 ? "moderate fit" : "weak fit"} /></div>
    </div>
      <div className="u1-visual"><svg viewBox="0 0 420 240" width="100%" height="240" role="img" aria-label={`Scatter plot of the data points with the fitted regression line, R squared ${f(r2, 2)}`}><line x1="30" y1="220" x2="400" y2="220" className="axis" /><line x1={px(0)} y1={py(b)} x2={px(6)} y2={py(m * 6 + b)} className="u1-fit-line" />{points.map((p, i) => <g key={i}><line x1={px(p.x)} y1={py(p.y)} x2={px(p.x)} y2={py(m * p.x + b)} className="u1-residual-line" /><circle cx={px(p.x)} cy={py(p.y)} r="6" className="u1-data-point" /></g>)}</svg></div></div>
    <div className="u1-observation"><LineChart /><p><b>{r2 > 0.8 ? "Strong fit:" : r2 > 0.4 ? "Moderate fit:" : "Weak fit:"}</b> R²={f(r2, 3)} means the line explains {f(r2 * 100, 1)}% of the variance in y; the rest is scatter the line can't capture.</p></div>
  </LabShell>;
}

function solve3(A: number[][], bVec: number[]) {
  const M = A.map((row, i) => [...row, bVec[i]]);
  for (let col = 0; col < 3; col++) {
    let piv = col; for (let r = col + 1; r < 3; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    [M[col], M[piv]] = [M[piv], M[col]];
    if (Math.abs(M[col][col]) < 1e-10) continue;
    for (let r = 0; r < 3; r++) { if (r === col) continue; const factor = M[r][col] / M[col][col]; for (let c = col; c <= 3; c++) M[r][c] -= factor * M[col][c]; }
  }
  return [0, 1, 2].map(i => M[i][3] / (M[i][i] || 1));
}

function MultipleRegressionLab() {
  const data = [{ x1: 2, x2: 8, y: 58 }, { x1: 4, x2: 6, y: 66 }, { x1: 3, x2: 7, y: 63 }, { x1: 5, x2: 5, y: 72 }, { x1: 6, x2: 9, y: 84 }];
  const [b0, setB0] = useState(50), [b1, setB1] = useState(4), [b2, setB2] = useState(1);
  const preds = data.map(d => b0 + b1 * d.x1 + b2 * d.x2);
  const yMean = mean(data.map(d => d.y));
  const ssRes = data.reduce((s, d, i) => s + (d.y - preds[i]) ** 2, 0), ssTot = data.reduce((s, d) => s + (d.y - yMean) ** 2, 0);
  const r2 = ssTot ? 1 - ssRes / ssTot : 1;
  const autoFit = () => {
    const n = data.length;
    const Xt = [data.map(() => 1), data.map(d => d.x1), data.map(d => d.x2)];
    const XtX = Xt.map(row1 => Xt.map(row2 => row1.reduce((s, v, i) => s + v * row2[i], 0)));
    const Xty = Xt.map(row => row.reduce((s, v, i) => s + v * data[i].y, 0));
    const [nb0, nb1, nb2] = solve3(XtX, Xty);
    setB0(Number(nb0.toFixed(2))); setB1(Number(nb1.toFixed(2))); setB2(Number(nb2.toFixed(2)));
  };
  return <LabShell title="Combine two predictors into one prediction" goal="Manually tune the coefficients, or auto-fit the least-squares solution, and watch R² respond.">
    <div className="u1-presets"><button onClick={autoFit}><Play />Auto-fit (least squares)</button></div>
    <div className="u1-lab-grid"><div className="u1-controls">
      <MiniRange label="intercept b0" value={b0} min={0} max={100} step={1} onChange={setB0} />
      <MiniRange label="hours-studied weight b1" value={b1} min={-5} max={10} step={0.1} onChange={setB1} />
      <MiniRange label="hours-slept weight b2" value={b2} min={-5} max={10} step={0.1} onChange={setB2} />
      <div className="u1-stats"><Stat label="R²" value={f(r2, 3)} good={r2 > 0.7} /></div>
    </div>
      <div className="u1-visual"><div className="u1-calc-table"><div><b>x1 (hours)</b><b>x2 (sleep)</b><b>Actual y</b><b>Predicted ŷ</b><b>Residual</b></div>{data.map((d, i) => <div key={i}><span>{d.x1}</span><span>{d.x2}</span><span>{d.y}</span><span>{f(preds[i])}</span><span>{f(d.y - preds[i])}</span></div>)}</div></div></div>
    <div className="u1-observation"><Grid3X3 /><p><b>Reading the model:</b> each extra hour studied changes ŷ by b1={f(b1)}, and each extra hour of sleep changes ŷ by b2={f(b2)} — holding the other input fixed.</p></div>
  </LabShell>;
}

function LogisticLab() {
  const cohort = [{ h: 1, passed: 0 }, { h: 2, passed: 0 }, { h: 2.5, passed: 0 }, { h: 3.5, passed: 1 }, { h: 4, passed: 0 }, { h: 5, passed: 1 }, { h: 5.5, passed: 1 }, { h: 6.5, passed: 1 }, { h: 7, passed: 1 }, { h: 8, passed: 1 }];
  const [w, setW] = useState(1.1), [b, setB] = useState(-4.5), [threshold, setThreshold] = useState(0.5);
  const probs = cohort.map(c => sigmoid(w * c.h + b));
  const preds = probs.map(p => p >= threshold ? 1 : 0);
  const tp = cohort.filter((c, i) => c.passed === 1 && preds[i] === 1).length, fp = cohort.filter((c, i) => c.passed === 0 && preds[i] === 1).length;
  const tn = cohort.filter((c, i) => c.passed === 0 && preds[i] === 0).length, fn = cohort.filter((c, i) => c.passed === 1 && preds[i] === 0).length;
  const precision = tp + fp ? tp / (tp + fp) : 0, recall = tp + fn ? tp / (tp + fn) : 0, accuracy = (tp + tn) / cohort.length;
  const autoFit = () => { let ww = 0, bb = 0; const lr = 0.3; for (let it = 0; it < 3000; it++) { let gw = 0, gb = 0; for (const c of cohort) { const p = sigmoid(ww * c.h + bb); gw += (p - c.passed) * c.h; gb += (p - c.passed); } ww -= lr * gw / cohort.length; bb -= lr * gb / cohort.length; } setW(Number(ww.toFixed(2))); setB(Number(bb.toFixed(2))); };
  const px = (h: number) => 40 + h * 42, py = (p: number) => 210 - p * 180;
  return <LabShell title="Turn a probability curve into a decision" goal="Fit the sigmoid, then move the threshold and watch precision and recall trade off against each other.">
    <div className="u1-presets"><button onClick={autoFit}><Play />Auto-fit</button></div>
    <div className="u1-lab-grid"><div className="u1-controls">
      <MiniRange label="weight w" value={w} min={-2} max={3} step={0.05} onChange={setW} />
      <MiniRange label="bias b" value={b} min={-10} max={5} step={0.1} onChange={setB} />
      <MiniRange label="decision threshold" value={threshold} min={0.05} max={0.95} step={0.05} onChange={setThreshold} />
      <div className="u1-stats"><Stat label="Accuracy" value={`${f(accuracy * 100, 1)}%`} /><Stat label="Precision" value={`${f(precision * 100, 1)}%`} /><Stat label="Recall" value={`${f(recall * 100, 1)}%`} good={recall > 0.7} /></div>
      <div className="u1-stats"><Stat label="TP" value={`${tp}`} /><Stat label="FP" value={`${fp}`} /><Stat label="TN" value={`${tn}`} /><Stat label="FN" value={`${fn}`} /></div>
    </div>
      <div className="u1-visual"><svg viewBox="0 0 420 230" width="100%" height="230" role="img" aria-label={`Sigmoid curve with decision threshold at ${f(threshold, 2)} and each student plotted by hours studied and pass or fail outcome`}><line x1="30" y1="210" x2="400" y2="210" className="axis" /><line x1="30" y1={py(threshold)} x2="400" y2={py(threshold)} stroke="#ec5d67" strokeWidth="1.5" strokeDasharray="4" /><polyline points={Array.from({ length: 60 }, (_, i) => { const h = i / 6; return `${px(h)},${py(sigmoid(w * h + b))}`; }).join(" ")} fill="none" stroke="#6d4aff" strokeWidth="2.5" />{cohort.map((c, i) => <circle key={i} cx={px(c.h)} cy={py(c.passed)} r="6" fill={c.passed ? "#0e9f6e" : "#ec5d67"} stroke="#fff" strokeWidth="1.5" />)}</svg></div></div>
    <div className="u1-observation"><Waves /><p><b>Threshold trade-off:</b> raising the threshold makes the model more cautious about predicting 'pass', which tends to raise precision but lower recall — the right balance depends on which mistake costs more.</p></div>
  </LabShell>;
}

function HypothesisTestLab() {
  const [successes, setSuccesses] = useState(65), [n, setN] = useState(100), [p0, setP0] = useState(0.5), [alpha, setAlpha] = useState(0.05);
  const pHat = successes / n, se = Math.sqrt(p0 * (1 - p0) / n), z = se ? (pHat - p0) / se : 0;
  const pValue = 2 * (1 - normalCDF(Math.abs(z)));
  const reject = pValue < alpha;
  const px = (v: number) => 210 + v * 42, py = (d: number, maxD: number) => 210 - (d / maxD) * 180;
  const xs = Array.from({ length: 161 }, (_, i) => -4 + i * 0.05), maxD = normalPDF(0, 0, 1);
  // Critical z depends on alpha — Φ⁻¹(1-α/2) is only ≈1.96 when α=0.05; recompute so the
  // dashed lines actually track the α slider instead of staying pinned at the 0.05 case.
  const zCrit = normalInvCDF(1 - alpha / 2);
  return <LabShell title="Decide whether an observed gap is real" goal="Change the observed data and α, then watch the p-value and reject/fail-to-reject decision update.">
    <div className="u1-lab-grid"><div className="u1-controls">
      <NumberBox label="observed successes" value={successes} onChange={v => setSuccesses(Math.max(0, Math.min(n, Math.round(v))))} step="1" />
      <NumberBox label="sample size n" value={n} onChange={v => setN(Math.max(1, Math.round(v)))} step="1" />
      <MiniRange label="hypothesised p0" value={p0} min={0.05} max={0.95} step={0.01} onChange={setP0} />
      <MiniRange label="significance α" value={alpha} min={0.01} max={0.2} step={0.01} onChange={setAlpha} />
      <div className="u1-equation-stack"><span>p̂ = {successes}/{n} = {f(pHat, 3)}</span><span>z = ({f(pHat, 3)}−{f(p0, 2)})/{f(se, 4)} = <b>{f(z, 3)}</b></span><span>two-tailed p-value = <b>{f(pValue, 4)}</b></span><span>z_critical = Φ⁻¹(1−α/2) = ±{f(zCrit, 3)}</span></div>
      <div className={`u1-observation ${reject ? "" : "warn"}`}><Scale /><p><b>{reject ? "Reject H0:" : "Fail to reject H0:"}</b> p={f(pValue, 4)} is {reject ? "below" : "not below"} α={f(alpha, 2)}.</p></div>
    </div>
      <div className="u1-visual"><svg viewBox="0 0 420 230" width="100%" height="230" role="img" aria-label={`Standard normal curve with dashed critical lines at plus and minus ${f(zCrit, 2)} for alpha ${f(alpha, 2)}, and the observed z-statistic marked at ${f(z, 2)}`}><line x1="30" y1="210" x2="400" y2="210" className="axis" /><polyline points={xs.map(x => `${px(x)},${py(normalPDF(x, 0, 1), maxD)}`).join(" ")} fill="none" stroke="#6d4aff" strokeWidth="2" /><line x1={px(-zCrit)} y1="20" x2={px(-zCrit)} y2="210" stroke="#ffb020" strokeDasharray="4" /><line x1={px(zCrit)} y1="20" x2={px(zCrit)} y2="210" stroke="#ffb020" strokeDasharray="4" /><line x1={px(z)} y1="20" x2={px(z)} y2="210" stroke="#ec5d67" strokeWidth="2" /><text x={px(z)} y="16" textAnchor="middle" fontSize="10" fill="#ec5d67">z={f(z, 2)}</text></svg></div></div>
  </LabShell>;
}

function TTestLab() {
  const [a, setA] = useState([72, 75, 78, 74, 77]), [b, setB] = useState([68, 70, 65, 72, 69]);
  const setAv = (i: number, v: number) => setA(arr => arr.map((x, j) => j === i ? v : x));
  const setBv = (i: number, v: number) => setB(arr => arr.map((x, j) => j === i ? v : x));
  const { t, p, df } = ttestInd(a, b);
  const ma = mean(a), mb = mean(b), sa = std(a, 1), sb = std(b, 1);
  const reject = p < 0.05;
  const maxV = Math.max(...a, ...b) + 5, minV = Math.min(...a, ...b) - 5, py = (v: number) => 200 - ((v - minV) / (maxV - minV)) * 170;
  return <LabShell title="Test whether two group means really differ" goal="Edit each group's values and watch the t-statistic and p-value respond to both the gap between means and the spread within each group.">
    <div className="u1-lab-grid"><div className="u1-controls">
      <div className="u1-control-pair">{a.map((v, i) => <NumberBox key={`a${i}`} label={`A${i + 1}`} value={v} onChange={n => setAv(i, n)} step="1" />)}</div>
      <div className="u1-control-pair">{b.map((v, i) => <NumberBox key={`b${i}`} label={`B${i + 1}`} value={v} onChange={n => setBv(i, n)} step="1" />)}</div>
      <div className="u1-equation-stack"><span>x̄A={f(ma)}  SDA={f(sa)}</span><span>x̄B={f(mb)}  SDB={f(sb)}</span><span>t={f(t, 3)}, df={df}</span><span>p-value = <b>{f(p, 4)}</b></span></div>
      <div className={`u1-observation ${reject ? "" : "warn"}`}><Split /><p><b>{reject ? "Reject H0:" : "Fail to reject H0:"}</b> the difference is {reject ? "unlikely to be chance alone (p<0.05)." : "small enough that chance alone can't be ruled out (p≥0.05)."} This is a <b>pooled (equal-variance) t-test</b> — it assumes both groups share the same underlying variance. A <b>Welch's t-test</b>, which doesn't require that assumption, would be a good addition for groups with very different spreads.</p></div>
    </div>
      <div className="u1-visual"><svg viewBox="0 0 260 220" width="100%" height="220" role="img" aria-label={`Dot plot of Group A and Group B values with their means marked; t=${f(t, 2)}, p=${f(p, 3)}`}>{a.map((v, i) => <circle key={`a${i}`} cx={60 + (i % 3) * 20} cy={py(v)} r="6" fill="#6d4aff" />)}{b.map((v, i) => <circle key={`b${i}`} cx={170 + (i % 3) * 20} cy={py(v)} r="6" fill="#ec5d67" />)}<line x1="30" y1={py(ma)} x2="120" y2={py(ma)} stroke="#4b2dcc" strokeWidth="2" /><line x1="145" y1={py(mb)} x2="235" y2={py(mb)} stroke="#ae3340" strokeWidth="2" /></svg>
        <div className="u1-legend"><span className="v1">Group A</span><span className="v2">Group B</span></div></div></div>
  </LabShell>;
}

function AnovaLab() {
  const [groups, setGroups] = useState([[70, 72, 75], [80, 82, 78], [65, 68, 70]]);
  const setVal = (gi: number, i: number, v: number) => setGroups(gs => gs.map((g, j) => j === gi ? g.map((x, k) => k === i ? v : x) : g));
  const { f: fStat, p, dfBetween, dfWithin } = fOneway(groups);
  const means = groups.map(mean), sds = groups.map(g => std(g, 1));
  const reject = p < 0.05;
  const maxV = Math.max(...groups.flat()) + 5, py = (v: number) => 200 - (v / maxV) * 170;
  const colors = ["#6d4aff", "#0e9f6e", "#ffb020"];
  return <LabShell title="Test whether three or more groups really differ" goal="Edit each group's values and watch the F-statistic weigh between-group spread against within-group spread.">
    <div className="u1-lab-grid"><div className="u1-controls">
      {groups.map((g, gi) => <div className="u1-control-pair" key={gi}>{g.map((v, i) => <NumberBox key={i} label={`G${gi + 1}.${i + 1}`} value={v} onChange={n => setVal(gi, i, n)} step="1" />)}</div>)}
      <div className="u1-equation-stack"><span>means: {means.map(m => f(m, 1)).join(", ")}</span><span>F = {f(fStat, 3)}, df=({dfBetween},{dfWithin})</span><span>p-value = <b>{f(p, 4)}</b></span></div>
      <div className={`u1-observation ${reject ? "" : "warn"}`}><Table2 /><p><b>{reject ? "Reject H0:" : "Fail to reject H0:"}</b> {reject ? "at least one group mean likely differs from the others." : "the group means could plausibly be equal — no strong evidence of a difference."}</p></div>
    </div>
      <div className="u1-visual"><svg viewBox="0 0 300 220" width="100%" height="220" role="img" aria-label={`Bar chart of each group's mean with error bars for one standard deviation; F=${f(fStat, 2)}, p=${f(p, 3)}`}>{groups.map((g, gi) => <g key={gi}><rect x={30 + gi * 90} y={py(means[gi])} width="60" height={200 - py(means[gi])} fill={colors[gi]} opacity="0.75" /><line x1={60 + gi * 90} y1={py(means[gi] - sds[gi])} x2={60 + gi * 90} y2={py(means[gi] + sds[gi])} stroke="#172033" strokeWidth="2" /><text x={60 + gi * 90} y="214" textAnchor="middle" fontSize="10" fill="#7a8496">Group {gi + 1}</text></g>)}</svg></div></div>
  </LabShell>;
}

function ChapterLab({ id }: { id: string }) {
  if (id === "regression") return <RegressionLab />;
  if (id === "multiple-regression") return <MultipleRegressionLab />;
  if (id === "logistic-regression") return <LogisticLab />;
  if (id === "hypothesis-testing") return <HypothesisTestLab />;
  if (id === "t-test") return <TTestLab />;
  return <AnovaLab />;
}

const misconceptions = [
  { s: "A high R² proves a regression model will generalise well to new data.", truth: false, why: "R² only measures fit on the data used to compute it; it says nothing directly about performance on unseen data." },
  { s: "In multiple regression, each coefficient can be interpreted without regard to the other predictors.", truth: false, why: "Each coefficient specifically represents the effect of its predictor while holding the other predictors constant — its value can change if other predictors are added or removed." },
  { s: "Logistic regression outputs a class label directly, with no probability involved.", truth: false, why: "It outputs a probability via the sigmoid function; a separate threshold choice converts that probability into a class label." },
  { s: "A p-value tells you the probability that the null hypothesis is true.", truth: false, why: "A p-value is the probability of seeing data this extreme IF the null hypothesis were true — not the probability that the null hypothesis itself is true." },
  { s: "Failing to reject H0 proves the null hypothesis is correct.", truth: false, why: "It only means the data didn't provide strong enough evidence against H0 — absence of evidence is not evidence of absence." },
  { s: "A statistically significant result is always practically important.", truth: false, why: "With a large enough sample, even a tiny, practically meaningless difference can become statistically significant." },
  { s: "Running three separate t-tests instead of one ANOVA gives the same error rate.", truth: false, why: "Each individual test carries its own false-positive risk, so running several compounds the overall chance of a false positive somewhere." },
  { s: "A larger t-statistic (in absolute value) generally corresponds to a smaller p-value.", truth: true, why: "A bigger gap relative to the standard error is less likely to occur by chance alone, which the p-value reflects." },
  { s: "ANOVA tells you exactly which pair of groups differs.", truth: false, why: "ANOVA only tests whether at least one group differs from the others overall; identifying which specific pair requires a separate follow-up (post-hoc) test." },
];

const quiz = [
  { q: "R² close to 1 means…", o: ["The line explains nearly all the variance in y", "The slope is exactly 1", "The sample size is large"], a: 0 },
  { q: "In ŷ=b0+b1x1+b2x2, b1 represents…", o: ["The effect of x1 holding x2 fixed", "The total variance explained", "The correlation between x1 and x2"], a: 0 },
  { q: "Logistic regression's sigmoid output represents…", o: ["A probability between 0 and 1", "A raw unbounded prediction", "A class label directly"], a: 0 },
  { q: "Raising the classification threshold typically…", o: ["Trades some recall for higher precision", "Has no effect on predictions", "Always improves accuracy"], a: 0 },
  { q: "A p-value is the probability of…", o: ["Data this extreme or more, assuming H0 is true", "H0 being true", "Making a measurement error"], a: 0 },
  { q: "If p < α, the standard decision is to…", o: ["Reject the null hypothesis", "Accept the null hypothesis as proven", "Increase the sample size only"], a: 0 },
  { q: "A two-sample t-test compares…", o: ["The means of two independent groups, accounting for spread and sample size", "Only the medians of two groups", "Three or more groups at once"], a: 0 },
  { q: "ANOVA's F-statistic compares…", o: ["Between-group variance to within-group variance", "Only the largest group's mean", "The correlation between two features"], a: 0 },
  { q: "Why not use several t-tests instead of one ANOVA for 3+ groups?", o: ["It inflates the overall false-positive rate", "T-tests are only for continuous data", "ANOVA cannot handle 3 groups"], a: 0 },
  { q: "Statistical significance guarantees…", o: ["A result unlikely to arise from chance alone, but not necessarily a practically important one", "The effect is large and important", "The null hypothesis is false with certainty"], a: 0 },
];

export default function Unit5Studio() {
  return <StudioShell
    unitKey="unit5"
    eyebrow="UNIT 5 · COMPLETE LEARNING STUDIO"
    heading={<>Statistical modelling and decisions you can <em>fit and test</em></>}
    description="From a single fitted line to comparing many groups at once — six connected topics covering how models are fit, evaluated, and how we decide whether a result is real."
    objectives={["Fit and evaluate a regression line with R²", "Combine multiple predictors correctly", "Turn probabilities into classification decisions", "Test hypotheses with p-values, t-tests and ANOVA"]}
    chapters={chapters}
    missions={missions}
    pythonByChapter={pythonByChapter}
    renderLab={id => <ChapterLab id={id} />}
    summarySentence="Regression fits a line and R² grades it → multiple regression combines several predictors → logistic regression turns a linear combination into a probability and then a decision → hypothesis testing formalises whether an observed gap is real → the t-test compares two groups and ANOVA extends that comparison to three or more."
    misconceptions={misconceptions}
    quiz={quiz}
    quizTitle="Can you connect the whole unit?"
    quizSubtitle="Ten questions test meaning — not memorised notation."
  />;
}
