export type Attributes = Record<"pace" | "shooting" | "passing" | "dribbling" | "defending" | "physical", number>;

const ATTR_KEYS: (keyof Attributes)[] = ["pace", "shooting", "passing", "dribbling", "defending", "physical"];

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

async function fetchRealAttributes(name: string): Promise<Attributes | null> {
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

function positionBase(position: string): Attributes {
  switch (position) {
    case "FW":
      return { pace: 88, shooting: 85, passing: 72, dribbling: 82, defending: 32, physical: 68 };
    case "MF":
      return { pace: 74, shooting: 68, passing: 86, dribbling: 78, defending: 58, physical: 74 };
    case "DF":
      return { pace: 70, shooting: 42, passing: 66, dribbling: 60, defending: 86, physical: 80 };
    case "GK":
      return { pace: 42, shooting: 28, passing: 54, dribbling: 38, defending: 76, physical: 78 };
    default:
      return { pace: 70, shooting: 60, passing: 70, dribbling: 65, defending: 60, physical: 70 };
  }
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

function generateAttributes(name: string, position: string, age: number, fifaRanking: number, confederation: string): Attributes {
  const seed = hashSeed(name);
  const base = positionBase(position);
  const rankMult = teamRankingFactor(fifaRanking);
  const ageMult = ageFactor(age);
  const confMult = confederationFactor(confederation);
  const overallMult = (rankMult + ageMult + confMult) / 3;

  const result = {} as Attributes;
  for (const key of ATTR_KEYS) {
    const vSeed = hashSeed(name + key);
    const spread = key === "defending" || key === "shooting" ? 12 : 10;
    const varMin = -spread;
    const varMax = spread;
    const raw = base[key] * overallMult + variance(vSeed, varMin, varMax);
    result[key] = Math.max(25, Math.min(99, Math.round(raw)));
  }

  return result;
}

export async function getPlayerAttributes(name: string, position: string, age: number, fifaRanking: number, confederation: string): Promise<Attributes> {
  const cacheKey = name;
  if (attrCache.has(cacheKey)) {
    return attrCache.get(cacheKey) ?? generateAttributes(name, position, age, fifaRanking, confederation);
  }

  const real = await fetchRealAttributes(name);
  if (real) {
    attrCache.set(cacheKey, real);
    return real;
  }

  const generated = generateAttributes(name, position, age, fifaRanking, confederation);
  attrCache.set(cacheKey, generated);
  return generated;
}

export const ATTR_LABELS: Record<string, string> = {
  pace: "PAC", shooting: "SHO", passing: "PAS", dribbling: "DRI", defending: "DEF", physical: "PHY",
};

export const ATTR_COLORS: Record<string, string> = {
  pace: "bg-rose-500", shooting: "bg-orange-500", passing: "bg-blue-500",
  dribbling: "bg-purple-500", defending: "bg-emerald-500", physical: "bg-amber-500",
};
