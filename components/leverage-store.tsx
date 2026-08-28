"use client";

import * as React from "react";

import {
  diagnoseLeverage,
  type DiagnosticAnswers,
  type LeverageDiagnosis,
} from "@/lib/leverage-diagnostic";
import {
  COMPLETED_PLAYS_KEY,
  HISTORY_KEY,
  SCORES_STORAGE_KEY,
  type Scores,
  type Snapshot,
} from "@/lib/levers";

const ANSWERS_STORAGE_KEY = "archimedes:evidence:v2";

interface LeverageValue {
  loaded: boolean;
  scores: Scores;
  answers: DiagnosticAnswers;
  setAnswer: (questionId: string, optionId: string) => void;
  resetDiagnosis: () => void;
  diagnosis: LeverageDiagnosis;
  constraint: LeverageDiagnosis["constraint"];
  index: number;
  completedPlays: Set<string>;
  togglePlay: (id: string) => void;
  history: Snapshot[];
  logSnapshot: () => void;
  clearHistory: () => void;
}

const LeverageContext = React.createContext<LeverageValue | null>(null);

export function useLeverage(): LeverageValue {
  const ctx = React.useContext(LeverageContext);
  if (!ctx) throw new Error("useLeverage must be used within <LeverageProvider>");
  return ctx;
}

export function LeverageProvider({ children }: { children: React.ReactNode }) {
  const [answers, setAnswers] = React.useState<DiagnosticAnswers>({});
  const [completedPlays, setCompleted] = React.useState<Set<string>>(new Set());
  const [history, setHistory] = React.useState<Snapshot[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const diagnosis = React.useMemo(() => diagnoseLeverage(answers), [answers]);
  const scores = diagnosis.scores;

  React.useEffect(() => {
    try {
      const rawAnswers = localStorage.getItem(ANSWERS_STORAGE_KEY);
      if (rawAnswers) {
        const parsed = JSON.parse(rawAnswers) as unknown;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          setAnswers(parsed as DiagnosticAnswers);
        }
      }
      const rawPlays = localStorage.getItem(COMPLETED_PLAYS_KEY);
      if (rawPlays) {
        const arr = JSON.parse(rawPlays) as unknown;
        if (Array.isArray(arr)) {
          setCompleted(new Set(arr.filter((x): x is string => typeof x === "string")));
        }
      }
      const rawHist = localStorage.getItem(HISTORY_KEY);
      if (rawHist) {
        const arr = JSON.parse(rawHist) as unknown;
        if (Array.isArray(arr)) setHistory(arr as Snapshot[]);
      }
    } catch {
      /* ignore malformed storage */
    }
    setLoaded(true);
  }, []);

  React.useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(answers));
      localStorage.setItem(SCORES_STORAGE_KEY, JSON.stringify(scores));
    } catch {
      /* storage unavailable */
    }
  }, [answers, scores, loaded]);

  React.useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(
        COMPLETED_PLAYS_KEY,
        JSON.stringify(Array.from(completedPlays))
      );
    } catch {
      /* storage unavailable */
    }
  }, [completedPlays, loaded]);

  React.useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* storage unavailable */
    }
  }, [history, loaded]);

  const setAnswer = React.useCallback((questionId: string, optionId: string) => {
    setAnswers((previous) => ({ ...previous, [questionId]: optionId }));
  }, []);

  const resetDiagnosis = React.useCallback(() => {
    setAnswers({});
  }, []);

  const togglePlay = React.useCallback((id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const logSnapshot = React.useCallback(() => {
    if (!diagnosis.complete) return;
    setHistory((prev) => {
      if (prev.some((snapshot) => snapshot.runId === diagnosis.runId)) {
        return prev;
      }
      const snap: Snapshot = {
        t: Date.now(),
        rubricVersion: diagnosis.rubricVersion,
        runId: diagnosis.runId,
        scores: { ...scores },
        index: diagnosis.index,
        confidence: diagnosis.confidence,
        evidenceCount: diagnosis.answered,
        constraint: diagnosis.constraint,
        answers: { ...answers },
      };
      return [...prev, snap].slice(-60);
    });
  }, [answers, diagnosis, scores]);

  const clearHistory = React.useCallback(() => setHistory([]), []);

  const value: LeverageValue = {
    loaded,
    scores,
    answers,
    setAnswer,
    resetDiagnosis,
    diagnosis,
    constraint: diagnosis.constraint,
    index: diagnosis.index,
    completedPlays,
    togglePlay,
    history,
    logSnapshot,
    clearHistory,
  };

  return (
    <LeverageContext.Provider value={value}>{children}</LeverageContext.Provider>
  );
}
