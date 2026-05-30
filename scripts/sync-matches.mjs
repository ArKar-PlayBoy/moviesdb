/**
 * sync-matches.mjs
 *
 * Fetches match results from a live API, writes data/live-results.json.
 * Runs as a GitHub Action cron every 10 minutes during the tournament.
 *
 * When no API is configured, generates deterministic simulated results
 * (same seeded algorithm as worldcup-2026.ts) so the pipeline works end-to-end.
 *
 * Output format (data/live-results.json):
 *   { updatedAt: "ISO", matches: { "A-1": { score1, score2, goalScorers: [...] } } }
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "..", "data", "live-results.json");

// =========================================================================
// Team/player data (from data/teams.json, generated from worldcup-2026.ts)
// =========================================================================

const TEAMS = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "data", "teams.json"), "utf-8"
));

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

// Build 6 matches per group
const FIXTURES = [[0,1],[2,3],[0,2],[1,3],[0,3],[1,2]];
const DAYS = ["Jun 11","Jun 12","Jun 14","Jun 15","Jun 17","Jun 18"];

const MATCH_LIST = [];
for (const g of GROUPS) {
  const t = TEAMS.filter(t => t.group === g);
  for (let f = 0; f < FIXTURES.length; f++) {
    MATCH_LIST.push({
      id: `${g}-${f + 1}`,
      group: g,
      team1: t[FIXTURES[f][0]].id,
      team2: t[FIXTURES[f][1]].id,
      date: DAYS[f],
    });
  }
}

// =========================================================================
// Seeded PRNG (same algorithm as worldcup-2026.ts)
// =========================================================================
const RANDOM_SEED = {};

function seededRandom(key) {
  if (!RANDOM_SEED[key]) RANDOM_SEED[key] = key.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const x = Math.sin(RANDOM_SEED[key]++ * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function isPast(dateStr) {
  return new Date(`2026 ${dateStr}`) <= new Date();
}

// =========================================================================
// Simulation (same logic as worldcup-2026.ts getMatchScore + getMatchGoalScorers)
// =========================================================================
function simulateScore(matchId, team1Id, team2Id) {
  const t1 = TEAMS.find(t => t.id === team1Id);
  const t2 = TEAMS.find(t => t.id === team2Id);
  if (!t1 || !t2) return [0, 0];
  const s1 = seededRandom(`${matchId}-score-1`);
  const s2 = seededRandom(`${matchId}-score-2`);
  const strength1 = 1 / t1.fifaRanking;
  const strength2 = 1 / t2.fifaRanking;
  const total = strength1 + strength2;
  return [
    Math.round((strength1 / total) * (2 + s1 * 3)),
    Math.round((strength2 / total) * (2 + s2 * 3)),
  ];
}

function simulateGoalScorers(matchId, team1Id, team2Id, score1, score2) {
  const t1 = TEAMS.find(t => t.id === team1Id);
  const t2 = TEAMS.find(t => t.id === team2Id);
  if (!t1 || !t2) return [];

  const weights = [0.60, 0.30, 0.08, 0.02]; // FW, MF, DF, GK

  function distribute(players, goals, seed) {
    if (goals === 0 || !players.length) return [];
    const result = [];
    for (let g = 0; g < goals; g++) {
      const r = seededRandom(`${seed}-${g}`);
      let cum = 0;
      for (let i = 0; i < players.length; i++) {
        cum += weights[Math.min(i, 3)]; // simple distribution by index order
        if (r < cum) {
          const minute = Math.round(10 + seededRandom(`${seed}-${g}-min`) * 75);
          result.push({ playerName: players[i], teamId: team1Id === t1.id ? team1Id : team2Id, minute });
          break;
        }
      }
    }
    return result;
  }

  const s1 = distribute(t1.players, score1, `${matchId}-t1`);
  const s2 = distribute(t2.players, score2, `${matchId}-t2`);
  return [...s1, ...s2];
}

// =========================================================================
// Generate full simulation for all matches
// =========================================================================
function generateSimulatedResults() {
  const matches = {};
  for (const m of MATCH_LIST) {
    if (!isPast(m.date)) continue;
    const [score1, score2] = simulateScore(m.id, m.team1, m.team2);
    const goalScorers = simulateGoalScorers(m.id, m.team1, m.team2, score1, score2);
    matches[m.id] = { score1, score2, goalScorers };
  }
  return matches;
}

// =========================================================================
// External API fetching
// =========================================================================
async function fetchMatches() {
  const apiKey = process.env.SPORTSRC_KEY;

  if (!apiKey) {
    console.log("No SPORTSRC_KEY set — using deterministic simulation.");
    return null;
  }

  const today = new Date().toISOString().split("T")[0];
  const url = `https://api.sportsrc.org/v2/?type=matches&sport=football&status=finished&date=${today}&api_key=${apiKey}`;

  console.log(`Fetching SportSRC: ${url.replace(apiKey, "***")}`);

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`SportSRC returned ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

function normalise(raw) {
  const matches = {};

  // SportSRC format: { data: [ { id, homeTeam: { name }, awayTeam: { name }, homeScore: { current }, awayScore: { current }, ... } ] }
  for (const m of (raw?.data || raw?.matches || raw?.response || [])) {
    const id = String(m.id || m.match_id || "");
    if (!id) continue;

    const homeScore = m.homeScore?.current ?? m.home_score;
    const awayScore = m.awayScore?.current ?? m.away_score;
    const team1Id = m.homeTeam?.name ? m.homeTeam.name.toLowerCase().replace(/\s+/g, "-") : "";
    const team2Id = m.awayTeam?.name ? m.awayTeam.name.toLowerCase().replace(/\s+/g, "-") : "";

    if (homeScore === null || homeScore === undefined || awayScore === null || awayScore === undefined) {
      continue;
    }

    // Map SportSRC match IDs to our internal IDs using team names
    // e.g. "mexico-vs-south-africa" → look up the match in our schedule
    const goalScorers = [];
    const rawGoals = m.goals || m.scorers || m.events || [];
    for (const g of rawGoals) {
      const name = g.scorer || g.playerName || g.player || g.name;
      const teamId = g.teamId || g.team || g.team_id || "";
      const minute = g.minute || g.min || g.time;
      if (name && minute !== undefined) {
        goalScorers.push({
          playerName: name,
          teamId: typeof teamId === "string" ? teamId.toLowerCase().replace(/\s+/g, "-") : String(teamId),
          minute: typeof minute === "string" ? parseInt(minute, 10) : minute,
        });
      }
    }

    // Store original SportSRC team names for matching against our schedule
    matches[id] = {
      score1: homeScore,
      score2: awayScore,
      goalScorers,
      team1Id,
      team2Id,
      _team1Name: m.homeTeam?.name || "",
      _team2Name: m.awayTeam?.name || "",
    };
  }

  return matches;
}

// =========================================================================
// Match ID mapping: SportSRC uses different IDs than our A-1, A-2 format.
// We map by matching team names.
// =========================================================================
function buildTeamNameMap() {
  // Our internal team IDs → display names (used by SportSRC API)
  const nameOverrides = {
    "czech-republic": "Czech Republic",
    "south-africa": "South Africa",
    "south-korea": "South Korea",
    "ivory-coast": "Ivory Coast",
    "new-zealand": "New Zealand",
    "saudi-arabia": "Saudi Arabia",
    "cape-verde": "Cape Verde",
    "dr-congo": "DR Congo",
  };
  const map = {};
  for (const t of TEAMS) {
    const display = nameOverrides[t.id] || t.id.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    map[display.toLowerCase()] = t.id;
  }
  return map;
}

function merge(existing, incoming) {
  const merged = { ...existing };
  const teamNameMap = buildTeamNameMap();

  for (const [, result] of Object.entries(incoming)) {
    // Map SportSRC team names to our internal team IDs
    const team1Id = result.team1Id || (teamNameMap[Object.keys(teamNameMap).find(k => result._team1Name?.toLowerCase().includes(k))] || "");
    const team2Id = result.team2Id || (teamNameMap[Object.keys(teamNameMap).find(k => result._team2Name?.toLowerCase().includes(k))] || "");

    // Find the matching match in our schedule
    const match = MATCH_LIST.find(m =>
      (m.team1 === team1Id && m.team2 === team2Id) ||
      (m.team1 === team2Id && m.team2 === team1Id)
    );

    if (match) {
      merged[match.id] = { score1: result.score1, score2: result.score2, goalScorers: result.goalScorers || [] };
    }
  }
  return merged;
}

// =========================================================================
// Main
// =========================================================================
async function main() {
  let existing = {};
  try {
    existing = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")).matches || {};
  } catch { /* first run */ }

  const raw = await fetchMatches();

  let matches;
  if (raw) {
    console.log("Using external SportSRC API data.");
    matches = merge(existing, normalise(raw));
  } else {
    console.log("Generating simulated match results.");
    matches = merge(existing, generateSimulatedResults());
  }

  const output = {
    updatedAt: new Date().toISOString(),
    matches,
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(output, null, 2));
  console.log(`Wrote ${Object.keys(matches).length} match results to data/live-results.json`);
}

main().catch((err) => {
  console.error("sync-matches failed:", err);
  process.exit(1);
});
