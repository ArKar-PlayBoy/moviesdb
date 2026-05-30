export type OutfieldAttributes = Record<"pace" | "shooting" | "passing" | "dribbling" | "defending" | "physical", number>;
export type GkAttributes = Record<"diving" | "handling" | "kicking" | "reflexes" | "speed" | "positioning", number>;
export type Attributes = OutfieldAttributes | GkAttributes;

const OF_KEYS: (keyof OutfieldAttributes)[] = ["pace", "shooting", "passing", "dribbling", "defending", "physical"];
const GK_KEYS: (keyof GkAttributes)[] = ["diving", "handling", "kicking", "reflexes", "speed", "positioning"];

const FC25_API = "https://api.msmc.cc/api/fc25/player/name";
const attrCache = new Map<string, Attributes | null>();

interface FC25Response {
  PAC?: string | number;
  SHO?: string | number;
  PAS?: string | number;
  DRI?: string | number;
  DEF?: string | number;
  PHY?: string | number;
}

async function fetchRealAttributes(name: string): Promise<OutfieldAttributes | null> {
  try {
    const res = await fetch(`${FC25_API}/${encodeURIComponent(name)}`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data: FC25Response = await res.json();
    if (!data.PAC) return null;
    return {
      pace: Number(data.PAC),
      shooting: Number(data.SHO),
      passing: Number(data.PAS),
      dribbling: Number(data.DRI),
      defending: Number(data.DEF),
      physical: Number(data.PHY),
    };
  } catch {
    return null;
  }
}

function hashSeed(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function variance(seed: number, min: number, max: number): number {
  return min + (seed % (max - min + 1));
}

function teamRankingFactor(ranking: number): number {
  if (ranking <= 5) return 1.12;
  if (ranking <= 15) return 1.06;
  if (ranking <= 30) return 1.02;
  if (ranking <= 50) return 0.97;
  return 0.92;
}

function ageFactor(age: number): number {
  const peak = 27;
  const diff = Math.abs(age - peak);
  if (diff <= 2) return 1.0;
  if (diff <= 5) return 0.97;
  if (diff <= 8) return 0.93;
  if (diff <= 12) return 0.88;
  return 0.82;
}

const CONFED_FACTOR: Record<string, number> = {
  UEFA: 1.04,
  CONMEBOL: 1.02,
  AFC: 0.96,
  CAF: 0.94,
  CONCACAF: 0.97,
  OFC: 0.90,
};

function confederationFactor(confederation: string): number {
  return CONFED_FACTOR[confederation] ?? 0.96;
}

function overallMultiplier(fifaRanking: number, age: number, confederation: string): number {
  return (teamRankingFactor(fifaRanking) + ageFactor(age) + confederationFactor(confederation)) / 3;
}

function generateOutfieldAttributes(name: string, position: string, age: number, fifaRanking: number, confederation: string): OutfieldAttributes {
  const base = outfieldPositionBase(position);
  const mult = overallMultiplier(fifaRanking, age, confederation);

  const result = {} as OutfieldAttributes;
  for (const key of OF_KEYS) {
    const vSeed = hashSeed(name + key);
    const spread = key === "defending" || key === "shooting" ? 12 : 10;
    const raw = base[key] * mult + variance(vSeed, -spread, spread);
    result[key] = Math.max(25, Math.min(99, Math.round(raw)));
  }
  return result;
}

function outfieldPositionBase(position: string): OutfieldAttributes {
  switch (position) {
    case "FW":
      return { pace: 88, shooting: 85, passing: 72, dribbling: 82, defending: 32, physical: 68 };
    case "MF":
      return { pace: 74, shooting: 68, passing: 86, dribbling: 78, defending: 58, physical: 74 };
    case "DF":
      return { pace: 70, shooting: 42, passing: 66, dribbling: 60, defending: 86, physical: 80 };
    default:
      return { pace: 70, shooting: 60, passing: 70, dribbling: 65, defending: 60, physical: 70 };
  }
}

function generateGkAttributes(name: string, age: number, fifaRanking: number, confederation: string): GkAttributes {
  const base: GkAttributes = { diving: 82, handling: 78, kicking: 70, reflexes: 85, speed: 55, positioning: 80 };
  const mult = overallMultiplier(fifaRanking, age, confederation);

  const result = {} as GkAttributes;
  for (const key of GK_KEYS) {
    const vSeed = hashSeed(name + "gk_" + key);
    const spread = 10;
    const raw = base[key] * mult + variance(vSeed, -spread, spread);
    result[key] = Math.max(25, Math.min(99, Math.round(raw)));
  }
  return result;
}

export async function getPlayerAttributes(name: string, position: string, age: number, fifaRanking: number, confederation: string): Promise<Attributes> {
  if (position === "GK") {
    return generateGkAttributes(name, age, fifaRanking, confederation);
  }

  const cacheKey = name;
  if (attrCache.has(cacheKey)) {
    return attrCache.get(cacheKey) ?? generateOutfieldAttributes(name, position, age, fifaRanking, confederation);
  }

  const real = await fetchRealAttributes(name);
  if (real) {
    attrCache.set(cacheKey, real);
    return real;
  }

  const generated = generateOutfieldAttributes(name, position, age, fifaRanking, confederation);
  attrCache.set(cacheKey, generated);
  return generated;
}

export function isGkAttributes(attrs: Attributes, position: string): attrs is GkAttributes {
  return position === "GK";
}

export const OF_ATTR_LABELS: Record<string, string> = {
  pace: "PAC", shooting: "SHO", passing: "PAS", dribbling: "DRI", defending: "DEF", physical: "PHY",
};

export const OF_ATTR_COLORS: Record<string, string> = {
  pace: "bg-rose-500", shooting: "bg-orange-500", passing: "bg-blue-500",
  dribbling: "bg-purple-500", defending: "bg-emerald-500", physical: "bg-amber-500",
};

export const GK_ATTR_LABELS: Record<string, string> = {
  diving: "DIV", handling: "HAN", kicking: "KIC", reflexes: "REF", speed: "SPD", positioning: "POS",
};

export const GK_ATTR_COLORS: Record<string, string> = {
  diving: "bg-blue-500", handling: "bg-amber-500", kicking: "bg-orange-500",
  reflexes: "bg-purple-500", speed: "bg-rose-500", positioning: "bg-emerald-500",
};
