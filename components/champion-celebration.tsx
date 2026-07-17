"use client";

import { useEffect, useRef, useState } from "react";
import { Trophy, Sparkles, Clock, Medal } from "lucide-react";
import { getTeamName, getTeamFlag } from "@/data/worldcup-2026";
import type { KnockoutMatch } from "@/data/worldcup-2026";

interface Props {
  finalMatch: KnockoutMatch | null;
  isAfterFinal: boolean;
  bronzeMatch?: KnockoutMatch | null;
}

export default function ChampionCelebration({ finalMatch, isAfterFinal, bronzeMatch }: Props) {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isAfterFinal || !canvasRef.current) return;

    let animId: number;
    let particles: { x: number; y: number; vx: number; vy: number; color: string; size: number; life: number }[] = [];
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ["#ffd700", "#ff6b35", "#ff0000", "#00ff00", "#00bfff", "#ff69b4", "#ffa500", "#7b68ee"];

    function spawnBurst(cx: number, cy: number) {
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: Math.random() * 6 + 3,
          life: 1,
        });
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particles = particles.filter((p) => p.life > 0);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.life -= 0.006;
        ctx!.globalAlpha = Math.max(0, p.life);
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    }

    spawnBurst(canvas.width / 2 - 100, canvas.height * 0.3);
    setTimeout(() => spawnBurst(canvas.width / 2 + 100, canvas.height * 0.3), 400);
    setTimeout(() => spawnBurst(canvas.width / 2, canvas.height * 0.3), 800);
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [mounted, isAfterFinal]);

  if (!mounted) {
    return <CountdownFallback finalMatch={finalMatch} />;
  }

  const finalDate = new Date("2026-07-19T21:00:00Z");
  const now = new Date();
  const diff = finalDate.getTime() - now.getTime();
  const isFinalSoon = !isAfterFinal && diff > 0;

  if (isAfterFinal && finalMatch) {
    const championId = finalMatch.score1! > finalMatch.score2!
      ? finalMatch.team1
      : finalMatch.team2;
    const championName = championId ? getTeamName(championId) : "Champion";
    const championFlag = championId ? getTeamFlag(championId) : "";
    const loserId = finalMatch.score1! > finalMatch.score2!
      ? finalMatch.team2
      : finalMatch.team1;

    return (
      <div className="relative overflow-hidden rounded-2xl border border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 via-background to-yellow-500/5 mt-10">
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-20" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 text-4xl animate-ping opacity-20">★</div>
          <div className="absolute top-8 right-12 text-3xl animate-ping opacity-20" style={{ animationDelay: "0.5s" }}>★</div>
          <div className="absolute bottom-8 left-1/3 text-2xl animate-ping opacity-20" style={{ animationDelay: "1s" }}>★</div>
        </div>

        <div className="relative z-10 p-6 md:p-10 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 rounded-full px-4 py-1.5 mb-4 border border-yellow-500/20">
            <Trophy className="h-4 w-4 text-yellow-500 animate-pulse" />
            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.15em]">2026 World Champions</span>
          </div>

          <div className="text-5xl md:text-7xl mb-2 animate-bounce" style={{ animationDuration: "2s" }}>
            {championFlag || "🏆"}
          </div>

          <h2 className="text-2xl md:text-5xl font-black gradient-text from-yellow-500 via-amber-400 to-orange-500 mt-2 mb-1">
            {championName}
          </h2>

          <p className="text-muted-foreground text-sm md:text-base mb-6">
            FIFA World Cup 2026 Champions
          </p>

          <div className="inline-flex items-center gap-3 bg-card/50 rounded-xl border border-border/50 px-5 py-3">
            <span className="text-lg">{championFlag}</span>
            <span className="font-bold">{finalMatch.score1}</span>
            <span className="text-muted-foreground">-</span>
            <span className="font-bold">{finalMatch.score2}</span>
            {loserId && <span className="text-lg">{getTeamFlag(loserId)}</span>}
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className="bg-card/40 rounded-lg p-3 border border-border/30">
              <p className="text-xs text-muted-foreground">Goals</p>
              <p className="text-lg font-bold">{(finalMatch.score1 ?? 0) + (finalMatch.score2 ?? 0)}</p>
            </div>
            <div className="bg-card/40 rounded-lg p-3 border border-border/30">
              <p className="text-xs text-muted-foreground">Margin</p>
              <p className="text-lg font-bold">{Math.abs((finalMatch.score1 ?? 0) - (finalMatch.score2 ?? 0))}</p>
            </div>
            <div className="bg-card/40 rounded-lg p-3 border border-border/30 col-span-2 md:col-span-1">
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-lg font-bold">Jul 19</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isFinalSoon && finalMatch) {
    const t1Name = getTeamName(finalMatch.team1 ?? "");
    const t2Name = getTeamName(finalMatch.team2 ?? "");
    const t1Flag = getTeamFlag(finalMatch.team1 ?? "");
    const t2Flag = getTeamFlag(finalMatch.team2 ?? "");

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return (
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/5 mt-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 p-6 md:p-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-3 border border-primary/20">
              <Trophy className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Championship Final</span>
            </div>
            <p className="text-sm text-muted-foreground">July 19, 2026</p>
          </div>

          <div className="flex items-center justify-center gap-4 md:gap-10 mb-6">
            <div className="text-center">
              <div className="text-5xl md:text-6xl mb-2">{t1Flag}</div>
              <p className="font-bold text-sm md:text-base">{t1Name}</p>
              <p className="text-[10px] text-muted-foreground">FIFA #3</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-black text-muted-foreground">VS</p>
              <div className="flex items-center gap-1 justify-center mt-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                  {days}d {hours}h {minutes}m
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl mb-2">{t2Flag}</div>
              <p className="font-bold text-sm md:text-base">{t2Name}</p>
              <p className="text-[10px] text-muted-foreground">FIFA #1</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Medal className="h-3 w-3" />
              <span>SF: beat France</span>
            </div>
            <span className="text-muted-foreground/30">·</span>
            <div className="flex items-center gap-1">
              <Medal className="h-3 w-3" />
              <span>SF: beat England</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 bg-card rounded-xl border border-border p-6 md:p-10 text-center">
      <Trophy className="h-10 w-10 mx-auto text-primary mb-3" />
      <h2 className="text-xl md:text-2xl font-bold mb-1">Champions</h2>
      <p className="text-sm text-muted-foreground">
        The 2026 FIFA World Cup champion will be crowned after the Final on July 19
      </p>
    </div>
  );
}

function CountdownFallback({ finalMatch }: { finalMatch: KnockoutMatch | null }) {
  if (!finalMatch?.team1 || !finalMatch?.team2) {
    return (
      <div className="mt-10 bg-card rounded-xl border border-border p-6 text-center">
        <Trophy className="h-10 w-10 mx-auto text-primary mb-3" />
        <h2 className="text-xl font-bold mb-1">Champions</h2>
        <p className="text-sm text-muted-foreground">The champion will be crowned after the Final on July 19</p>
      </div>
    );
  }

  return (
    <div className="mt-10 bg-card rounded-xl border border-border p-6 text-center">
      <Trophy className="h-10 w-10 mx-auto text-primary mb-3" />
      <h2 className="text-xl font-bold mb-1">Championship Final</h2>
      <p className="text-sm text-muted-foreground">July 19 · Loading countdown...</p>
    </div>
  );
}
