import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Axis3D,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Code2,
  Cpu,
  Equal,
  Eye,
  Focus,
  FunctionSquare,
  Gauge,
  Grid3X3,
  Layers3,
  Lightbulb,
  LineChart,
  LockKeyhole,
  Minus,
  MoveUpRight,
  Network,
  Play,
  Plus,
  RotateCcw,
  Sigma,
  Sparkles,
  Target,
  Triangle,
  VectorSquare,
  WandSparkles,
} from "lucide-react";

type Chapter = {
  id: string;
  number: string;
  title: string;
  short: string;
  icon: typeof VectorSquare;
  meaning: string;
  example: string;
  formula: string;
  ml: string;
  check: { q: string; options: string[]; answer: number; why: string };
};

const chapters: Chapter[] = [
  {
    id: "vectors",
    number: "1.1",
    title: "Vectors: numbers with direction",
    short: "Vectors",
    icon: MoveUpRight,
    meaning: "A vector is an ordered list of numbers. In 2D it can mean a movement; in machine learning it can hold the features of one observation.",
    example: "A student described by [study hours, attendance] = [3, 4] is a two-feature vector. Its length is √(3²+4²)=5.",
    formula: "Length (magnitude): ‖v‖ = √(v₁² + v₂²)   •   Unit vector: v̂ = v / ‖v‖",
    ml: "Every row of a machine-learning dataset is commonly treated as a feature vector; its magnitude is often used directly, for example as an embedding's confidence or an L2-regularisation penalty.",
    check: { q: "What does the vector [3, 4] contain?", options: ["One feature", "Two ordered features", "A 3×4 matrix"], answer: 1, why: "A vector stores ordered components—in this case, two." },
  },
  {
    id: "vector-addition",
    number: "1.2",
    title: "Vector addition: combining two movements",
    short: "Vector addition",
    icon: Plus,
    meaning: "Adding two vectors combines their components one-by-one, and geometrically it means placing the second vector's tail at the first vector's tip — the sum is the straight arrow from the very start to the very end.",
    example: "A delivery walks [3,1] then [1,2] more blocks. The combined trip is [3,1]+[1,2]=[4,3] — the direct route from start to finish, even though the walker took two separate legs.",
    formula: "u + v = [u₁+v₁, u₂+v₂]   •   commutative: u+v = v+u",
    ml: "Averaging embeddings, accumulating gradient updates during training, and combining word vectors ('king' direction + 'royal' direction) are all repeated vector additions.",
    check: { q: "Geometrically, u+v is drawn by…", options: ["Placing v's tail at u's tip, then connecting start to end", "Rotating u by v's angle", "Multiplying every component"], answer: 0, why: "This 'tip-to-tail' placement is exactly what component-wise addition produces geometrically." },
  },
  {
    id: "vector-subtraction",
    number: "1.3",
    title: "Vector subtraction: the gap between two points",
    short: "Vector subtraction",
    icon: Minus,
    meaning: "Subtracting two vectors gives the vector that connects their tips — u−v is 'how do I get from v to u?'. Its length is the straight-line distance between the two points.",
    example: "Two students score [72,3] and [65,5] on [test score, hours studied]. Their difference [72,3]−[65,5]=[7,−2] describes exactly how the first student differs from the second.",
    formula: "u − v = [u₁−v₁, u₂−v₂]   •   distance(u,v) = ‖u−v‖   •   NOT commutative: u−v = −(v−u)",
    ml: "Distance between two feature vectors — used constantly in k-nearest neighbours, k-means clustering and anomaly detection — is just the magnitude of their difference; residuals in regression are also a subtraction of predicted from actual.",
    check: { q: "The distance between two points u and v equals…", options: ["‖u−v‖, the magnitude of their difference", "u+v", "The angle between them"], answer: 0, why: "Subtracting the vectors gives the connecting vector; its length is the straight-line distance." },
  },
  {
    id: "cross-product",
    number: "1.4",
    title: "Cross product: a vector perpendicular to two others",
    short: "Cross product",
    icon: Axis3D,
    meaning: "The cross product takes two 3D vectors and produces a third vector perpendicular to both, following the right-hand rule. Its length equals the area of the parallelogram the two original vectors span.",
    example: "For a=[1,0,0] and b=[0,1,0] (pointing along x and y), a×b=[0,0,1] — a vector pointing straight up along z, perpendicular to the flat xy-plane both a and b lie in.",
    formula: "a×b = [a₂b₃−a₃b₂, a₃b₁−a₁b₃, a₁b₂−a₂b₁]   •   ‖a×b‖ = ‖a‖‖b‖sinθ   •   anticommutative: a×b = −(b×a)",
    ml: "Less common in flat tabular ML, but essential wherever 3D geometry matters: computing surface normals for 3D point-cloud and mesh models, torque and angular velocity in robotics/reinforcement-learning control, and camera/pose geometry in computer vision.",
    check: { q: "The cross product a×b is perpendicular to…", options: ["Only a", "Only b", "Both a and b"], answer: 2, why: "That's its defining property — a×b points in the one direction perpendicular to the plane containing both a and b." },
  },
  {
    id: "span",
    number: "1.5",
    title: "Linear combinations, span and independence",
    short: "Span & independence",
    icon: Triangle,
    meaning: "A linear combination scales vectors and adds them. The span is every point those combinations can reach.",
    example: "[1,0] and [0,1] can reach every 2D point: 3[1,0]+2[0,1]=[3,2]. Parallel vectors can reach only one line.",
    formula: "w = c₁v₁ + c₂v₂   •   In 2D, det([v₁ v₂]) ≠ 0 means independent",
    ml: "Redundant features point in the same information direction and can make estimation unstable.",
    check: { q: "If v₂ = 2v₁, are the vectors independent?", options: ["Yes", "No", "Only if both are long"], answer: 1, why: "One vector is made entirely from the other, so it adds no new direction." },
  },
  {
    id: "dot",
    number: "1.6",
    title: "Dot product, angle and projection",
    short: "Dot & projection",
    icon: Focus,
    meaning: "The dot product measures directional agreement. Projection asks: how much of one vector lies along another?",
    example: "[2,1]·[1,0] = 2. The projection onto the horizontal direction keeps [2,0] and removes the vertical part.",
    formula: "u·v = u₁v₁+u₂v₂   •   projᵥ(u) = (u·v / v·v)v",
    ml: "Similarity search, attention, recommendation systems and least squares all use dot products.",
    check: { q: "If u·v = 0, the vectors are…", options: ["Parallel", "Perpendicular", "Identical"], answer: 1, why: "A zero dot product means a 90° angle for non-zero vectors." },
  },
  {
    id: "basis",
    number: "1.7",
    title: "Basis and coordinates: a new language for the same point",
    short: "Basis coordinates",
    icon: VectorSquare,
    meaning: "A basis is a set of independent directions used to describe every vector in a space. Coordinates change when the basis changes, but the actual point does not.",
    example: "Using basis v₁=[1,1], v₂=[1,−1], the point [4,2] has coordinates [3,1] because 3v₁+1v₂=[4,2].",
    formula: "x = c₁v₁+c₂v₂ = Bc   •   basis coordinates c=B⁻¹x",
    ml: "PCA changes basis so the first new coordinate captures the greatest variance in the data.",
    check: { q: "When the basis changes, what stays unchanged?", options: ["The coordinate numbers", "The actual vector", "The basis vectors"], answer: 1, why: "Coordinates are a description; the geometric vector is the same object." },
  },
  {
    id: "transform",
    number: "1.8",
    title: "Matrices as space-transforming machines",
    short: "Transformations",
    icon: Grid3X3,
    meaning: "A matrix transforms every input vector using one consistent rule: rotate, stretch, reflect, shear or squash.",
    example: "A=[[2,0],[0,1]] sends [1,1] to [2,1]. Horizontal distance doubles while vertical distance stays unchanged.",
    formula: "y = Ax   •   [y₁,y₂]ᵀ = [[a,b],[c,d]][x₁,x₂]ᵀ",
    ml: "A neural-network layer first performs a matrix transformation, then usually applies a nonlinear activation.",
    check: { q: "What does a 2×2 matrix accept in this lesson?", options: ["A 2D vector", "Only one number", "A paragraph"], answer: 0, why: "Its two columns match the two components of a 2D input vector." },
  },
  {
    id: "multiply",
    number: "1.9",
    title: "Matrix multiplication and composition",
    short: "Matrix multiplication",
    icon: Network,
    meaning: "Multiplying matrices combines transformations. In BAx, transformation A happens first and transformation B happens second.",
    example: "Rotate then stretch is usually different from stretch then rotate. Matrix multiplication therefore does not generally commute: AB≠BA.",
    formula: "(AB)ᵢⱼ = row i of A · column j of B   •   BAx means A first, then B",
    ml: "Deep networks compose many matrix operations; the output of one layer becomes the input of the next.",
    check: { q: "In BAx, which matrix acts on x first?", options: ["A", "B", "Both simultaneously"], answer: 0, why: "Operations are evaluated from right to left: first Ax, then B(Ax)." },
  },
  {
    id: "determinant",
    number: "1.10",
    title: "Determinant, inverse and information loss",
    short: "Determinant & inverse",
    icon: LockKeyhole,
    meaning: "The determinant tells how area changes. Zero means the transformation crushes 2D space into a line or point, losing information.",
    example: "det([[2,0],[0,3]])=6, so a unit square becomes area 6. If det(A)=0, A⁻¹ does not exist.",
    formula: "det(A)=ad−bc   •   A⁻¹ = (1/det A)[[d,−b],[−c,a]]",
    ml: "Singular or near-singular feature matrices make coefficients hard to identify and sensitive to noise.",
    check: { q: "If det(A)=0, what is definitely true?", options: ["A has no inverse", "A doubles area", "A is the identity"], answer: 0, why: "A zero determinant means information was collapsed, so the transformation cannot be uniquely undone." },
  },
  {
    id: "systems",
    number: "1.11",
    title: "Linear systems: where constraints meet",
    short: "Linear systems",
    icon: Equal,
    meaning: "A linear system asks for values that satisfy several equations at the same time. Geometrically, a 2×2 system asks where two lines meet.",
    example: "x+y=5 and x−y=1 meet at x=3, y=2. The same answer is written Ax=b.",
    formula: "Ax=b   •   If A is invertible: x=A⁻¹b   •   In practice: solve(A,b)",
    ml: "Calibration, optimisation, circuit analysis and many fitting algorithms reduce to solving linear systems.",
    check: { q: "Two different parallel lines have how many exact solutions?", options: ["One", "None", "Infinitely many"], answer: 1, why: "Parallel lines never meet, so no point satisfies both equations." },
  },
  {
    id: "rank",
    number: "1.12",
    title: "Rank, column space and null space",
    short: "Rank & subspaces",
    icon: Layers3,
    meaning: "Rank counts independent information directions. The null space contains inputs that the matrix sends to zero.",
    example: "[[1,2],[2,4]] has rank 1 because row 2 is twice row 1. Vector [−2,1] is in its null space.",
    formula: "rank(A) = number of independent rows/columns   •   Null(A)={x: Ax=0}",
    ml: "Rank reveals redundant features; low-rank methods compress data and expose latent structure.",
    check: { q: "Does full rank prove every feature is useful for prediction?", options: ["Yes", "No"], answer: 1, why: "Full rank only proves algebraic independence—not predictive relevance, fairness or stability." },
  },
  {
    id: "orthogonal",
    number: "1.13",
    title: "Gram–Schmidt: build clean perpendicular directions",
    short: "Orthogonalisation",
    icon: Target,
    meaning: "Gram–Schmidt removes from one vector the part already explained by another, leaving a perpendicular direction.",
    example: "From v₁=[2,0], v₂=[1,2], subtract projᵥ₁(v₂)=[1,0]. The remainder [0,2] is perpendicular to v₁.",
    formula: "u₁=v₁   •   u₂=v₂−projᵤ₁(v₂)   •   qᵢ=uᵢ/‖uᵢ‖",
    ml: "Orthogonal features separate directions of variation and simplify projection, QR decomposition and least squares.",
    check: { q: "What does Gram–Schmidt subtract from v₂?", options: ["All of v₁", "The projection of v₂ onto v₁", "The determinant"], answer: 1, why: "It removes only the component already pointing along the first direction." },
  },
  {
    id: "conditioning",
    number: "1.14",
    title: "Conditioning: when tiny input noise becomes a large error",
    short: "Numerical stability",
    icon: Gauge,
    meaning: "A matrix can be invertible yet dangerously close to singular. Then tiny measurement changes can cause large changes in the solution.",
    example: "Two almost-parallel equations appear to meet, but a small change in b can move their intersection a long distance.",
    formula: "condition number κ(A)=σmax/σmin   •   large κ means sensitive and unstable",
    ml: "Highly correlated features can produce unstable regression coefficients even when predictions appear acceptable.",
    check: { q: "A very large condition number warns about…", options: ["Numerical sensitivity", "Perfect independence", "More observations"], answer: 0, why: "The solution may amplify small noise or rounding error." },
  },
  {
    id: "eigen",
    number: "1.15",
    title: "Eigenvectors: directions that do not turn",
    short: "Eigenvectors",
    icon: Gauge,
    meaning: "Most vectors change both length and direction under a matrix. An eigenvector keeps its direction and is only scaled.",
    example: "For diag(3,1), [1,0] is scaled by 3 and [0,1] by 1. Those axes are eigenvectors.",
    formula: "Av=λv   •   λ is the eigenvalue; v is its eigenvector",
    ml: "PCA uses eigenvectors of a covariance matrix to find directions containing the most variation.",
    check: { q: "An eigenvector transformed by A…", options: ["Must become zero", "Keeps its direction", "Always rotates 90°"], answer: 1, why: "It may flip or change length, but remains on the same line." },
  },
  {
    id: "least-squares",
    number: "1.16",
    title: "Least squares and the best imperfect answer",
    short: "Least squares",
    icon: LineChart,
    meaning: "When no line passes through every observation, least squares chooses the line with the smallest total squared vertical error.",
    example: "For imperfect points, residual eᵢ=yᵢ−ŷᵢ. Squaring prevents positive and negative errors cancelling.",
    formula: "SSE=Σ(yᵢ−ŷᵢ)²   •   β̂=(XᵀX)⁻¹Xᵀy   •   safer: lstsq(X,y)",
    ml: "Ordinary linear regression is a least-squares problem; the design matrix stores all observations and features.",
    check: { q: "Why square residuals?", options: ["To cancel them", "To penalise error and keep values non-negative", "To remove all noise"], answer: 1, why: "Squared errors cannot cancel and larger misses receive more penalty." },
  },
  {
    id: "gradient",
    number: "1.17",
    title: "Gradient descent: walk downhill to the best line",
    short: "Gradient descent",
    icon: LineChart,
    meaning: "Instead of solving least squares in one formula, gradient descent repeatedly moves parameters in the direction that reduces error.",
    example: "If the slope is too small, the SSE gradient points toward a larger slope. A learning rate controls the size of each step.",
    formula: "m ← m−α(∂SSE/∂m)   •   b ← b−α(∂SSE/∂b)",
    ml: "Neural networks learn millions of weights using gradient-based optimisation rather than a direct matrix inverse.",
    check: { q: "What does the learning rate control?", options: ["Step size", "Number of features", "Matrix rank"], answer: 0, why: "Too small is slow; too large can overshoot the minimum." },
  },
  {
    id: "ml-bridge",
    number: "1.18",
    title: "The bridge to machine learning",
    short: "Matrix regression & layers",
    icon: BrainCircuit,
    meaning: "Machine learning repeatedly combines input vectors, weight matrices and outputs. Linear algebra is the language connecting them.",
    example: "For x=[hours, attendance], a model computes score=w·x+b. For many students together, it becomes ŷ=Xβ.",
    formula: "One case: ŷ=wᵀx+b   •   Many cases: ŷ=Xβ   •   Layer: H=activation(XW+b)",
    ml: "This same pattern appears in regression, embeddings, attention layers and deep neural networks.",
    check: { q: "In ŷ=Xβ, what does each row of X represent?", options: ["One observation", "One model", "One target only"], answer: 0, why: "Rows are observations; columns are input features." },
  },
];

const missions: Record<string, string[]> = {
  vectors: ["Make v₁ have length exactly 5.", "Create two perpendicular vectors (dot product = 0).", "Make v₁+v₂ equal [3,3]."],
  "vector-addition": ["Make u+v equal exactly [4,3].", "Find two different pairs of u,v that both sum to [5,0].", "Confirm u+v equals v+u by swapping the sliders."],
  "vector-subtraction": ["Make the distance ‖u−v‖ exactly 5.", "Move u and v so they become equal — confirm the distance drops to 0.", "Swap u and v and confirm u−v flips sign but keeps the same length."],
  "cross-product": ["Make a and b both lie flat in the xy-plane and confirm a×b points purely along z.", "Make a and b parallel and confirm a×b becomes the zero vector.", "Swap a and b and confirm a×b flips direction (anticommutativity)."],
  span: ["Create two independent vectors with determinant 1.", "Collapse the parallelogram by making the vectors parallel.", "Use c₁ and c₂ to reach the point [3,2]."],
  dot: ["Project u=[3,2] onto the horizontal axis.", "Choose u and v so the projection equals u.", "Make the remainder·v equal zero and explain why."],
  basis: ["Express [4,2] using basis [1,1] and [1,−1].", "Change the basis without moving the target point.", "Make the basis singular and explain why coordinates stop being unique."],
  transform: ["Rotate the unit square by 90°.", "Create a shear without changing area.", "Find a matrix that reflects the square."],
  multiply: ["Apply rotation then stretch and record the output.", "Reverse the order and compare the result.", "Find two matrices for which AB=BA."],
  determinant: ["Make area scale equal 6.", "Create a negative determinant and observe the flip.", "Set determinant to zero and explain the information loss."],
  systems: ["Produce the solution [3,2].", "Create different parallel equations with no solution.", "Create two equations representing the same line."],
  rank: ["Construct a rank-2 matrix.", "Make row 2 exactly three times row 1.", "Use the displayed null vector to verify Av=0."],
  orthogonal: ["Start with two non-perpendicular vectors.", "Use Gram–Schmidt and verify q₁·q₂=0.", "Make the original vectors parallel and observe the failure."],
  conditioning: ["Set ε=1 and compare both solutions.", "Move ε close to zero and add tiny noise.", "Explain why full rank alone does not guarantee stability."],
  eigen: ["Start with diagonal matrix diag(3,1).", "Increase k until the green vector nearly matches the eigen-line.", "Create equal eigenvalues and observe the loss of one dominant direction."],
  "least-squares": ["Beat SSE=2 using the sliders.", "Reveal the best fit and verify its SSE.", "Switch to perfect data and obtain SSE=0."],
  gradient: ["Take one gradient step and observe SSE.", "Compare learning rates 0.001 and 0.02.", "Find a learning rate that overshoots or becomes unstable."],
  "ml-bridge": ["Make Student 1's prediction equal 5.", "Set one feature weight to zero and interpret it.", "Use a negative weight and explain its effect on predictions."],
};

const pythonByChapter: Record<string, { code: string; output: string }> = {
  vectors: { code: "v = np.array([3, 4])\nprint(np.linalg.norm(v))\nprint(v / np.linalg.norm(v))", output: "5.0\n[0.6 0.8]" },
  "vector-addition": { code: "u = np.array([3, 1])\nv = np.array([1, 2])\nprint(u + v)\nprint(np.array_equal(u + v, v + u))", output: "[4 3]\nTrue" },
  "vector-subtraction": { code: "a = np.array([72, 3])\nb = np.array([65, 5])\ndiff = a - b\nprint(diff)\nprint(np.linalg.norm(diff))", output: "[7 -2]\n7.280109889280518" },
  "cross-product": { code: "a = np.array([1, 0, 0])\nb = np.array([0, 1, 0])\nc = np.cross(a, b)\nprint(c)\nprint(np.dot(c, a), np.dot(c, b))", output: "[0 0 1]\n0 0" },
  span: { code: "V = np.column_stack(([2, 1], [1, 2]))\nprint(np.linalg.det(V))\nprint(np.linalg.matrix_rank(V))", output: "3.0\n2" },
  dot: { code: "u = np.array([3., 2.])\nv = np.array([2., 0.])\nprojection = (u @ v) / (v @ v) * v\nprint(projection)", output: "[3. 0.]" },
  basis: { code: "B = np.array([[1, 1], [1, -1]])\nx = np.array([4, 2])\ncoordinates = np.linalg.solve(B, x)\nprint(coordinates)", output: "[3. 1.]" },
  transform: { code: "A = np.array([[1, 1], [0, 1]])\nx = np.array([1, 2])\nprint(A @ x)", output: "[3 2]" },
  multiply: { code: "R = np.array([[0, -1], [1, 0]])\nS = np.array([[2, 0], [0, 1]])\nx = np.array([1, 1])\nprint(S @ R @ x)\nprint(R @ S @ x)", output: "[-2  1]\n[-1  2]" },
  determinant: { code: "A = np.array([[2, 0], [0, 3]])\nprint(np.linalg.det(A))\nprint(np.linalg.inv(A))", output: "6.0\n[[0.5   0.   ]\n [0.    0.333]]" },
  systems: { code: "A = np.array([[1, 1], [1, -1]])\nb = np.array([5, 1])\nx = np.linalg.solve(A, b)\nprint(x)", output: "[3. 2.]" },
  rank: { code: "A = np.array([[1, 2], [2, 4]])\nprint(np.linalg.matrix_rank(A))\nprint(A @ np.array([-2, 1]))", output: "1\n[0 0]" },
  orthogonal: { code: "v1 = np.array([2., 0.])\nv2 = np.array([1., 2.])\nu2 = v2 - (v2@v1)/(v1@v1)*v1\nq1, q2 = v1/np.linalg.norm(v1), u2/np.linalg.norm(u2)\nprint(q1 @ q2)", output: "0.0" },
  conditioning: { code: "A = np.array([[1., 1.], [1., 1.001]])\nprint(np.linalg.cond(A))\nprint(np.linalg.solve(A, [2, 2.001]))", output: "approximately 4002\n[1. 1.]" },
  eigen: { code: "A = np.array([[3, 0], [0, 1]])\nvalues, vectors = np.linalg.eig(A)\nprint(values)\nprint(vectors)", output: "[3. 1.]\n[[1. 0.]\n [0. 1.]]" },
  "least-squares": { code: "X = np.c_[np.ones(len(x)), x]\nbeta = np.linalg.lstsq(X, y, rcond=None)[0]\ny_hat = X @ beta\nSSE = np.sum((y - y_hat)**2)", output: "beta = [intercept, slope]\nSSE = sum of squared residuals" },
  gradient: { code: "for step in range(1000):\n    error = (m*x + b) - y\n    m -= alpha * 2*np.mean(error*x)\n    b -= alpha * 2*np.mean(error)\nprint(m, b)", output: "Parameters move toward the least-squares solution." },
  "ml-bridge": { code: "X = np.array([[1,1,2], [1,2,3], [1,3,4]])\nbeta = np.array([1, 2, 0.5])\nprint(X @ beta)", output: "[4.  6.5 9. ]" },
};

const f = (n: number, digits = 2) => Number.isFinite(n) ? n.toFixed(digits).replace(/\.00$/, "") : "—";
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
function readJSON<T>(key: string, fallback: T): T {
  try { const s = localStorage.getItem(key); if (s) return JSON.parse(s) as T; } catch { }
  return fallback;
}
function writeJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { }
}

function MiniRange({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (n: number) => void }) {
  return <label className="u1-range"><span>{label}<output>{f(value, 1)}</output></span><input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} /></label>;
}

function NumberBox({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return <label className="u1-number"><span>{label}</span><input type="number" value={value} step="0.5" onChange={e => onChange(Number(e.target.value))} /></label>;
}

function Stat({ label, value, note, good }: { label: string; value: string; note?: string; good?: boolean }) {
  return <div className={`u1-stat ${good ? "good" : ""}`}><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>;
}

function LabShell({ title, goal, children }: { title: string; goal: string; children: React.ReactNode }) {
  return <section className="u1-lab-shell"><div className="u1-lab-title"><div><span><Play /> INTERACTIVE LAB</span><h3>{title}</h3><p>{goal}</p></div><b><i /> LIVE</b></div>{children}</section>;
}

const sx = (x: number) => 210 + x * 42;
const sy = (y: number) => 190 - y * 42;

function Plane({ children, label = "Interactive coordinate plane" }: { children: React.ReactNode; label?: string }) {
  return <svg className="u1-plane" viewBox="0 0 420 380" role="img" aria-label={label}>
    {[-4,-3,-2,-1,0,1,2,3,4].map(i => <g key={i}><line x1={sx(i)} y1="20" x2={sx(i)} y2="360" className={i === 0 ? "u1-axis" : "u1-grid"}/><line x1="30" y1={sy(i)} x2="390" y2={sy(i)} className={i === 0 ? "u1-axis" : "u1-grid"}/>{i !== 0 && <><text x={sx(i)} y={sy(0)+17} textAnchor="middle">{i}</text><text x={sx(0)-10} y={sy(i)+4} textAnchor="end">{i}</text></>}</g>)}
    <defs><marker id="arrow-purple" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L0,7 L6,3.5 z" fill="#6d4aff"/></marker><marker id="arrow-coral" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L0,7 L6,3.5 z" fill="#ec5d67"/></marker><marker id="arrow-green" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L0,7 L6,3.5 z" fill="#0e9f6e"/></marker></defs>
    {children}
  </svg>;
}

function VectorLab({ mode }: { mode: "add" | "span" }) {
  const [ax,setAx]=useState(2),[ay,setAy]=useState(1),[bx,setBx]=useState(1),[by,setBy]=useState(2),[c1,setC1]=useState(1),[c2,setC2]=useState(1);
  const det=ax*by-ay*bx, dot=ax*bx+ay*by, magA=Math.hypot(ax,ay), magB=Math.hypot(bx,by);
  const angle=magA&&magB?Math.acos(clamp(dot/(magA*magB),-1,1))*180/Math.PI:0;
  const tx=c1*ax+c2*bx,ty=c1*ay+c2*by;
  // Angle arc between v1 and v2, drawn in screen space (svg y grows downward, so flip the y component).
  const showArc = mode==="add" && magA>0.001 && magB>0.001;
  const a1sc=Math.atan2(-ay,ax), a2sc=Math.atan2(-by,bx);
  let arcDiff=a2sc-a1sc; while(arcDiff<=-Math.PI) arcDiff+=2*Math.PI; while(arcDiff>Math.PI) arcDiff-=2*Math.PI;
  const arcR=32, arcX1=sx(0)+arcR*Math.cos(a1sc), arcY1=sy(0)+arcR*Math.sin(a1sc), arcX2=sx(0)+arcR*Math.cos(a1sc+arcDiff), arcY2=sy(0)+arcR*Math.sin(a1sc+arcDiff), arcSweep=arcDiff>=0?1:0;
  const midA=a1sc+arcDiff/2, labelX=sx(0)+(arcR+15)*Math.cos(midA), labelY=sy(0)+(arcR+15)*Math.sin(midA);
  return <LabShell title={mode==="add"?"Build, add and compare two vectors":"Can these two vectors reach the plane?"} goal={mode==="add"?"Change components and connect the arrows to the numbers.":"Make the vectors parallel, then watch 2D reach collapse to one line."}>
    <div className="u1-lab-grid"><div className="u1-controls"><div className="u1-control-pair"><NumberBox label="v₁.x" value={ax} onChange={setAx}/><NumberBox label="v₁.y" value={ay} onChange={setAy}/><NumberBox label="v₂.x" value={bx} onChange={setBx}/><NumberBox label="v₂.y" value={by} onChange={setBy}/></div>{mode==="span"&&<><MiniRange label="coefficient c₁" value={c1} min={-2} max={2} step={.5} onChange={setC1}/><MiniRange label="coefficient c₂" value={c2} min={-2} max={2} step={.5} onChange={setC2}/><button className="u1-preset" onClick={()=>{setBx(ax*2);setBy(ay*2)}}>Make v₂ parallel to v₁</button></>}<div className="u1-stats">{mode==="add"?<><Stat label="‖v₁‖" value={f(magA)}/><Stat label="v₁·v₂" value={f(dot)}/><Stat label="Angle between v₁ and v₂" value={`${f(angle,1)}°`}/><Stat label="v₁+v₂" value={`[${f(ax+bx)}, ${f(ay+by)}]`}/></>:<><Stat label="det([v₁ v₂])" value={f(det)} good={Math.abs(det)>.001}/><Stat label="Status" value={Math.abs(det)>.001?"Independent":"Dependent"}/><Stat label="Combination" value={`[${f(tx)}, ${f(ty)}]`}/></>}</div></div>
      <div className="u1-visual"><Plane>{mode==="span"&&<polygon points={`${sx(0)},${sy(0)} ${sx(ax*c1)},${sy(ay*c1)} ${sx(tx)},${sy(ty)} ${sx(bx*c2)},${sy(by*c2)}`} className="u1-span-area"/>}<line x1={sx(0)} y1={sy(0)} x2={sx(ax)} y2={sy(ay)} className="u1-v1" markerEnd="url(#arrow-purple)"/><line x1={sx(0)} y1={sy(0)} x2={sx(bx)} y2={sy(by)} className="u1-v2" markerEnd="url(#arrow-coral)"/>{mode==="add"?<line x1={sx(0)} y1={sy(0)} x2={sx(ax+bx)} y2={sy(ay+by)} className="u1-vsum" markerEnd="url(#arrow-green)"/>:<line x1={sx(0)} y1={sy(0)} x2={sx(tx)} y2={sy(ty)} className="u1-vsum" markerEnd="url(#arrow-green)"/>}{showArc&&<path d={`M ${arcX1} ${arcY1} A ${arcR} ${arcR} 0 0 ${arcSweep} ${arcX2} ${arcY2}`} className="u1-angle-arc"/>}{showArc&&<text x={labelX} y={labelY} textAnchor="middle" className="u1-angle-label">{f(angle,1)}°</text>}</Plane><div className="u1-legend"><span className="v1">v₁</span><span className="v2">v₂</span><span className="sum">{mode==="add"?"v₁+v₂":"c₁v₁+c₂v₂"}</span>{showArc&&<span className="angle">∠ = {f(angle,1)}°</span>}</div></div></div>
    <div className="u1-observation"><Eye/><p><b>Observe:</b> {mode==="add"?`the dot product is ${f(dot)}, and the angle between v₁ and v₂ is ${f(angle,1)}°. ${Math.abs(dot)<.001?"The vectors are perpendicular.":dot>0?"They point generally in the same direction.":"They point generally in opposite directions."}`:Math.abs(det)<.001?"The parallelogram has zero area. One vector adds no new direction, so rank falls to 1.":`The parallelogram area is |${f(det)}|. Two independent directions span the entire 2D plane.`}</p></div>
  </LabShell>;
}

function SingleVectorLab(){
  const [x,setX]=useState(3),[y,setY]=useState(4);
  const mag=Math.hypot(x,y), ux=mag?x/mag:0, uy=mag?y/mag:0, angle=Math.atan2(y,x)*180/Math.PI;
  return <LabShell title="Meet a vector: components, length and direction" goal="Change the components and watch the magnitude, unit vector and angle update together.">
    <div className="u1-lab-grid"><div className="u1-controls"><div className="u1-control-pair"><NumberBox label="v.x" value={x} onChange={setX}/><NumberBox label="v.y" value={y} onChange={setY}/></div><div className="u1-stats"><Stat label="‖v‖ (magnitude)" value={f(mag)}/><Stat label="Unit vector v̂" value={`[${f(ux,2)}, ${f(uy,2)}]`} good/><Stat label="Angle from x-axis" value={`${f(angle,1)}°`}/></div></div>
      <div className="u1-visual"><Plane><line x1={sx(0)} y1={sy(0)} x2={sx(x)} y2={sy(y)} className="u1-v1" markerEnd="url(#arrow-purple)"/><line x1={sx(0)} y1={sy(0)} x2={sx(ux*1.4)} y2={sy(uy*1.4)} className="u1-vsum" markerEnd="url(#arrow-green)"/></Plane><div className="u1-legend"><span className="v1">v</span><span className="sum">unit vector v̂</span></div></div></div>
    <div className="u1-observation"><Eye/><p><b>Observe:</b> the unit vector always has length 1 and points in the exact same direction as v — dividing by the magnitude "normalises" it.</p></div>
  </LabShell>;
}

function SubtractLab(){
  const [ax,setAx]=useState(5),[ay,setAy]=useState(4),[bx,setBx]=useState(1),[by,setBy]=useState(1);
  const dx=ax-bx, dy=ay-by, dist=Math.hypot(dx,dy);
  return <LabShell title="Find the gap between two points" goal="Move u and v — the dashed connector from v's tip to u's tip is exactly u−v, and its length is the distance between them.">
    <div className="u1-lab-grid"><div className="u1-controls"><div className="u1-control-pair"><NumberBox label="u.x" value={ax} onChange={setAx}/><NumberBox label="u.y" value={ay} onChange={setAy}/><NumberBox label="v.x" value={bx} onChange={setBx}/><NumberBox label="v.y" value={by} onChange={setBy}/></div><button className="u1-preset" onClick={()=>{setBx(ax);setBy(ay)}}>Make v equal u</button><div className="u1-stats"><Stat label="u − v" value={`[${f(dx)}, ${f(dy)}]`}/><Stat label="distance ‖u−v‖" value={f(dist)} good={dist>0}/></div></div>
      <div className="u1-visual"><Plane><line x1={sx(0)} y1={sy(0)} x2={sx(ax)} y2={sy(ay)} className="u1-v1" markerEnd="url(#arrow-purple)"/><line x1={sx(0)} y1={sy(0)} x2={sx(bx)} y2={sy(by)} className="u1-v2" markerEnd="url(#arrow-coral)"/><line x1={sx(0)} y1={sy(0)} x2={sx(dx)} y2={sy(dy)} className="u1-vsum" markerEnd="url(#arrow-green)"/><line x1={sx(bx)} y1={sy(by)} x2={sx(ax)} y2={sy(ay)} className="u1-residual-line"/></Plane><div className="u1-legend"><span className="v1">u</span><span className="v2">v</span><span className="sum">u−v</span></div></div></div>
    <div className="u1-observation"><Minus/><p><b>Observe:</b> {dist<.01?"u and v are now the same point — the distance between them has dropped to 0.":`the dashed connector from v to u has the same length and direction as the green u−v vector: both equal ${f(dist)}.`}</p></div>
  </LabShell>;
}

function iso(x:number,y:number,z:number){const a=Math.PI/6;return {x:x-z*Math.cos(a)*0.6, y:y-z*Math.sin(a)*0.6};}
function CrossProductLab(){
  const [ax,setAx]=useState(1),[ay,setAy]=useState(0),[az,setAz]=useState(0),[bx,setBx]=useState(0),[by,setBy]=useState(1),[bz,setBz]=useState(0);
  const cx=ay*bz-az*by, cy=az*bx-ax*bz, cz=ax*by-ay*bx;
  const magA=Math.hypot(ax,ay,az), magB=Math.hypot(bx,by,bz), magC=Math.hypot(cx,cy,cz);
  const checkA=cx*ax+cy*ay+cz*az, checkB=cx*bx+cy*by+cz*bz;
  const pA=iso(ax,ay,az), pB=iso(bx,by,bz), pC=iso(cx*0.9,cy*0.9,cz*0.9), pZ=iso(0,0,3);
  return <LabShell title="Build a vector perpendicular to two others" goal="Edit two 3D vectors a and b — the green vector is a×b, always perpendicular to both (check the dot products below).">
    <div className="u1-presets"><button onClick={()=>{setAx(1);setAy(0);setAz(0);setBx(0);setBy(1);setBz(0)}}>x̂ × ŷ = ẑ</button><button onClick={()=>{setBx(ax*2);setBy(ay*2);setBz(az*2)}}>Make a, b parallel</button><button onClick={()=>{const t=ax;setAx(bx);setBx(t);const t2=ay;setAy(by);setBy(t2);const t3=az;setAz(bz);setBz(t3)}}>Swap a and b</button></div>
    <div className="u1-lab-grid"><div className="u1-controls"><div className="u1-control-pair"><NumberBox label="a.x" value={ax} onChange={setAx}/><NumberBox label="a.y" value={ay} onChange={setAy}/><NumberBox label="a.z" value={az} onChange={setAz}/><NumberBox label="b.x" value={bx} onChange={setBx}/><NumberBox label="b.y" value={by} onChange={setBy}/><NumberBox label="b.z" value={bz} onChange={setBz}/></div><div className="u1-equation-stack"><span>a×b = [{f(cx)}, {f(cy)}, {f(cz)}]</span></div><div className="u1-stats"><Stat label="‖a×b‖" value={f(magC)} note={magC>0?"area of the parallelogram":"a and b are parallel"}/><Stat label="(a×b)·a" value={f(checkA)} good={Math.abs(checkA)<.001}/><Stat label="(a×b)·b" value={f(checkB)} good={Math.abs(checkB)<.001}/></div></div>
      <div className="u1-visual"><svg className="u1-plane" viewBox="0 0 420 380" role="img" aria-label="3D cross product, isometric view"><line x1={sx(0)} y1={sy(0)} x2={sx(pZ.x)} y2={sy(pZ.y)} className="u1-grid"/><line x1={sx(-4)} y1={sy(0)} x2={sx(4)} y2={sy(0)} className="u1-grid"/><line x1={sx(0)} y1={sy(-4)} x2={sx(0)} y2={sy(4)} className="u1-grid"/><defs><marker id="arrow-purple2" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L0,7 L6,3.5 z" fill="#6d4aff"/></marker><marker id="arrow-coral2" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L0,7 L6,3.5 z" fill="#ec5d67"/></marker><marker id="arrow-green2" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L0,7 L6,3.5 z" fill="#0e9f6e"/></marker></defs><line x1={sx(0)} y1={sy(0)} x2={sx(pA.x)} y2={sy(pA.y)} className="u1-v1" markerEnd="url(#arrow-purple2)"/><line x1={sx(0)} y1={sy(0)} x2={sx(pB.x)} y2={sy(pB.y)} className="u1-v2" markerEnd="url(#arrow-coral2)"/><line x1={sx(0)} y1={sy(0)} x2={sx(pC.x)} y2={sy(pC.y)} className="u1-vsum" markerEnd="url(#arrow-green2)"/></svg><div className="u1-legend"><span className="v1">a</span><span className="v2">b</span><span className="sum">a×b</span></div></div></div>
    <div className="u1-observation"><Axis3D/><p><b>Perpendicularity check:</b> {Math.abs(checkA)<.001&&Math.abs(checkB)<.001?"both dot products are 0, confirming a×b is perpendicular to both a and b.":"a×b has collapsed toward zero because a and b are parallel — there is no unique perpendicular direction left to find."}</p></div>
  </LabShell>;
}

function ProjectionLab(){
  const[ax,setAx]=useState(3),[ay,setAy]=useState(2),[bx,setBx]=useState(2),[by,setBy]=useState(0);
  const den=bx*bx+by*by,k=den?(ax*bx+ay*by)/den:0,px=k*bx,py=k*by,rx=ax-px,ry=ay-py;
  return <LabShell title="Drop a perpendicular: see projection" goal="The green vector is the part of u explained by direction v; the dashed remainder is orthogonal."><div className="u1-lab-grid"><div className="u1-controls"><div className="u1-control-pair"><NumberBox label="u.x" value={ax} onChange={setAx}/><NumberBox label="u.y" value={ay} onChange={setAy}/><NumberBox label="v.x" value={bx} onChange={setBx}/><NumberBox label="v.y" value={by} onChange={setBy}/></div><div className="u1-equation-stack"><span>scale = (u·v)/(v·v) = <b>{f(k)}</b></span><span>projection = <b>[{f(px)}, {f(py)}]</b></span><span>remainder = <b>[{f(rx)}, {f(ry)}]</b></span></div><div className="u1-stats"><Stat label="remainder · v" value={f(rx*bx+ry*by)} good={Math.abs(rx*bx+ry*by)<.001}/></div></div><div className="u1-visual"><Plane><line x1={sx(0)} y1={sy(0)} x2={sx(ax)} y2={sy(ay)} className="u1-v1" markerEnd="url(#arrow-purple)"/><line x1={sx(0)} y1={sy(0)} x2={sx(bx)} y2={sy(by)} className="u1-v2" markerEnd="url(#arrow-coral)"/><line x1={sx(0)} y1={sy(0)} x2={sx(px)} y2={sy(py)} className="u1-vsum" markerEnd="url(#arrow-green)"/><line x1={sx(px)} y1={sy(py)} x2={sx(ax)} y2={sy(ay)} className="u1-residual-line"/></Plane></div></div><div className="u1-observation"><Target/><p><b>Least-squares connection:</b> the fitted prediction is a projection. The residual is perpendicular to the model’s column space.</p></div></LabShell>
}

function BasisLab(){
  const[a,setA]=useState(1),[b,setB]=useState(1),[c,setC]=useState(1),[d,setD]=useState(-1),[tx,setTx]=useState(4),[ty,setTy]=useState(2),det=a*d-b*c,k1=det?(tx*d-b*ty)/det:0,k2=det?(a*ty-tx*c)/det:0;
  return <LabShell title="Describe one point in a different coordinate language" goal="The green target stays fixed while its coordinates change with the purple and coral basis vectors."><div className="u1-lab-grid"><div className="u1-controls"><div className="u1-control-pair"><NumberBox label="v₁.x" value={a} onChange={setA}/><NumberBox label="v₁.y" value={c} onChange={setC}/><NumberBox label="v₂.x" value={b} onChange={setB}/><NumberBox label="v₂.y" value={d} onChange={setD}/><NumberBox label="target x" value={tx} onChange={setTx}/><NumberBox label="target y" value={ty} onChange={setTy}/></div><button className="u1-preset" onClick={()=>{setB(a*2);setD(c*2)}}>Make basis vectors dependent</button><div className="u1-stats"><Stat label="Basis determinant" value={f(det)} good={Math.abs(det)>.001}/><Stat label="Basis coordinates" value={Math.abs(det)>.001?`[${f(k1)}, ${f(k2)}]`:"Not unique"}/></div><div className="u1-equation-stack"><span>x = {f(k1)}v₁ + {f(k2)}v₂</span><span>Bc = [{f(tx)}, {f(ty)}]</span></div></div><div className="u1-visual"><Plane><line x1={sx(0)} y1={sy(0)} x2={sx(a)} y2={sy(c)} className="u1-v1" markerEnd="url(#arrow-purple)"/><line x1={sx(0)} y1={sy(0)} x2={sx(b)} y2={sy(d)} className="u1-v2" markerEnd="url(#arrow-coral)"/><line x1={sx(0)} y1={sy(0)} x2={sx(tx)} y2={sy(ty)} className="u1-vsum" markerEnd="url(#arrow-green)"/>{Math.abs(det)>.001&&<><line x1={sx(0)} y1={sy(0)} x2={sx(k1*a)} y2={sy(k1*c)} className="u1-basis-step"/><line x1={sx(k1*a)} y1={sy(k1*c)} x2={sx(tx)} y2={sy(ty)} className="u1-basis-step"/></>}</Plane></div></div><div className={`u1-observation ${Math.abs(det)<.001?"warn":""}`}><VectorSquare/><p><b>{Math.abs(det)<.001?"Invalid 2D basis:":"Same point, new coordinates:"}</b> {Math.abs(det)<.001?"parallel directions cannot describe every point uniquely.":`[${f(tx)},${f(ty)}] in standard coordinates becomes [${f(k1)},${f(k2)}] in this basis.`}</p></div></LabShell>
}

function TransformLab({ determinantFocus=false }: { determinantFocus?: boolean }){
  const[a,setA]=useState(determinantFocus?2:1),[b,setB]=useState(determinantFocus?0:1),[c,setC]=useState(0),[d,setD]=useState(determinantFocus?1:1);
  const det=a*d-b*c, p=(x:number,y:number)=>`${sx(a*x+b*y)},${sy(c*x+d*y)}`;
  const preset=(name:string)=>{if(name==="rotate"){setA(0);setB(-1);setC(1);setD(0)}if(name==="shear"){setA(1);setB(1);setC(0);setD(1)}if(name==="collapse"){setA(1);setB(2);setC(2);setD(4)}if(name==="identity"){setA(1);setB(0);setC(0);setD(1)}};
  return <LabShell title={determinantFocus?"Area, orientation and invertibility":"Transform the whole coordinate space"} goal={determinantFocus?"Watch determinant encode area scale and information loss.":"Choose a preset or edit A. The faded grid is the original; purple is transformed."}><div className="u1-presets"><button onClick={()=>preset("identity")}>Identity</button><button onClick={()=>preset("rotate")}>Rotate 90°</button><button onClick={()=>preset("shear")}>Shear</button><button onClick={()=>preset("collapse")}>Collapse</button></div><div className="u1-lab-grid"><div className="u1-controls"><div className="u1-matrix-input"><span>A =</span><div><NumberBox label="a" value={a} onChange={setA}/><NumberBox label="b" value={b} onChange={setB}/><NumberBox label="c" value={c} onChange={setC}/><NumberBox label="d" value={d} onChange={setD}/></div></div><div className="u1-stats"><Stat label="det(A)=ad−bc" value={f(det)} good={Math.abs(det)>.001}/><Stat label="Area scale" value={`${f(Math.abs(det))}×`}/><Stat label="Orientation" value={det<0?"Flipped":det>0?"Preserved":"Collapsed"}/><Stat label="Inverse" value={Math.abs(det)>.001?"Exists":"Does not exist"}/></div>{Math.abs(det)>.001&&determinantFocus&&<div className="u1-equation-stack"><span>A⁻¹ = 1/{f(det)} × [[{f(d)}, {f(-b)}], [{f(-c)}, {f(a)}]]</span></div>}</div><div className="u1-visual"><Plane>{[-3,-2,-1,0,1,2,3].map(i=><g key={i}><line x1={sx(a*(-3)+b*i)} y1={sy(c*(-3)+d*i)} x2={sx(a*3+b*i)} y2={sy(c*3+d*i)} className="u1-tgrid"/><line x1={sx(a*i+b*(-3))} y1={sy(c*i+d*(-3))} x2={sx(a*i+b*3)} y2={sy(c*i+d*3)} className="u1-tgrid"/></g>)}<polygon points={`${p(0,0)} ${p(1,0)} ${p(1,1)} ${p(0,1)}`} className="u1-transformed-square"/></Plane></div></div><div className={`u1-observation ${Math.abs(det)<.001?"warn":""}`}><Grid3X3/><p><b>{Math.abs(det)<.001?"Information lost:":"Transformation readable:"}</b> {Math.abs(det)<.001?"the square became a line. Different inputs can now produce the same output.":`one unit of area becomes ${f(Math.abs(det))} units of area.`}</p></div></LabShell>
}

function MultiplyLab(){
  const[x,setX]=useState(1),[y,setY]=useState(1),[stretchX,setStretchX]=useState(2),[stretchY,setStretchY]=useState(1),[angle,setAngle]=useState(90),[order,setOrder]=useState<"RS"|"SR">("RS");const t=angle*Math.PI/180,co=Math.cos(t),si=Math.sin(t);
  const rotate=(u:number,v:number):[number,number]=>[co*u-si*v,si*u+co*v],stretch=(u:number,v:number):[number,number]=>[stretchX*u,stretchY*v];
  const first=order==="RS"?rotate(x,y):stretch(x,y),out=order==="RS"?stretch(...first):rotate(...first),otherFirst=order==="RS"?stretch(x,y):rotate(x,y),otherOut=order==="RS"?rotate(...otherFirst):stretch(...otherFirst);
  return <LabShell title="Order matters: compose two transformations" goal="Compare rotate→stretch with stretch→rotate. The same input can finish at different points."><div className="u1-order-toggle"><button className={order==="RS"?"active":""} onClick={()=>setOrder("RS")}>1 Rotate → 2 Stretch</button><button className={order==="SR"?"active":""} onClick={()=>setOrder("SR")}>1 Stretch → 2 Rotate</button></div><div className="u1-lab-grid"><div className="u1-controls"><div className="u1-control-pair"><NumberBox label="input x" value={x} onChange={setX}/><NumberBox label="input y" value={y} onChange={setY}/></div><MiniRange label="rotation angle" value={angle} min={-180} max={180} step={15} onChange={setAngle}/><MiniRange label="horizontal stretch" value={stretchX} min={.5} max={3} step={.25} onChange={setStretchX}/><MiniRange label="vertical stretch" value={stretchY} min={.5} max={3} step={.25} onChange={setStretchY}/><div className="u1-stats"><Stat label="After first matrix" value={`[${f(first[0])}, ${f(first[1])}]`}/><Stat label="Final output" value={`[${f(out[0])}, ${f(out[1])}]`}/><Stat label="Reverse order" value={`[${f(otherOut[0])}, ${f(otherOut[1])}]`}/></div></div><div className="u1-visual"><Plane><line x1={sx(0)} y1={sy(0)} x2={sx(x)} y2={sy(y)} className="u1-v1" markerEnd="url(#arrow-purple)"/><line x1={sx(0)} y1={sy(0)} x2={sx(first[0])} y2={sy(first[1])} className="u1-v2" markerEnd="url(#arrow-coral)"/><line x1={sx(0)} y1={sy(0)} x2={sx(out[0])} y2={sy(out[1])} className="u1-vsum" markerEnd="url(#arrow-green)"/><circle cx={sx(otherOut[0])} cy={sy(otherOut[1])} r="7" className="u1-other-order"/></Plane><div className="u1-legend"><span className="v1">input</span><span className="v2">after first</span><span className="sum">final</span><span className="other">reverse order</span></div></div></div><div className="u1-observation"><Network/><p><b>Composition:</b> {Math.hypot(out[0]-otherOut[0],out[1]-otherOut[1])<.01?"for these settings both orders happen to agree.":"the two final outputs differ, demonstrating that matrix multiplication is generally not commutative."}</p></div></LabShell>
}

function LayerLab(){
  const[x1,setX1]=useState(2),[x2,setX2]=useState(3),[w1,setW1]=useState(.5),[w2,setW2]=useState(-.25),[bias,setBias]=useState(1);const z=x1*w1+x2*w2+bias,relu=Math.max(0,z);
  return <LabShell title="From matrix multiplication to one neuron" goal="Follow two inputs through weights, addition, bias and ReLU."><div className="u1-network"><div className="u1-node-col"><label><span>x₁</span><input type="number" step=".5" value={x1} onChange={e=>setX1(Number(e.target.value))}/><small>study hours</small></label><label><span>x₂</span><input type="number" step=".5" value={x2} onChange={e=>setX2(Number(e.target.value))}/><small>practice tasks</small></label></div><div className="u1-weights"><MiniRange label="weight w₁" value={w1} min={-2} max={2} step={.25} onChange={setW1}/><MiniRange label="weight w₂" value={w2} min={-2} max={2} step={.25} onChange={setW2}/><MiniRange label="bias b" value={bias} min={-2} max={2} step={.25} onChange={setBias}/></div><ArrowRight/><div className="u1-neuron"><Cpu/><span>Weighted sum</span><strong>{f(x1)}({f(w1)}) + {f(x2)}({f(w2)}) + {f(bias)} = {f(z)}</strong></div><ArrowRight/><div className="u1-output"><span>ReLU output</span><strong>{f(relu)}</strong><small>max(0, z)</small></div></div><div className="u1-code-line"><Code2/><code>x @ w + b = [{f(x1)}, {f(x2)}] · [{f(w1)}, {f(w2)}] + {f(bias)} = {f(z)}</code></div></LabShell>
}

function SystemsLab(){
  const[a,setA]=useState(1),[b,setB]=useState(1),[c,setC]=useState(1),[d,setD]=useState(-1),[e,setE]=useState(5),[g,setG]=useState(1);const det=a*d-b*c,x=det?(e*d-b*g)/det:0,y=det?(a*g-e*c)/det:0;
  const line=(aa:number,bb:number,cc:number)=>{
    if(Math.abs(bb)>.001) return {x1:sx(-4),y1:sy((cc-aa*(-4))/bb),x2:sx(4),y2:sy((cc-aa*4)/bb)};
    if(Math.abs(aa)>.001){const xx=cc/aa;return{x1:sx(xx),y1:sy(-4),x2:sx(xx),y2:sy(4)}}
    return null; // both coefficients are 0: "0 = c" has no line to draw — avoid feeding Infinity/NaN into the SVG
  };
  const l1=line(a,b,e),l2=line(c,d,g);
  const degenerate=!l1||!l2;
  return <LabShell title="Solve Ax=b and see the intersection" goal="Change either equation. A non-zero determinant produces one exact meeting point."><div className="u1-lab-grid"><div className="u1-controls"><div className="u1-system-input"><div><NumberBox label="a₁" value={a} onChange={setA}/><span>x +</span><NumberBox label="b₁" value={b} onChange={setB}/><span>y =</span><NumberBox label="c₁" value={e} onChange={setE}/></div><div><NumberBox label="a₂" value={c} onChange={setC}/><span>x +</span><NumberBox label="b₂" value={d} onChange={setD}/><span>y =</span><NumberBox label="c₂" value={g} onChange={setG}/></div></div><div className="u1-presets vertical"><button onClick={()=>{setA(1);setB(1);setE(5);setC(1);setD(-1);setG(1)}}>One solution</button><button onClick={()=>{setA(1);setB(2);setE(4);setC(2);setD(4);setG(11)}}>Parallel: no solution</button><button onClick={()=>{setA(1);setB(2);setE(4);setC(2);setD(4);setG(8)}}>Same line: infinite</button></div><div className="u1-stats"><Stat label="det(A)" value={f(det)} good={Math.abs(det)>.001}/><Stat label="Solution" value={Math.abs(det)>.001?`[${f(x)}, ${f(y)}]`:"Not unique"}/></div></div><div className="u1-visual"><Plane>{l1&&<line {...l1} className="u1-system-line one"/>}{l2&&<line {...l2} className="u1-system-line two"/>}{Math.abs(det)>.001&&Math.abs(x)<=4&&Math.abs(y)<=4&&<circle cx={sx(x)} cy={sy(y)} r="7" className="u1-intersection"/>}</Plane></div></div><div className="u1-solve-steps"><b>Substitution check</b>{degenerate?<span>An equation with both coefficients set to 0 (0x+0y=c) has no line to draw — give x or y a non-zero coefficient.</span>:Math.abs(det)>.001?<><span>Equation 1: {f(a)}({f(x)}) + {f(b)}({f(y)}) = <strong>{f(a*x+b*y)}</strong></span><span>Equation 2: {f(c)}({f(x)}) + {f(d)}({f(y)}) = <strong>{f(c*x+d*y)}</strong></span></>:<span>det(A)=0, so the rows are dependent. Check whether the lines are parallel or identical.</span>}</div></LabShell>
}

function RankLab(){
  const[a,setA]=useState(1),[b,setB]=useState(2),[c,setC]=useState(2),[d,setD]=useState(4),det=a*d-b*c,rank=Math.abs(det)>.0001?2:(Math.abs(a)+Math.abs(b)+Math.abs(c)+Math.abs(d)>.0001?1:0);
  const nv=Math.hypot(a,b)>0?[-b/Math.hypot(a,b),a/Math.hypot(a,b)]:[1,0],n1=a*nv[0]+b*nv[1],n2=c*nv[0]+d*nv[1];
  return <LabShell title="Detect redundant information" goal="Make one row a multiple of the other and inspect rank plus a null-space direction."><div className="u1-lab-grid"><div className="u1-controls"><div className="u1-matrix-input"><span>A =</span><div><NumberBox label="a" value={a} onChange={setA}/><NumberBox label="b" value={b} onChange={setB}/><NumberBox label="c" value={c} onChange={setC}/><NumberBox label="d" value={d} onChange={setD}/></div></div><div className="u1-presets"><button onClick={()=>{setA(1);setB(2);setC(2);setD(4)}}>Rank 1</button><button onClick={()=>{setA(1);setB(2);setC(2);setD(5)}}>Full rank</button><button onClick={()=>{setA(0);setB(0);setC(0);setD(0)}}>Rank 0</button></div><div className="u1-stats"><Stat label="Rank" value={`${rank}`} good={rank===2}/><Stat label="Independent columns" value={`${rank} of 2`}/><Stat label="det(A)" value={f(det)}/></div></div><div className="u1-rank-viz"><div className={`u1-rank-bars rank-${rank}`}><i/><i/></div><h4>{rank===2?"Two independent directions":"Information has collapsed"}</h4><p>{rank===2?"Both feature directions contribute algebraically new information.":rank===1?"One direction is redundant; the output lives on a line.":"Every input is sent to zero."}</p>{rank===1&&<div className="u1-null"><span>One null-space direction</span><strong>[{f(nv[0])}, {f(nv[1])}]</strong><small>A×v = [{f(n1)}, {f(n2)}]</small></div>}</div></div><div className="u1-observation"><CircleHelp/><p><b>Important:</b> full rank does not mean every feature improves prediction. It only means no column is an exact linear combination of the others.</p></div></LabShell>
}

function OrthogonalLab(){
  const[a,setA]=useState(2),[b,setB]=useState(0),[c,setC]=useState(1),[d,setD]=useState(2),den=a*a+b*b,k=den?(c*a+d*b)/den:0,u2x=c-k*a,u2y=d-k*b,m1=Math.hypot(a,b),m2=Math.hypot(u2x,u2y),q1=[m1?a/m1:0,m1?b/m1:0],q2=[m2?u2x/m2:0,m2?u2y/m2:0],dependent=m2<.001;
  return <LabShell title="Turn overlapping directions into perpendicular directions" goal="Gram–Schmidt keeps the first direction and removes its contribution from the second."><div className="u1-lab-grid"><div className="u1-controls"><div className="u1-control-pair"><NumberBox label="v₁.x" value={a} onChange={setA}/><NumberBox label="v₁.y" value={b} onChange={setB}/><NumberBox label="v₂.x" value={c} onChange={setC}/><NumberBox label="v₂.y" value={d} onChange={setD}/></div><button className="u1-preset" onClick={()=>{setC(a*2);setD(b*2)}}>Make vectors parallel</button><div className="u1-equation-stack"><span>projection removed = [{f(k*a)}, {f(k*b)}]</span><span>u₂ = v₂ − projection = [{f(u2x)}, {f(u2y)}]</span></div><div className="u1-stats"><Stat label="q₁" value={`[${f(q1[0])}, ${f(q1[1])}]`}/><Stat label="q₂" value={dependent?"Undefined":`[${f(q2[0])}, ${f(q2[1])}]`}/><Stat label="q₁·q₂" value={dependent?"—":f(q1[0]*q2[0]+q1[1]*q2[1])} good={!dependent}/></div></div><div className="u1-visual"><Plane><line x1={sx(0)} y1={sy(0)} x2={sx(a)} y2={sy(b)} className="u1-v1" markerEnd="url(#arrow-purple)"/><line x1={sx(0)} y1={sy(0)} x2={sx(c)} y2={sy(d)} className="u1-original-v2" markerEnd="url(#arrow-coral)"/>{!dependent&&<line x1={sx(0)} y1={sy(0)} x2={sx(u2x)} y2={sy(u2y)} className="u1-vsum" markerEnd="url(#arrow-green)"/>}<line x1={sx(k*a)} y1={sy(k*b)} x2={sx(c)} y2={sy(d)} className="u1-residual-line"/></Plane><div className="u1-legend"><span className="v1">u₁=v₁</span><span className="v2">original v₂</span><span className="sum">orthogonal u₂</span></div></div></div><div className={`u1-observation ${dependent?"warn":""}`}><Target/><p><b>{dependent?"Cannot create a second direction:":"Orthogonality verified:"}</b> {dependent?"v₂ contains no information beyond v₁.":`q₁·q₂=${f(q1[0]*q2[0]+q1[1]*q2[1])}, so the new unit directions are perpendicular.`}</p></div></LabShell>
}

function ConditioningLab(){
  const[eps,setEps]=useState(.2),[noise,setNoise]=useState(.01),det=eps,b1=2,b2=2+eps+noise,x1=(b1*(1+eps)-b2)/det,x2=(b2-b1)/det,tr=2+eps,disc=Math.sqrt(4+eps*eps),lmax=(tr+disc)/2,lmin=(tr-disc)/2,cond=Math.abs(lmax/lmin),change=Math.hypot(x1-1,x2-1);
  return <LabShell title="Amplify a tiny measurement error" goal="The matrix remains full rank, but near-parallel equations make the solution increasingly fragile."><div className="u1-conditioning"><div className="u1-controls"><MiniRange label="separation ε" value={eps} min={.01} max={2} step={.01} onChange={setEps}/><MiniRange label="tiny noise added to b₂" value={noise} min={0} max={.05} step={.001} onChange={setNoise}/><div className="u1-equation-stack"><span>A = [[1,1],[1,{f(1+eps)}]]</span><span>clean b = [2,{f(2+eps)}]</span><span>observed b = [2,{f(2+eps+noise)}]</span></div></div><div className="u1-condition-meter"><span>Condition number</span><strong>{cond>9999?">9999":f(cond,1)}</strong><div><i style={{width:`${Math.min(100,Math.log10(cond)*32)}%`}}/></div><small>{cond<10?"Well conditioned":cond<100?"Sensitive":"Highly unstable"}</small></div><div className="u1-solution-shift"><div><span>Clean solution</span><strong>[1, 1]</strong></div><ArrowRight/><div><span>With tiny noise</span><strong>[{f(x1)}, {f(x2)}]</strong></div><small>Solution moved by {f(change)} even though b changed by only {f(noise,3)}</small></div></div><div className={`u1-observation ${cond>=100?"warn":""}`}><Gauge/><p><b>Key lesson:</b> full rank tells us a unique solution exists. Conditioning tells us whether that solution is trustworthy under small noise.</p></div></LabShell>
}

function EigenLab(){
  const[a,setA]=useState(3),[c,setC]=useState(0),[d,setD]=useState(1),[power,setPower]=useState(1);const tr=a+d,disc=Math.sqrt((a-d)**2+4*c*c),l1=(tr+disc)/2,l2=(tr-disc)/2;
  let vx=c,vy=l1-a;if(Math.hypot(vx,vy)<.001){vx=1;vy=0}const vm=Math.hypot(vx,vy);vx/=vm;vy/=vm;let px=1/Math.SQRT2,py=1/Math.SQRT2;for(let i=0;i<power;i++){const nx=a*px+c*py,ny=c*px+d*py,m=Math.hypot(nx,ny)||1;px=nx/m;py=ny/m}
  return <LabShell title="Watch repeated transformation reveal the dominant direction" goal="Use a symmetric matrix so eigenvalues stay real. Increase the power and see the vector align."><div className="u1-lab-grid"><div className="u1-controls"><div className="u1-symmetric"><span>A =</span><div><NumberBox label="a" value={a} onChange={setA}/><NumberBox label="c" value={c} onChange={setC}/><NumberBox label="c" value={c} onChange={setC}/><NumberBox label="d" value={d} onChange={setD}/></div></div><MiniRange label="Repeated applications k" value={power} min={0} max={10} onChange={setPower}/><div className="u1-stats"><Stat label="Largest eigenvalue λ₁" value={f(l1)}/><Stat label="Second eigenvalue λ₂" value={f(l2)}/><Stat label="Dominant direction" value={`[${f(vx)}, ${f(vy)}]`}/></div></div><div className="u1-visual"><Plane><line x1={sx(-vx*4)} y1={sy(-vy*4)} x2={sx(vx*4)} y2={sy(vy*4)} className="u1-eigen-axis"/><line x1={sx(0)} y1={sy(0)} x2={sx(px*3)} y2={sy(py*3)} className="u1-vsum" markerEnd="url(#arrow-green)"/></Plane><div className="u1-legend"><span className="sum">normalised Aᵏ[1,1]</span><span className="eig">dominant eigen-line</span></div></div></div><div className="u1-observation"><Gauge/><p><b>Power iteration:</b> repeated multiplication amplifies the direction with the largest |λ|. This is one way algorithms estimate a dominant eigenvector.</p></div></LabShell>
}

type Point={x:number;y:number};
function fitLine(points:Point[]){const n=points.length,mx=points.reduce((s,p)=>s+p.x,0)/n,my=points.reduce((s,p)=>s+p.y,0)/n,num=points.reduce((s,p)=>s+(p.x-mx)*(p.y-my),0),den=points.reduce((s,p)=>s+(p.x-mx)**2,0),m=num/den,b=my-m*mx;return{m,b}}
function LeastSquaresLab(){
  const imperfect=[{x:1,y:3},{x:2,y:5.6},{x:3,y:6.2},{x:4,y:9.4}],perfect=[{x:1,y:3},{x:2,y:5},{x:3,y:7},{x:4,y:9}];const[mode,setMode]=useState<"imperfect"|"perfect">("imperfect"),[m,setM]=useState(2),[b,setB]=useState(1),points=mode==="perfect"?perfect:imperfect,best=fitLine(points),rows=points.map(p=>({...p,hat:m*p.x+b,e:p.y-(m*p.x+b)})),sse=rows.reduce((s,r)=>s+r.e*r.e,0),px=(x:number)=>42+x*76,py=(y:number)=>245-y*20;
  return <LabShell title="Compete against the least-squares line" goal="Move slope and intercept, inspect every residual, then reveal the mathematical optimum."><div className="u1-presets"><button className={mode==="imperfect"?"active":""} onClick={()=>setMode("imperfect")}>Imperfect data</button><button className={mode==="perfect"?"active":""} onClick={()=>{setMode("perfect");setM(2);setB(1)}}>Perfect data</button><button onClick={()=>{setM(Number(best.m.toFixed(2)));setB(Number(best.b.toFixed(2)))}}><WandSparkles/> Show best fit</button></div><div className="u1-lab-grid"><div className="u1-controls"><MiniRange label="Slope m" value={m} min={0} max={4} step={.05} onChange={setM}/><MiniRange label="Intercept b" value={b} min={-2} max={4} step={.05} onChange={setB}/><div className="u1-big-equation">ŷ = {f(m)}x {b>=0?"+":"−"} {f(Math.abs(b))}</div><div className={`u1-score ${sse<.01?"perfect":""}`}><span>Sum of squared errors</span><strong>{f(sse)}</strong><small>Best possible here: {f(points.reduce((s,p)=>s+(p.y-(best.m*p.x+best.b))**2,0))}</small></div></div><div className="u1-ls-chart"><svg viewBox="0 0 420 270">{[0,1,2,3,4,5].map(i=><line key={`v${i}`} x1={px(i)} y1="20" x2={px(i)} y2="245" className="u1-grid"/>)}{[0,2,4,6,8,10].map(i=><line key={`h${i}`} x1="42" y1={py(i)} x2="390" y2={py(i)} className="u1-grid"/>)}<line x1={px(0)} y1={py(b)} x2={px(4.5)} y2={py(m*4.5+b)} className="u1-fit-line"/>{rows.map((r,i)=><g key={i}><line x1={px(r.x)} y1={py(r.y)} x2={px(r.x)} y2={py(r.hat)} className="u1-residual-line"/><circle cx={px(r.x)} cy={py(r.y)} r="6" className="u1-data-point"/></g>)}</svg></div></div><div className="u1-calc-table"><div><b>x</b><b>Actual y</b><b>Predicted ŷ</b><b>Residual e</b><b>e²</b></div>{rows.map((r,i)=><div key={i}><span>{r.x}</span><span>{f(r.y)}</span><span>{f(r.hat)}</span><span>{f(r.e)}</span><span>{f(r.e*r.e)}</span></div>)}<footer><b>Total SSE</b><strong>{f(sse)}</strong></footer></div><div className="u1-normal-equation"><Sigma/><div><span>Matrix solution</span><strong>β̂ = (XᵀX)⁻¹Xᵀy = [{f(best.b)}, {f(best.m)}]</strong><small>The first number is intercept; the second is slope.</small></div></div></LabShell>
}

function GradientLab(){
  const points=[{x:1,y:3},{x:2,y:5.6},{x:3,y:6.2},{x:4,y:9.4}],[m,setM]=useState(0),[b,setB]=useState(0),[alpha,setAlpha]=useState(.01),[steps,setSteps]=useState(0);const best=fitLine(points),sse=points.reduce((s,p)=>s+(p.y-(m*p.x+b))**2,0),px=(x:number)=>42+x*76,py=(y:number)=>245-y*20;
  const advance=(count:number)=>{let mm=m,bb=b;for(let j=0;j<count;j++){const errors=points.map(p=>mm*p.x+bb-p.y),gm=2/points.length*errors.reduce((s,e,i)=>s+e*points[i].x,0),gb=2/points.length*errors.reduce((s,e)=>s+e,0);mm-=alpha*gm;bb-=alpha*gb;if(!Number.isFinite(mm)||Math.abs(mm)>1e8){mm=0;bb=0;break}}setM(mm);setB(bb);setSteps(v=>v+count)};
  return <LabShell title="Train the line one step at a time" goal="Gradient descent starts with a poor line and repeatedly reduces error instead of using the closed-form solution."><div className="u1-presets"><button onClick={()=>advance(1)}>Take 1 step</button><button onClick={()=>advance(10)}>Take 10 steps</button><button onClick={()=>advance(100)}>Take 100 steps</button><button onClick={()=>{setM(0);setB(0);setSteps(0)}}><RotateCcw/>Reset</button></div><div className="u1-lab-grid"><div className="u1-controls"><MiniRange label="learning rate α" value={alpha} min={.001} max={.08} step={.001} onChange={setAlpha}/><div className="u1-stats"><Stat label="Steps taken" value={`${steps}`}/><Stat label="Current slope" value={f(m)}/><Stat label="Current intercept" value={f(b)}/><Stat label="Current SSE" value={f(sse)} good={sse<3}/></div><div className="u1-equation-stack"><span>m ← m − α × gradientₘ</span><span>b ← b − α × gradientᵦ</span><span>target solution ≈ [{f(best.b)}, {f(best.m)}]</span></div></div><div className="u1-ls-chart"><svg viewBox="0 0 420 270">{[0,1,2,3,4,5].map(i=><line key={`v${i}`} x1={px(i)} y1="20" x2={px(i)} y2="245" className="u1-grid"/>)}{[0,2,4,6,8,10].map(i=><line key={`h${i}`} x1="42" y1={py(i)} x2="390" y2={py(i)} className="u1-grid"/>)}<line x1={px(0)} y1={py(b)} x2={px(4.5)} y2={py(m*4.5+b)} className="u1-fit-line"/>{points.map((p,i)=><circle key={i} cx={px(p.x)} cy={py(p.y)} r="6" className="u1-data-point"/>)}</svg></div></div><div className="u1-observation"><LineChart/><p><b>Optimisation:</b> {sse<3?"the line is near the minimum. Smaller later steps can refine it.":alpha>.05?"a large learning rate may jump around or overshoot. Try a smaller value.":"take more steps and watch SSE fall toward the least-squares minimum."}</p></div></LabShell>
}

function MLBridgeLab(){
  const[w0,setW0]=useState(1),[w1,setW1]=useState(2),[w2,setW2]=useState(.5),data=[[1,2],[2,3],[3,4]],pred=data.map(r=>w0+w1*r[0]+w2*r[1]);
  return <LabShell title="One equation becomes a batch prediction" goal="Treat rows as students and columns as features. Matrix multiplication predicts everyone at once."><div className="u1-batch"><div className="u1-matrix-card"><span>Design matrix X</span><div className="u1-array">{data.map((r,i)=><i key={i}><em>1</em><em>{r[0]}</em><em>{r[1]}</em></i>)}</div><small>columns: intercept, hours, tasks</small></div><div className="u1-times">×</div><div className="u1-matrix-card weights"><span>Coefficients β</span><MiniRange label="intercept" value={w0} min={-2} max={4} step={.5} onChange={setW0}/><MiniRange label="hours weight" value={w1} min={-2} max={4} step={.5} onChange={setW1}/><MiniRange label="tasks weight" value={w2} min={-2} max={4} step={.5} onChange={setW2}/></div><div className="u1-times">=</div><div className="u1-matrix-card result"><span>Predictions ŷ</span>{pred.map((v,i)=><strong key={i}>Student {i+1}: {f(v)}</strong>)}</div></div><div className="u1-flow-strip"><span><b>Raw observations</b>3 students × 2 features</span><ArrowRight/><span><b>Design matrix</b>Add intercept column</span><ArrowRight/><span><b>Matrix product</b>Xβ</span><ArrowRight/><span><b>Predictions</b>One per student</span></div></LabShell>
}

function ChapterLab({ id }: { id: string }){
  if(id==="vectors") return <SingleVectorLab/>;
  if(id==="vector-addition") return <VectorLab mode="add"/>;
  if(id==="vector-subtraction") return <SubtractLab/>;
  if(id==="cross-product") return <CrossProductLab/>;
  if(id==="span") return <VectorLab mode="span"/>;
  if(id==="dot") return <ProjectionLab/>;
  if(id==="basis") return <BasisLab/>;
  if(id==="transform") return <TransformLab/>;
  if(id==="multiply") return <MultiplyLab/>;
  if(id==="determinant") return <TransformLab determinantFocus/>;
  if(id==="systems") return <SystemsLab/>;
  if(id==="rank") return <RankLab/>;
  if(id==="orthogonal") return <OrthogonalLab/>;
  if(id==="conditioning") return <ConditioningLab/>;
  if(id==="eigen") return <EigenLab/>;
  if(id==="least-squares") return <LeastSquaresLab/>;
  if(id==="gradient") return <GradientLab/>;
  return <MLBridgeLab/>;
}

function MissionPanel({ chapter, completed, toggle }: { chapter: Chapter; completed: string[]; toggle: (key: string) => void }) {
  return <section className="u1-missions"><div className="u1-mission-head"><div><Target/><span><b>Experiment missions</b>Do these inside the live lab—then tick only when you can explain what happened.</span></div><strong>{missions[chapter.id].filter((_,i)=>completed.includes(`${chapter.id}-${i}`)).length}/3</strong></div><div className="u1-mission-grid">{missions[chapter.id].map((m,i)=>{const key=`${chapter.id}-${i}`,done=completed.includes(key);return <button className={done?"done":""} key={m} onClick={()=>toggle(key)}><i>{done?<Check/>:i+1}</i><span>{m}</span></button>})}</div></section>;
}

function PythonPanel({ chapter }: { chapter: Chapter }) {
  const[open,setOpen]=useState(false),[ran,setRan]=useState(false),sample=pythonByChapter[chapter.id];
  useEffect(()=>{setOpen(false);setRan(false)},[chapter.id]);
  return <section className="u1-python"><div><div><Code2/><span><b>NumPy connection</b>See how the visual experiment is expressed in Python — this is a worked reference, not a live code runner.</span></div><button onClick={()=>setOpen(v=>!v)}>{open?"Hide code":"Open code lab"}<ChevronDown/></button></div>{open&&<div className="u1-python-body"><div className="u1-code-window"><header><i/><i/><i/><span>unit_1_lab.py</span></header><pre><code>import numpy as np{"\n\n"}{sample.code}</code></pre></div><div className="u1-run-panel"><button onClick={()=>setRan(true)}><Play/>Reveal expected output</button><span>Expected output</span><pre>{ran?sample.output:"Click \"Reveal expected output\" to check your own reasoning against it."}</pre></div></div>}</section>;
}

const misconceptions=[
  {s:"A full-rank feature matrix proves every feature is useful.",truth:false,why:"Full rank proves only algebraic independence. A feature may still have little predictive value."},
  {s:"A full-rank matrix is always numerically stable.",truth:false,why:"It may be invertible but nearly singular, producing a very large condition number."},
  {s:"A determinant of zero means an inverse does not exist.",truth:true,why:"The transformation has collapsed a dimension and cannot be uniquely reversed."},
  {s:"Matrix multiplication always satisfies AB=BA.",truth:false,why:"Composition order normally changes the result; transformations act from right to left."},
  {s:"Changing basis changes the actual geometric vector.",truth:false,why:"Only its coordinate description changes; the point itself stays fixed."},
  {s:"Least squares always passes through every data point.",truth:false,why:"Only perfectly collinear data permit zero residuals. Usually it finds the best compromise."},
  {s:"Two perpendicular vectors have dot product zero.",truth:true,why:"cos(90°)=0, so u·v=‖u‖‖v‖cosθ=0."},
  {s:"An eigenvector must keep exactly the same length.",truth:false,why:"It keeps its direction; its length is scaled by the eigenvalue λ."},
  {s:"A larger gradient-descent learning rate is always better.",truth:false,why:"A step that is too large may overshoot the minimum or diverge."},
  {s:"Rows of a design matrix normally represent observations.",truth:true,why:"Each row is one case and each column is one input feature (plus an optional intercept column)."},
  {s:"Vector addition is commutative: u+v always equals v+u.",truth:true,why:"Adding components one-by-one gives the same result regardless of order."},
  {s:"Vector subtraction is commutative: u−v always equals v−u.",truth:false,why:"u−v and v−u point in exactly opposite directions — subtraction is not commutative."},
  {s:"The cross product a×b is commutative: a×b equals b×a.",truth:false,why:"The cross product is anticommutative: a×b = −(b×a), so swapping the order flips its direction."},
  {s:"The cross product is only defined for 3D vectors.",truth:true,why:"The standard cross product produces a perpendicular vector, which only has a well-defined single direction in 3D (2D has a scalar analogue, but not a true cross product)."},
];

function MisconceptionLab(){
  const[answers,setAnswers]=useState<(boolean|null)[]>(Array(misconceptions.length).fill(null));
  return <section className="u1-mistakes"><div className="u1-mistake-head"><div><CircleHelp/><span><b>Mistake detective</b>Decide whether each common statement is true or false.</span></div><strong>{answers.filter((a,i)=>a===misconceptions[i].truth).length}/{misconceptions.length} correct</strong></div><div className="u1-mistake-grid">{misconceptions.map((m,i)=><article key={m.s}><p>{m.s}</p><div><button className={answers[i]===true?(m.truth?"correct":"wrong"):""} onClick={()=>setAnswers(v=>v.map((a,j)=>j===i?true:a))}>True</button><button className={answers[i]===false?(!m.truth?"correct":"wrong"):""} onClick={()=>setAnswers(v=>v.map((a,j)=>j===i?false:a))}>False</button></div>{answers[i]!==null&&<small>{answers[i]===m.truth?<Check/>:<CircleHelp/>}{m.why}</small>}</article>)}</div></section>;
}

function ConceptCard({ chapter }: { chapter: Chapter }){
  const [step,setStep]=useState(0),[choice,setChoice]=useState<number|null>(null);const correct=choice===chapter.check.answer;
  useEffect(()=>{setStep(0);setChoice(null)},[chapter.id]);
  const steps=[{label:"Meaning first",icon:Lightbulb,text:chapter.meaning},{label:"Tiny numerical example",icon:FunctionSquare,text:chapter.example},{label:"Formula connected",icon:Sigma,text:chapter.formula},{label:"Why AI/ML uses it",icon:BrainCircuit,text:chapter.ml}];
  return <section className="u1-concept"><div className="u1-concept-head"><span>{chapter.number}</span><div><p>GUIDED CONCEPT</p><h2>{chapter.title}</h2></div></div><div className="u1-step-tabs">{steps.map((s,i)=>{const I=s.icon;return <button key={s.label} className={step===i?"active":""} onClick={()=>setStep(i)}><I/><span>{i+1}. {s.label}</span></button>})}</div><div className="u1-step-body"><span>0{step+1}</span><div><h3>{steps[step].label}</h3><p>{steps[step].text}</p>{step===2&&<aside>Read every symbol from the example before trying to memorise the expression.</aside>}</div></div><div className="u1-check"><div><CircleHelp/><span><b>Quick check</b>{chapter.check.q}</span></div><div className="u1-check-options">{chapter.check.options.map((o,i)=><button className={choice===null?"":i===chapter.check.answer?"correct":choice===i?"wrong":""} key={o} onClick={()=>setChoice(i)}>{choice!==null&&i===chapter.check.answer?<Check/>:<i>{String.fromCharCode(65+i)}</i>}{o}</button>)}</div>{choice!==null&&<p className={correct?"correct":"wrong"}>{correct?"Correct. ":"Not quite. "}{chapter.check.why}</p>}</div></section>
}

const quiz=[
  {q:"Which operation measures directional similarity?",o:["Determinant","Dot product","Rank"],a:1},
  {q:"What do basis coordinates describe?",o:["A vector using selected basis directions","Only the vector length","The matrix determinant"],a:0},
  {q:"Why can AB and BA produce different results?",o:["Matrix composition depends on order","Their entries disappear","A matrix cannot transform vectors"],a:0},
  {q:"If det(A)=0, what happened to space?",o:["It expanded only","It lost at least one dimension","It stayed identical"],a:1},
  {q:"What does rank count?",o:["Rows in the file","Independent information directions","Only non-zero entries"],a:1},
  {q:"What result does Gram–Schmidt create?",o:["Orthogonal directions","A singular inverse","More observations"],a:0},
  {q:"What does a large condition number indicate?",o:["The solution is sensitive to small noise","The matrix is always rank zero","Gradient descent is complete"],a:0},
  {q:"What is special about an eigenvector?",o:["It keeps its direction under A","It is always [1,1]","Its length is always one"],a:0},
  {q:"Least squares minimises…",o:["the number of points","sum of squared residuals","the slope only"],a:1},
  {q:"Gradient descent updates parameters using…",o:["A direction that reduces loss","Random rank","Only the determinant"],a:0},
  {q:"In ŷ=Xβ, columns of X usually represent…",o:["observations","features","different models"],a:1},
  {q:"Geometrically, u+v is found by…",o:["Placing v's tail at u's tip and connecting start to end","Rotating u by v's length","Finding the midpoint of u and v"],a:0},
  {q:"The distance between two points u and v equals…",o:["‖u−v‖","u·v","u+v"],a:0},
  {q:"The cross product a×b is a vector that is…",o:["Perpendicular to both a and b","Parallel to a","Always the zero vector"],a:0},
  {q:"Which is true about a×b and b×a?",o:["a×b = −(b×a)","a×b = b×a always","They are unrelated"],a:0},
];

function MasteryQuiz(){
 const[answers,setAnswers]=useState<(number|null)[]>(()=>{const saved=readJSON<(number|null)[]>("unit1-quiz-answers",[]);return saved.length===quiz.length?saved:Array(quiz.length).fill(null)}),[submitted,setSubmitted]=useState(()=>readJSON<boolean>("unit1-quiz-submitted",false));
 useEffect(()=>{writeJSON("unit1-quiz-answers",answers)},[answers]);
 useEffect(()=>{writeJSON("unit1-quiz-submitted",submitted)},[submitted]);
 const score=answers.reduce<number>((s,v,i)=>s+(v===quiz[i].a?1:0),0),complete=answers.every(v=>v!==null);
 const reset=()=>{setAnswers(Array(quiz.length).fill(null));setSubmitted(false)};
 return <section className="u1-mastery" id="unit1-quiz"><div className="u1-mastery-head"><div><span><GraduationCapIcon/> MASTERY CHECK</span><h2>Can you connect the whole unit?</h2><p>{quiz.length} questions test meaning—not memorised notation.</p></div>{submitted&&<div className="u1-grade"><strong>{score}/{quiz.length}</strong><span>{score===quiz.length?"Excellent":score>=Math.ceil(quiz.length*0.7)?"Good foundation":"Review the highlighted topics"}</span></div>}</div><div className="u1-quiz-grid">{quiz.map((q,i)=><article key={q.q}><b>{i+1}</b><p>{q.q}</p>{q.o.map((o,j)=><button disabled={submitted} aria-pressed={answers[i]===j} className={submitted?(j===q.a?"correct":answers[i]===j?"wrong":""):answers[i]===j?"selected":""} onClick={()=>setAnswers(v=>v.map((x,k)=>k===i?j:x))} key={o}>{o}</button>)}</article>)}</div><div className="u1-quiz-actions"><button className="u1-primary" disabled={!complete} onClick={()=>setSubmitted(true)}>{submitted?"Score shown":"Check my answers"}<ArrowRight/></button>{submitted&&<button className="u1-secondary" onClick={reset}><RotateCcw/>Try again</button>}<span>{complete?"All questions answered":"Answer every question to check your score"}</span></div></section>
}

function GraduationCapIcon(){return <BookOpen/>}

export default function Unit1Studio(){
  const[active,setActive]=useState<string>(()=>{const saved=readJSON<string|null>("unit1-active-chapter",null);return saved&&chapters.some(c=>c.id===saved)?saved:chapters[0].id}),[complete,setComplete]=useState<string[]>([]),[missionDone,setMissionDone]=useState<string[]>([]);const chapter=chapters.find(c=>c.id===active)!;
  useEffect(()=>{try{const s=localStorage.getItem("unit1-topic-progress");if(s)setComplete(JSON.parse(s))}catch{}},[]);
  useEffect(()=>{localStorage.setItem("unit1-topic-progress",JSON.stringify(complete))},[complete]);
  useEffect(()=>{try{const s=localStorage.getItem("unit1-mission-progress");if(s)setMissionDone(JSON.parse(s))}catch{}},[]);
  useEffect(()=>{localStorage.setItem("unit1-mission-progress",JSON.stringify(missionDone))},[missionDone]);
  useEffect(()=>{writeJSON("unit1-active-chapter",active)},[active]);
  const index=chapters.findIndex(c=>c.id===active),pct=Math.round(complete.length/chapters.length*100),next=chapters[index+1],prev=chapters[index-1];
  const mark=()=>{if(!complete.includes(active))setComplete(v=>[...v,active]);if(next){setActive(next.id);setTimeout(()=>document.getElementById("unit1-studio")?.scrollIntoView({behavior:"smooth"}),50)}};
  const goTo=(id:string)=>{setActive(id);document.getElementById("unit1-concept")?.scrollIntoView({behavior:"smooth"})};
  const learningPath=useMemo(()=>chapters.map(c=>({c,done:complete.includes(c.id)})),[complete]);
  const toggleMission=(key:string)=>setMissionDone(v=>v.includes(key)?v.filter(x=>x!==key):[...v,key]);
  return <div className="u1-wrap" id="unit1-studio"><section className="u1-intro"><div><span className="u1-eyebrow"><Sparkles aria-hidden="true"/> UNIT 1 · COMPLETE LEARNING STUDIO</span><h2>Linear algebra you can <em>see, change and explain</em></h2><p>Move from one vector to full matrix regression through eighteen connected topics. Every topic follows meaning → tiny numbers → visual experiment → ML use.</p><div className="u1-objectives"><span><CheckCircle2 aria-hidden="true"/>Interpret vectors and matrices</span><span><CheckCircle2 aria-hidden="true"/>Diagnose rank and instability</span><span><CheckCircle2 aria-hidden="true"/>Solve, fit and optimise models</span><span><CheckCircle2 aria-hidden="true"/>Connect algebra to AI</span></div></div><div className="u1-progress-ring" style={{"--p":`${pct*3.6}deg`} as React.CSSProperties}><div><strong>{pct}%</strong><span>{complete.length}/{chapters.length} topics</span></div></div></section><section className="u1-path"><div className="u1-path-head"><div><p>YOUR LEARNING PATH</p><h2>Choose a topic</h2></div><span>Progress saves automatically</span></div><div className="u1-topic-grid" role="tablist" aria-label="Unit 1 topics">{learningPath.map(({c,done})=>{const I=c.icon;return <button key={c.id} role="tab" aria-selected={active===c.id} aria-current={active===c.id?"true":undefined} className={active===c.id?"active":""} onClick={()=>goTo(c.id)}><span><I aria-hidden="true"/></span><div><small>{c.number}</small><b>{c.short}</b></div>{done?<i aria-label="completed"><Check aria-hidden="true"/></i>:<ChevronDown aria-hidden="true"/>}</button>})}</div></section><div id="unit1-concept"><nav className="u1-chapter-nav" aria-label="Adjacent topics"><button disabled={!prev} onClick={()=>prev&&goTo(prev.id)}><ChevronLeft aria-hidden="true"/><span>{prev?<><small>Previous</small><b>{prev.number} {prev.short}</b></>:<b>Start of unit</b>}</span></button><span className="u1-chapter-nav-count">{index+1} / {chapters.length}</span><button disabled={!next} onClick={()=>next&&goTo(next.id)}><span>{next?<><small>Next</small><b>{next.number} {next.short}</b></>:<b>End of unit</b>}</span><ChevronRight aria-hidden="true"/></button></nav><ConceptCard chapter={chapter}/><ChapterLab id={chapter.id}/><MissionPanel chapter={chapter} completed={missionDone} toggle={toggleMission}/><PythonPanel chapter={chapter}/><section className="u1-topic-finish"><div><CheckCircle2 aria-hidden="true"/><span><b>Finished experimenting with {chapter.number}?</b>Mark it understood and continue. You can revisit it at any time.</span></div><button onClick={mark}>{complete.includes(active)?"Continue":`Mark ${chapter.number} understood`}<ArrowRight aria-hidden="true"/></button></section></div><section className="u1-map"><div><Network aria-hidden="true"/><span><b>The unit in one sentence</b>Vectors define directions → bases describe them → matrices transform and compose them → rank and conditioning test information quality → least squares and gradient descent learn predictions.</span></div></section><MisconceptionLab/><MasteryQuiz/></div>;
}
