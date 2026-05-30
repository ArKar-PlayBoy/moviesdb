"use client";

import { useState, useEffect } from "react";

const WORLD_CUP_START = new Date("2026-06-11T00:00:00");

function calc() {
  const now = new Date();
  const diff = WORLD_CUP_START.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, started: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    started: false,
  };
}

export default function Countdown() {
  const [mounted, setMounted] = useState(false);
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, started: false });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setT(calc());
    const id = setInterval(() => setT(calc), 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return <div className="h-12" />;

  if (t.started) {
    return (
      <div className="inline-flex items-center gap-2 text-sm font-bold text-foreground bg-primary/10 px-3 py-1 rounded-full">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        Tournament Underway
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4 text-center" aria-live="polite" aria-label={`Countdown: ${t.days} days, ${t.hours} hours, ${t.minutes} minutes, ${t.seconds} seconds remaining`}>
      <Unit value={t.days} label="Days" />
      <span className="text-2xl font-bold text-muted-foreground">:</span>
      <Unit value={t.hours} label="Hours" />
      <span className="text-2xl font-bold text-muted-foreground">:</span>
      <Unit value={t.minutes} label="Min" />
      <span className="text-2xl font-bold text-muted-foreground">:</span>
      <Unit value={t.seconds} label="Sec" />
    </div>
  );
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl md:text-3xl font-black tabular-nums leading-none">{String(value).padStart(2, "0")}</span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}
