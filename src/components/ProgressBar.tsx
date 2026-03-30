"use client";

import { useState, useEffect, useRef } from "react";

interface ProgressBarProps {
  isActive: boolean;
  isComplete: boolean;
  isEs: boolean;
}

const STAGES_ES = [
  { label: "Leyendo tu CV...", pct: 15, duration: 2000 },
  { label: "Analizando estructura...", pct: 35, duration: 3000 },
  { label: "Evaluando contenido...", pct: 60, duration: 5000 },
  { label: "Generando recomendaciones...", pct: 85, duration: 4000 },
  { label: "Finalizando...", pct: 95, duration: 3000 },
];

const STAGES_EN = [
  { label: "Reading your resume...", pct: 15, duration: 2000 },
  { label: "Analyzing structure...", pct: 35, duration: 3000 },
  { label: "Evaluating content...", pct: 60, duration: 5000 },
  { label: "Generating recommendations...", pct: 85, duration: 4000 },
  { label: "Finalizing...", pct: 95, duration: 3000 },
];

export default function ProgressBar({ isActive, isComplete, isEs }: ProgressBarProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [pct, setPct] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stages = isEs ? STAGES_ES : STAGES_EN;

  useEffect(() => {
    if (!isActive) {
      setStageIndex(0);
      setPct(0);
      return;
    }

    // Start first stage immediately
    setPct(stages[0].pct);

    function advance(index: number) {
      if (index >= stages.length - 1) return;
      timerRef.current = setTimeout(() => {
        const next = index + 1;
        setStageIndex(next);
        setPct(stages[next].pct);
        advance(next);
      }, stages[index].duration);
    }

    advance(0);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, stages]);

  useEffect(() => {
    if (isComplete) setPct(100);
  }, [isComplete]);

  if (!isActive && !isComplete) return null;

  const label = isComplete
    ? (isEs ? "¡Listo!" : "Done!")
    : stages[stageIndex].label;

  return (
    <div className="w-full space-y-2 py-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-500">{label}</span>
        <span className="text-xs text-ink-300 font-[family-name:var(--font-mono)] tabular-nums">{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-ink-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full"
          style={{
            width: `${pct}%`,
            transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
    </div>
  );
}
