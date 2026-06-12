import type { Metadata } from "next";
import { MATCHES, getTeamById, getTeamName, getAllPlayers, type StarOfMatch } from "@/data/worldcup-2026";
import { getMatchData, type GoalEvent } from "@/lib/data-service";
import { slugify } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Trophy, Clock, Goal as GoalIcon, Youtube, Users, Star, Medal, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlayerAvatar from "@/components/player-avatar";
import ShareButton from "@/components/share-button";
import { resolvePlayerPhoto } from "@/lib/player-photos";



export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const match = MATCHES.find(m => m.id === id);
  if (!match) return { title: "Match Not Found — WorldCup 2026" };
  const t1 = getTeamName(match.team1);
  const t2 = getTeamName(match.team2);
  return {
    title: `${t1} vs ${t2} — WorldCup 2026`,
    description: `${t1} vs ${t2} — Group ${match.group} · ${match.date} · ${match.venue}`,
  };
}

export function generateStaticParams() {
  return MATCHES.map((m) => ({ id: m.id }));
}

function computeStarOfMatch(
  goals: GoalEvent[],
  team1Id: string,
  team2Id: string,
  t1Name: string,
  t2Name: string,
  t1Flag: string,
  t2Flag: string,
  score: [number, number],
): StarOfMatch | null {
  if (goals.length === 0) return null;
  const counts: Record<string, { count: number; minutes: number[]; teamId: string }> = {};
  for (const g of goals) {
    if (!counts[g.playerName]) counts[g.playerName] = { count: 0, minutes: [], teamId: g.teamId };
    counts[g.playerName].count++;
    counts[g.playerName].minutes.push(g.minute);
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1].count - a[1].count);
  const top = sorted[0];
  const isTeam1 = top[1].teamId === team1Id;
  const [s1, s2] = score;
  const teamScore = isTeam1 ? s1 : s2;
  const oppScore = isTeam1 ? s2 : s1;

  const allPlayers = getAllPlayers();
  const playerData = allPlayers.find(p => p.name === top[0] && p.teamId === top[1].teamId);

  return {
    playerName: top[0],
    teamId: top[1].teamId,
    teamName: isTeam1 ? t1Name : t2Name,
    teamFlag: isTeam1 ? t1Flag : t2Flag,
    position: playerData?.position || "",
    goals: top[1].count,
    minutes: top[1].minutes.sort((a, b) => a - b),
    teamScore,
    opponentScore: oppScore,
    isWinningTeam: teamScore > oppScore,
  };
}

export const revalidate = 60;

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = MATCHES.find(m => m.id === id);
  if (!match) notFound();

  const t1 = getTeamById(match.team1);
  const t2 = getTeamById(match.team2);
  if (!t1 || !t2) notFound();

  const liveData = await getMatchData(match.id, match.team1, match.team2);
  const played = liveData.status !== "scheduled";
  const [s1, s2] = played ? liveData.score : [0, 0];
  const scorers1 = liveData.goals.filter((g: GoalEvent) => g.teamId === match.team1);
  const scorers2 = liveData.goals.filter((g: GoalEvent) => g.teamId === match.team2);
  const isDraw = played && s1 === s2;
  const t1Won = played && s1 > s2;

  const allGoals = [...scorers1, ...scorers2].sort((a, b) => a.minute - b.minute);
  const starOfMatch = computeStarOfMatch(liveData.goals, match.team1, match.team2, t1.name, t2.name, t1.flag, t2.flag, [s1, s2]);
  const starPhoto = starOfMatch ? await resolvePlayerPhoto(starOfMatch.playerName) : null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/matches">
            <ArrowLeft className="h-4 w-4 mr-1" />
            All Matches
          </Link>
        </Button>
        <ShareButton title={`${t1.name} vs ${t2.name} — WorldCup 2026`} text={`${t1.name} ${played ? `${s1}-${s2}` : "vs"} ${t2.name} — Group ${match.group} · ${match.date}`} />
      </div>

      {/* ===== MATCH HEADER ===== */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-transparent" />
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground mb-5 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-secondary px-2.5 py-1 rounded-full font-medium">
              <Trophy className="h-3 w-3" />
              Group {match.group}
            </span>
            <span className="inline-flex items-center gap-1 bg-secondary px-2.5 py-1 rounded-full font-medium">
              <Calendar className="h-3 w-3" />
              {match.date}
            </span>
            <span className="inline-flex items-center gap-1 bg-secondary px-2.5 py-1 rounded-full font-medium">
              <MapPin className="h-3 w-3" />
              {match.venue}
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 md:gap-10 py-6">
            <Link href={`/team/${match.team1}`} className="flex flex-col items-center gap-3 group min-w-0 w-24 sm:w-28 md:w-36">
              <span className="text-4xl sm:text-5xl md:text-7xl group-hover:scale-110 transition-transform duration-300">{t1.flag}</span>
              <span className={`font-bold text-xs sm:text-sm md:text-base text-center leading-tight group-hover:text-primary transition-colors truncate max-w-full ${t1Won ? "text-primary" : ""}`}>
                {t1.name}
              </span>
              <span className="text-[10px] text-muted-foreground">FIFA #{t1.fifaRanking}</span>
            </Link>

            <div className="flex flex-col items-center gap-2">
              {played ? (
                <>
                  <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-3xl md:text-4xl font-black tabular-nums shadow-lg ${
                    isDraw
                      ? "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20"
                      : t1Won
                        ? "bg-green-500/10 text-green-600 ring-1 ring-green-500/20"
                        : "bg-red-500/10 text-red-600 ring-1 ring-red-500/20"
                  }`}>
                    <span>{s1}</span>
                    <span className="text-muted-foreground text-2xl">:</span>
                    <span>{s2}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${
                    isDraw ? "text-amber-600" : t1Won ? "text-green-600" : "text-red-600"
                  }`}>
                    {isDraw ? "Draw" : `${t1Won ? t1.name : t2!.name} Wins`}
                  </span>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-muted/30">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                      </span>
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Upcoming</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{match.date} · 2026</span>
                </>
              )}
            </div>

            <Link href={`/team/${match.team2}`} className="flex flex-col items-center gap-3 group min-w-0 w-24 sm:w-28 md:w-36">
              <span className="text-4xl sm:text-5xl md:text-7xl group-hover:scale-110 transition-transform duration-300">{t2.flag}</span>
              <span className={`font-bold text-xs sm:text-sm md:text-base text-center leading-tight group-hover:text-primary transition-colors truncate max-w-full ${t1Won ? "" : "font-medium"}`}>
                {t2.name}
              </span>
              <span className="text-[10px] text-muted-foreground">FIFA #{t2.fifaRanking}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ===== GOAL TIMELINE ===== */}
      {played && (
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <GoalIcon className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Match Timeline</h2>
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground tabular-nums">{allGoals.length} goal{allGoals.length !== 1 ? "s" : ""}</span>
          </div>

          {allGoals.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-secondary mx-auto flex items-center justify-center mb-3">
                <GoalIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No goals scored in this match</p>
              <p className="text-xs text-muted-foreground mt-1">A defensive stalemate</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-[17px] top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4">
                {allGoals.map((sc, i) => {
                  const isTeam1 = sc.teamId === match.team1;
                  return (
                    <div key={i} className="relative flex items-start gap-4 pl-0">
                      <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 ring-2 ring-background ${
                        isTeam1 ? "bg-green-500/15 text-green-600" : "bg-blue-500/15 text-blue-600"
                      }`}>
                        <GoalIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/player/${slugify(sc.playerName)}`}
                            className="font-semibold text-sm hover:text-primary transition-colors"
                          >
                            {sc.playerName}
                          </Link>
                          <span className="inline-flex items-center justify-center min-w-[2.5rem] h-5 rounded bg-secondary text-[10px] font-bold tabular-nums text-muted-foreground px-1.5">
                            {sc.minute}&apos;
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {isTeam1 ? t1.name : t2!.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`h-1.5 rounded-full flex-1 max-w-[200px] ${
                            isTeam1 ? "bg-green-500/20" : "bg-blue-500/20"
                          }`}>
                            <div
                              className={`h-full rounded-full ${isTeam1 ? "bg-green-500" : "bg-blue-500"}`}
                              style={{ width: `${Math.min(100, (sc.minute / 90) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{Math.round((sc.minute / 90) * 100)}% match elapsed</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{t1.name}</p>
              <p className="text-2xl font-black tabular-nums text-green-600">{s1}</p>
              <p className="text-[10px] text-muted-foreground">Goals</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{t2.name}</p>
              <p className="text-2xl font-black tabular-nums text-blue-600">{s2}</p>
              <p className="text-[10px] text-muted-foreground">Goals</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== TEAM COMPARISON SIDEBAR ===== */}
      {played && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{t1.flag}</span>
              <h3 className="font-bold text-sm">{t1.name}</h3>
            </div>
            <div className="space-y-3">
              {scorers1.map((sc, i) => (
                <Link
                  key={i}
                  href={`/player/${slugify(sc.playerName)}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center shrink-0">
                    <GoalIcon className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">{sc.playerName}</p>
                    <p className="text-[10px] text-muted-foreground">{sc.minute}&apos; — Goal</p>
                  </div>
                  <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded tabular-nums">{sc.minute}&apos;</span>
                </Link>
              ))}
              {scorers1.length === 0 && (
                <div className="text-center py-6">
                  <Users className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">No goal scorers</p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{t2.flag}</span>
              <h3 className="font-bold text-sm">{t2.name}</h3>
            </div>
            <div className="space-y-3">
              {scorers2.map((sc, i) => (
                <Link
                  key={i}
                  href={`/player/${slugify(sc.playerName)}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center shrink-0">
                    <GoalIcon className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">{sc.playerName}</p>
                    <p className="text-[10px] text-muted-foreground">{sc.minute}&apos; — Goal</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded tabular-nums">{sc.minute}&apos;</span>
                </Link>
              ))}
              {scorers2.length === 0 && (
                <div className="text-center py-6">
                  <Users className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">No goal scorers</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== STAR OF THE MATCH ===== */}
      {starOfMatch && (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-amber-500/[0.04] via-background to-background p-6 md:p-8 mb-6">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -mr-12 -mt-12" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -ml-8 -mb-8" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              </div>
              <h2 className="text-lg font-bold">Star of the Match</h2>
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">
                {played ? "Top Performer" : "Preview"}
              </span>
            </div>

            <Link
              href={`/player/${slugify(starOfMatch.playerName)}`}
              className="flex flex-col sm:flex-row items-center gap-5 group"
            >
              <div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-b from-amber-500/30 to-transparent blur-lg" />
                <PlayerAvatar name={starOfMatch.playerName} photoUrl={starPhoto} size="lg" className="ring-2 ring-amber-500/20 group-hover:ring-amber-500/50 transition-all" />
                <div className="absolute -top-1 -right-1">
                  <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                    <Medal className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left min-w-0">
                <p className="font-bold text-lg group-hover:text-amber-600 transition-colors">{starOfMatch.playerName}</p>
                <div className="flex items-center gap-2 justify-center sm:justify-start text-sm text-muted-foreground">
                  <span>{starOfMatch.teamFlag}</span>
                  <span>{starOfMatch.teamName}</span>
                  <span className="text-muted-foreground/40">·</span>
                  <span>{starOfMatch.position}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <p className="text-3xl font-black text-amber-600 tabular-nums">{starOfMatch.goals}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Goals</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <p className="text-lg font-bold tabular-nums">
                    {starOfMatch.teamScore}
                    <span className="text-muted-foreground mx-1">-</span>
                    {starOfMatch.opponentScore}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {starOfMatch.isWinningTeam ? "Win" : "Draw"}
                  </p>
                </div>
              </div>
            </Link>

            {starOfMatch.minutes.length > 0 && (
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border justify-center sm:justify-start">
                <GoalIcon className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs text-muted-foreground">Goal minutes:</span>
                <div className="flex items-center gap-1.5">
                  {starOfMatch.minutes.map((min, i) => (
                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[10px] font-bold tabular-nums">
                      {min}&apos;
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== YOUTUBE HIGHLIGHTS ===== */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-red-500/[0.03] via-background to-background p-6 md:p-8 mb-6">
        <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Youtube className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-bold">Match Highlights</h3>
              <p className="text-xs text-muted-foreground">FIFA Official Channel</p>
            </div>
          </div>

          {played ? (
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-3">
              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                `fifa world cup 2026 ${t1.name} vs ${t2.name} official highlights`
              )}`} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 hover:bg-zinc-900 transition-colors group z-20">
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-red-500 transition-all shadow-lg">
                  <Youtube className="h-8 w-8 text-white" />
                </div>
                <p className="text-white font-medium mb-1">Watch Highlights on YouTube</p>
                <p className="text-zinc-400 text-xs flex items-center gap-1">Opens in a new tab <ExternalLink className="h-3 w-3" /></p>
              </a>
            </div>
          ) : (
            <div className="w-full aspect-video bg-muted/30 rounded-xl flex flex-col items-center justify-center gap-3">
              <Youtube className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Highlights available after the match</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{match.date}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                `fifa world cup 2026 ${t1.name} vs ${t2.name} official highlights`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-red-500 transition-colors inline-flex items-center gap-1"
            >
              <Youtube className="h-3 w-3" />
              Search on YouTube
            </a>
            <a
              href="https://www.youtube.com/@FIFA"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
            >
              FIFA Official Channel ↗
            </a>
          </div>
        </div>
      </div>


      {/* ===== WATCH ON FIFA+ ===== */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/[0.03] via-background to-background p-6 md:p-8 mb-6">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-lg">🌍</span>
            </div>
            <div>
              <h3 className="font-bold">Watch Free on FIFA+</h3>
              <p className="text-xs text-muted-foreground">Official free streaming platform — no subscription, no ads</p>
            </div>
          </div>
          <a
            href="https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all font-medium text-sm"
          >
            <span>⚽</span>
            <div className="flex flex-col items-start">
              <span>Watch on FIFA+</span>
              <span className="text-[10px] text-muted-foreground font-normal">Free · Official · All matches</span>
            </div>
          </a>
        </div>
      </div>

      {/* ===== MATCH INFO FOOTER ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Stage</p>
          <p className="text-sm font-bold">{match.stage}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Group</p>
          <p className="text-sm font-bold">Group {match.group}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Date</p>
          <p className="text-sm font-bold">{match.date}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Venue</p>
          <p className="text-sm font-bold truncate" title={match.venue}>{match.venue}</p>
        </div>
      </div>
    </div>
  );
}
