"use client";

import { useState, useEffect } from "react";

export function ProgressBar({ label, durationMs = 15000 }: { label: string; durationMs?: number }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(90, (elapsed / durationMs) * 90));
    }, 100);
    return () => clearInterval(interval);
  }, [durationMs]);

  return (
    <div className="w-full max-w-sm mx-auto text-center py-8">
      <div className="h-1 bg-ink-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-ink-400">{label}</p>
    </div>
  );
}
