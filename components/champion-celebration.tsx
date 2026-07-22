"use client";

import { useEffect, useRef, useState } from "react";
import { Trophy, Sparkles, Clock, Medal, Star, Crown, Flame } from "lucide-react";
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
    let particles: { x: number; y: number; vx: number; vy: number; color: string; size: number; life: number; rot: number; rotSpeed: number }[] = [];
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const COLORS = ["#ffd700", "#ffaa00", "#ff6b35", "#ff0000", "#00ff00", "#00bfff", "#ff69b4", "#ffa500", "#7b68ee", "#ffffff"];

    function spawnBurst(cx: number, cy: number, count: number) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 10 + 3;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 4,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: Math.random() * 8 + 2,
          life: 1,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.2,
        });
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particles = particles.filter((p) => p.life > 0);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.vx *= 0.99;
        p.life -= 0.004;
        p.rot += p.rotSpeed;
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rot);
        ctx!.globalAlpha = Math.max(0, p.life);
        ctx!.fillStyle = p.color;
        if (Math.random() > 0.5) {
          ctx!.fillRect(-p.size / 2, -p.size / 2, p.size * p.life, p.size * p.life);
        } else {
          ctx!.beginPath();
          ctx!.arc(0, 0, p.size * p.life, 0, Math.PI * 2);
          ctx!.fill();
        }
        ctx!.restore();
      }
      ctx!.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    }

    const w = canvas.width;
    const h = canvas.height;
    spawnBurst(w * 0.2, h * 0.25, 100);
    setTimeout(() => spawnBurst(w * 0.8, h * 0.25, 100), 300);
    setTimeout(() => spawnBurst(w * 0.5, h * 0.2, 120), 600);
    setTimeout(() => spawnBurst(w * 0.3, h * 0.4, 80), 900);
    setTimeout(() => spawnBurst(w * 0.7, h * 0.4, 80), 1100);
    setTimeout(() => spawnBurst(w * 0.5, h * 0.35, 90), 1400);
    setTimeout(() => spawnBurst(w * 0.15, h * 0.5, 60), 1700);
    setTimeout(() => spawnBurst(w * 0.85, h * 0.5, 60), 1900);
    animate();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
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
    const loserName = loserId ? getTeamName(loserId) : "";
    const loserFlag = loserId ? getTeamFlag(loserId) : "";
    const totalGoals = (finalMatch.score1 ?? 0) + (finalMatch.score2 ?? 0);
    const margin = Math.abs((finalMatch.score1 ?? 0) - (finalMatch.score2 ?? 0));

    return (
      <section className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl border border-yellow-500/30 bg-gradient-to-b from-yellow-900/80 via-amber-900/60 to-background animate-in">
        {/* Group celebration photo background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1400&q=80')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/70 via-amber-900/50 to-background" />
        </div>

        {/* Golden sunburst rays */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="sunburst-rays absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] opacity-[0.07]" />
          <div className="sunburst-rays-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] opacity-[0.04]" />
        </div>

        {/* Ambient glow orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-500/8 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 right-1/3 w-[300px] h-[300px] bg-orange-500/6 rounded-full blur-[80px]" />
        </div>

        {/* Confetti canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-30" />

        {/* Floating decorative stars */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute top-8 left-[8%] text-yellow-500/30 animate-ping"><Star className="h-5 w-5 fill-yellow-500/30" /></div>
          <div className="absolute top-16 right-[12%] text-amber-400/25 animate-ping" style={{ animationDelay: "0.7s" }}><Star className="h-4 w-4 fill-amber-400/25" /></div>
          <div className="absolute bottom-12 left-[20%] text-yellow-500/20 animate-ping" style={{ animationDelay: "1.4s" }}><Star className="h-3 w-3 fill-yellow-500/20" /></div>
          <div className="absolute top-1/3 left-[5%] text-amber-500/20 animate-ping" style={{ animationDelay: "2s" }}><Crown className="h-6 w-6" /></div>
          <div className="absolute bottom-1/4 right-[8%] text-yellow-400/20 animate-ping" style={{ animationDelay: "0.3s" }}><Flame className="h-5 w-5" /></div>
          <div className="absolute top-20 left-[45%] text-amber-300/15 animate-ping" style={{ animationDelay: "1.8s" }}><Sparkles className="h-4 w-4" /></div>
        </div>

        {/* Content */}
        <div className="relative z-20 py-16 sm:py-20 md:py-28 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Champion badge */}
            <div className="animate-in inline-flex items-center gap-2.5 bg-yellow-500/15 backdrop-blur-sm rounded-full px-5 py-2 mb-8 border border-yellow-500/25 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
              <Trophy className="h-4 w-4 text-yellow-500 animate-pulse" />
              <span className="text-[11px] font-bold text-yellow-500 uppercase tracking-[0.2em]">2026 World Champions</span>
              <Trophy className="h-4 w-4 text-yellow-500 animate-pulse" />
            </div>

            {/* Giant champion flag */}
            <div className="animate-in animate-in-delay-1 mb-6">
              <div className="text-8xl sm:text-9xl md:text-[10rem] leading-none drop-shadow-[0_8px_30px_rgba(234,179,8,0.3)] champion-flag-bounce">
                {championFlag || "🏆"}
              </div>
            </div>

            {/* Champion name */}
            <h2 className="animate-in animate-in-delay-2 text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black gradient-text from-yellow-400 via-amber-300 to-orange-400 mb-3 tracking-tight leading-none">
              {championName}
            </h2>

            <p className="animate-in animate-in-delay-2 text-base sm:text-lg text-amber-200/60 font-medium mb-8">
              FIFA World Cup 2026 Champions
            </p>

            {/* Score display */}
            <div className="animate-in animate-in-delay-3 inline-flex items-center gap-4 sm:gap-6 bg-card/30 backdrop-blur-md rounded-2xl border border-yellow-500/20 px-6 sm:px-8 py-4 shadow-[0_0_40px_rgba(234,179,8,0.08)]">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl sm:text-3xl">{championFlag}</span>
                <span className="text-sm sm:text-base font-bold text-foreground">{championName}</span>
              </div>
              <div className="flex items-center gap-2 text-2xl sm:text-3xl font-black">
                <span className="text-yellow-400">{finalMatch.score1}</span>
                <span className="text-muted-foreground/40">-</span>
                <span className="text-muted-foreground">{finalMatch.score2}</span>
              </div>
              {loserId && (
                <div className="flex items-center gap-2.5">
                  <span className="text-sm sm:text-base font-bold text-muted-foreground">{loserName}</span>
                  <span className="text-2xl sm:text-3xl">{loserFlag}</span>
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="animate-in animate-in-delay-4 mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
              <div className="bg-card/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/10">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  <p className="text-[10px] text-amber-200/50 uppercase tracking-wider font-medium">Goals</p>
                </div>
                <p className="text-2xl font-black text-amber-400">{totalGoals}</p>
              </div>
              <div className="bg-card/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/10">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                  <p className="text-[10px] text-amber-200/50 uppercase tracking-wider font-medium">Margin</p>
                </div>
                <p className="text-2xl font-black text-amber-400">{margin}</p>
              </div>
              <div className="bg-card/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/10">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Medal className="h-3.5 w-3.5 text-yellow-500" />
                  <p className="text-[10px] text-amber-200/50 uppercase tracking-wider font-medium">Final</p>
                </div>
                <p className="text-2xl font-black text-amber-400">Jul 19</p>
              </div>
              <div className="bg-card/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/10">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Crown className="h-3.5 w-3.5 text-amber-300" />
                  <p className="text-[10px] text-amber-200/50 uppercase tracking-wider font-medium">Venue</p>
                </div>
                <p className="text-lg font-black text-amber-400">MetLife</p>
              </div>
            </div>

            {/* Golden divider */}
            <div className="animate-in animate-in-delay-5 mt-10 flex items-center gap-4 max-w-md mx-auto">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
              <Sparkles className="h-4 w-4 text-yellow-500/40" />
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
            </div>

            <p className="animate-in animate-in-delay-5 mt-4 text-xs text-amber-200/30 tracking-widest uppercase">
              Champion of the World
            </p>
          </div>
        </div>
      </section>
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
