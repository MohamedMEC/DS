import { useMemo, useState } from "react";
import { Activity, BarChart3, Crosshair, Database, Layers3, Play, RotateCcw, Sliders, Table2 } from "lucide-react";
import { Chapter, LabShell, MiniRange, NumberBox, Stat, StudioShell, f } from "./studio-kit";
import { makeGaussianRng, mean, std } from "./stats-kit";

const chapters: Chapter[] = [
  {
    id: "missing-data", number: "4.1", title: "Missing values and imputation", short: "Missing data", icon: Database,
    meaning: "Real datasets have gaps — a sensor drops a reading, a survey question goes unanswered. The three basic strategies are: drop the row, drop the column, or impute (fill in) a reasonable substitute value such as the mean or median.",
    example: "A class of 8 students has quiz scores, but 2 scores are missing. Dropping those rows loses 25% of the data; filling both gaps with the class mean keeps every row but slightly understates how spread out the real scores are.",
    formula: "Mean imputation: replace each missing entry with mean(observed values)   •   Median imputation is more robust when outliers are present",
    ml: "Almost no ML algorithm accepts NaN directly, so imputation (or an explicit 'was this missing' indicator feature) is a standard preprocessing step before model training.",
    check: { q: "What is a downside of mean imputation?", options: ["It always deletes usable data", "It can artificially shrink the dataset's true variability", "It only works on text columns"], answer: 1, why: "Filling every gap with the same mean value pulls the imputed points toward the centre, understating the real spread of the feature." },
  },
  {
    id: "outliers", number: "4.2", title: "Outlier detection with IQR and z-scores", short: "Outlier detection", icon: Crosshair,
    meaning: "An outlier is a value unusually far from the rest of the data. The IQR method flags points outside Q1−1.5×IQR to Q3+1.5×IQR; the z-score method flags points whose distance from the mean, in standard deviations, exceeds a threshold.",
    example: "In the set {12, 13, 14, 14, 15, 95}, the value 95 sits far past the upper IQR fence — both detection methods flag it as an outlier.",
    formula: "IQR = Q3 − Q1   •   fence = [Q1 − 1.5·IQR, Q3 + 1.5·IQR]   •   z-rule: flag if |x − mean|/std > threshold",
    ml: "Outliers can dominate squared-error loss functions like ordinary least squares, and can distort feature scaling — detecting them is a standard exploratory data analysis (EDA) step before model fitting.",
    check: { q: "Why can a single outlier strongly affect OLS regression?", options: ["Squared error penalises large residuals much more heavily than small ones", "OLS ignores all numeric features", "Outliers always have zero residual"], answer: 0, why: "Because OLS minimises squared residuals, one very large residual contributes disproportionately to the total error the model tries to reduce." },
  },
  {
    id: "descriptive-stats", number: "4.3", title: "Descriptive statistics: centre and spread", short: "Descriptive stats", icon: BarChart3,
    meaning: "Descriptive statistics summarise a whole dataset with a handful of numbers: measures of centre (mean, median) and measures of spread (range, variance, standard deviation).",
    example: "Exam scores {55, 60, 65, 70, 95} have mean 69 but median 65 — the single high score of 95 pulls the mean upward more than the median, revealing the data is right-skewed.",
    formula: "mean = Σx/n   •   median = middle value when sorted   •   variance = Σ(x−mean)²/n   •   std = √variance",
    ml: "Summary statistics for each feature guide preprocessing decisions — whether to scale, whether a feature is skewed, whether an outlier needs handling — before any model is trained.",
    check: { q: "Why can the median be more informative than the mean for skewed data?", options: ["The median is unaffected by extreme outliers, unlike the mean", "The median is always larger than the mean", "The median ignores half of the data"], answer: 0, why: "The median only depends on the middle-ranked value, so a single extreme point cannot pull it far, unlike the mean." },
  },
  {
    id: "correlation", number: "4.4", title: "Correlation and scatterplots", short: "Correlation", icon: Activity,
    meaning: "Correlation measures the strength and direction of a straight-line relationship between two variables. It ranges from −1 (perfect negative) through 0 (no linear relationship) to +1 (perfect positive).",
    example: "Study hours and exam scores for five students might show a strong positive correlation — more hours tends to go with a higher score, even if the match isn't perfect.",
    formula: "r = Σ(xᵢ−x̄)(yᵢ−ȳ) / √(Σ(xᵢ−x̄)²·Σ(yᵢ−ȳ)²)",
    ml: "Highly correlated input features can cause multicollinearity in regression models, and a correlation matrix is a standard first step in exploratory data analysis before choosing features.",
    check: { q: "A correlation of r=0 between x and y means…", options: ["No LINEAR relationship exists — a curved relationship could still exist", "x and y are identical", "x causes y"], answer: 0, why: "Correlation only measures straight-line association; a strong curved (nonlinear) pattern can still produce r close to 0." },
  },
  {
    id: "scaling", number: "4.5", title: "Normalisation and standardisation", short: "Feature scaling", icon: Sliders,
    meaning: "Many algorithms are sensitive to the scale of each feature. Min-max scaling rescales values into [0,1]; standardisation rescales values to have mean 0 and standard deviation 1.",
    example: "A feature 'income' ranging 20,000–200,000 would dominate a feature 'age' ranging 20–80 in any distance calculation, unless both are rescaled onto comparable ranges first.",
    formula: "Min-max: x′ = (x−min)/(max−min)   •   Standardise: x′ = (x−mean)/std",
    ml: "k-nearest neighbours, k-means clustering, gradient descent and PCA all behave better — or only make sense — on comparably-scaled features; tree-based models are a notable exception that don't need scaling.",
    check: { q: "Which model family is largely unaffected by feature scaling?", options: ["k-nearest neighbours", "Tree-based models like decision trees", "k-means clustering"], answer: 1, why: "Trees split on threshold comparisons within one feature at a time, so the relative scale between different features doesn't change the resulting splits." },
  },
  {
    id: "pca", number: "4.6", title: "Dimensionality reduction with PCA", short: "PCA", icon: Layers3,
    meaning: "Principal Component Analysis finds new axes — principal components — ordered by how much of the data's total variance they capture. The first component points along the single direction the data spreads out the most.",
    example: "For strongly correlated height and weight measurements, PCA's first component points roughly along an 'overall size' direction, compressing two correlated numbers into one that still captures most of the spread.",
    formula: "PC1 = eigenvector of the covariance matrix with the largest eigenvalue λ₁   •   variance explained by PC1 = λ₁/(λ₁+λ₂)",
    ml: "PCA is a standard dimensionality-reduction step for compressing correlated features, visualising high-dimensional data in 2D, and reducing noise before training a downstream model.",
    check: { q: "The first principal component points in the direction of…", options: ["Maximum variance in the data", "Zero correlation between features", "The smallest possible spread"], answer: 0, why: "PCA orders components by how much variance each one explains; the first component always captures the most." },
  },
];

const missions: Record<string, string[]> = {
  "missing-data": ["Mark two values as missing, then compare Drop vs Mean-impute results.", "Impute with the median instead and see if the result changes.", "Explain in one sentence why the imputed column's spread looks smaller than the original."],
  outliers: ["Add one extreme value and confirm both methods flag it.", "Lower the z-score threshold until a borderline point gets flagged.", "Switch to IQR and compare which points it flags versus the z-score method."],
  "descriptive-stats": ["Add a large outlier and watch the mean move more than the median.", "Make every value identical and observe standard deviation become 0.", "Build a dataset where mean and median are exactly equal."],
  correlation: ["Create points with r close to +1.", "Create points with r close to −1.", "Use the curved preset and notice r stays near 0 despite an obvious pattern."],
  scaling: ["Add one very large value and watch min-max compression squeeze the rest together.", "Compare a standardised value here to a z-score from the normal-distribution lab.", "Make two very differently-scaled features look comparable after standardising."],
  pca: ["Set correlation near 0 and confirm PC1 explains close to 50% of variance.", "Set correlation near 1 and watch PC1 approach 100%.", "Regenerate the cloud and confirm PC1 still follows the main scatter direction."],
};

const pythonByChapter: Record<string, { code: string; output: string }> = {
  "missing-data": { code: "import numpy as np\nscores = np.array([72, np.nan, 85, 90, np.nan, 60, 78, 95])\nfilled = np.where(np.isnan(scores), np.nanmean(scores), scores)\nprint(np.nanmean(scores))\nprint(filled)", output: "80.0\n[72. 80. 85. 90. 80. 60. 78. 95.]" },
  outliers: { code: "import numpy as np\ndata = np.array([12, 14, 13, 15, 14, 95])\nq1, q3 = np.percentile(data, [25, 75])\niqr = q3 - q1\nlower, upper = q1 - 1.5*iqr, q3 + 1.5*iqr\nprint(q1, q3, iqr, lower, upper)\nprint(data[(data < lower) | (data > upper)])", output: "13.25 14.75 1.5 11.0 17.0\n[95]" },
  "descriptive-stats": { code: "import numpy as np\nx = np.array([55, 60, 65, 70, 95])\nprint(x.mean(), np.median(x), x.std(), x.std(ddof=1))", output: "69.0 65.0 13.92838827718412 15.572411502397436" },
  correlation: { code: "import numpy as np\nx = np.array([1, 2, 3, 4, 5])\ny = np.array([2, 4, 5, 4, 5])\nprint(np.corrcoef(x, y)[0, 1])", output: "0.7745966692414834" },
  scaling: { code: "import numpy as np\nx = np.array([20, 22, 25, 40, 200])\nminmax = (x - x.min()) / (x.max() - x.min())\nstandardized = (x - x.mean()) / x.std()\nprint(np.round(minmax, 3))\nprint(np.round(standardized, 3))", output: "[0.    0.011 0.028 0.111 1.   ]\n[-0.594 -0.566 -0.523 -0.307  1.99 ]" },
  pca: { code: "import numpy as np\nX = np.column_stack([x, y])  # already mean-centered\ncov = np.cov(X.T)\nvalues, vectors = np.linalg.eigh(cov)\nexplained = values / values.sum()\nprint(explained)", output: "e.g. [0.15 0.85] -- exact split depends on the generated sample's correlation" },
};

type Row = { id: number; value: number | null };
function quantile(sorted: number[], q: number) { const pos = (sorted.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos); if (lo === hi) return sorted[lo]; return sorted[lo] + (pos - lo) * (sorted[hi] - sorted[lo]); }

function MissingDataLab() {
  const [rows, setRows] = useState<Row[]>([{ id: 1, value: 72 }, { id: 2, value: null }, { id: 3, value: 85 }, { id: 4, value: 90 }, { id: 5, value: null }, { id: 6, value: 60 }, { id: 7, value: 78 }, { id: 8, value: 95 }]);
  const [strategy, setStrategy] = useState<"drop" | "mean" | "median">("mean");
  const observed = rows.filter(r => r.value !== null).map(r => r.value as number);
  const m = observed.length ? mean(observed) : 0;
  const sortedObs = [...observed].sort((a, b) => a - b), med = observed.length ? quantile(sortedObs, 0.5) : 0;
  const cleaned = strategy === "drop" ? observed : rows.map(r => r.value === null ? (strategy === "mean" ? m : med) : r.value);
  const cleanedStats = cleaned.length ? { mean: mean(cleaned), std: std(cleaned) } : { mean: 0, std: 0 };
  const toggle = (id: number) => setRows(v => v.map(r => r.id === id ? { ...r, value: r.value === null ? Math.round(50 + Math.random() * 45) : null } : r));
  return <LabShell title="Fill the gaps and watch the statistics shift" goal="Toggle a value to missing, choose a strategy, and compare the cleaned dataset's mean and spread to the fully-observed original.">
    <div className="u1-presets"><button className={strategy === "drop" ? "active" : ""} onClick={() => setStrategy("drop")}>Drop missing rows</button><button className={strategy === "mean" ? "active" : ""} onClick={() => setStrategy("mean")}>Mean impute</button><button className={strategy === "median" ? "active" : ""} onClick={() => setStrategy("median")}>Median impute</button></div>
    <div className="u1-lab-grid"><div className="u1-controls">
      <div className="table"><div className="tr head"><span>Student</span><span>Score</span><span>Action</span></div>{rows.map(r => <div className="tr" key={r.id}><span>#{r.id}</span><span>{r.value === null ? <b className="flag">missing</b> : r.value}</span><span><button className="u1-preset" onClick={() => toggle(r.id)}>{r.value === null ? "Restore" : "Mark missing"}</button></span></div>)}</div>
      <div className="u1-stats"><Stat label="Observed n" value={`${observed.length}/8`} /><Stat label="Cleaned n" value={`${cleaned.length}/8`} /><Stat label="Cleaned mean" value={f(cleanedStats.mean)} /><Stat label="Cleaned SD" value={f(cleanedStats.std)} /></div>
    </div>
      <div className="u1-visual"><svg viewBox="0 0 380 220" width="100%" height="220" role="img" aria-label={`Bar chart of each student's score, with imputed values shown faded, using the ${strategy} strategy`}><line x1="20" y1="200" x2="360" y2="200" className="axis" />{rows.map((r, i) => { const v = r.value === null ? (strategy === "drop" ? null : strategy === "mean" ? m : med) : r.value; if (v === null) return null; return <g key={r.id}><rect x={26 + i * 42} y={200 - v * 1.6} width="30" height={v * 1.6} className="bar" opacity={r.value === null ? 0.45 : 1} /><text x={26 + i * 42 + 15} y="212" textAnchor="middle" fontSize="9" fill="#7a8496">#{r.id}</text></g>; })}</svg></div></div>
    <div className="u1-observation"><Database /><p><b>Trade-off:</b> {strategy === "drop" ? "dropping rows loses real information and shrinks your sample size." : `imputed values (faded bars) are all pulled to the exact same ${strategy}, which quietly reduces the true variability of the feature.`}</p></div>
  </LabShell>;
}

function OutlierLab() {
  const [values, setValues] = useState([12, 14, 13, 15, 14, 95, 16, 13]);
  const [method, setMethod] = useState<"iqr" | "z">("iqr");
  const [zThresh, setZThresh] = useState(2.5);
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = quantile(sorted, 0.25), q3 = quantile(sorted, 0.75), iqr = q3 - q1, lower = q1 - 1.5 * iqr, upper = q3 + 1.5 * iqr;
  const m = mean(values), s = std(values) || 1;
  const isOutlier = (v: number) => method === "iqr" ? (v < lower || v > upper) : Math.abs((v - m) / s) > zThresh;
  const setVal = (i: number, v: number) => setValues(arr => arr.map((x, j) => j === i ? v : x));
  const px = (v: number) => 30 + ((v - Math.min(...values, 0)) / (Math.max(...values) - Math.min(...values, 0) + 1)) * 350;
  return <LabShell title="Flag points that don't fit the pattern" goal="Edit values, switch detection method, and see which points get flagged as outliers.">
    <div className="u1-presets"><button className={method === "iqr" ? "active" : ""} onClick={() => setMethod("iqr")}>IQR fence</button><button className={method === "z" ? "active" : ""} onClick={() => setMethod("z")}>Z-score threshold</button></div>
    <div className="u1-lab-grid"><div className="u1-controls">
      <div className="u1-control-pair">{values.map((v, i) => <NumberBox key={i} label={`v${i + 1}`} value={v} onChange={n => setVal(i, n)} step="1" />)}</div>
      {method === "z" && <MiniRange label="z threshold" value={zThresh} min={1} max={4} step={0.1} onChange={setZThresh} />}
      <div className="u1-stats">{method === "iqr" ? <><Stat label="Q1" value={f(q1)} /><Stat label="Q3" value={f(q3)} /><Stat label="IQR" value={f(iqr)} /><Stat label="Fence" value={`[${f(lower)}, ${f(upper)}]`} /></> : <><Stat label="mean" value={f(m)} /><Stat label="std" value={f(s)} /></>}<Stat label="Outliers flagged" value={`${values.filter(isOutlier).length}`} good={values.filter(isOutlier).length > 0} /></div>
    </div>
      <div className="u1-visual"><svg viewBox="0 0 400 90" width="100%" height="90" role="img" aria-label={`Number line of the values with ${values.filter(isOutlier).length} flagged as outliers using the ${method === "iqr" ? "IQR fence" : "z-score threshold"} method`}><line x1="20" y1="45" x2="390" y2="45" className="axis" />{values.map((v, i) => <circle key={i} cx={px(v)} cy="45" r="8" className={isOutlier(v) ? "point flag" : "point"} fill={isOutlier(v) ? "#ec5d67" : "#6d4aff"} stroke="#fff" strokeWidth="2" />)}</svg></div></div>
    <div className="u1-observation"><Crosshair /><p><b>{values.some(isOutlier) ? "Flagged:" : "Nothing flagged:"}</b> {values.filter(isOutlier).length ? `${values.filter(isOutlier).map(v => f(v, 0)).join(", ")} sit outside the ${method === "iqr" ? "IQR fence" : "z-score threshold"}.` : "every point is within the normal range for this method and threshold."}</p></div>
  </LabShell>;
}

function DescriptiveStatsLab() {
  const [values, setValues] = useState([55, 60, 65, 70, 95]);
  const m = mean(values), sorted = [...values].sort((a, b) => a - b), med = quantile(sorted, 0.5), s = std(values), range = Math.max(...values) - Math.min(...values);
  const setVal = (i: number, v: number) => setValues(arr => arr.map((x, j) => j === i ? v : x));
  const maxV = Math.max(...values, 1);
  return <LabShell title="Summarise a dataset in a few numbers" goal="Edit values and watch how mean, median and spread respond differently to a single extreme point.">
    <div className="u1-lab-grid"><div className="u1-controls">
      <div className="u1-control-pair">{values.map((v, i) => <NumberBox key={i} label={`x${i + 1}`} value={v} onChange={n => setVal(i, n)} step="1" />)}</div>
      <div className="u1-stats"><Stat label="mean" value={f(m)} good /><Stat label="median" value={f(med)} /><Stat label="range" value={f(range)} /><Stat label="std" value={f(s)} /></div>
    </div>
      <div className="u1-visual"><svg viewBox="0 0 380 220" width="100%" height="220" role="img" aria-label={`Bar chart of the sorted values with dashed lines marking the mean (${f(m)}) and median (${f(med)})`}><line x1="20" y1="200" x2="360" y2="200" className="axis" />{sorted.map((v, i) => <rect key={i} x={30 + i * 62} y={200 - (v / maxV) * 170} width="44" height={(v / maxV) * 170} className="bar" />)}<line x1="20" y1={200 - (m / maxV) * 170} x2="360" y2={200 - (m / maxV) * 170} stroke="#ec5d67" strokeWidth="2" strokeDasharray="5" /><text x="365" y={200 - (m / maxV) * 170 + 4} fontSize="9" fill="#ec5d67">mean</text><line x1="20" y1={200 - (med / maxV) * 170} x2="360" y2={200 - (med / maxV) * 170} stroke="#0e9f6e" strokeWidth="2" strokeDasharray="2" /><text x="365" y={200 - (med / maxV) * 170 - 4} fontSize="9" fill="#0e9f6e">median</text></svg></div></div>
    <div className="u1-observation"><BarChart3 /><p><b>Centre vs spread:</b> {Math.abs(m - med) > s * 0.3 ? "mean and median have pulled apart — a sign of skew from an extreme value." : "mean and median are close together — this dataset looks fairly symmetric."}</p></div>
  </LabShell>;
}

function CorrelationLab() {
  const [points, setPoints] = useState([{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 5 }, { x: 4, y: 4 }, { x: 5, y: 5 }]);
  const setPt = (i: number, key: "x" | "y", v: number) => setPoints(ps => ps.map((p, j) => j === i ? { ...p, [key]: v } : p));
  const mx = mean(points.map(p => p.x)), my = mean(points.map(p => p.y));
  const num = points.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
  const den = Math.sqrt(points.reduce((s, p) => s + (p.x - mx) ** 2, 0) * points.reduce((s, p) => s + (p.y - my) ** 2, 0));
  const r = den ? num / den : 0;
  const preset = (name: string) => { if (name === "pos") setPoints([{ x: 1, y: 1 }, { x: 2, y: 2.2 }, { x: 3, y: 3.1 }, { x: 4, y: 4.3 }, { x: 5, y: 4.9 }]); if (name === "neg") setPoints([{ x: 1, y: 5 }, { x: 2, y: 4.1 }, { x: 3, y: 3 }, { x: 4, y: 1.9 }, { x: 5, y: 1 }]); if (name === "curve") setPoints([{ x: -2, y: 4 }, { x: -1, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 4 }]); };
  const px = (x: number) => 40 + (x + 2) * 55, py = (y: number) => 210 - (y + 2) * 30;
  return <LabShell title="See a relationship, then measure it" goal="Drag values around (via the number boxes) and watch the correlation coefficient track the linear pattern — or fail to see a curved one.">
    <div className="u1-presets"><button onClick={() => preset("pos")}>Strong positive</button><button onClick={() => preset("neg")}>Strong negative</button><button onClick={() => preset("curve")}>Curved (r≈0)</button></div>
    <div className="u1-lab-grid"><div className="u1-controls">
      {points.map((p, i) => <div className="u1-control-pair" key={i}><NumberBox label={`x${i + 1}`} value={p.x} onChange={v => setPt(i, "x", v)} step="0.5" /><NumberBox label={`y${i + 1}`} value={p.y} onChange={v => setPt(i, "y", v)} step="0.5" /></div>)}
      <div className="u1-stats"><Stat label="correlation r" value={f(r, 3)} good={Math.abs(r) > 0.6} /></div>
    </div>
      <div className="u1-visual"><svg viewBox="0 0 420 230" width="100%" height="230" role="img" aria-label={`Scatter plot of the points, correlation r=${f(r, 3)}`}><line x1="30" y1="210" x2="400" y2="210" className="axis" />{points.map((p, i) => <circle key={i} cx={px(p.x)} cy={py(p.y)} r="7" className="point" />)}</svg></div></div>
    <div className="u1-observation"><Activity /><p><b>{Math.abs(r) < 0.3 ? "Weak or no linear pattern:" : r > 0 ? "Positive relationship:" : "Negative relationship:"}</b> r={f(r, 3)}. {Math.abs(r) < 0.3 ? "Try the curved preset — a clear pattern can still produce a near-zero r if it isn't a straight line." : "Points cluster fairly tightly along one direction."}</p></div>
  </LabShell>;
}

function ScalingLab() {
  const [values, setValues] = useState([20, 22, 25, 40, 200]);
  const [view, setView] = useState<"raw" | "minmax" | "std">("raw");
  const setVal = (i: number, v: number) => setValues(arr => arr.map((x, j) => j === i ? v : x));
  const mn = Math.min(...values), mx = Math.max(...values), rangeV = mx - mn || 1, m = mean(values), s = std(values) || 1;
  const transformed = view === "raw" ? values : view === "minmax" ? values.map(v => (v - mn) / rangeV) : values.map(v => (v - m) / s);
  const maxAbs = Math.max(...transformed.map(Math.abs), 1);
  return <LabShell title="Put every feature on the same footing" goal="Compare raw values against min-max and standardised versions — notice how one big value affects each scaling method differently.">
    <div className="u1-presets"><button className={view === "raw" ? "active" : ""} onClick={() => setView("raw")}>Raw</button><button className={view === "minmax" ? "active" : ""} onClick={() => setView("minmax")}>Min-max [0,1]</button><button className={view === "std" ? "active" : ""} onClick={() => setView("std")}>Standardised</button></div>
    <div className="u1-lab-grid"><div className="u1-controls">
      <div className="u1-control-pair">{values.map((v, i) => <NumberBox key={i} label={`x${i + 1}`} value={v} onChange={n => setVal(i, n)} step="1" />)}</div>
      <div className="u1-stats"><Stat label="min" value={f(mn)} /><Stat label="max" value={f(mx)} /><Stat label="mean" value={f(m)} /><Stat label="std" value={f(s)} /></div>
    </div>
      <div className="u1-visual"><svg viewBox="0 0 380 220" width="100%" height="220" role="img" aria-label={`Bar chart of the values under the ${view} transformation`}><line x1="20" y1="120" x2="360" y2="120" className="axis" />{transformed.map((v, i) => <g key={i}><rect x={26 + i * 66} y={v >= 0 ? 120 - (v / maxAbs) * 90 : 120} width="44" height={Math.abs(v / maxAbs) * 90} className="bar" /><text x={26 + i * 66 + 22} y={v >= 0 ? 120 - (v / maxAbs) * 90 - 6 : 120 + (Math.abs(v) / maxAbs) * 90 + 14} textAnchor="middle" fontSize="9" fill="#4b2dcc">{f(v, 2)}</text></g>)}</svg></div></div>
    <div className="u1-observation"><Sliders /><p><b>{view === "raw" ? "Unscaled:" : view === "minmax" ? "Min-max scaled:" : "Standardised:"}</b> {view === "raw" ? "one large value dominates the raw scale." : view === "minmax" ? "everything is squeezed between 0 and 1, but a single extreme value compresses the rest into a tiny sub-range." : "values are expressed in standard deviations from the mean, so extreme values become clearly visible outliers rather than range-crushers."}</p></div>
  </LabShell>;
}

function PCALab() {
  const [corr, setCorr] = useState(0.8), [seedBump, setSeedBump] = useState(0);
  const points = useMemo(() => { const g = makeGaussianRng(11 + seedBump); const pts: { x: number; y: number }[] = []; for (let i = 0; i < 60; i++) { const x = g(0, 1); const y = corr * x + Math.sqrt(Math.max(0, 1 - corr * corr)) * g(0, 1); pts.push({ x, y }); } return pts; }, [corr, seedBump]);
  const mx = mean(points.map(p => p.x)), my = mean(points.map(p => p.y));
  const cxx = points.reduce((s, p) => s + (p.x - mx) ** 2, 0) / points.length, cyy = points.reduce((s, p) => s + (p.y - my) ** 2, 0) / points.length, cxy = points.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / points.length;
  const tr = cxx + cyy, disc = Math.sqrt((cxx - cyy) ** 2 + 4 * cxy * cxy), l1 = (tr + disc) / 2, l2 = (tr - disc) / 2;
  let vx = cxy, vy = l1 - cxx; if (Math.hypot(vx, vy) < 1e-6) { vx = 1; vy = 0; } const vm = Math.hypot(vx, vy); vx /= vm; vy /= vm;
  const explained = tr ? l1 / tr : 0;
  const px = (x: number) => 210 + x * 55, py = (y: number) => 190 - y * 55;
  return <LabShell title="Find the direction of maximum spread" goal="Adjust how correlated x and y are, then watch PC1 (the purple line) align with the direction the cloud stretches the most.">
    <div className="u1-lab-grid"><div className="u1-controls">
      <MiniRange label="correlation between x and y" value={corr} min={-0.99} max={0.99} step={0.01} onChange={setCorr} />
      <button className="u1-preset" onClick={() => setSeedBump(v => v + 1)}><RotateCcw />Regenerate sample</button>
      <div className="u1-stats"><Stat label="λ₁ (PC1 variance)" value={f(l1)} /><Stat label="λ₂ (PC2 variance)" value={f(l2)} /><Stat label="variance explained by PC1" value={`${f(explained * 100, 1)}%`} good={explained > 0.75} /></div>
    </div>
      <div className="u1-visual"><svg viewBox="0 0 420 380" width="100%" height="380" role="img" aria-label={`Scatter plot of the sample cloud with PC1 (${f(explained * 100, 0)}% of variance) and PC2 axes drawn through it`}>{[-4, -3, -2, -1, 0, 1, 2, 3, 4].map(i => <g key={i}><line x1={210 + i * 55} y1="20" x2={210 + i * 55} y2="360" className="u1-grid" /><line x1="30" y1={190 - i * 55} x2="390" y2={190 - i * 55} className="u1-grid" /></g>)}
        {points.map((p, i) => <circle key={i} cx={px(p.x)} cy={py(p.y)} r="3.5" fill="#6d4aff" opacity="0.55" />)}
        <line x1={px(-vx * 3)} y1={py(-vy * 3)} x2={px(vx * 3)} y2={py(vy * 3)} stroke="#ec5d67" strokeWidth="3" /><line x1={px(vy * 2)} y1={py(-vx * 2)} x2={px(-vy * 2)} y2={py(vx * 2)} stroke="#0e9f6e" strokeWidth="2" strokeDasharray="5" />
      </svg><div className="u1-legend"><span className="v2">PC1: max variance</span><span className="sum">PC2: perpendicular</span></div></div></div>
    <div className="u1-observation"><Layers3 /><p><b>Reading it:</b> {explained > 0.9 ? "x and y are so correlated that a single number (position along PC1) captures almost everything." : explained < 0.6 ? "with low correlation, both directions carry meaningful variance — reducing to 1D would lose real information." : "PC1 captures the majority of the spread, but PC2 still holds a noticeable amount."}</p></div>
  </LabShell>;
}

function ChapterLab({ id }: { id: string }) {
  if (id === "missing-data") return <MissingDataLab />;
  if (id === "outliers") return <OutlierLab />;
  if (id === "descriptive-stats") return <DescriptiveStatsLab />;
  if (id === "correlation") return <CorrelationLab />;
  if (id === "scaling") return <ScalingLab />;
  return <PCALab />;
}

const misconceptions = [
  { s: "Mean imputation preserves the true variability of a feature.", truth: false, why: "Filling every gap with the same mean value pulls those points toward the centre, shrinking the observed spread." },
  { s: "The IQR method and z-score method always flag exactly the same points as outliers.", truth: false, why: "They use different criteria (quartile-based fences vs standard deviations from the mean), so their flagged points can differ, especially with skewed data." },
  { s: "The median is always a better summary than the mean.", truth: false, why: "The mean uses every value and is often more efficient for symmetric, outlier-free data; the median's advantage is specifically its resistance to extreme values." },
  { s: "A correlation near 0 proves there is no relationship between two variables.", truth: false, why: "Correlation only detects LINEAR relationships — a strong curved pattern can still produce r close to 0." },
  { s: "Correlation implies causation.", truth: false, why: "A high correlation shows association, not that one variable causes the other — a hidden third factor can drive both." },
  { s: "Standardised values always fall between 0 and 1.", truth: false, why: "Standardisation (z-scoring) centres data at mean 0 with SD 1; values can be negative or exceed 1 depending on spread." },
  { s: "Tree-based models require feature scaling to work correctly.", truth: false, why: "Trees split on threshold comparisons within a single feature at a time, so scale doesn't change the structure of the resulting splits." },
  { s: "PCA's first principal component always points along one of the original feature axes.", truth: false, why: "PC1 is generally a new combined direction — it only aligns with an original axis in special cases like zero correlation between features." },
  { s: "Dropping every row with a missing value is always the safest choice.", truth: false, why: "Dropping rows discards real information and shrinks the sample; whether that's safer than imputing depends on how much data is missing and why." },
];

const quiz = [
  { q: "Mean imputation replaces a missing value with…", o: ["The mean of the observed values", "Zero, always", "The maximum value in the column"], a: 0 },
  { q: "The IQR outlier fence is defined using…", o: ["Q1, Q3 and 1.5×IQR", "Only the mean", "Only the maximum value"], a: 0 },
  { q: "For skewed data, the median differs from the mean because…", o: ["The median ignores extreme values that pull the mean away from the typical value", "The median is always larger", "They are always identical"], a: 0 },
  { q: "A correlation coefficient of −0.9 indicates…", o: ["A strong positive linear relationship", "A strong negative linear relationship", "No relationship"], a: 1 },
  { q: "Min-max scaling transforms values to fall within…", o: ["[0, 1]", "[-∞, ∞]", "[-1, 1] always"], a: 0 },
  { q: "Standardisation rescales a feature to have…", o: ["Mean 0 and standard deviation 1", "Minimum 0 and maximum 1", "All values equal"], a: 0 },
  { q: "Which model type is largely unaffected by feature scaling?", o: ["k-nearest neighbours", "Decision trees", "k-means clustering"], a: 1 },
  { q: "PCA's first principal component captures…", o: ["The direction of maximum variance", "The mean of all features", "The smallest possible spread"], a: 0 },
  { q: "If PC1 explains 95% of the variance, that suggests…", o: ["The two original features are strongly related", "The features are completely unrelated", "PCA failed"], a: 0 },
  { q: "Why is EDA (exploratory data analysis) usually done before model training?", o: ["To spot missing values, outliers and relationships that shape preprocessing choices", "Because it trains the model faster", "Because it replaces the need for a model entirely"], a: 0 },
];

export default function Unit4Studio() {
  return <StudioShell
    unitKey="unit4"
    eyebrow="UNIT 4 · COMPLETE LEARNING STUDIO"
    heading={<>Clean, describe and compress data you can <em>edit live</em></>}
    description="From messy gaps to a compressed 2D summary — six connected topics covering the exploratory data analysis work that happens before any model is trained."
    objectives={["Handle missing values responsibly", "Detect outliers with two different methods", "Summarise and compare distributions", "Reduce correlated features with PCA"]}
    chapters={chapters}
    missions={missions}
    pythonByChapter={pythonByChapter}
    renderLab={id => <ChapterLab id={id} />}
    summarySentence="Missing values get dropped or imputed → outliers get flagged by IQR or z-score → descriptive statistics summarise centre and spread → correlation measures linear relationships between features → scaling puts features on comparable footing → PCA compresses correlated features into the directions of maximum variance."
    misconceptions={misconceptions}
    quiz={quiz}
    quizTitle="Can you connect the whole unit?"
    quizSubtitle="Ten questions test meaning — not memorised notation."
  />;
}
