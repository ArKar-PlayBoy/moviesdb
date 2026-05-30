/**
 * One-time export: extracts team data from worldcup-2026.ts into data/teams.json
 * Used by sync-matches.mjs for deterministic simulation fallback.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(__dirname, "..", "data", "worldcup-2026.ts"), "utf-8");

// Extract PLAYERS_BY_TEAM
const pbStart = src.indexOf("const PLAYERS_BY_TEAM");
const pbEnd = src.indexOf(";\n\nconst TEAMS", pbStart);
const playersSection = src.slice(pbStart, pbEnd);

// Parse team players
const teamPlayers = {};
const teamRegex = /  ([\w-]+|"[\w-]+"): \[([\s\S]*?)\],/g;
let m;
while ((m = teamRegex.exec(playersSection)) !== null) {
  const id = m[1].replace(/"/g, "");
  const names = [...m[2].matchAll(/name: "([^"]+)"/g)].map(x => x[1]);
  if (names.length > 0) teamPlayers[id] = names;
}

// Extract TEAMS array
const tStart = src.indexOf("const TEAMS: TeamData[] = [");
const tEnd = src.indexOf("];", tStart) + 2;
const teamsSection = src.slice(tStart, tEnd);

const teams = [];
const tRegex = /id: "([\w-]+)".*?fifaRanking: ([\d]+).*?group: "([A-L])"/g;
while ((m = tRegex.exec(teamsSection)) !== null) {
  const id = m[1];
  teams.push({
    id,
    fifaRanking: parseInt(m[2]),
    group: m[3],
    players: teamPlayers[id] || [],
  });
}

fs.writeFileSync(
  path.join(__dirname, "..", "data", "teams.json"),
  JSON.stringify(teams, null, 2),
);
console.log(`Exported ${teams.length} teams to data/teams.json`);
