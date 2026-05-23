import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  Flame,
  History,
  Home,
  Minus,
  Plus,
  RotateCcw,
  Settings,
  Sparkles,
  Target,
  Timer,
  Trash2,
  TrendingUp,
  Trophy,
  Zap
} from "lucide-react";
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function Card({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function Button({ className = "", children, onClick, type = "button", ...props }) {
  return (
    <button type={type} onClick={onClick} className={className} {...props}>
      {children}
    </button>
  );
}

const STORAGE_KEY = "brandon_hypertrophy_ultra_v2";

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
  page: "min-h-screen bg-[#F5F5F7] px-4 py-5 pb-28 text-[#1D1D1F] antialiased selection:bg-[#007AFF] selection:text-white",
  card: "rounded-[2rem] border border-black/[0.06] bg-white/90 shadow-[0_18px_60px_rgba(0,0,0,0.08)] backdrop-blur-2xl",
  soft: "rounded-[1.45rem] border border-black/[0.05] bg-[#F5F5F7] shadow-inner shadow-black/[0.03]",
  label: "text-[11px] font-bold uppercase tracking-[0.16em] text-[#6E6E73]",
  sub: "text-[15px] font-medium leading-relaxed text-[#6E6E73]",
  input: "w-full rounded-[1.15rem] border border-black/[0.08] bg-white p-3 text-center text-xl font-bold text-[#1D1D1F] shadow-sm outline-none transition focus:border-[#007AFF]/40 focus:ring-4 focus:ring-[#007AFF]/20",
  field: "w-full rounded-[1.15rem] border border-black/[0.08] bg-white p-3 text-base font-semibold text-[#1D1D1F] shadow-sm outline-none placeholder:text-[#86868B] focus:border-[#007AFF]/40 focus:ring-4 focus:ring-[#007AFF]/20",
  primary: "w-full rounded-[1.25rem] bg-[#007AFF] py-5 text-base font-bold text-white shadow-[0_10px_30px_rgba(0,122,255,0.24)] transition-all duration-200 hover:bg-[#006FE6] active:scale-[0.98]",
  ghost: "rounded-[1.25rem] border border-black/[0.06] bg-white font-bold text-[#1D1D1F] transition-all hover:bg-[#F5F5F7] active:scale-[0.98]"
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

function getLastSession(logs, exerciseId) {
  return getExerciseSessions(logs, exerciseId)[0];
}

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
    completed: completed.length,
    allTopRange: reps.every((r) => r >= exercise.targetMax),
    belowMin: reps.some((r) => r < exercise.targetMin),
    tooHard: avgRir !== null && avgRir < 0.5,
    tooEasy: avgRir !== null && avgRir >= exercise.rirTarget + 1,
    avgRir
  };
}

function recommendation(exercise, lastSession, weekNumber, readiness) {
  const lastWeight = bestWeightFromSession(lastSession);
  const deload = weekNumber % 6 === 0;
  const readinessPenalty = readiness < 55;
  if (!lastSession || lastWeight === "") return { label: "Calibrate", weight: "", tone: "neutral", reason: "Choose a load that leaves 1–2 RIR. First exposure is calibration." };
  const stats = sessionStats(lastSession, exercise);
  if (!stats) return { label: "Repeat", weight: lastWeight, tone: "neutral", reason: "Previous data was incomplete. Repeat and log properly." };
  if (deload || readinessPenalty) return { label: "Regulate", weight: roundToIncrement(lastWeight * 0.9, exercise.increment), tone: "warning", reason: deload ? "Scheduled deload. Reduce load and leave more in reserve." : "Readiness is low. Reduce load and protect recovery." };
  if (stats.allTopRange && !stats.tooHard) return { label: "Increase", weight: roundToIncrement(Number(lastWeight) + Number(exercise.increment), exercise.increment), tone: "good", reason: "Top of range achieved without excessive grind. Add load." };
  if (stats.belowMin || stats.tooHard) return { label: "Reduce", weight: roundToIncrement(Number(lastWeight) - Number(exercise.increment), exercise.increment), tone: "bad", reason: "Too heavy for productive hypertrophy. Fix the load." };
  if (stats.tooEasy) return { label: "Increase", weight: roundToIncrement(Number(lastWeight) + Number(exercise.increment), exercise.increment), tone: "good", reason: "RIR suggests the work was under-dosed." };
  return { label: "Hold", weight: lastWeight, tone: "neutral", reason: "Keep load and beat reps before increasing." };
}

function recClass(tone) {
  if (tone === "good") return "bg-[#E8F8EF] text-[#0A7A3D] border-[#B7E7C8]";
  if (tone === "bad") return "bg-[#FFF0F0] text-[#B42318] border-[#FFD0D0]";
  if (tone === "warning") return "bg-[#FFF7E6] text-[#9A5B00] border-[#FFE1A6]";
  return "bg-[#EEF6FF] text-[#0057B8] border-[#BBD7FF]";
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function Stepper({ value, setValue, step = 1, min = 0, suffix = "" }) {
  const n = Number(value) || 0;
  return (
    <div className="flex items-center justify-between rounded-[1.2rem] border border-black/[0.06] bg-white p-1 shadow-sm">
      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F7] text-[#007AFF] active:scale-95" onClick={() => { setValue(Math.max(min, roundToIncrement(n - step, step))); haptic(); }}><Minus className="h-4 w-4" /></button>
      <div className="min-w-16 text-center text-xl font-black tracking-[-0.03em]">{value || 0}{suffix}</div>
      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#007AFF] text-white active:scale-95" onClick={() => { setValue(roundToIncrement(n + step, step)); haptic(); }}><Plus className="h-4 w-4" /></button>
    </div>
  );
}

function TinyMetric({ label, value, icon: Icon }) {
  return (
    <div className={ui.soft + " p-3.5"}>
      <div className="flex items-center justify-between gap-2">
        <p className={ui.label}>{label}</p>
        {Icon && <Icon className="h-4 w-4 text-[#007AFF]" />}
      </div>
      <p className="mt-2 text-2xl font-black tracking-[-0.04em]">{value}</p>
    </div>
  );
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
  const [profile, setProfile] = useState({ name: "Brandon", goal: "Hypertrophy", experience: "Advanced", weakPoint: "Upper chest / delts" });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.exercises) setExercises(parsed.exercises);
        if (parsed.logs) setLogs(parsed.logs);
        if (parsed.weekNumber) setWeekNumber(parsed.weekNumber);
        if (parsed.selectedDay) setSelectedDay(parsed.selectedDay);
        if (parsed.readiness) setReadiness(parsed.readiness);
        if (parsed.profile) setProfile(parsed.profile);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ exercises, logs, weekNumber, selectedDay, readiness, profile }));
  }, [exercises, logs, weekNumber, selectedDay, readiness, profile]);

  useEffect(() => {
    if (restSeconds <= 0) return;
    const t = setTimeout(() => setRestSeconds((s) => Math.max(0, s - 1)), 1000);
    if (restSeconds === 1) haptic(50);
    return () => clearTimeout(t);
  }, [restSeconds]);

  useEffect(() => {
    if (!celebration) return;
    const t = setTimeout(() => setCelebration(null), 2300);
    return () => clearTimeout(t);
  }, [celebration]);

  const dayExercises = useMemo(() => exercises.filter((e) => e.day === selectedDay), [exercises, selectedDay]);
  const activeExercise = exercises.find((e) => e.id === activeExerciseId) || dayExercises[0] || exercises[0];
  const readinessScore = Math.round((readiness.sleep * 10 + (10 - readiness.soreness) * 10 + (10 - readiness.stress) * 10 + readiness.motivation * 10) / 4);
  const lastSession = getLastSession(logs, activeExercise?.id);
  const rec = activeExercise ? recommendation(activeExercise, lastSession, weekNumber, readinessScore) : null;

  useEffect(() => {
    const first = exercises.find((e) => e.day === selectedDay);
    if (first) {
      setActiveExerciseId(first.id);
      setSessionIndex(0);
      const suggested = recommendation(first, getLastSession(logs, first.id), weekNumber, readinessScore).weight;
      setSetInputs(emptySetData(first.sets, suggested || ""));
    }
  }, [selectedDay]);

  useEffect(() => {
    if (!activeExercise) return;
    const suggested = recommendation(activeExercise, getLastSession(logs, activeExercise.id), weekNumber, readinessScore).weight;
    setSetInputs(emptySetData(activeExercise.sets, suggested || ""));
  }, [activeExerciseId, weekNumber]);

  const weeklyLogs = logs.filter((l) => Number(l.weekNumber) === Number(weekNumber));
  const weeklyVolume = weeklyLogs.reduce((sum, l) => sum + sessionVolume(l), 0);
  const completedThisWeek = weeklyLogs.length;
  const todayCompletion = dayExercises.length ? Math.round((weeklyLogs.filter((l) => l.day === selectedDay).length / dayExercises.length) * 100) : 0;

  const progressData = useMemo(() => {
    if (!activeExercise) return [];
    return getExerciseSessions(logs, activeExercise.id).slice().reverse().map((session, index) => ({
      session: index + 1,
      weight: bestWeightFromSession(session),
      volume: sessionVolume(session)
    }));
  }, [logs, activeExercise]);

  const volumeTrend = useMemo(() => {
    const weeks = Array.from({ length: Math.max(weekNumber, 6) }, (_, i) => i + 1);
    return weeks.map((w) => ({
      week: w,
      volume: logs.filter((l) => Number(l.weekNumber) === w).reduce((s, l) => s + sessionVolume(l), 0)
    }));
  }, [logs, weekNumber]);

  const coachingInsight = useMemo(() => {
    if (readinessScore < 55) return "Readiness is poor. Train, but reduce load or total sets. You do not grow by burying recovery.";
    if (weekNumber % 6 === 0) return "Deload week. Do not be stupid. Leave the ego at the door and recover.";
    if (completedThisWeek < 3) return "Priority: complete the planned sessions. Consistency beats heroic random sessions.";
    if (weeklyVolume > 0) return "Momentum is building. Keep execution strict and progress one variable at a time.";
    return "Start the week. First goal is clean logging, not maximal punishment.";
  }, [readinessScore, weekNumber, completedThisWeek, weeklyVolume]);

  function updateSet(index, key, value) {
    const copy = [...setInputs];
    copy[index] = { ...copy[index], [key]: value };
    setSetInputs(copy);
  }

  function markSetComplete(index) {
    const copy = [...setInputs];
    copy[index] = { ...copy[index], complete: true };
    setSetInputs(copy);
    setRestSeconds(activeExercise?.rest || 90);
    haptic(20);
  }

  function detectPR(entry) {
    const previous = getExerciseSessions(logs, entry.exerciseId);
    const previousBest = previous.length ? Math.max(...previous.map((s) => bestWeightFromSession(s) || 0)) : 0;
    const previousVol = previous.length ? Math.max(...previous.map((s) => sessionVolume(s))) : 0;
    const best = bestWeightFromSession(entry) || 0;
    const vol = sessionVolume(entry);
    if (best > previousBest && previousBest > 0) return `Load PR: ${best}kg`;
    if (vol > previousVol && previousVol > 0) return `Volume PR: ${Math.round(vol).toLocaleString()}kg`;
    return null;
  }

  function saveSession() {
    if (!activeExercise) return;
    const cleanSets = setInputs.map((s) => ({ weight: Number(s.weight) || "", reps: Number(s.reps) || "", rir: s.rir === "" ? "" : Number(s.rir) })).filter((s) => s.weight && s.reps);
    if (!cleanSets.length) return;
    const entry = { id: `${activeExercise.id}-${Date.now()}`, exerciseId: activeExercise.id, exerciseName: activeExercise.name, day: activeExercise.day, weekNumber, date: new Date().toISOString(), sets: cleanSets };
    const pr = detectPR(entry);
    setLogs([entry, ...logs]);
    setSetInputs(emptySetData(activeExercise.sets, recommendation(activeExercise, entry, weekNumber, readinessScore).weight || ""));
    setRestSeconds(activeExercise.rest || 90);
    if (pr) { setCelebration(pr); haptic(80); }
  }

  function nextExercise() {
    const next = Math.min(dayExercises.length - 1, sessionIndex + 1);
    setSessionIndex(next);
    if (dayExercises[next]) setActiveExerciseId(dayExercises[next].id);
    haptic();
  }

  function prevExercise() {
    const prev = Math.max(0, sessionIndex - 1);
    setSessionIndex(prev);
    if (dayExercises[prev]) setActiveExerciseId(dayExercises[prev].id);
    haptic();
  }

  function resetData() {
    setLogs([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  function addExercise() {
    if (!newExercise.name.trim()) return;
    const id = newExercise.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + Date.now();
    setExercises([...exercises, { id, day: newExercise.day, name: newExercise.name, muscle: newExercise.muscle || "Custom", sets: 3, targetMin: 8, targetMax: 12, rirTarget: 1, increment: 2.5, icon: "•", rest: 90 }]);
    setNewExercise({ name: "", muscle: "", day: selectedDay });
  }

  function ExerciseSelector() {
    return (
      <div>
        <p className={ui.label}>Current exercise</p>
        <div className="relative mt-1">
          <select className="w-full appearance-none rounded-[1.35rem] border border-black/[0.06] bg-white px-4 py-4 pr-12 text-[17px] font-black tracking-[-0.02em] text-[#1D1D1F] shadow-[0_8px_24px_rgba(0,0,0,0.05)] outline-none transition focus:border-[#007AFF]/35 focus:ring-4 focus:ring-[#007AFF]/15" value={activeExercise?.id || ""} onChange={(e) => { const id = e.target.value; setActiveExerciseId(id); setSessionIndex(dayExercises.findIndex((x) => x.id === id)); haptic(); }}>
            {dayExercises.map((exercise) => {
              const lastWeight = bestWeightFromSession(getLastSession(logs, exercise.id));
              return <option key={exercise.id} value={exercise.id}>{exercise.name}{lastWeight ? ` · ${lastWeight}kg` : ""}</option>;
            })}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#F5F5F7] text-[#007AFF]"><ChevronDown className="h-5 w-5" /></div>
        </div>
        <p className="mt-2 text-sm font-semibold text-[#6E6E73]">{activeExercise?.muscle} · {activeExercise?.targetMin}-{activeExercise?.targetMax} reps · RIR {activeExercise?.rirTarget}</p>
      </div>
    );
  }

  function SetCards() {
    return (
      <div className="space-y-3">
        {setInputs.map((s, i) => (
          <motion.div layout key={i} className={`rounded-[1.7rem] border p-4 shadow-sm ${s.complete ? "border-[#34C759]/30 bg-[#EDFAF1]" : "border-black/[0.06] bg-[#F5F5F7]"}`}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${s.complete ? "bg-[#34C759] text-white" : "bg-white text-[#007AFF]"}`}>{s.complete ? <Check className="h-4 w-4" /> : i + 1}</div>
                <div><p className="font-black tracking-[-0.02em]">Set {i + 1}</p><p className="text-xs font-semibold text-[#6E6E73]">Swipe-free quick controls</p></div>
              </div>
              <button className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#007AFF]" onClick={() => markSetComplete(i)}>Complete</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><p className={ui.label}>kg</p><Stepper value={s.weight} setValue={(v) => updateSet(i, "weight", v)} step={activeExercise?.increment || 2.5} suffix="" /></div>
              <div><p className={ui.label}>reps</p><Stepper value={s.reps} setValue={(v) => updateSet(i, "reps", v)} step={1} suffix="" /></div>
              <div><p className={ui.label}>RIR</p><Stepper value={s.rir} setValue={(v) => updateSet(i, "rir", Math.min(5, v))} step={1} suffix="" /></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  function ProgressBlock({ compact = false }) {
    const hasData = progressData.length > 0;
    return (
      <div className="space-y-4 rounded-[1.8rem] border border-black/[0.06] bg-[#F5F5F7] p-5 shadow-inner shadow-black/[0.03]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-[#007AFF]" /><div><p className="text-lg font-black tracking-[-0.02em]">Exercise Progress</p><p className={ui.sub}>Selected exercise trend</p></div></div>
          <div className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#6E6E73] shadow-sm">{progressData.length} logged</div>
        </div>
        {!hasData ? (
          <div className="rounded-[1.5rem] border border-dashed border-black/[0.12] bg-white p-6 text-center"><BarChart3 className="mx-auto h-8 w-8 text-[#007AFF]" /><p className="mt-3 text-lg font-black tracking-[-0.02em]">No progress data yet</p><p className="mt-1 text-sm font-medium leading-relaxed text-[#6E6E73]">Log this exercise once and the app will build your trend.</p></div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              <TinyMetric label="Best" value={`${Math.max(...progressData.map((d) => Number(d.weight) || 0))}kg`} />
              <TinyMetric label="Peak Vol" value={Math.max(...progressData.map((d) => Number(d.volume) || 0)).toLocaleString()} />
              <TinyMetric label="Sessions" value={progressData.length} />
            </div>
            <div className={`${compact ? "h-52" : "h-72"} w-full rounded-[1.5rem] border border-black/[0.06] bg-white p-3`}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData}>
                  <defs><linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#007AFF" stopOpacity={0.25}/><stop offset="95%" stopColor="#007AFF" stopOpacity={0}/></linearGradient></defs>
                  <XAxis dataKey="session" stroke="#86868B" tick={{ fill: "#6E6E73", fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#86868B" tick={{ fill: "#6E6E73", fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "18px", color: "#1D1D1F", fontWeight: 700 }} />
                  <Area type="monotone" dataKey="weight" stroke="#007AFF" strokeWidth={4} fill="url(#weightFill)" dot={{ r: 4, fill: "#007AFF" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-[1.25rem] border border-black/[0.06] bg-white p-4"><p className={ui.label}>Analysis</p><p className="mt-2 text-base font-semibold leading-relaxed">{progressData.length < 3 ? "More data needed before the trend means anything." : Number(progressData.at(-1).weight) > Number(progressData[0].weight) ? "Performance is trending up. Productive progression." : "Progress has stalled. Recovery, execution, or load selection needs fixing."}</p></div>
          </>
        )}
      </div>
    );
  }

  function Today() {
    return (
      <div className="space-y-5">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between gap-4">
            <div><div className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#6E6E73] shadow-sm backdrop-blur-xl"><Flame className="h-3.5 w-3.5 text-[#FF9500]" /> Brandon Fitness</div><h1 className="mt-3 text-[36px] font-black tracking-[-0.045em]">Today</h1><p className={ui.sub}>{selectedDay} · {profile.goal} · {profile.experience}</p></div>
            <div className="rounded-[1.35rem] bg-[#1D1D1F] p-3 text-white shadow-[0_12px_30px_rgba(0,0,0,0.16)]"><Dumbbell className="h-7 w-7" /></div>
          </div>
        </motion.div>

        <Card className={ui.card}><CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-3 gap-2">
  <div className={ui.soft + " p-3.5"}>
    <div className="flex items-center justify-between gap-2">
      <p className={ui.label}>Week</p>
      <CalendarDays className="h-4 w-4 text-[#007AFF]" />
    </div>

    <div className="mt-2 flex items-center justify-between gap-2">
      <button
        type="button"
        disabled={weekNumber <= 1}
        onClick={() => {
          setWeekNumber(Math.max(1, weekNumber - 1));
          haptic();
        }}
        className={`flex h-9 w-9 items-center justify-center rounded-full font-black transition active:scale-95 ${
          weekNumber <= 1
            ? "bg-[#E5E5EA] text-[#AEAEB2]"
            : "bg-white text-[#007AFF] shadow-sm"
        }`}
      >
        <Minus className="h-4 w-4" />
      </button>

      <p className="text-2xl font-black tracking-[-0.04em]">{weekNumber}</p>

      <button
        type="button"
        onClick={() => {
          setWeekNumber(weekNumber + 1);
          haptic();
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#007AFF] font-black text-white shadow-sm transition active:scale-95"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  </div>

  <TinyMetric label="Ready" value={`${readinessScore}%`} icon={Zap} />
  <TinyMetric label="Done" value={`${todayCompletion}%`} icon={Check} />
</div>
<div className="grid grid-cols-1 gap-2">
  <Button
    className="group relative flex h-24 w-full items-center justify-center overflow-hidden rounded-[1.7rem] bg-[#007AFF] px-6 text-white shadow-[0_14px_36px_rgba(0,122,255,0.28)] transition-all duration-200 hover:bg-[#006FE6] active:scale-[0.985]"
    onClick={() => setSessionMode(!sessionMode)}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10" />

    <div className="relative flex items-center justify-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
        <Sparkles className="h-5 w-5" />
      </div>

      <span className="text-[20px] font-black tracking-[-0.02em]">
        {sessionMode ? "Exit Session" : "Start Session"}
      </span>
    </div>
  </Button>
</div>
        </CardContent></Card>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">{days.map((d) => <button key={d} onClick={() => { setSelectedDay(d); haptic(); }} className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-bold transition active:scale-[0.98] ${selectedDay === d ? "border-[#1D1D1F] bg-[#1D1D1F] text-white shadow-[0_8px_24px_rgba(0,0,0,0.14)]" : "border-black/[0.06] bg-white/80 text-[#1D1D1F] hover:bg-white"}`}>{d}</button>)}</div>

        <Card className={ui.card}><CardContent className="space-y-4 p-4">
          {sessionMode && <div className="flex items-center justify-between rounded-[1.4rem] bg-[#F5F5F7] p-2"><button className="rounded-full bg-white px-4 py-2 text-sm font-bold" onClick={prevExercise}>Previous</button><p className="text-sm font-black text-[#6E6E73]">{sessionIndex + 1} / {dayExercises.length}</p><button className="rounded-full bg-[#007AFF] px-4 py-2 text-sm font-bold text-white" onClick={nextExercise}>Next</button></div>}
          <ExerciseSelector />
          <div className={`rounded-[1.6rem] border p-5 ${recClass(rec?.tone)}`}><div className="flex items-center gap-2"><Target className="h-5 w-5" /><p className="text-sm font-black uppercase tracking-wide">Recommendation</p></div><p className="mt-2 text-3xl font-black leading-tight tracking-[-0.04em]">{rec?.label}</p><p className="mt-1 text-2xl font-black tracking-[-0.03em]">{rec?.weight ? `${rec.weight} kg` : "Choose load"}</p><p className="mt-2 text-sm font-semibold leading-snug opacity-90">{rec?.reason}</p></div>
          <SetCards />
          <Button onClick={saveSession} className={ui.primary}><Check className="mr-2 h-5 w-5" /> Save Exercise</Button>
          <ProgressBlock compact />
        </CardContent></Card>
      </div>
    );
  }

function Progress() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[36px] font-black tracking-[-0.045em]">Progress</h1>
          <p className={ui.sub}>Week {weekNumber} training data</p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-sm">
          <button
            type="button"
            disabled={weekNumber <= 1}
            onClick={() => {
              setWeekNumber(Math.max(1, weekNumber - 1));
              haptic();
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition active:scale-95 ${
              weekNumber <= 1
                ? "bg-[#F2F2F7] text-[#C7C7CC]"
                : "bg-[#F2F2F7] text-[#007AFF]"
            }`}
          >
            <Minus className="h-4 w-4" />
          </button>

          <span className="min-w-8 text-center text-sm font-black">{weekNumber}</span>

          <button
            type="button"
            onClick={() => {
              setWeekNumber(weekNumber + 1);
              haptic();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#007AFF] text-white transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Card className={ui.card}>
        <CardContent className="space-y-4 p-4">
          <ExerciseSelector />
          <ProgressBlock />
        </CardContent>
      </Card>

      <Card className={ui.card}>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#007AFF]" />
            <h2 className="text-lg font-black tracking-[-0.02em]">Weekly Volume</h2>
          </div>

          <div className="h-64 rounded-[1.5rem] bg-white p-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeTrend}>
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6E6E73", fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6E6E73", fontWeight: 700 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: "18px",
                    fontWeight: 700
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#1D1D1F"
                  strokeWidth={4}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
  function HistoryView() {
  const visibleLogs = logs.filter((l) => Number(l.weekNumber) === Number(weekNumber));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[36px] font-black tracking-[-0.045em]">History</h1>
          <p className={ui.sub}>Viewing Week {weekNumber}</p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-sm">
          <button
            type="button"
            disabled={weekNumber <= 1}
            onClick={() => {
              setWeekNumber(Math.max(1, weekNumber - 1));
              haptic();
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition active:scale-95 ${
              weekNumber <= 1
                ? "bg-[#F2F2F7] text-[#C7C7CC]"
                : "bg-[#F2F2F7] text-[#007AFF]"
            }`}
          >
            <Minus className="h-4 w-4" />
          </button>

          <span className="min-w-8 text-center text-sm font-black">{weekNumber}</span>

          <button
            type="button"
            onClick={() => {
              setWeekNumber(weekNumber + 1);
              haptic();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#007AFF] text-white transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Card className={ui.card}>
        <CardContent className="space-y-3 p-4">
          {visibleLogs.length === 0 && (
            <p className="rounded-[1.25rem] bg-[#F5F5F7] p-4 text-sm font-semibold text-[#6E6E73]">
              No sessions logged for Week {weekNumber}.
            </p>
          )}

          {visibleLogs.map((l) => (
            <div
              key={l.id}
              className="rounded-[1.6rem] border border-black/[0.06] bg-[#F5F5F7] p-4 shadow-inner shadow-black/[0.03]"
            >
              <div className="flex justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-black leading-tight tracking-[-0.02em]">{l.exerciseName}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#6E6E73]">
                    Week {l.weekNumber} · {new Date(l.date).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => setLogs(logs.filter((x) => x.id !== l.id))}
                  className="rounded-xl p-2 text-[#6E6E73] hover:bg-white hover:text-[#FF3B30]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-3 rounded-[1.2rem] bg-white p-3 text-sm font-bold leading-snug">
                <BarChart3 className="mr-1 inline h-4 w-4 text-[#007AFF]" />
                Volume: {Math.round(sessionVolume(l)).toLocaleString()} kg
                <br />
                <span className="text-[#6E6E73]">
                  {l.sets.map((s) => `${s.weight || "?"}×${s.reps || "?"}`).join(" / ")}
                </span>
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

  function Library() {
    return <div className="space-y-5"><h1 className="text-[36px] font-black tracking-[-0.045em]">Library</h1><Card className={ui.card}><CardContent className="space-y-3 p-4"><div className="flex items-center gap-2"><Plus className="h-5 w-5 text-[#007AFF]" /><h2 className="text-lg font-black tracking-[-0.02em]">Add Exercise</h2></div><input value={newExercise.name} onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })} placeholder="Exercise name" className={ui.field} /><input value={newExercise.muscle} onChange={(e) => setNewExercise({ ...newExercise, muscle: e.target.value })} placeholder="Muscle group" className={ui.field} /><select value={newExercise.day} onChange={(e) => setNewExercise({ ...newExercise, day: e.target.value })} className={ui.field}>{days.map((d) => <option key={d}>{d}</option>)}</select><Button onClick={addExercise} className="w-full rounded-[1.25rem] bg-[#1D1D1F] py-5 font-bold text-white hover:bg-black">Add exercise</Button></CardContent></Card><Card className={ui.card}><CardContent className="space-y-2 p-4">{exercises.map((e) => <div key={e.id} className="flex items-center justify-between rounded-[1.4rem] bg-[#F5F5F7] p-3"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-black text-[#007AFF]">{e.icon}</div><div><p className="font-black tracking-[-0.02em]">{e.name}</p><p className="text-sm font-semibold text-[#6E6E73]">{e.day} · {e.muscle}</p></div></div><ChevronRight className="h-5 w-5 text-[#C7C7CC]" /></div>)}</CardContent></Card></div>;
  }

  function SettingsView() {
    const rows = [
      ["Sleep", "sleep", "Higher is better"],
      ["Soreness", "soreness", "Lower is better"],
      ["Stress", "stress", "Lower is better"],
      ["Motivation", "motivation", "Higher is better"]
    ];
    return <div className="space-y-5"><h1 className="text-[36px] font-black tracking-[-0.045em]">Settings</h1><Card className={ui.card}><CardContent className="space-y-4 p-4"><div><p className={ui.label}>Readiness</p><p className="mt-1 text-3xl font-black tracking-[-0.04em]">{readinessScore}%</p></div>{rows.map(([label, key, hint]) => <div key={key} className="rounded-[1.4rem] bg-[#F5F5F7] p-4"><div className="flex items-center justify-between"><div><p className="font-black">{label}</p><p className="text-sm font-semibold text-[#6E6E73]">{hint}</p></div><p className="text-2xl font-black text-[#007AFF]">{readiness[key]}</p></div><input type="range" min="1" max="10" value={readiness[key]} onChange={(e) => setReadiness({ ...readiness, [key]: Number(e.target.value) })} className="mt-3 w-full accent-[#007AFF]" /></div>)}</CardContent></Card><Card className={ui.card}><CardContent className="space-y-3 p-4"><p className={ui.label}>Profile</p><input className={ui.field} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /><input className={ui.field} value={profile.goal} onChange={(e) => setProfile({ ...profile, goal: e.target.value })} /><input className={ui.field} value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: e.target.value })} /><input className={ui.field} value={profile.weakPoint} onChange={(e) => setProfile({ ...profile, weakPoint: e.target.value })} /></CardContent></Card><Button variant="outline" onClick={resetData} className="w-full rounded-[1.25rem] border-black/[0.06] bg-white py-5 font-bold text-[#FF3B30] hover:bg-[#FFF0F0]"><RotateCcw className="mr-2 h-4 w-4" />Reset all training data</Button></div>;
  }

  return (
    <div className={ui.page}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_34%),radial-gradient(circle_at_top_right,rgba(0,122,255,0.10),transparent_28%)]" /><div className="absolute bottom-[-160px] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#007AFF]/[0.06] blur-3xl" /></div>
      <div className="relative mx-auto max-w-md space-y-5">
        <AnimatePresence mode="wait"><motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>{tab === "today" && <Today />}{tab === "progress" && <Progress />}{tab === "history" && <HistoryView />}{tab === "library" && <Library />}{tab === "settings" && <SettingsView />}</motion.div></AnimatePresence>
      </div>

      <AnimatePresence>{restSeconds > 0 && <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="fixed bottom-24 left-1/2 z-40 w-[92%] max-w-md -translate-x-1/2 rounded-[1.5rem] border border-black/[0.06] bg-[#1D1D1F]/95 p-3 text-white shadow-[0_20px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"><Timer className="h-5 w-5" /></div><div><p className="text-sm font-bold text-white/60">Rest Timer</p><p className="text-2xl font-black tracking-[-0.04em]">{formatTime(restSeconds)}</p></div></div><button className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black" onClick={() => setRestSeconds(0)}>Skip</button></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#007AFF]" style={{ width: `${Math.min(100, (restSeconds / (activeExercise?.rest || 90)) * 100)}%` }} /></div></motion.div>}</AnimatePresence>

      <AnimatePresence>{celebration && <motion.div initial={{ scale: 0.82, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="fixed left-1/2 top-24 z-50 w-[88%] max-w-sm -translate-x-1/2 rounded-[2rem] border border-[#FFD60A]/30 bg-white p-5 text-center shadow-[0_30px_90px_rgba(0,0,0,0.25)]"><Trophy className="mx-auto h-10 w-10 text-[#FF9500]" /><p className="mt-2 text-sm font-black uppercase tracking-[0.16em] text-[#6E6E73]">New PR</p><p className="mt-1 text-2xl font-black tracking-[-0.04em]">{celebration}</p></motion.div>}</AnimatePresence>

      <div className="fixed bottom-3 left-1/2 z-30 w-[94%] max-w-md -translate-x-1/2 rounded-[2rem] border border-black/[0.06] bg-white/90 p-2 shadow-[0_20px_70px_rgba(0,0,0,0.16)] backdrop-blur-2xl">
        <div className="grid grid-cols-5 gap-1">{nav.map((item) => { const Icon = item.icon; const active = tab === item.id; return <button key={item.id} onClick={() => { setTab(item.id); haptic(); }} className={`flex flex-col items-center justify-center gap-1 rounded-[1.4rem] py-2 text-[10px] font-bold transition active:scale-95 ${active ? "bg-[#007AFF] text-white shadow-[0_8px_22px_rgba(0,122,255,0.22)]" : "text-[#6E6E73] hover:bg-[#F5F5F7]"}`}><Icon className="h-5 w-5" />{item.label}</button>; })}</div>
      </div>
    </div>
  );
}
