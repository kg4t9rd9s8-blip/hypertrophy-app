import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3, CalendarDays, Check, ChevronDown, Dumbbell, History, Home,
  Minus, Plus, RotateCcw, Settings, Sparkles, Target, Timer, Trash2,
  TrendingUp, Trophy, Zap
} from "lucide-react";
import {
  Area, AreaChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";

function Button({ className = "", children, onClick, type = "button", disabled = false, ...props }) {
  return <button type={type} onClick={onClick} disabled={disabled} className={className} {...props}>{children}</button>;
}

const STORAGE_KEY = "brandon_hypertrophy_native_v1";
const defaultProfile = {
  name: "Brandon",
  goal: "Hypertrophy",
  experience: "Advanced",
  priority: "Upper chest / delts",
  frequency: 5,
  progressionStyle: "Double progression",
  deloadFrequency: 6,
  units: "kg"
};

const defaultExercises = [
  { id: "flat-bench", day: "Push A", name: "Flat Barbell Bench Press", sets: 3, targetMin: 6, targetMax: 10, rirTarget: 1, increment: 2.5, muscle: "Chest", icon: "◐", rest: 150 },
  { id: "incline-db", day: "Push A", name: "Incline Dumbbell Press", sets: 3, targetMin: 8, targetMax: 12, rirTarget: 1, increment: 2, muscle: "Chest", icon: "◓", rest: 120 },
  { id: "pec-dec", day: "Push A", name: "Pec Dec", sets: 3, targetMin: 10, targetMax: 15, rirTarget: 1, increment: 2.5, muscle: "Chest", icon: "◎", rest: 90 },
  { id: "cable-lat-raise", day: "Push A", name: "Cable Lateral Raise", sets: 4, targetMin: 12, targetMax: 20, rirTarget: 1, increment: 1, muscle: "Delts", icon: "◇", rest: 75 },
  { id: "rope-pressdown", day: "Push A", name: "Rope Triceps Pressdown", sets: 3, targetMin: 10, targetMax: 15, rirTarget: 1, increment: 2.5, muscle: "Triceps", icon: "⌁", rest: 75 },
  { id: "pullup", day: "Pull A", name: "Pull-ups / Assisted Pull-ups", sets: 3, targetMin: 6, targetMax: 10, rirTarget: 1, increment: 2.5, muscle: "Back", icon: "↑", rest: 150 },
  { id: "seated-row", day: "Pull A", name: "Seated Cable Row", sets: 3, targetMin: 8, targetMax: 12, rirTarget: 1, increment: 2.5, muscle: "Back", icon: "↔", rest: 120 },
  { id: "lat-pulldown", day: "Pull A", name: "Lat Pulldown", sets: 3, targetMin: 10, targetMax: 15, rirTarget: 1, increment: 2.5, muscle: "Lats", icon: "↓", rest: 105 },
  { id: "rear-delt-cable", day: "Pull A", name: "Cable Rear Delt Fly", sets: 3, targetMin: 12, targetMax: 20, rirTarget: 1, increment: 1, muscle: "Rear Delts", icon: "◇", rest: 75 },
  { id: "db-curl", day: "Pull A", name: "Incline DB Curl", sets: 3, targetMin: 8, targetMax: 12, rirTarget: 1, increment: 2, muscle: "Biceps", icon: "⌐", rest: 75 },
  { id: "squat", day: "Legs A", name: "Back Squat", sets: 3, targetMin: 6, targetMax: 10, rirTarget: 1, increment: 2.5, muscle: "Quads", icon: "▰", rest: 180 },
  { id: "rdl", day: "Legs A", name: "Romanian Deadlift", sets: 3, targetMin: 8, targetMax: 12, rirTarget: 1, increment: 2.5, muscle: "Hamstrings", icon: "▱", rest: 150 },
  { id: "leg-extension", day: "Legs A", name: "Leg Extension", sets: 3, targetMin: 10, targetMax: 15, rirTarget: 1, increment: 2.5, muscle: "Quads", icon: "▰", rest: 90 },
  { id: "leg-curl", day: "Legs A", name: "Leg Curl", sets: 3, targetMin: 10, targetMax: 15, rirTarget: 1, increment: 2.5, muscle: "Hamstrings", icon: "▱", rest: 90 },
  { id: "calf-raise", day: "Legs A", name: "Standing Calf Raise", sets: 4, targetMin: 8, targetMax: 15, rirTarget: 1, increment: 2.5, muscle: "Calves", icon: "▵", rest: 75 },
  { id: "incline-bench", day: "Upper B", name: "Incline Barbell Bench Press", sets: 3, targetMin: 6, targetMax: 10, rirTarget: 1, increment: 2.5, muscle: "Chest", icon: "◓", rest: 150 },
  { id: "chest-supported-row", day: "Upper B", name: "Chest-Supported DB Row", sets: 3, targetMin: 8, targetMax: 12, rirTarget: 1, increment: 2, muscle: "Back", icon: "↔", rest: 120 },
  { id: "db-shoulder-press", day: "Upper B", name: "DB Shoulder Press", sets: 3, targetMin: 8, targetMax: 12, rirTarget: 1, increment: 2, muscle: "Delts", icon: "△", rest: 120 },
  { id: "single-arm-pulldown", day: "Upper B", name: "Single-Arm Cable Pulldown", sets: 3, targetMin: 10, targetMax: 15, rirTarget: 1, increment: 1, muscle: "Lats", icon: "↓", rest: 90 },
  { id: "overhead-triceps", day: "Upper B", name: "Overhead Cable Triceps Extension", sets: 3, targetMin: 10, targetMax: 15, rirTarget: 1, increment: 1, muscle: "Triceps", icon: "⌁", rest: 75 },
  { id: "hammer-curl", day: "Upper B", name: "DB Hammer Curl", sets: 3, targetMin: 10, targetMax: 15, rirTarget: 1, increment: 2, muscle: "Biceps", icon: "⌐", rest: 75 },
  { id: "deadlift", day: "Lower B", name: "Deadlift", sets: 2, targetMin: 4, targetMax: 6, rirTarget: 2, increment: 2.5, muscle: "Posterior Chain", icon: "◆", rest: 210 },
  { id: "front-squat", day: "Lower B", name: "Front Squat / High-Bar Squat", sets: 3, targetMin: 8, targetMax: 12, rirTarget: 1, increment: 2.5, muscle: "Quads", icon: "▰", rest: 150 },
  { id: "bulgarian", day: "Lower B", name: "Bulgarian Split Squat", sets: 3, targetMin: 8, targetMax: 12, rirTarget: 1, increment: 2, muscle: "Quads/Glutes", icon: "◩", rest: 120 },
  { id: "adductor", day: "Lower B", name: "Adductor Machine", sets: 3, targetMin: 12, targetMax: 20, rirTarget: 1, increment: 2.5, muscle: "Adductors", icon: "◁", rest: 75 },
  { id: "abductor", day: "Lower B", name: "Abductor Machine", sets: 3, targetMin: 12, targetMax: 20, rirTarget: 1, increment: 2.5, muscle: "Glutes", icon: "▷", rest: 75 }
];

const days = ["Push A", "Pull A", "Legs A", "Upper B", "Lower B"];
const nav = [
  { id: "today", label: "Today", icon: Home },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "history", label: "History", icon: History },
  { id: "library", label: "Library", icon: Dumbbell },
  { id: "settings", label: "Settings", icon: Settings }
];

const ui = {
  page: "min-h-screen bg-[#F5F5F7] px-4 py-5 pb-28 text-[#1D1D1F] antialiased",
  screen: "relative mx-auto max-w-md space-y-5",
  title: "text-[36px] font-black tracking-[-0.045em] text-[#1D1D1F]",
  sub: "text-[15px] font-semibold leading-relaxed text-[#6E6E73]",
  label: "text-[11px] font-black uppercase tracking-[0.16em] text-[#8E8E93]",
  group: "overflow-hidden rounded-[1.75rem] border border-black/[0.06] bg-white shadow-[0_8px_28px_rgba(0,0,0,0.055)]",
  divider: "border-t border-black/[0.06]",
  field: "w-full rounded-[1.15rem] border border-black/[0.08] bg-white px-4 py-3 text-base font-semibold text-[#1D1D1F] shadow-sm outline-none placeholder:text-[#86868B] focus:border-[#007AFF]/40 focus:ring-4 focus:ring-[#007AFF]/20",
  primary: "flex min-h-[58px] w-full items-center justify-center rounded-[1.35rem] bg-[#007AFF] px-5 text-[17px] font-black tracking-[-0.02em] text-white shadow-[0_10px_26px_rgba(0,122,255,0.22)] transition active:scale-[0.985]",
  secondary: "flex min-h-[52px] items-center justify-center rounded-[1.25rem] bg-[#F2F2F7] px-4 text-[15px] font-black text-[#007AFF] transition active:scale-[0.985]"
};

function emptySetData(sets, weight = "") {
  return Array.from({ length: sets }, () => ({ weight, reps: "", rir: "", complete: false }));
}

function roundToIncrement(value, increment) {
  const n = Number(value);
  const inc = Number(increment) || 1;
  if (!Number.isFinite(n)) return "";
  return Math.round(n / inc) * inc;
}

function haptic(ms = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try { navigator.vibrate(ms); } catch {}
  }
}

function getExerciseSessions(logs, exerciseId) {
  return logs.filter((l) => l.exerciseId === exerciseId).sort((a, b) => new Date(b.date) - new Date(a.date));
}
function getLastSession(logs, exerciseId) { return getExerciseSessions(logs, exerciseId)[0]; }
function bestWeightFromSession(session) {
  if (!session) return "";
  const weights = session.sets.map((s) => Number(s.weight)).filter((n) => Number.isFinite(n) && n > 0);
  return weights.length ? Math.max(...weights) : "";
}
function sessionVolume(session) {
  if (!session) return 0;
  return session.sets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
}
function sessionStats(session, exercise) {
  if (!session) return null;
  const completed = session.sets.filter((s) => Number(s.weight) > 0 && Number(s.reps) > 0);
  if (!completed.length) return null;
  const reps = completed.map((s) => Number(s.reps));
  const rirs = completed.map((s) => Number(s.rir)).filter((n) => Number.isFinite(n));
  const avgRir = rirs.length ? rirs.reduce((a, b) => a + b, 0) / rirs.length : null;
  return {
    allTopRange: reps.every((r) => r >= exercise.targetMax),
    belowMin: reps.some((r) => r < exercise.targetMin),
    tooHard: avgRir !== null && avgRir < 0.5,
    tooEasy: avgRir !== null && avgRir >= exercise.rirTarget + 1,
    avgRir
  };
}

function isPriorityExercise(exercise, profile) {
  const priority = String(profile?.priority || profile?.weakPoint || "").toLowerCase();
  const name = String(exercise?.name || "").toLowerCase();
  const muscle = String(exercise?.muscle || "").toLowerCase();

  if (!priority) return false;

  if (priority.includes("upper chest") && (name.includes("incline") || muscle.includes("chest"))) return true;
  if (priority.includes("delt") && muscle.includes("delt")) return true;
  if (priority.includes("back") && (muscle.includes("back") || muscle.includes("lat"))) return true;
  if (priority.includes("arms") && (muscle.includes("biceps") || muscle.includes("triceps"))) return true;
  if (priority.includes("legs") && (muscle.includes("quad") || muscle.includes("hamstring") || muscle.includes("glute"))) return true;

  return priority
    .split(/[\/, ]+/)
    .filter(Boolean)
    .some((token) => name.includes(token) || muscle.includes(token));
}

function getProgressionRules(profile, exercise) {
  const goal = String(profile?.goal || "Hypertrophy").toLowerCase();
  const experience = String(profile?.experience || "Advanced").toLowerCase();
  const style = String(profile?.progressionStyle || "Double progression").toLowerCase();

  let incrementMultiplier = 1;
  let topRangeBuffer = 0;
  let rirBuffer = 0;

  if (experience.includes("beginner")) {
    incrementMultiplier = 1.25;
    topRangeBuffer = -1;
  }

  if (experience.includes("intermediate")) {
    incrementMultiplier = 1;
  }

  if (experience.includes("advanced")) {
    incrementMultiplier = 0.75;
    rirBuffer = 0.25;
  }

  if (goal.includes("strength")) {
    incrementMultiplier += 0.25;
    rirBuffer += 0.25;
  }

  if (goal.includes("maintenance")) {
    incrementMultiplier = 0.5;
    topRangeBuffer = 1;
  }

  if (goal.includes("fat")) {
    incrementMultiplier = 0.75;
    topRangeBuffer = 0;
  }

  if (style.includes("conservative")) {
    incrementMultiplier *= 0.75;
    topRangeBuffer += 1;
  }

  if (style.includes("aggressive")) {
    incrementMultiplier *= 1.25;
    topRangeBuffer -= 1;
  }

  if (isPriorityExercise(exercise, profile)) {
    topRangeBuffer -= 1;
  }

  return {
    incrementMultiplier,
    topRangeBuffer,
    rirBuffer
  };
}

function adjustedIncrement(exercise, profile) {
  const base = Number(exercise.increment) || 1;
  const rules = getProgressionRules(profile, exercise);
  const raw = base * rules.incrementMultiplier;

  if (base >= 2.5) return Math.max(1.25, roundToIncrement(raw, 1.25));
  if (base >= 2) return Math.max(1, roundToIncrement(raw, 1));
  return Math.max(0.5, roundToIncrement(raw, 0.5));
}

function recommendation(exercise, lastSession, weekNumber, readiness, profile = defaultProfile) {
  const lastWeight = bestWeightFromSession(lastSession);
  const deloadFrequency = Number(profile?.deloadFrequency) || 6;
  const deload = weekNumber % deloadFrequency === 0;
  const readinessPenalty = readiness < 55;
  const priority = isPriorityExercise(exercise, profile);
  const rules = getProgressionRules(profile, exercise);
  const increment = adjustedIncrement(exercise, profile);

  if (!lastSession || lastWeight === "") {
    return {
      label: priority ? "Priority calibrate" : "Calibrate",
      weight: "",
      tone: "neutral",
      reason: priority
        ? "Priority movement. Pick a controlled load with 1–2 RIR and log it cleanly."
        : "Choose a load that leaves 1–2 RIR. First exposure is calibration."
    };
  }

  const stats = sessionStats(lastSession, exercise);

  if (!stats) {
    return {
      label: "Repeat",
      weight: lastWeight,
      tone: "neutral",
      reason: "Previous data was incomplete. Repeat and log properly."
    };
  }

  if (deload || readinessPenalty) {
    return {
      label: "Regulate",
      weight: roundToIncrement(lastWeight * 0.9, exercise.increment),
      tone: "warning",
      reason: deload
        ? `Scheduled deload. Your profile is set to deload every ${deloadFrequency} weeks.`
        : "Readiness is low. Reduce load and protect recovery."
    };
  }

  const targetForIncrease = Math.max(exercise.targetMin, exercise.targetMax + rules.topRangeBuffer);
  const avgRirOkay = stats.avgRir === null || stats.avgRir >= exercise.rirTarget + rules.rirBuffer;
  const reps = lastSession.sets.map((s) => Number(s.reps) || 0);
  const reachedTarget = reps.every((r) => r >= targetForIncrease);

  if (reachedTarget && avgRirOkay && !stats.tooHard) {
    return {
      label: priority ? "Priority increase" : "Increase",
      weight: roundToIncrement(Number(lastWeight) + increment, exercise.increment),
      tone: "good",
      reason: priority
        ? `Priority exercise matched your profile target. Add load if execution stayed strict.`
        : "Target reps achieved without excessive grind. Add load."
    };
  }

  if (stats.belowMin || stats.tooHard) {
    return {
      label: "Reduce",
      weight: roundToIncrement(Number(lastWeight) - Number(exercise.increment), exercise.increment),
      tone: "bad",
      reason: "Too heavy for productive hypertrophy. Fix the load."
    };
  }

  if (stats.tooEasy) {
    return {
      label: priority ? "Priority increase" : "Increase",
      weight: roundToIncrement(Number(lastWeight) + increment, exercise.increment),
      tone: "good",
      reason: "RIR suggests the work was under-dosed."
    };
  }

  return {
    label: priority ? "Priority hold" : "Hold",
    weight: lastWeight,
    tone: "neutral",
    reason: priority
      ? "Priority movement. Hold load and push reps with strict execution."
      : "Keep load and beat reps before increasing."
  };
}

function recClass(tone) {
  if (tone === "good") return "bg-[#EFFAF3] text-[#0A7A3D] border-[#BFE7CC]";
  if (tone === "bad") return "bg-[#FFF2F1] text-[#B42318] border-[#FFD5D2]";
  if (tone === "warning") return "bg-[#FFF8EA] text-[#9A5B00] border-[#FFE1A6]";
  return "bg-[#EEF6FF] text-[#0057B8] border-[#C7DEFF]";
}
function formatTime(seconds) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; }

function Header({ title, subtitle, accessory }) {
  return <div className="flex items-start justify-between gap-4"><div className="min-w-0"><h1 className={ui.title}>{title}</h1>{subtitle && <p className={ui.sub}>{subtitle}</p>}</div>{accessory}</div>;
}
function Section({ title, subtitle, children }) {
  return <section className="space-y-2.5"><div className="px-1"><h2 className="text-[22px] font-black tracking-[-0.045em]">{title}</h2>{subtitle && <p className="text-sm font-semibold text-[#6E6E73]">{subtitle}</p>}</div>{children}</section>;
}
function Metric({ label, value, icon: Icon, dark = false }) {
  return <div className={`rounded-[1.45rem] p-4 ${dark ? "bg-[#1D1D1F] text-white shadow-[0_14px_36px_rgba(0,0,0,0.14)]" : "bg-white text-[#1D1D1F] shadow-[0_8px_24px_rgba(0,0,0,0.045)]"}`}><div className="flex items-center justify-between gap-2"><p className={`text-[11px] font-black uppercase tracking-[0.16em] ${dark ? "text-white/50" : "text-[#8E8E93]"}`}>{label}</p>{Icon && <Icon className={`h-4 w-4 ${dark ? "text-[#FFD60A]" : "text-[#007AFF]"}`} />}</div><p className="mt-2 text-2xl font-black tracking-[-0.05em]">{value}</p></div>;
}
function WeekControl({ weekNumber, setWeekNumber }) {
  return <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-sm"><button disabled={weekNumber <= 1} onClick={() => { setWeekNumber(Math.max(1, weekNumber - 1)); haptic(); }} className={`flex h-9 w-9 items-center justify-center rounded-full transition active:scale-95 ${weekNumber <= 1 ? "bg-[#F2F2F7] text-[#C7C7CC]" : "bg-[#F2F2F7] text-[#007AFF]"}`}><Minus className="h-4 w-4" /></button><span className="min-w-8 text-center text-sm font-black">{weekNumber}</span><button onClick={() => { setWeekNumber(weekNumber + 1); haptic(); }} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#007AFF] text-white transition active:scale-95"><Plus className="h-4 w-4" /></button></div>;
}
function NativeValueControl({ label, value, setValue, step = 1, min = 0, max = null }) {
  const n = Number(value) || 0;
  const dec = () => { setValue(Math.max(min, roundToIncrement(n - step, step))); haptic(); };
  const inc = () => { const raw = roundToIncrement(n + step, step); setValue(max !== null ? Math.min(max, raw) : raw); haptic(); };
  return <div className="min-w-0"><p className="mb-1.5 text-center text-[10px] font-black uppercase tracking-[0.14em] text-[#8E8E93]">{label}</p><div className="grid grid-cols-[38px_1fr_38px] items-center rounded-[1.1rem] bg-[#F5F5F7] p-1 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.045)]"><button onClick={dec} className="flex h-11 w-11 -translate-x-1.5 items-center justify-center rounded-full transition active:scale-90"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#007AFF] shadow-sm"><Minus className="h-3.5 w-3.5" /></span></button><div className="text-center text-[18px] font-black tracking-[-0.04em]">{value || 0}</div><button onClick={inc} className="flex h-11 w-11 -translate-x-1.5 items-center justify-center rounded-full transition active:scale-90"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#007AFF] text-white shadow-[0_3px_10px_rgba(0,122,255,0.22)]"><Plus className="h-3.5 w-3.5" /></span></button></div></div>;
}

export default function HypertrophyTrackerApp() {
  const [exercises, setExercises] = useState(defaultExercises);
  const [logs, setLogs] = useState([]);
  const [selectedDay, setSelectedDay] = useState("Push A");
  const [weekNumber, setWeekNumber] = useState(1);
  const [activeExerciseId, setActiveExerciseId] = useState(defaultExercises[0].id);
  const [setInputs, setSetInputs] = useState(emptySetData(defaultExercises[0].sets));
  const [newExercise, setNewExercise] = useState({ name: "", muscle: "", day: "Push A" });
  const [tab, setTab] = useState("today");
  const [sessionMode, setSessionMode] = useState(false);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [readiness, setReadiness] = useState({ sleep: 7, soreness: 4, stress: 4, motivation: 8 });
  const [restSeconds, setRestSeconds] = useState(0);
  const [celebration, setCelebration] = useState(null);
  const [profile, setProfile] = useState(defaultProfile);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.exercises) setExercises(parsed.exercises);
      if (parsed.logs) setLogs(parsed.logs);
      if (parsed.weekNumber) setWeekNumber(parsed.weekNumber);
      if (parsed.selectedDay) setSelectedDay(parsed.selectedDay);
      if (parsed.readiness) setReadiness(parsed.readiness);
      if (parsed.profile) setProfile({ ...defaultProfile, ...parsed.profile });
    } catch {}
  }, []);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify({ exercises, logs, weekNumber, selectedDay, readiness, profile })); }, [exercises, logs, weekNumber, selectedDay, readiness, profile]);
  useEffect(() => { if (restSeconds <= 0) return; const t = setTimeout(() => setRestSeconds((s) => Math.max(0, s - 1)), 1000); if (restSeconds === 1) haptic(50); return () => clearTimeout(t); }, [restSeconds]);
  useEffect(() => { if (!celebration) return; const t = setTimeout(() => setCelebration(null), 2300); return () => clearTimeout(t); }, [celebration]);

  const dayExercises = useMemo(() => exercises.filter((e) => e.day === selectedDay), [exercises, selectedDay]);
  const activeExercise = exercises.find((e) => e.id === activeExerciseId) || dayExercises[0] || exercises[0];
  const readinessScore = Math.round((readiness.sleep * 10 + (10 - readiness.soreness) * 10 + (10 - readiness.stress) * 10 + readiness.motivation * 10) / 4);
  const rec = activeExercise ? recommendation(activeExercise, lastSession, weekNumber, readinessScore, profile) : null;

  useEffect(() => {
    const first = exercises.find((e) => e.day === selectedDay);
    if (!first) return;
    setActiveExerciseId(first.id);
    setSessionIndex(0);
  const suggested = recommendation(first, getLastSession(logs, first.id), weekNumber, readinessScore, profile).weight;
    setSetInputs(emptySetData(first.sets, suggested || ""));
  }, [selectedDay, profile]);
  useEffect(() => {
    if (!activeExercise) return;
    const suggested = recommendation(activeExercise, getLastSession(logs, activeExercise.id), weekNumber, readinessScore, profile).weight;
    setSetInputs(emptySetData(activeExercise.sets, suggested || ""));
  }, [activeExerciseId, weekNumber, profile]);

  const weeklyLogs = logs.filter((l) => Number(l.weekNumber) === Number(weekNumber));
  const weeklyVolume = weeklyLogs.reduce((sum, l) => sum + sessionVolume(l), 0);
  const completedThisWeek = weeklyLogs.length;
  const todayCompletion = dayExercises.length ? Math.round((weeklyLogs.filter((l) => l.day === selectedDay).length / dayExercises.length) * 100) : 0;
  const progressData = useMemo(() => activeExercise ? getExerciseSessions(logs, activeExercise.id).slice().reverse().map((s, i) => ({ session: i + 1, weight: bestWeightFromSession(s), volume: sessionVolume(s) })) : [], [logs, activeExercise]);
  const volumeTrend = useMemo(() => Array.from({ length: Math.max(weekNumber, 6) }, (_, i) => i + 1).map((w) => ({ week: w, volume: logs.filter((l) => Number(l.weekNumber) === w).reduce((s, l) => s + sessionVolume(l), 0) })), [logs, weekNumber]);
  const coachingInsight = readinessScore < 55 ? "Readiness is poor. Reduce load or total sets." : weekNumber % 6 === 0 ? "Deload week. Leave the ego at the door." : completedThisWeek < 3 ? "Priority: complete the planned sessions." : weeklyVolume > 0 ? "Momentum is building. Progress one variable at a time." : "Start the week. First goal is clean logging.";

  const updateSet = (index, key, value) => setSetInputs(setInputs.map((s, i) => i === index ? { ...s, [key]: value } : s));
  const markSetComplete = (index) => { setSetInputs(setInputs.map((s, i) => i === index ? { ...s, complete: true } : s)); setRestSeconds(activeExercise?.rest || 90); haptic(20); };
  const detectPR = (entry) => {
    const previous = getExerciseSessions(logs, entry.exerciseId);
    const previousBest = previous.length ? Math.max(...previous.map((s) => bestWeightFromSession(s) || 0)) : 0;
    const previousVol = previous.length ? Math.max(...previous.map((s) => sessionVolume(s))) : 0;
    const best = bestWeightFromSession(entry) || 0;
    const vol = sessionVolume(entry);
    if (best > previousBest && previousBest > 0) return `Load PR: ${best}kg`;
    if (vol > previousVol && previousVol > 0) return `Volume PR: ${Math.round(vol).toLocaleString()}kg`;
    return null;
  };
  const saveSession = () => {
    if (!activeExercise) return;
    const cleanSets = setInputs.map((s) => ({ weight: Number(s.weight) || "", reps: Number(s.reps) || "", rir: s.rir === "" ? "" : Number(s.rir) })).filter((s) => s.weight && s.reps);
    if (!cleanSets.length) return;
    const entry = { id: `${activeExercise.id}-${Date.now()}`, exerciseId: activeExercise.id, exerciseName: activeExercise.name, day: activeExercise.day, weekNumber, date: new Date().toISOString(), sets: cleanSets };
    const pr = detectPR(entry);
    setLogs([entry, ...logs]);
    setSetInputs(emptySetData(activeExercise.sets, recommendation(activeExercise, entry, weekNumber, readinessScore, profile).weight || ""));
    setRestSeconds(activeExercise.rest || 90);
    if (pr) { setCelebration(pr); haptic(80); }
  };
  const nextExercise = () => { const next = Math.min(dayExercises.length - 1, sessionIndex + 1); setSessionIndex(next); if (dayExercises[next]) setActiveExerciseId(dayExercises[next].id); haptic(); };
  const prevExercise = () => { const prev = Math.max(0, sessionIndex - 1); setSessionIndex(prev); if (dayExercises[prev]) setActiveExerciseId(dayExercises[prev].id); haptic(); };
  const resetData = () => { setLogs([]); localStorage.removeItem(STORAGE_KEY); };
  const addExercise = () => {
    if (!newExercise.name.trim()) return;
    const id = newExercise.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + Date.now();
    setExercises([...exercises, { id, day: newExercise.day, name: newExercise.name, muscle: newExercise.muscle || "Custom", sets: 3, targetMin: 8, targetMax: 12, rirTarget: 1, increment: 2.5, icon: "•", rest: 90 }]);
    setNewExercise({ name: "", muscle: "", day: selectedDay });
  };

  function ExerciseSelector() {
    return <div className={ui.group}><div className="flex items-center justify-between gap-3 px-4 py-3.5"><div className="min-w-0"><p className={ui.label}>Current exercise</p><select className="mt-1 w-full appearance-none bg-transparent pr-8 text-[17px] font-black tracking-[-0.02em] outline-none" value={activeExercise?.id || ""} onChange={(e) => { const id = e.target.value; setActiveExerciseId(id); setSessionIndex(dayExercises.findIndex((x) => x.id === id)); haptic(); }}>{dayExercises.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}{bestWeightFromSession(getLastSession(logs, ex.id)) ? ` · ${bestWeightFromSession(getLastSession(logs, ex.id))}kg` : ""}</option>)}</select></div><ChevronDown className="h-5 w-5 shrink-0 text-[#007AFF]" /></div><div className={ui.divider + " px-4 py-3"}><p className="text-sm font-semibold text-[#6E6E73]">{activeExercise?.muscle} · {activeExercise?.targetMin}-{activeExercise?.targetMax} reps · RIR {activeExercise?.rirTarget}</p></div></div>;
  }
  function SetCards() {
    const completedCount = setInputs.filter((s) => s.complete).length;
    return <Section title="Sets" subtitle={`${completedCount}/${setInputs.length} logged · ${activeExercise?.targetMin}-${activeExercise?.targetMax} reps`}><div className={ui.group}>{setInputs.map((s, i) => <motion.div layout key={i} className={`${i !== 0 ? ui.divider : ""} px-4 py-4 ${s.complete ? "bg-[#F5FFF8]" : "bg-white"}`}><div className="mb-3 flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${s.complete ? "bg-[#34C759] text-white" : "bg-[#F2F2F7] text-[#007AFF]"}`}>{s.complete ? <Check className="h-4 w-4" /> : i + 1}</div><div className="min-w-0"><p className="text-[17px] font-black tracking-[-0.035em]">Set {i + 1}</p><p className="text-xs font-semibold text-[#8E8E93]">{s.complete ? "Logged" : "Tap values, then log"}</p></div></div><button onClick={() => markSetComplete(i)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition active:scale-95 ${s.complete ? "bg-[#34C759] text-white" : "bg-[#F2F2F7] text-[#007AFF]"}`}>{s.complete ? "Done" : "Log"}</button></div><div className="grid grid-cols-3 gap-2"><NativeValueControl label="kg" value={s.weight} setValue={(v) => updateSet(i, "weight", v)} step={activeExercise?.increment || 2.5} /><NativeValueControl label="reps" value={s.reps} setValue={(v) => updateSet(i, "reps", v)} step={1} /><NativeValueControl label="RIR" value={s.rir} setValue={(v) => updateSet(i, "rir", v)} step={1} max={5} /></div></motion.div>)}</div></Section>;
  }
  function ProgressBlock({ compact = false }) {
    const hasData = progressData.length > 0;
    return <Section title="Exercise Progress" subtitle="Selected exercise trend"><div className={ui.group}>{!hasData ? <div className="px-5 py-8 text-center"><BarChart3 className="mx-auto h-8 w-8 text-[#007AFF]" /><p className="mt-3 text-lg font-black tracking-[-0.02em]">No progress data yet</p><p className="mt-1 text-sm font-semibold text-[#6E6E73]">Log this exercise once and the app will build your trend.</p></div> : <><div className="grid grid-cols-3 gap-2 p-3"><Metric label="Best" value={`${Math.max(...progressData.map((d) => Number(d.weight) || 0))}kg`} /><Metric label="Peak Vol" value={Math.max(...progressData.map((d) => Number(d.volume) || 0)).toLocaleString()} /><Metric label="Sessions" value={progressData.length} /></div><div className={`${ui.divider} ${compact ? "h-52" : "h-72"} p-3`}><ResponsiveContainer width="100%" height="100%"><AreaChart data={progressData}><defs><linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#007AFF" stopOpacity={0.22} /><stop offset="95%" stopColor="#007AFF" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="session" stroke="#8E8E93" tick={{ fill: "#6E6E73", fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} /><YAxis stroke="#8E8E93" tick={{ fill: "#6E6E73", fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "18px", color: "#1D1D1F", fontWeight: 700 }} /><Area type="monotone" dataKey="weight" stroke="#007AFF" strokeWidth={4} fill="url(#weightFill)" dot={{ r: 4, fill: "#007AFF" }} /></AreaChart></ResponsiveContainer></div></>}</div></Section>;
  }
  function RecommendationCard() {
    return <div className={`rounded-[1.55rem] border px-4 py-4 ${recClass(rec?.tone)}`}><div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-black uppercase tracking-[0.16em] opacity-70">Recommendation</p><p className="mt-1 text-[28px] font-black leading-tight tracking-[-0.05em]">{rec?.label}</p></div><Target className="h-6 w-6 opacity-80" /></div><p className="mt-1 text-[22px] font-black tracking-[-0.04em]">{rec?.weight ? `${rec.weight} kg` : "Choose load"}</p><p className="mt-2 text-sm font-semibold leading-snug opacity-90">{rec?.reason}</p></div>;
  }
  function TrainingPanel() {
  return (
    <section className="space-y-4">
<TrainingPanel />
      <div className="flex items-end justify-between px-1">
        <div>
          <h2 className="text-[30px] font-black tracking-[-0.06em] text-[#1D1D1F]">
            Training
          </h2>
          <p className="mt-1 text-sm font-semibold text-[#6E6E73]">
            {selectedDay} · {dayExercises.length} exercises
          </p>
        </div>

        <div className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#8E8E93] shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
          Week {weekNumber}
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_18px_46px_rgba(0,0,0,0.10)] backdrop-blur-2xl">
        <div className="relative p-5">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-white to-[#EEF6FF]" />

          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8E8E93]">
                  Current Exercise
                </p>

                <div className="relative mt-3">
                  <select
                    className="w-full appearance-none bg-transparent pr-12 text-[22px] font-black leading-tight tracking-[-0.045em] text-[#1D1D1F] outline-none"
                    value={activeExercise?.id || ""}
                    onChange={(e) => {
                      const id = e.target.value;
                      setActiveExerciseId(id);
                      setSessionIndex(dayExercises.findIndex((x) => x.id === id));
                      haptic();
                    }}
                  >
                    {dayExercises.map((exercise) => {
                      const lastWeight = bestWeightFromSession(getLastSession(logs, exercise.id));
                      return (
                        <option key={exercise.id} value={exercise.id}>
                          {exercise.name}
                          {lastWeight ? ` · ${lastWeight}kg` : ""}
                        </option>
                      );
                    })}
                  </select>

                  <div className="pointer-events-none absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#F2F2F7] text-[#007AFF] shadow-inner shadow-black/[0.03]">
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] bg-[#007AFF] text-white shadow-[0_10px_24px_rgba(0,122,255,0.25)]">
                <Dumbbell className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-[1.4rem] border border-black/[0.05] bg-[#F5F5F7]">
              <div className="p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8E8E93]">
                  Muscle
                </p>
                <p className="mt-1 truncate text-sm font-black tracking-[-0.02em] text-[#1D1D1F]">
                  {activeExercise?.muscle}
                </p>
              </div>

              <div className="border-x border-black/[0.05] p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8E8E93]">
                  Reps
                </p>
                <p className="mt-1 text-sm font-black tracking-[-0.02em] text-[#1D1D1F]">
                  {activeExercise?.targetMin}-{activeExercise?.targetMax}
                </p>
              </div>

              <div className="p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8E8E93]">
                  RIR
                </p>
                <p className="mt-1 text-sm font-black tracking-[-0.02em] text-[#1D1D1F]">
                  {activeExercise?.rirTarget}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
function Today() {
  return (
    <div className="space-y-5">
      <Header
        title="Today"
        subtitle={`${selectedDay} · ${profile.goal} · ${profile.experience}`}
        accessory={
          <div className="rounded-[1.25rem] bg-[#1D1D1F] p-3 text-white shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
            <Dumbbell className="h-7 w-7" />
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-2">
        <Metric label="Week" value={weekNumber} icon={CalendarDays} />
        <Metric label="Ready" value={`${readinessScore}%`} icon={Zap} dark />
        <Metric label="Done" value={`${todayCompletion}%`} icon={Check} />
      </div>

      <div className={ui.group}>
        <div className="px-4 py-3.5">
          <p className={ui.label}>Coach</p>
          <p className="mt-1 text-base font-black leading-tight tracking-[-0.02em]">
            {coachingInsight}
          </p>
        </div>

        <div className={ui.divider + " grid grid-cols-2 gap-2 p-3"}>
          <Button
            className={ui.primary}
            onClick={() => {
              setSessionMode(!sessionMode);
              haptic(15);
            }}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {sessionMode ? "Exit" : "Start"}
          </Button>

          <div className="flex items-center justify-center rounded-[1.35rem] bg-[#F2F2F7]">
            <WeekControl weekNumber={weekNumber} setWeekNumber={setWeekNumber} />
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
          {days.map((day) => {
            const active = selectedDay === day;

            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  setSelectedDay(day);
                  haptic();
                }}
                className={`shrink-0 rounded-full px-5 py-3 text-[15px] font-semibold tracking-[-0.02em] transition active:scale-[0.97] ${
                  active
                    ? "bg-[#1D1D1F] text-white shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
                    : "border border-black/[0.05] bg-white/85 text-[#1D1D1F] shadow-[0_7px_18px_rgba(0,0,0,0.07)] backdrop-blur-xl"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="flex items-end justify-between px-1">
          <div>
            <h2 className="text-[30px] font-black tracking-[-0.06em] text-[#1D1D1F]">
              Training
            </h2>
            <p className="mt-1 text-sm font-semibold text-[#6E6E73]">
              {selectedDay} · {dayExercises.length} exercises
            </p>
          </div>

          <div className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#8E8E93] shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
            Week {weekNumber}
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_18px_46px_rgba(0,0,0,0.10)] backdrop-blur-2xl">
          <div className="relative p-5">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-white to-[#EEF6FF]" />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8E8E93]">
                    Current Exercise
                  </p>

                  <div className="relative mt-3">
                    <select
                      className="w-full appearance-none bg-transparent pr-12 text-[22px] font-black leading-tight tracking-[-0.045em] text-[#1D1D1F] outline-none"
                      value={activeExercise?.id || ""}
                      onChange={(e) => {
                        const id = e.target.value;
                        setActiveExerciseId(id);
                        setSessionIndex(dayExercises.findIndex((x) => x.id === id));
                        haptic();
                      }}
                    >
                      {dayExercises.map((exercise) => {
                        const lastWeight = bestWeightFromSession(getLastSession(logs, exercise.id));

                        return (
                          <option key={exercise.id} value={exercise.id}>
                            {exercise.name}
                            {lastWeight ? ` · ${lastWeight}kg` : ""}
                          </option>
                        );
                      })}
                    </select>

                    <div className="pointer-events-none absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#F2F2F7] text-[#007AFF] shadow-inner shadow-black/[0.03]">
                      <ChevronDown className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] bg-[#007AFF] text-white shadow-[0_10px_24px_rgba(0,122,255,0.25)]">
                  <Dumbbell className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-[1.4rem] border border-black/[0.05] bg-[#F5F5F7]">
                <div className="p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8E8E93]">
                    Muscle
                  </p>
                  <p className="mt-1 truncate text-sm font-black tracking-[-0.02em] text-[#1D1D1F]">
                    {activeExercise?.muscle}
                  </p>
                </div>

                <div className="border-x border-black/[0.05] p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8E8E93]">
                    Reps
                  </p>
                  <p className="mt-1 text-sm font-black tracking-[-0.02em] text-[#1D1D1F]">
                    {activeExercise?.targetMin}-{activeExercise?.targetMax}
                  </p>
                </div>

                <div className="p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8E8E93]">
                    RIR
                  </p>
                  <p className="mt-1 text-sm font-black tracking-[-0.02em] text-[#1D1D1F]">
                    {activeExercise?.rirTarget}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {sessionMode && (
        <div className={ui.group}>
          <div className="grid grid-cols-3 items-center gap-2 p-2">
            <button className={ui.secondary} onClick={prevExercise}>
              Previous
            </button>

            <p className="text-center text-sm font-black text-[#6E6E73]">
              {sessionIndex + 1}/{dayExercises.length}
            </p>

            <button className={ui.primary + " min-h-[52px] text-[15px]"} onClick={nextExercise}>
              Next
            </button>
          </div>
        </div>
      )}

      <RecommendationCard />
      <SetCards />

      <Button onClick={saveSession} className={ui.primary}>
        <Check className="mr-2 h-5 w-5" />
        Save Exercise
      </Button>

      <ProgressBlock compact />
    </div>
  );
}
  function Progress() {
    return <div className="space-y-5"><Header title="Progress" subtitle={`Week ${weekNumber} training data`} accessory={<WeekControl weekNumber={weekNumber} setWeekNumber={setWeekNumber} />} /><Section title="Exercise"><ExerciseSelector /></Section><ProgressBlock /><Section title="Weekly Volume"><div className={ui.group}><div className="h-64 p-3"><ResponsiveContainer width="100%" height="100%"><LineChart data={volumeTrend}><XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#6E6E73", fontWeight: 700 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#6E6E73", fontWeight: 700 }} /><Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "18px", fontWeight: 700 }} /><Line type="monotone" dataKey="volume" stroke="#1D1D1F" strokeWidth={4} dot={false} /></LineChart></ResponsiveContainer></div></div></Section></div>;
  }
  function HistoryView() {
    const visibleLogs = logs.filter((l) => Number(l.weekNumber) === Number(weekNumber));
    return <div className="space-y-5"><Header title="History" subtitle={`Viewing Week ${weekNumber}`} accessory={<WeekControl weekNumber={weekNumber} setWeekNumber={setWeekNumber} />} /><div className={ui.group}>{visibleLogs.length === 0 && <div className="px-4 py-8 text-center"><History className="mx-auto h-8 w-8 text-[#007AFF]" /><p className="mt-3 text-lg font-black tracking-[-0.03em]">No sessions logged</p><p className="mt-1 text-sm font-semibold text-[#6E6E73]">Week {weekNumber} has no saved exercises yet.</p></div>}{visibleLogs.map((log, index) => <div key={log.id} className={`${index !== 0 ? ui.divider : ""} px-4 py-4`}><div className="flex justify-between gap-3"><div className="min-w-0"><p className="font-black leading-tight tracking-[-0.02em]">{log.exerciseName}</p><p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#8E8E93]">Week {log.weekNumber} · {new Date(log.date).toLocaleDateString()}</p></div><button onClick={() => setLogs(logs.filter((x) => x.id !== log.id))} className="rounded-full p-2 text-[#8E8E93] transition hover:bg-[#FFF0F0] hover:text-[#FF3B30]"><Trash2 className="h-4 w-4" /></button></div><div className="mt-3 rounded-[1.2rem] bg-[#F5F5F7] p-3"><p className="text-sm font-black">Volume: {Math.round(sessionVolume(log)).toLocaleString()} kg</p><p className="mt-1 text-sm font-semibold text-[#6E6E73]">{log.sets.map((set) => `${set.weight || "?"}×${set.reps || "?"}`).join(" / ")}</p></div></div>)}</div></div>;
  }
  function Library() {
    return <div className="space-y-5"><Header title="Library" subtitle={`${exercises.length} exercises`} /><Section title="Add Exercise"><div className={ui.group}><div className="space-y-3 p-4"><input value={newExercise.name} onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })} placeholder="Exercise name" className={ui.field} /><input value={newExercise.muscle} onChange={(e) => setNewExercise({ ...newExercise, muscle: e.target.value })} placeholder="Muscle group" className={ui.field} /><select value={newExercise.day} onChange={(e) => setNewExercise({ ...newExercise, day: e.target.value })} className={ui.field}>{days.map((day) => <option key={day}>{day}</option>)}</select><Button onClick={addExercise} className="flex min-h-[54px] w-full items-center justify-center rounded-[1.25rem] bg-[#1D1D1F] px-5 font-black text-white transition active:scale-[0.985]">Add Exercise</Button></div></div></Section><Section title="Exercises"><div className={ui.group}>{exercises.map((ex, i) => <div key={ex.id} className={`${i !== 0 ? ui.divider : ""} flex items-center gap-3 px-4 py-3.5`}><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F2F2F7] text-lg font-black text-[#007AFF]">{ex.icon}</div><div className="min-w-0"><p className="truncate font-black tracking-[-0.02em]">{ex.name}</p><p className="text-sm font-semibold text-[#6E6E73]">{ex.day} · {ex.muscle}</p></div></div>)}</div></Section></div>;
  }
function SettingsView() {
  const rows = [
    {
      label: "Sleep",
      key: "sleep",
      hint: "Higher is better",
      low: "Poor",
      high: "Excellent"
    },
    {
      label: "Soreness",
      key: "soreness",
      hint: "Lower is better",
      low: "Fresh",
      high: "Smashed"
    },
    {
      label: "Stress",
      key: "stress",
      hint: "Lower is better",
      low: "Calm",
      high: "High"
    },
    {
      label: "Motivation",
      key: "motivation",
      hint: "Higher is better",
      low: "Low",
      high: "High"
    }
  ];

  return (
    <div className="space-y-5">
      <Header title="Settings" subtitle="Recovery, profile, and app controls" />

      <div className={ui.group + " p-4 space-y-5"}>
        <div className="rounded-[1.7rem] bg-[#1D1D1F] p-5 text-white shadow-[0_14px_36px_rgba(0,0,0,0.16)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
                Readiness
              </p>
              <p className="mt-1 text-[42px] font-black tracking-[-0.06em]">
                {readinessScore}%
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-white/10">
              <Zap className="h-7 w-7 text-[#FFD60A]" />
            </div>
          </div>

          <p className="mt-3 text-sm font-semibold leading-relaxed text-white/70">
            Used to adjust loading recommendations when fatigue is high.
          </p>
        </div>

        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.key}
              className="rounded-[1.55rem] border border-black/[0.06] bg-[#F5F5F7] p-4 shadow-inner shadow-black/[0.03]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[17px] font-black tracking-[-0.03em]">
                    {row.label}
                  </p>
                  <p className="text-sm font-semibold text-[#6E6E73]">
                    {row.hint}
                  </p>
                </div>

                <div className="flex h-11 min-w-11 items-center justify-center rounded-full bg-white px-3 text-xl font-black tracking-[-0.04em] text-[#007AFF] shadow-sm">
                  {readiness[row.key]}
                </div>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={readiness[row.key]}
                onChange={(e) => {
                  setReadiness({ ...readiness, [row.key]: Number(e.target.value) });
                  haptic();
                }}
                className="mt-4 w-full accent-[#007AFF]"
              />

              <div className="mt-1 flex justify-between px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8E8E93]">
                <span>{row.low}</span>
                <span>{row.high}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={ui.group + " p-4 space-y-4"}>
        <div>
          <p className={ui.label}>Training Profile</p>
          <p className="mt-1 text-sm font-semibold text-[#6E6E73]">
            These settings now change progression recommendations.
          </p>
        </div>

        <div className="space-y-3">
          <input
            className={ui.field}
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Name"
          />

          <select
            className={ui.field}
            value={profile.goal}
            onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
          >
            <option>Hypertrophy</option>
            <option>Strength</option>
            <option>Maintenance</option>
            <option>Fat loss</option>
          </select>

          <select
            className={ui.field}
            value={profile.experience}
            onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>

          <select
            className={ui.field}
            value={profile.progressionStyle}
            onChange={(e) => setProfile({ ...profile, progressionStyle: e.target.value })}
          >
            <option>Conservative</option>
            <option>Double progression</option>
            <option>Aggressive</option>
          </select>

          <select
            className={ui.field}
            value={profile.frequency}
            onChange={(e) => setProfile({ ...profile, frequency: Number(e.target.value) })}
          >
            <option value={3}>3 days/week</option>
            <option value={4}>4 days/week</option>
            <option value={5}>5 days/week</option>
            <option value={6}>6 days/week</option>
          </select>

          <select
            className={ui.field}
            value={profile.deloadFrequency}
            onChange={(e) => setProfile({ ...profile, deloadFrequency: Number(e.target.value) })}
          >
            <option value={4}>Deload every 4 weeks</option>
            <option value={5}>Deload every 5 weeks</option>
            <option value={6}>Deload every 6 weeks</option>
            <option value={8}>Deload every 8 weeks</option>
          </select>

          <select
            className={ui.field}
            value={profile.priority || profile.weakPoint || ""}
            onChange={(e) => setProfile({ ...profile, priority: e.target.value })}
          >
            <option>Upper chest / delts</option>
            <option>Back / lats</option>
            <option>Arms</option>
            <option>Legs</option>
            <option>Glutes</option>
            <option>None</option>
          </select>
        </div>

        <div className="rounded-[1.4rem] bg-[#F5F5F7] p-4">
          <p className={ui.label}>Active logic</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-[#6E6E73]">
            Goal changes progression behaviour. Experience changes aggressiveness.
            Priority muscles get slightly more favourable progression prompts.
            Deload frequency controls when the app tells you to regulate.
          </p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-[#FF3B30]/15 bg-[#FFF4F4] p-4 shadow-[0_18px_60px_rgba(255,59,48,0.08)]">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#FF3B30] shadow-sm">
            <RotateCcw className="h-5 w-5" />
          </div>

          <div>
            <p className="text-[18px] font-black tracking-[-0.03em]">
              Reset training data
            </p>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-[#6E6E73]">
              This clears your local logs from this device. There is currently no cloud backup.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={resetData}
          className="mt-4 flex min-h-[58px] w-full items-center justify-center rounded-[1.35rem] bg-[#FF3B30] px-5 text-[16px] font-black tracking-[-0.02em] text-white shadow-[0_10px_26px_rgba(255,59,48,0.24)] transition active:scale-[0.985]"
        >
          Reset All Training Data
        </button>
      </div>
    </div>
  );
}
  return <div className={ui.page}><div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),transparent_34%),radial-gradient(circle_at_top_right,rgba(0,122,255,0.08),transparent_28%)]" /></div><div className={ui.screen}><AnimatePresence mode="wait"><motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>{tab === "today" && <Today />}{tab === "progress" && <Progress />}{tab === "history" && <HistoryView />}{tab === "library" && <Library />}{tab === "settings" && <SettingsView />}</motion.div></AnimatePresence></div><AnimatePresence>{restSeconds > 0 && <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="fixed bottom-24 left-1/2 z-40 w-[92%] max-w-md -translate-x-1/2 rounded-[1.5rem] border border-black/[0.06] bg-[#1D1D1F]/95 p-3 text-white shadow-[0_20px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"><Timer className="h-5 w-5" /></div><div><p className="text-sm font-bold text-white/60">Rest Timer</p><p className="text-2xl font-black tracking-[-0.04em]">{formatTime(restSeconds)}</p></div></div><button className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black" onClick={() => setRestSeconds(0)}>Skip</button></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#007AFF]" style={{ width: `${Math.min(100, (restSeconds / (activeExercise?.rest || 90)) * 100)}%` }} /></div></motion.div>}</AnimatePresence><AnimatePresence>{celebration && <motion.div initial={{ scale: 0.82, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="fixed left-1/2 top-24 z-50 w-[88%] max-w-sm -translate-x-1/2 rounded-[2rem] border border-[#FFD60A]/30 bg-white p-5 text-center shadow-[0_30px_90px_rgba(0,0,0,0.25)]"><Trophy className="mx-auto h-10 w-10 text-[#FF9500]" /><p className="mt-2 text-sm font-black uppercase tracking-[0.16em] text-[#6E6E73]">New PR</p><p className="mt-1 text-2xl font-black tracking-[-0.04em]">{celebration}</p></motion.div>}</AnimatePresence><div className="fixed bottom-3 left-1/2 z-30 w-[94%] max-w-md -translate-x-1/2 rounded-[2rem] border border-black/[0.06] bg-white/90 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.14)] backdrop-blur-2xl"><div className="grid grid-cols-5 gap-1">{nav.map((item) => { const Icon = item.icon; const active = tab === item.id; return <button key={item.id} onClick={() => { setTab(item.id); haptic(); }} className={`flex flex-col items-center justify-center gap-1 rounded-[1.35rem] py-2 text-[10px] font-black transition active:scale-95 ${active ? "bg-[#007AFF] text-white shadow-[0_8px_22px_rgba(0,122,255,0.22)]" : "text-[#6E6E73] hover:bg-[#F5F5F7]"}`}><Icon className="h-5 w-5" />{item.label}</button>; })}</div></div></div>;
}
