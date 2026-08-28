import { useState } from "react";
import { ArrowRight, Dices, Eye, GitBranch, GitMerge, Percent, PieChart, Play, RotateCcw, Shuffle, Sigma, Stethoscope, TrendingUp } from "lucide-react";
import { Chapter, LabShell, MiniRange, NumberBox, Stat, StudioShell, f } from "./studio-kit";

const chapters: Chapter[] = [
  {
    id: "sample-space", number: "2.1", title: "Sample spaces, outcomes and events", short: "Sample space", icon: Dices,
    meaning: "A sample space lists every possible outcome of a random experiment. An event is any subset of that sample space — the outcomes we actually care about.",
    example: "Rolling two dice has 36 equally-likely outcomes (i,j). The event \"the two dice sum to 7\" is the subset {(1,6),(2,5),(3,4),(4,3),(5,2),(6,1)} — 6 of the 36 outcomes.",
    formula: "P(event) = |favourable outcomes| / |sample space|   •   for equally-likely outcomes only",
    ml: "Every classifier prediction is treated as an outcome drawn from a sample space of possible labels; training data estimates how outcomes are distributed.",
    check: { q: "How many outcomes are in the sample space of two dice?", options: ["12", "36", "21"], answer: 1, why: "Each die has 6 faces, and the two rolls are independent choices: 6×6=36." },
  },
  {
    id: "prob-rules", number: "2.2", title: "Probability rules: addition and complement", short: "Addition & complement", icon: Percent,
    meaning: "The complement rule says P(not A) = 1 − P(A). The addition rule says P(A or B) = P(A) + P(B) − P(A and B), so we don't double-count outcomes in both events.",
    example: "If P(sum=7)=6/36 and P(at least one 6)=11/36, and both happen together in 2/36 outcomes, then P(sum=7 or at least one 6) = 6/36+11/36−2/36 = 15/36.",
    formula: "P(Aᶜ) = 1 − P(A)   •   P(A∪B) = P(A) + P(B) − P(A∩B)",
    ml: "Precision/recall style error analysis, and combining independent alert rules in a monitoring system, both rely on the addition rule to avoid double-counting overlapping cases.",
    check: { q: "Why subtract P(A∩B) in the addition rule?", options: ["To make the answer smaller", "Because outcomes in both events were counted twice", "Because A and B can't overlap"], answer: 1, why: "Outcomes belonging to both A and B are added once inside P(A) and once inside P(B), so removing one copy corrects the double count." },
  },
  {
    id: "conditional", number: "2.3", title: "Conditional probability: updating with information", short: "Conditional", icon: GitBranch,
    meaning: "Conditional probability P(A|B) asks: once we know B happened, what fraction of that smaller world also satisfies A? Learning B happened shrinks the sample space down to just B's outcomes.",
    example: "Among 100 emails, 40 are spam and 25 spam emails contain the word 'free'. If 'free' appears in 30 emails total, P(spam | 'free') = 25/30 ≈ 0.83 — much higher than the overall P(spam)=0.40.",
    formula: "P(A|B) = P(A∩B) / P(B)     (requires P(B) > 0)",
    ml: "A spam filter's whole job is estimating P(spam | words in the email) — a conditional probability updated by evidence, exactly as Bayesian classifiers work.",
    check: { q: "P(A|B) is computed over which sample space?", options: ["The full original sample space", "Only the outcomes where B happened", "Only the outcomes where A happened"], answer: 1, why: "Conditioning on B restricts attention to B's outcomes, then asks what share of those also satisfy A." },
  },
  {
    id: "independence", number: "2.4", title: "Independent vs dependent events", short: "Independence", icon: Shuffle,
    meaning: "Two events are independent only when knowing one occurred tells you nothing about the other: P(A∩B) = P(A)×P(B) exactly. If the actual overlap differs from that product, the events are dependent.",
    example: "Coin flip 1 and coin flip 2 are independent — P(both heads)=0.5×0.5=0.25. But 'raining today' and 'carrying an umbrella today' are dependent — people carry umbrellas more often when it rains.",
    formula: "Independent: P(A∩B) = P(A)·P(B)   •   Dependent: P(A∩B) ≠ P(A)·P(B)",
    ml: "Naive Bayes classifiers explicitly (and often incorrectly) assume features are conditionally independent given the class, which is what makes the math tractable — but it's an assumption, not a guarantee.",
    check: { q: "If P(A)=0.5, P(B)=0.5 and P(A∩B)=0.3, are A and B independent?", options: ["Yes, both probabilities are 0.5", "No, because 0.3 ≠ 0.5×0.5", "Cannot be determined"], answer: 1, why: "Independence requires the joint probability to equal the product exactly; 0.3 does not equal 0.25, so they are dependent." },
  },
  {
    id: "multiplication-rule", number: "2.5", title: "The multiplication rule: chaining conditional steps", short: "Multiplication rule", icon: GitMerge,
    meaning: "Rearranging the conditional probability formula gives the multiplication rule: P(A∩B) = P(A)·P(B|A). It lets you build the probability of a whole sequence of events by multiplying each step's probability, conditioned on everything before it.",
    example: "Drawing two cards without replacement from a 52-card deck: P(both aces) = P(1st ace) × P(2nd ace | 1st ace) = (4/52) × (3/51) ≈ 0.0045 — much smaller than either single draw's probability, because the second draw depends on the first.",
    formula: "P(A∩B) = P(A)·P(B|A) = P(B)·P(A|B)   •   chains to 3+ events: P(A∩B∩C) = P(A)·P(B|A)·P(C|A∩B)",
    ml: "This 'chain rule of probability' is exactly how language models score a sentence: P(w₁,w₂,…,wₙ) = P(w₁)·P(w₂|w₁)·P(w₃|w₁,w₂)·… — each word's probability is conditioned on every word before it.",
    check: { q: "For dependent events, why can't you just multiply P(A) and P(B) directly?", options: ["P(B) may change once A is known to have happened, so P(B|A) is needed instead", "Multiplication only works for independent events entirely", "P(A) and P(B) are always equal"], answer: 0, why: "The multiplication rule uses P(B|A), not the plain P(B), precisely because knowing A occurred can shift B's probability." },
  },
  {
    id: "total-probability", number: "2.6", title: "The law of total probability: averaging over every path", short: "Total probability", icon: PieChart,
    meaning: "When an event can happen through several distinct, non-overlapping pathways that together cover every possibility (a partition), the law of total probability says the overall probability is a weighted average of each pathway's conditional probability, weighted by how likely that pathway is.",
    example: "A factory's three machines produce 50%, 30% and 20% of items, with defect rates of 2%, 3% and 5%. The overall defect rate is P(defect) = 0.5×0.02 + 0.3×0.03 + 0.2×0.05 = 0.029 — a production-weighted blend of all three machines.",
    formula: "P(B) = Σᵢ P(B|Aᵢ)·P(Aᵢ), where A₁,…,Aₖ partition the sample space (mutually exclusive, covering everything)",
    ml: "This is exactly the denominator P(E) in Bayes' theorem, and it's also how ensemble and mixture models compute an overall prediction by averaging each component's prediction, weighted by how likely that component is.",
    check: { q: "The law of total probability requires the groups A₁…Aₖ to be…", options: ["Mutually exclusive and together covering every possibility", "All exactly the same size", "Independent of event B"], answer: 0, why: "Only a true partition of the sample space lets you add up each pathway's contribution without double-counting or missing outcomes." },
  },
  {
    id: "bayes", number: "2.7", title: "Bayes' theorem: reversing the condition", short: "Bayes' theorem", icon: Stethoscope,
    meaning: "Bayes' theorem converts P(evidence | cause) — usually the thing we can measure — into P(cause | evidence) — usually the thing we actually want to know.",
    example: "A rare disease affects 1% of people. A test is 95% sensitive and 90% specific. Even with a positive result, most positives come from the huge pool of healthy people who got a false positive — the true P(disease | positive) is much lower than 95%.",
    formula: "P(H|E) = P(E|H)·P(H) / P(E)   •   P(E) = P(E|H)P(H) + P(E|¬H)P(¬H)",
    ml: "Bayesian spam filters, medical screening tools and recommender systems all start from a prior belief (base rate) and update it using observed evidence — that update rule is Bayes' theorem.",
    check: { q: "Why can a positive result on a 95%-accurate test still be more likely wrong than right?", options: ["The test is broken", "When the condition is rare, false positives from the large healthy group can outnumber true positives", "Bayes' theorem does not apply to rare events"], answer: 1, why: "With a low prior (rare disease), even a small false-positive rate applied to a huge healthy population can produce more false positives than true positives." },
  },
  {
    id: "expectation", number: "2.8", title: "Random variables, expectation and variance", short: "Expectation & variance", icon: TrendingUp,
    meaning: "A random variable assigns a number to each outcome. Its expectation E[X] is the probability-weighted average value — the long-run average over many repetitions. Variance measures how spread out the outcomes typically are around that average.",
    example: "A fair die has E[X] = 1(1/6)+2(1/6)+...+6(1/6) = 3.5 — a value the die can never actually show, but the long-run average of many rolls.",
    formula: "E[X] = Σ xᵢP(xᵢ)   •   Var(X) = Σ P(xᵢ)(xᵢ−E[X])²   •   SD(X) = √Var(X)",
    ml: "Expected loss (the average of a loss function over the data distribution) is exactly what training a machine-learning model minimises — expectation is the mathematical core of learning objectives.",
    check: { q: "For a fair six-sided die, E[X] equals…", options: ["A value the die can actually land on", "3.5, the long-run average over many rolls", "6, the maximum possible value"], answer: 1, why: "Expectation is a weighted average, not a guaranteed single outcome — it can fall between the possible values." },
  },
];

const missions: Record<string, string[]> = {
  "sample-space": ["Set the target sum to 7 and read off how many of the 36 outcomes match.", "Find a target sum with only 1 matching outcome.", "Find the target sum with the most matching outcomes and explain why it's the most common."],
  "prob-rules": ["Pick a target sum and confirm P(A)+P(Aᶜ)=1.", "Turn on the 'at least one 6' event and watch the overlap cells highlight.", "Verify the union probability equals P(A)+P(B)−P(A∩B) using the live numbers."],
  conditional: ["Set die 1 to a fixed value and watch the conditional probability change.", "Make P(A|B) larger than the unconditional P(A) and explain why.", "Make P(A|B) equal to P(A) — what does that tell you about A and B?"],
  independence: ["Enter contingency counts where P(A∩B) exactly equals P(A)×P(B).", "Change one count so the events become dependent.", "Make A and B almost perfectly dependent (large gap between P(A∩B) and P(A)P(B))."],
  "multiplication-rule": ["Compute P(1st draw matches) then P(2nd draw matches | 1st matched) and multiply them.", "Switch to 3 draws and watch the chain lengthen and the product shrink further.", "Compare the chained product against the independent (with-replacement) product."],
  "total-probability": ["Adjust each pathway's share and confirm the three shares sum to exactly 1.", "Raise one pathway's rate and check the overall rate shifts by exactly that pathway's weight.", "Make all three rates equal and confirm the overall rate matches them regardless of the shares."],
  bayes: ["Set prevalence to 1% and read off the positive predictive value.", "Raise specificity toward 99.9% and watch PPV improve.", "Raise prevalence to 50% and compare PPV to the low-prevalence case."],
  expectation: ["Make every payout equal so variance drops to zero.", "Create a high-risk, high-reward payout table and read the resulting SD.", "Switch to the loaded die and see how E[X] shifts toward the favoured face."],
};

const pythonByChapter: Record<string, { code: string; output: string }> = {
  "sample-space": { code: "outcomes = [(i, j) for i in range(1, 7) for j in range(1, 7)]\nevent = [o for o in outcomes if sum(o) == 7]\nprint(len(event), \"/\", len(outcomes))\nprint(len(event) / len(outcomes))", output: "6 / 36\n0.16666666666666666" },
  "prob-rules": { code: "A = {o for o in outcomes if sum(o) == 7}\nB = {o for o in outcomes if 6 in o}\nunion = A | B\nprint(len(A)/36, len(B)/36, len(A & B)/36)\nprint(len(union)/36)", output: "0.16666666666666666 0.3055555555555556 0.05555555555555555\n0.4166666666666667" },
  conditional: { code: "# A: sum == 7   B: first die shows 4\nA_and_B = sum(1 for i, j in outcomes if i == 4 and i+j == 7)\nB = sum(1 for i, j in outcomes if i == 4)\nprint(A_and_B/36, B/36, A_and_B/B)", output: "0.027777777777777776 0.16666666666666666 0.16666666666666666" },
  independence: { code: "a, b, c, d = 30, 20, 10, 40   # contingency table counts\nN = a + b + c + d\npA, pB, pAB = (a+b)/N, (a+c)/N, a/N\nprint(pA * pB, pAB)", output: "0.2 0.3" },
  "multiplication-rule": { code: "p_ace1 = 4 / 52\np_ace2_given_ace1 = 3 / 51\np_both = p_ace1 * p_ace2_given_ace1\nprint(p_ace1, p_ace2_given_ace1)\nprint(round(p_both, 4))", output: "0.07692307692307693 0.058823529411764705\n0.0045" },
  "total-probability": { code: "shares = [0.5, 0.3, 0.2]\nrates = [0.02, 0.03, 0.05]\noverall = sum(s * r for s, r in zip(shares, rates))\nprint(round(overall, 4))", output: "0.029" },
  bayes: { code: "p, se, sp = 0.01, 0.95, 0.90\ntp = p * se\nfp = (1 - p) * (1 - sp)\nppv = tp / (tp + fp)\nprint(round(ppv, 4))", output: "0.0876" },
  expectation: { code: "x = np.array([1, 2, 3, 4, 5, 6])\np = np.array([1/6] * 6)\nmean = np.sum(x * p)\nvar = np.sum(p * (x - mean)**2)\nprint(mean, var, np.sqrt(var))", output: "3.5 2.9166666666666665 1.707825127659933" },
};

function DiceGridLab({ mode }: { mode: "single" | "rules" }) {
  const [target, setTarget] = useState(7);
  const [useB, setUseB] = useState(true);
  const cells: { i: number; j: number; inA: boolean; inB: boolean }[] = [];
  for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) cells.push({ i, j, inA: i + j === target, inB: mode === "rules" && useB && (i === 6 || j === 6) });
  const countA = cells.filter(c => c.inA).length, countB = cells.filter(c => c.inB).length, countBoth = cells.filter(c => c.inA && c.inB).length, countUnion = cells.filter(c => c.inA || c.inB).length;
  const pA = countA / 36, pB = countB / 36, pAB = countBoth / 36, pUnion = countUnion / 36;
  const cell = 44, ox = 60, oy = 30;
  return <LabShell title={mode === "single" ? "Build the sample space of two dice" : "Combine two events without double-counting"} goal={mode === "single" ? "Choose a target sum and watch the matching outcomes light up across all 36 possibilities." : "Turn on a second event and see how the addition rule accounts for the overlap."}>
    <div className="u1-lab-grid"><div className="u1-controls">
      <MiniRange label="target sum" value={target} min={2} max={12} step={1} onChange={setTarget} />
      {mode === "rules" && <button className={`u1-preset ${useB ? "active" : ""}`} onClick={() => setUseB(v => !v)}><Dices />{useB ? "Hide" : "Show"} event B: at least one 6</button>}
      <div className="u1-stats">
        <Stat label="P(A) = sum equals target" value={f(pA, 3)} note={`${countA}/36`} />
        {mode === "rules" && useB && <><Stat label="P(B) = at least one 6" value={f(pB, 3)} note={`${countB}/36`} /><Stat label="P(A∩B)" value={f(pAB, 3)} note={`${countBoth}/36`} /><Stat label="P(A∪B)" value={f(pUnion, 3)} good note={`${countUnion}/36`} /></>}
        {mode === "single" && <Stat label="P(Aᶜ) = complement" value={f(1 - pA, 3)} note={`${36 - countA}/36`} />}
      </div>
    </div>
      <div className="u1-visual"><svg viewBox="0 0 420 320" width="100%" height="320">
        <text x={ox + 3 * cell} y="16" textAnchor="middle" fontSize="10" fill="#7a8496">die 2 →</text>
        <text x="14" y={oy + 3 * cell} textAnchor="middle" fontSize="10" fill="#7a8496" transform={`rotate(-90 14 ${oy + 3 * cell})`}>die 1 →</text>
        {[1, 2, 3, 4, 5, 6].map(j => <text key={`c${j}`} x={ox + (j - 0.5) * cell} y={oy - 6} textAnchor="middle" fontSize="10" fill="#98a0ae">{j}</text>)}
        {[1, 2, 3, 4, 5, 6].map(i => <text key={`r${i}`} x={ox - 10} y={oy + (i - 0.5) * cell + 4} textAnchor="middle" fontSize="10" fill="#98a0ae">{i}</text>)}
        {cells.map(c => {
          const fill = c.inA && c.inB ? "#0e9f6e" : c.inA ? "#6d4aff" : c.inB ? "#ec5d67" : "#f1f3f7";
          return <g key={`${c.i}-${c.j}`}><rect x={ox + (c.j - 1) * cell} y={oy + (c.i - 1) * cell} width={cell - 3} height={cell - 3} rx="6" fill={fill} opacity={c.inA || c.inB ? 0.85 : 1} /><text x={ox + (c.j - 1) * cell + cell / 2 - 1} y={oy + (c.i - 1) * cell + cell / 2 + 4} textAnchor="middle" fontSize="10" fill={c.inA || c.inB ? "#fff" : "#8791a3"}>{c.i + c.j}</text></g>;
        })}
      </svg>
        <div className="u1-legend"><span className="v1">A: sum = {target}</span>{mode === "rules" && useB && <><span className="v2">B: has a 6</span><span className="sum">both</span></>}</div>
      </div></div>
    <div className="u1-observation"><Eye /><p><b>Observe:</b> {mode === "single" ? `${countA} of the 36 equally-likely outcomes give a sum of ${target}, so P(A)=${f(pA, 3)}.` : useB ? `P(A)+P(B)=${f(pA + pB, 3)}, which double-counts the ${countBoth} overlapping outcomes — subtracting P(A∩B) gives the correct P(A∪B)=${f(pUnion, 3)}.` : "Turn on event B to see the addition rule in action."}</p></div>
  </LabShell>;
}

function ConditionalLab({ independenceFocus = false }: { independenceFocus?: boolean }) {
  const [a, setA] = useState(30), [b, setB] = useState(20), [c, setC] = useState(10), [d, setD] = useState(40);
  const N = Math.max(1, a + b + c + d), pA = (a + b) / N, pB = (a + c) / N, pAB = a / N, pAgivenB = (a + c) ? a / (a + c) : 0, pBgivenA = (a + b) ? a / (a + b) : 0;
  const expected = pA * pB, gap = pAB - expected, independent = Math.abs(gap) < 0.005;
  const squares = 100, filled = { a: Math.round((a / N) * squares), b: Math.round((b / N) * squares), c: Math.round((c / N) * squares) };
  const cats: string[] = []; for (let i = 0; i < filled.a; i++) cats.push("a"); for (let i = 0; i < filled.b; i++) cats.push("b"); for (let i = 0; i < filled.c; i++) cats.push("c"); while (cats.length < squares) cats.push("d");
  return <LabShell title={independenceFocus ? "Test whether two events are independent" : "Edit a contingency table and read conditional probabilities"} goal={independenceFocus ? "Compare the actual overlap P(A∩B) with the independence prediction P(A)×P(B)." : "A and B are two events over the same N cases — change the counts and watch every probability update."}>
    <div className="u1-lab-grid"><div className="u1-controls">
      <div className="u1-control-pair"><NumberBox label="A ∩ B" value={a} onChange={setA} step="1" /><NumberBox label="A ∩ ¬B" value={b} onChange={setB} step="1" /><NumberBox label="¬A ∩ B" value={c} onChange={setC} step="1" /><NumberBox label="¬A ∩ ¬B" value={d} onChange={setD} step="1" /></div>
      <div className="u1-stats"><Stat label="P(A)" value={f(pA, 3)} /><Stat label="P(B)" value={f(pB, 3)} /><Stat label="P(A∩B)" value={f(pAB, 3)} /><Stat label="P(A|B)" value={f(pAgivenB, 3)} good={!independenceFocus} /><Stat label="P(B|A)" value={f(pBgivenA, 3)} />{independenceFocus && <Stat label="P(A)×P(B)" value={f(expected, 3)} />}</div>
      {independenceFocus && <div className={`u1-observation ${independent ? "" : "warn"}`}><Shuffle /><p><b>{independent ? "Independent:" : "Dependent:"}</b> P(A∩B)={f(pAB, 3)} {independent ? "matches" : "differs from"} P(A)×P(B)={f(expected, 3)} (gap {f(gap, 3)}).</p></div>}
    </div>
      <div className="u1-visual"><svg viewBox="0 0 260 260" width="100%" height="260">{cats.map((cat, i) => { const col = i % 10, row = Math.floor(i / 10), color = cat === "a" ? "#6d4aff" : cat === "b" ? "#ec5d67" : cat === "c" ? "#ffb020" : "#e1e4eb"; return <rect key={i} x={6 + col * 25} y={6 + row * 25} width="21" height="21" rx="4" fill={color} />; })}</svg>
        <div className="u1-legend"><span className="v1">A∩B</span><span className="v2">A∩¬B</span><span className="eig">¬A∩B</span></div>
      </div></div>
  </LabShell>;
}

function BayesLab() {
  const [prevalence, setPrevalence] = useState(0.01), [sens, setSens] = useState(0.95), [spec, setSpec] = useState(0.9);
  const tp = prevalence * sens, fn = prevalence * (1 - sens), fp = (1 - prevalence) * (1 - spec), tn = (1 - prevalence) * spec;
  const posTotal = tp + fp, ppv = posTotal ? tp / posTotal : 0, negTotal = fn + tn, npv = negTotal ? tn / negTotal : 0;
  return <LabShell title="Reverse a diagnostic test with Bayes' theorem" goal="Move the sliders and watch how the base rate (prevalence) changes what a positive result really means.">
    <div className="u1-lab-grid"><div className="u1-controls">
      <MiniRange label="prevalence P(disease)" value={prevalence} min={0.001} max={0.5} step={0.001} onChange={setPrevalence} />
      <MiniRange label="sensitivity P(+|disease)" value={sens} min={0.5} max={0.999} step={0.001} onChange={setSens} />
      <MiniRange label="specificity P(−|healthy)" value={spec} min={0.5} max={0.999} step={0.001} onChange={setSpec} />
      <div className="u1-equation-stack"><span>PPV = P(disease|+) = TP / (TP+FP)</span><span>= {f(tp * 1000, 1)} / ({f(tp * 1000, 1)} + {f(fp * 1000, 1)}) = <b>{f(ppv * 100, 1)}%</b></span></div>
      <div className="u1-stats"><Stat label="Positive predictive value" value={`${f(ppv * 100, 1)}%`} good={ppv > 0.5} /><Stat label="Negative predictive value" value={`${f(npv * 100, 2)}%`} /></div>
    </div>
      <div className="u1-visual" style={{ padding: "10px 6px" }}>
        <div className="u1-flow-strip"><span><b>1,000 people</b>prevalence {f(prevalence * 100, 1)}%</span><ArrowRight /><span><b>{f(prevalence * 1000, 0)} have it</b>{f((1 - prevalence) * 1000, 0)} don't</span></div>
        <div className="u1-calc-table"><div><b>Group</b><b>Test +</b><b>Test −</b><b>Total</b><b>% of positives</b></div>
          <div><span>Disease</span><span>{f(tp * 1000, 1)}</span><span>{f(fn * 1000, 1)}</span><span>{f(prevalence * 1000, 1)}</span><span>{f((tp / (posTotal || 1)) * 100, 1)}%</span></div>
          <div><span>No disease</span><span>{f(fp * 1000, 1)}</span><span>{f(tn * 1000, 1)}</span><span>{f((1 - prevalence) * 1000, 1)}</span><span>{f((fp / (posTotal || 1)) * 100, 1)}%</span></div>
          <footer><b>Total positive</b><strong>{f(posTotal * 1000, 1)}</strong></footer>
        </div>
      </div></div>
    <div className={`u1-observation ${ppv < 0.5 ? "warn" : ""}`}><Stethoscope /><p><b>{ppv < 0.5 ? "Base-rate trap:" : "Reliable positive:"}</b> {ppv < 0.5 ? `because disease is rare, most of the ${f(posTotal * 1000, 0)} positive results come from the enormous healthy group's false positives — only ${f(ppv * 100, 1)}% of positives truly have the disease.` : `at this prevalence, a positive result is right ${f(ppv * 100, 1)}% of the time.`}</p></div>
  </LabShell>;
}

function ExpectationLab() {
  const [payouts, setPayouts] = useState([1, 2, 3, 4, 5, 6]);
  const [loaded, setLoaded] = useState(false);
  const probs = loaded ? [0.1, 0.1, 0.1, 0.1, 0.1, 0.5] : [1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6];
  const mean = payouts.reduce((s, x, i) => s + x * probs[i], 0);
  const variance = payouts.reduce((s, x, i) => s + probs[i] * (x - mean) ** 2, 0), sd = Math.sqrt(variance);
  const setPayout = (i: number, v: number) => setPayouts(p => p.map((x, j) => j === i ? v : x));
  const maxAbs = Math.max(1, ...payouts.map(Math.abs)), barH = (v: number) => 12 + (Math.abs(v) / maxAbs) * 130;
  return <LabShell title="Weigh outcomes by their probability" goal="Edit the payout for each face of a die, then watch expectation and variance respond to both the values and the probabilities.">
    <div className="u1-presets"><button className={!loaded ? "active" : ""} onClick={() => setLoaded(false)}>Fair die (uniform)</button><button className={loaded ? "active" : ""} onClick={() => setLoaded(true)}>Loaded die (favours 6)</button></div>
    <div className="u1-lab-grid"><div className="u1-controls">
      <div className="u1-control-pair">{payouts.map((v, i) => <NumberBox key={i} label={`payout for face ${i + 1}`} value={v} onChange={n => setPayout(i, n)} step="1" />)}</div>
      <div className="u1-stats"><Stat label="E[X]" value={f(mean)} good /><Stat label="Var(X)" value={f(variance)} /><Stat label="SD(X)" value={f(sd)} /></div>
    </div>
      <div className="u1-visual" style={{ padding: "10px" }}><svg viewBox="0 0 380 180" width="100%" height="180">
        <line x1="20" y1="150" x2="360" y2="150" className="axis" />
        {payouts.map((v, i) => <g key={i}><rect x={30 + i * 55} y={150 - barH(v)} width="34" height={barH(v)} className="bar" /><text x={30 + i * 55 + 17} y="164" textAnchor="middle" fontSize="10" fill="#7a8496">face {i + 1}</text><text x={30 + i * 55 + 17} y={150 - barH(v) - 6} textAnchor="middle" fontSize="10" fill="#4b2dcc">{v}</text></g>)}
        <line x1="20" y1={150 - (mean / maxAbs) * 130} x2="360" y2={150 - (mean / maxAbs) * 130} stroke="#ec5d67" strokeWidth="2" strokeDasharray="6" />
        <text x="365" y={150 - (mean / maxAbs) * 130 + 4} fontSize="10" fill="#ec5d67">E[X]</text>
      </svg></div></div>
    <div className="u1-observation"><Sigma /><p><b>Reading the shape:</b> {loaded ? "shifting probability toward face 6 pulls the expectation upward even if the payout numbers stay the same." : "with uniform probabilities, expectation is just the plain average of the payouts."} Variance grows when payouts are spread far from E[X], regardless of which outcome is most likely.</p></div>
  </LabShell>;
}

function MultiplicationRuleLab() {
  const [total, setTotal] = useState(52), [matching, setMatching] = useState(4), [draws, setDraws] = useState(2);
  const steps: { label: string; p: number }[] = [];
  let remainingTotal = total, remainingMatch = matching, product = 1;
  for (let i = 0; i < draws; i++) {
    const p = remainingTotal > 0 ? remainingMatch / remainingTotal : 0;
    steps.push({ label: i === 0 ? `P(draw ${i + 1} matches)` : `P(draw ${i + 1} matches | previous ${i} matched)`, p });
    product *= p;
    remainingTotal -= 1; remainingMatch -= 1;
  }
  const independentProduct = Math.pow(total ? matching / total : 0, draws);
  return <LabShell title="Chain conditional steps with the multiplication rule" goal="Draw items without replacement and watch each step's probability shrink the pool for the next draw.">
    <div className="u1-lab-grid"><div className="u1-controls">
      <div className="u1-control-pair"><NumberBox label="total items" value={total} onChange={setTotal} step="1" /><NumberBox label="matching items" value={matching} onChange={setMatching} step="1" /></div>
      <div className="u1-presets"><button className={draws === 2 ? "active" : ""} onClick={() => setDraws(2)}>2 draws</button><button className={draws === 3 ? "active" : ""} onClick={() => setDraws(3)}>3 draws</button></div>
      <div className="u1-equation-stack">
        {steps.map((s, i) => <span key={i}>{s.label} = {f(s.p, 4)}</span>)}
        <span>Product = {steps.map(s => f(s.p, 3)).join(" × ")} = <b>{f(product, 4)}</b></span>
      </div>
      <div className="u1-stats"><Stat label="P(all match), without replacement" value={f(product, 4)} good /><Stat label="If independent (with replacement)" value={f(independentProduct, 4)} /></div>
    </div>
      <div className="u1-visual"><svg viewBox="0 0 380 160" width="100%" height="160">
        {steps.map((s, i) => <g key={i}>
          <rect x={20 + i * 125} y="40" width="100" height="60" rx="10" fill={i === 0 ? "#6d4aff" : "#ec5d67"} opacity={0.85} />
          <text x={70 + i * 125} y="65" textAnchor="middle" fontSize="11" fill="#fff">draw {i + 1}</text>
          <text x={70 + i * 125} y="83" textAnchor="middle" fontSize="12" fill="#fff">{f(s.p, 3)}</text>
          {i < steps.length - 1 && <text x={128 + i * 125} y="76" fontSize="16" fill="#7a8496">×</text>}
        </g>)}
      </svg></div></div>
    <div className="u1-observation"><GitMerge /><p><b>Chain rule:</b> each draw's probability is conditioned on every draw that came before it — removing a matching item shrinks both the pool and the matching count, so probabilities compound faster than independent draws would.</p></div>
  </LabShell>;
}

function TotalProbabilityLab() {
  const [shares, setShares] = useState([0.5, 0.3, 0.2]);
  const [rates, setRates] = useState([0.02, 0.03, 0.05]);
  const setShare = (i: number, v: number) => setShares(s => s.map((x, j) => j === i ? v : x));
  const setRate = (i: number, v: number) => setRates(s => s.map((x, j) => j === i ? v : x));
  const shareSum = shares.reduce((a, b) => a + b, 0);
  const contributions = shares.map((share, i) => share * rates[i]);
  const overall = contributions.reduce((a, b) => a + b, 0);
  const maxContribution = Math.max(0.001, ...contributions);
  const labels = ["Machine A", "Machine B", "Machine C"];
  return <LabShell title="Average over every pathway with the law of total probability" goal="Edit each pathway's share of production and its own defect rate, and watch the overall defect rate blend all three.">
    <div className="u1-lab-grid"><div className="u1-controls">
      {labels.map((lab, i) => <div key={i} className="u1-control-pair"><NumberBox label={`${lab} share`} value={shares[i]} onChange={v => setShare(i, v)} step="0.01" /><NumberBox label={`${lab} defect rate`} value={rates[i]} onChange={v => setRate(i, v)} step="0.001" /></div>)}
      <div className={`u1-observation ${Math.abs(shareSum - 1) > 0.01 ? "warn" : ""}`}><PieChart /><p>Shares sum to <b>{f(shareSum, 2)}</b>{Math.abs(shareSum - 1) > 0.01 ? " — a partition must sum to exactly 1." : " — a valid partition."}</p></div>
      <div className="u1-stats">{labels.map((lab, i) => <Stat key={i} label={`${lab}: share × rate`} value={f(contributions[i], 4)} />)}<Stat label="Overall P(defect)" value={f(overall, 4)} good /></div>
    </div>
      <div className="u1-visual"><svg viewBox="0 0 380 180" width="100%" height="180">
        <line x1="20" y1="150" x2="360" y2="150" className="axis" />
        {contributions.map((v, i) => <g key={i}><rect x={40 + i * 110} y={150 - (v / maxContribution) * 120} width="70" height={(v / maxContribution) * 120} className="bar" /><text x={75 + i * 110} y="164" textAnchor="middle" fontSize="10" fill="#7a8496">{labels[i]}</text><text x={75 + i * 110} y={150 - (v / maxContribution) * 120 - 6} textAnchor="middle" fontSize="10" fill="#4b2dcc">{f(v, 3)}</text></g>)}
        <line x1="20" y1={150 - (overall / maxContribution) * 120} x2="360" y2={150 - (overall / maxContribution) * 120} stroke="#ec5d67" strokeWidth="2" strokeDasharray="6" />
        <text x="365" y={150 - (overall / maxContribution) * 120 + 4} fontSize="10" fill="#ec5d67">total</text>
      </svg></div></div>
    <div className="u1-observation"><Sigma /><p><b>Weighted blend:</b> the overall probability isn't a plain average of the three rates — it's weighted by how much each pathway contributes to the whole, exactly like Bayes' theorem's denominator P(E).</p></div>
  </LabShell>;
}

function ChapterLab({ id }: { id: string }) {
  if (id === "sample-space") return <DiceGridLab mode="single" />;
  if (id === "prob-rules") return <DiceGridLab mode="rules" />;
  if (id === "conditional") return <ConditionalLab />;
  if (id === "independence") return <ConditionalLab independenceFocus />;
  if (id === "multiplication-rule") return <MultiplicationRuleLab />;
  if (id === "total-probability") return <TotalProbabilityLab />;
  if (id === "bayes") return <BayesLab />;
  return <ExpectationLab />;
}

const misconceptions = [
  { s: "P(A or B) always equals P(A) + P(B).", truth: false, why: "That only holds when A and B are mutually exclusive; otherwise you must subtract P(A∩B) to avoid double-counting." },
  { s: "Independent events can never happen at the same time.", truth: false, why: "Independence is about probability, not overlap — independent events can absolutely occur together; that's a separate idea from mutually exclusive." },
  { s: "A highly accurate test on a rare condition still gives a trustworthy positive result.", truth: false, why: "With a low base rate, false positives from the large unaffected group can outnumber true positives — this is the base-rate fallacy Bayes' theorem corrects for." },
  { s: "P(A|B) is generally the same number as P(B|A).", truth: false, why: "Confusing the two is called 'the confusion of the inverse' — Bayes' theorem exists precisely to convert one into the other correctly." },
  { s: "Expectation is the value you should expect on any single trial.", truth: false, why: "E[X] is a long-run average across many repetitions and may not even be a value the variable can actually take, like 3.5 on a die." },
  { s: "If P(A)=0.5 and P(B)=0.5, A and B must be independent.", truth: false, why: "Independence requires P(A∩B)=P(A)P(B) exactly — two events can each have probability 0.5 while being strongly dependent." },
  { s: "The multiplication rule P(A∩B)=P(A)·P(B|A) only works when A and B are independent.", truth: false, why: "It holds for any two events — for independent events P(B|A) just simplifies to the plain P(B), but the rule itself is completely general." },
  { s: "The law of total probability requires each pathway to be equally likely.", truth: false, why: "The pathways only need to be mutually exclusive and cover every possibility — their shares can be any values at all, as long as they sum to 1." },
  { s: "Variance can never be negative.", truth: true, why: "Variance sums squared deviations from the mean, and squares are never negative, so variance is always ≥ 0." },
  { s: "Bayes' theorem is a tool specific to medical testing.", truth: false, why: "It is a general rule for updating any prior belief with new evidence — spam filters, search ranking and A/B testing all use it." },
  { s: "Adding more possible outcomes to a sample space always lowers the probability of a specific event.", truth: false, why: "It depends entirely on how many of the new outcomes fall inside the event — probability is about the event's share of the space, not the space's size alone." },
];

const quiz = [
  { q: "Rolling one die, what is the sample space?", o: ["{1,2,3,4,5,6}", "{heads, tails}", "{1,...,36}"], a: 0 },
  { q: "P(A∪B) = P(A)+P(B)−P(A∩B) corrects for…", o: ["Rounding error", "Double-counting the overlap", "Events being independent"], a: 1 },
  { q: "Conditional probability P(A|B) restricts attention to…", o: ["Only outcomes where B happened", "The entire original sample space", "Only outcomes where A happened"], a: 0 },
  { q: "Two events are independent exactly when…", o: ["P(A∩B) = P(A)·P(B)", "P(A) = P(B)", "They cannot occur together"], a: 0 },
  { q: "The multiplication rule P(A∩B) = P(A)·P(B|A) is also known as…", o: ["The chain rule of probability", "The addition rule", "Bayes' theorem"], a: 0 },
  { q: "The law of total probability requires the pathway groups to be…", o: ["A partition: mutually exclusive and covering everything", "All exactly equally likely", "Independent of event B"], a: 0 },
  { q: "Bayes' theorem converts…", o: ["P(evidence|cause) into P(cause|evidence)", "A mean into a variance", "A sample space into an event"], a: 0 },
  { q: "In a rare-disease test, why can PPV be low even with 95% sensitivity?", o: ["The test is always wrong", "False positives from the large healthy group can dominate", "Specificity does not matter"], a: 1 },
  { q: "E[X] for a random variable is…", o: ["The probability-weighted average outcome", "Always the most likely single outcome", "Always zero"], a: 0 },
  { q: "Variance measures…", o: ["How spread out outcomes are around the mean", "The number of outcomes", "The most likely outcome"], a: 0 },
  { q: "P(Aᶜ), the complement rule, equals…", o: ["1 − P(A)", "P(A) − 1", "P(A) × P(A)"], a: 0 },
  { q: "A naive Bayes classifier assumes features are…", o: ["Perfectly correlated", "Conditionally independent given the class", "Always normally distributed"], a: 1 },
];

export default function Unit2Studio() {
  return <StudioShell
    unitKey="unit2"
    eyebrow="UNIT 2 · COMPLETE LEARNING STUDIO"
    heading={<>Probability and Bayes' theorem you can <em>see and test</em></>}
    description="Move from counting outcomes to reversing conditional probabilities through eight connected topics. Every topic follows meaning → tiny numbers → visual experiment → ML use."
    objectives={["Count outcomes in a sample space", "Combine and condition events correctly", "Detect independence from real data", "Chain conditional steps and average over pathways", "Reverse conditionals with Bayes' theorem"]}
    chapters={chapters}
    missions={missions}
    pythonByChapter={pythonByChapter}
    renderLab={id => <ChapterLab id={id} />}
    summarySentence="Sample spaces define what can happen → probability rules combine events without double-counting → conditioning updates beliefs with evidence → Bayes' theorem reverses that conditioning → expectation and variance summarise a random variable in two numbers."
    misconceptions={misconceptions}
    quiz={quiz}
    quizTitle="Can you connect the whole unit?"
    quizSubtitle="Ten questions test meaning — not memorised notation."
  />;
}
