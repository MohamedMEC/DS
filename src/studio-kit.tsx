import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Code2,
  FunctionSquare,
  Lightbulb,
  Network,
  Play,
  RotateCcw,
  Sigma,
  Sparkles,
} from "lucide-react";

function readJSON<T>(key: string, fallback: T): T {
  try { const s = localStorage.getItem(key); if (s) return JSON.parse(s) as T; } catch { }
  return fallback;
}
function writeJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { }
}

// ---------------------------------------------------------------------------
// Shared "learning studio" kit used by every unit's deep-dive component.
// Extracted from Unit1.tsx so Units 2-5 can reuse the exact same interaction
// pattern (meaning -> example -> formula -> ml -> quick check -> live SVG lab
// -> missions -> python panel -> misconceptions -> mastery quiz) without
// duplicating boilerplate. All CSS classes (u1-*) are already unit-agnostic
// in style.css, so no new styling is required.
// ---------------------------------------------------------------------------

export type Chapter = {
  id: string;
  number: string;
  title: string;
  short: string;
  icon: any;
  meaning: string;
  example: string;
  formula: string;
  ml: string;
  check: { q: string; options: string[]; answer: number; why: string };
};

export type Mission = string[];
export type PythonSample = { code: string; output: string };
export type Misconception = { s: string; truth: boolean; why: string };
export type QuizQuestion = { q: string; o: string[]; a: number };

export const f = (n: number, digits = 2) =>
  Number.isFinite(n) ? n.toFixed(digits).replace(/\.00$/, "") : "—";
export const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

export function MiniRange({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (n: number) => void }) {
  return <label className="u1-range"><span>{label}<output>{f(value, 1)}</output></span><input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} /></label>;
}

export function NumberBox({ label, value, onChange, step = "0.5" }: { label: string; value: number; onChange: (n: number) => void; step?: string }) {
  return <label className="u1-number"><span>{label}</span><input type="number" value={value} step={step} onChange={e => onChange(Number(e.target.value))} /></label>;
}

export function Stat({ label, value, note, good }: { label: string; value: string; note?: string; good?: boolean }) {
  return <div className={`u1-stat ${good ? "good" : ""}`}><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>;
}

export function LabShell({ title, goal, children }: { title: string; goal: string; children: React.ReactNode }) {
  return <section className="u1-lab-shell"><div className="u1-lab-title"><div><span><Play /> INTERACTIVE LAB</span><h3>{title}</h3><p>{goal}</p></div><b><i /> LIVE</b></div>{children}</section>;
}

export const sx = (x: number) => 210 + x * 42;
export const sy = (y: number) => 190 - y * 42;

export function Plane({ children, label = "Interactive coordinate plane" }: { children: React.ReactNode; label?: string }) {
  return <svg className="u1-plane" viewBox="0 0 420 380" role="img" aria-label={label}>
    {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map(i => <g key={i}><line x1={sx(i)} y1="20" x2={sx(i)} y2="360" className={i === 0 ? "u1-axis" : "u1-grid"} /><line x1="30" y1={sy(i)} x2="390" y2={sy(i)} className={i === 0 ? "u1-axis" : "u1-grid"} />{i !== 0 && <><text x={sx(i)} y={sy(0) + 17} textAnchor="middle">{i}</text><text x={sx(0) - 10} y={sy(i) + 4} textAnchor="end">{i}</text></>}</g>)}
    <defs><marker id="arrow-purple" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L0,7 L6,3.5 z" fill="#6d4aff" /></marker><marker id="arrow-coral" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L0,7 L6,3.5 z" fill="#ec5d67" /></marker><marker id="arrow-green" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L0,7 L6,3.5 z" fill="#0e9f6e" /></marker></defs>
    {children}
  </svg>;
}

export function MissionPanel({ chapter, missions, completed, toggle }: { chapter: Chapter; missions: Record<string, Mission>; completed: string[]; toggle: (key: string) => void }) {
  const list = missions[chapter.id] || [];
  return <section className="u1-missions"><div className="u1-mission-head"><div><Play /><span><b>Experiment missions</b>Do these inside the live lab—then tick only when you can explain what happened.</span></div><strong>{list.filter((_, i) => completed.includes(`${chapter.id}-${i}`)).length}/{list.length}</strong></div><div className="u1-mission-grid">{list.map((m, i) => { const key = `${chapter.id}-${i}`, done = completed.includes(key); return <button className={done ? "done" : ""} key={m} onClick={() => toggle(key)}><i>{done ? <Check /> : i + 1}</i><span>{m}</span></button>; })}</div></section>;
}

export function PythonPanel({ chapter, pythonByChapter }: { chapter: Chapter; pythonByChapter: Record<string, PythonSample> }) {
  const [open, setOpen] = useState(false), [ran, setRan] = useState(false), sample = pythonByChapter[chapter.id];
  useEffect(() => { setOpen(false); setRan(false); }, [chapter.id]);
  if (!sample) return null;
  return <section className="u1-python"><div><div><Code2 /><span><b>NumPy connection</b>See how the visual experiment is expressed in Python — this is a worked reference, not a live code runner.</span></div><button onClick={() => setOpen(v => !v)}>{open ? "Hide code" : "Open code lab"}<ChevronDown /></button></div>{open && <div className="u1-python-body"><div className="u1-code-window"><header><i /><i /><i /><span>{chapter.id}_lab.py</span></header><pre><code>import numpy as np{"\n\n"}{sample.code}</code></pre></div><div className="u1-run-panel"><button onClick={() => setRan(true)}><Play />Reveal expected output</button><span>Expected output</span><pre>{ran ? sample.output : "Click \"Reveal expected output\" to check your own reasoning against it."}</pre></div></div>}</section>;
}

export function ConceptCard({ chapter }: { chapter: Chapter }) {
  const [step, setStep] = useState(0), [choice, setChoice] = useState<number | null>(null);
  const correct = choice === chapter.check.answer;
  useEffect(() => { setStep(0); setChoice(null); }, [chapter.id]);
  const steps = [{ label: "Meaning first", icon: Lightbulb, text: chapter.meaning }, { label: "Tiny numerical example", icon: FunctionSquare, text: chapter.example }, { label: "Formula connected", icon: Sigma, text: chapter.formula }, { label: "Why AI/ML uses it", icon: BrainCircuit, text: chapter.ml }];
  return <section className="u1-concept"><div className="u1-concept-head"><span>{chapter.number}</span><div><p>GUIDED CONCEPT</p><h2>{chapter.title}</h2></div></div><div className="u1-step-tabs" role="tablist" aria-label="Concept steps">{steps.map((s, i) => { const I = s.icon; return <button key={s.label} role="tab" aria-selected={step === i} className={step === i ? "active" : ""} onClick={() => setStep(i)}><I aria-hidden="true" /><span>{i + 1}. {s.label}</span></button>; })}</div><div className="u1-step-body"><span>0{step + 1}</span><div><h3>{steps[step].label}</h3><p>{steps[step].text}</p></div></div><div className="u1-check"><div><CircleHelp /><span><b>Quick check</b>{chapter.check.q}</span></div><div className="u1-check-options">{chapter.check.options.map((o, i) => <button className={choice === null ? "" : i === chapter.check.answer ? "correct" : choice === i ? "wrong" : ""} key={o} onClick={() => setChoice(i)}>{choice !== null && i === chapter.check.answer ? <Check /> : <i>{String.fromCharCode(65 + i)}</i>}{o}</button>)}</div>{choice !== null && <p className={correct ? "correct" : "wrong"}>{correct ? "Correct. " : "Not quite. "}{chapter.check.why}</p>}</div></section>;
}

export function MisconceptionLab({ items }: { items: Misconception[] }) {
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(items.length).fill(null));
  return <section className="u1-mistakes"><div className="u1-mistake-head"><div><CircleHelp /><span><b>Mistake detective</b>Decide whether each common statement is true or false.</span></div><strong>{answers.filter((a, i) => a === items[i].truth).length}/{items.length} correct</strong></div><div className="u1-mistake-grid">{items.map((m, i) => <article key={m.s}><p>{m.s}</p><div><button className={answers[i] === true ? (m.truth ? "correct" : "wrong") : ""} onClick={() => setAnswers(v => v.map((a, j) => j === i ? true : a))}>True</button><button className={answers[i] === false ? (!m.truth ? "correct" : "wrong") : ""} onClick={() => setAnswers(v => v.map((a, j) => j === i ? false : a))}>False</button></div>{answers[i] !== null && <small>{answers[i] === m.truth ? <Check /> : <CircleHelp />}{m.why}</small>}</article>)}</div></section>;
}

export function MasteryQuiz({ quiz, storageId, title, subtitle }: { quiz: QuizQuestion[]; storageId: string; title: string; subtitle: string }) {
  const answersKey = `${storageId}-answers`, submittedKey = `${storageId}-submitted`;
  const [answers, setAnswers] = useState<(number | null)[]>(() => { const saved = readJSON<(number | null)[]>(answersKey, []); return saved.length === quiz.length ? saved : Array(quiz.length).fill(null); });
  const [submitted, setSubmitted] = useState(() => readJSON<boolean>(submittedKey, false));
  useEffect(() => { writeJSON(answersKey, answers); }, [answers, answersKey]);
  useEffect(() => { writeJSON(submittedKey, submitted); }, [submitted, submittedKey]);
  const score = answers.reduce<number>((s, v, i) => s + (v === quiz[i].a ? 1 : 0), 0), complete = answers.every(v => v !== null);
  const reset = () => { setAnswers(Array(quiz.length).fill(null)); setSubmitted(false); };
  return <section className="u1-mastery" id={storageId}><div className="u1-mastery-head"><div><span><BookOpen /> MASTERY CHECK</span><h2>{title}</h2><p>{subtitle}</p></div>{submitted && <div className="u1-grade"><strong>{score}/{quiz.length}</strong><span>{score === quiz.length ? "Excellent" : score >= Math.ceil(quiz.length * 0.7) ? "Good foundation" : "Review the highlighted topics"}</span></div>}</div><div className="u1-quiz-grid">{quiz.map((q, i) => <article key={q.q}><b>{i + 1}</b><p>{q.q}</p>{q.o.map((o, j) => <button disabled={submitted} aria-pressed={answers[i] === j} className={submitted ? (j === q.a ? "correct" : answers[i] === j ? "wrong" : "") : answers[i] === j ? "selected" : ""} onClick={() => setAnswers(v => v.map((x, k) => k === i ? j : x))} key={o}>{o}</button>)}</article>)}</div><div className="u1-quiz-actions"><button className="u1-primary" disabled={!complete} onClick={() => setSubmitted(true)}>{submitted ? "Score shown" : "Check my answers"}<ArrowRight /></button>{submitted && <button className="u1-secondary" onClick={reset}><RotateCcw />Try again</button>}<span>{complete ? "All questions answered" : "Answer every question to check your score"}</span></div></section>;
}

export type StudioShellProps = {
  unitKey: string; // short unique slug, e.g. "unit2" — used for localStorage keys and DOM ids
  eyebrow: string;
  heading: React.ReactNode;
  description: string;
  objectives: string[];
  chapters: Chapter[];
  missions: Record<string, Mission>;
  pythonByChapter: Record<string, PythonSample>;
  renderLab: (id: string) => React.ReactNode;
  summarySentence: string;
  misconceptions: Misconception[];
  quiz: QuizQuestion[];
  quizTitle: string;
  quizSubtitle: string;
};

/** Generic orchestrator that reproduces Unit1Studio's layout for any unit. */
export function StudioShell(props: StudioShellProps) {
  const { unitKey, eyebrow, heading, description, objectives, chapters, missions, pythonByChapter, renderLab, summarySentence, misconceptions, quiz, quizTitle, quizSubtitle } = props;
  const topicKey = `${unitKey}-topic-progress`, missionKey = `${unitKey}-mission-progress`, activeKey = `${unitKey}-active-chapter`;
  const [active, setActive] = useState<string>(() => { const saved = readJSON<string | null>(activeKey, null); return saved && chapters.some(c => c.id === saved) ? saved : chapters[0].id; });
  const [complete, setComplete] = useState<string[]>([]);
  const [missionDone, setMissionDone] = useState<string[]>([]);
  const chapter = chapters.find(c => c.id === active)!;
  useEffect(() => { try { const s = localStorage.getItem(topicKey); if (s) setComplete(JSON.parse(s)); } catch { } }, [topicKey]);
  useEffect(() => { localStorage.setItem(topicKey, JSON.stringify(complete)); }, [complete, topicKey]);
  useEffect(() => { try { const s = localStorage.getItem(missionKey); if (s) setMissionDone(JSON.parse(s)); } catch { } }, [missionKey]);
  useEffect(() => { localStorage.setItem(missionKey, JSON.stringify(missionDone)); }, [missionDone, missionKey]);
  useEffect(() => { writeJSON(activeKey, active); }, [active, activeKey]);
  const index = chapters.findIndex(c => c.id === active), pct = Math.round(complete.length / chapters.length * 100), next = chapters[index + 1], prev = chapters[index - 1];
  const mark = () => { if (!complete.includes(active)) setComplete(v => [...v, active]); if (next) { setActive(next.id); setTimeout(() => document.getElementById(`${unitKey}-studio`)?.scrollIntoView({ behavior: "smooth" }), 50); } };
  const goTo = (id: string) => { setActive(id); document.getElementById(`${unitKey}-concept`)?.scrollIntoView({ behavior: "smooth" }); };
  const learningPath = useMemo(() => chapters.map(c => ({ c, done: complete.includes(c.id) })), [complete, chapters]);
  const toggleMission = (key: string) => setMissionDone(v => v.includes(key) ? v.filter(x => x !== key) : [...v, key]);
  return <div className="u1-wrap" id={`${unitKey}-studio`}>
    <section className="u1-intro"><div><span className="u1-eyebrow"><Sparkles /> {eyebrow}</span><h2>{heading}</h2><p>{description}</p><div className="u1-objectives">{objectives.map(o => <span key={o}><CheckCircle2 />{o}</span>)}</div></div><div className="u1-progress-ring" style={{ "--p": `${pct * 3.6}deg` } as React.CSSProperties}><div><strong>{pct}%</strong><span>{complete.length}/{chapters.length} topics</span></div></div></section>
    <section className="u1-path"><div className="u1-path-head"><div><p>YOUR LEARNING PATH</p><h2>Choose a topic</h2></div><span>Progress saves automatically</span></div><div className="u1-topic-grid" role="tablist" aria-label="Unit topics">{learningPath.map(({ c, done }) => { const I = c.icon; return <button key={c.id} role="tab" aria-selected={active === c.id} aria-current={active === c.id ? "true" : undefined} className={active === c.id ? "active" : ""} onClick={() => goTo(c.id)}><span><I aria-hidden="true" /></span><div><small>{c.number}</small><b>{c.short}</b></div>{done ? <i aria-label="completed"><Check aria-hidden="true" /></i> : <ChevronDown aria-hidden="true" />}</button>; })}</div></section>
    <div id={`${unitKey}-concept`}>
      <nav className="u1-chapter-nav" aria-label="Adjacent topics">
        <button disabled={!prev} onClick={() => prev && goTo(prev.id)}><ChevronLeft aria-hidden="true" /><span>{prev ? <><small>Previous</small><b>{prev.number} {prev.short}</b></> : <b>Start of unit</b>}</span></button>
        <span className="u1-chapter-nav-count">{index + 1} / {chapters.length}</span>
        <button disabled={!next} onClick={() => next && goTo(next.id)}><span>{next ? <><small>Next</small><b>{next.number} {next.short}</b></> : <b>End of unit</b>}</span><ChevronRight aria-hidden="true" /></button>
      </nav>
      <ConceptCard chapter={chapter} />{renderLab(chapter.id)}<MissionPanel chapter={chapter} missions={missions} completed={missionDone} toggle={toggleMission} /><PythonPanel chapter={chapter} pythonByChapter={pythonByChapter} /><section className="u1-topic-finish"><div><CheckCircle2 /><span><b>Finished experimenting with {chapter.number}?</b>Mark it understood and continue. You can revisit it at any time.</span></div><button onClick={mark}>{complete.includes(active) ? "Continue" : `Mark ${chapter.number} understood`}<ArrowRight /></button></section>
    </div>
    <section className="u1-map"><div><Network /><span><b>The unit in one sentence</b>{summarySentence}</span></div></section>
    <MisconceptionLab items={misconceptions} />
    <MasteryQuiz quiz={quiz} storageId={`${unitKey}-quiz`} title={quizTitle} subtitle={quizSubtitle} />
  </div>;
}
