export function normalizeQuery(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "");
}

export function getWorldCupSearchQuery(name: string, teamName: string, tab: string): string {
  const cleanName = normalizeQuery(name);
  const cleanTeam = normalizeQuery(teamName);
  return `fifa world cup 2026 ${cleanName} ${cleanTeam} ${tab}`;
}

export function getYouTubeEmbedUrl(name: string, teamName: string, tab: string): string {
  const query = getWorldCupSearchQuery(name, teamName, tab);
  return `https://www.youtube.com/embed?listType=search&q=${encodeURIComponent(query)}&hl=en`;
}

export function getYouTubeSearchUrl(name: string, teamName: string, tab: string): string {
  const query = getWorldCupSearchQuery(name, teamName, tab);
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export function getFIFAYouTubeEmbedUrl(team1: string, team2: string): string {
  const query = `fifa world cup 2026 ${normalizeQuery(team1)} vs ${normalizeQuery(team2)} official highlights`;
  return `https://www.youtube.com/embed?listType=search&q=${encodeURIComponent(query)}&hl=en`;
}

export function getFIFAChannelUrl(): string {
  return "https://www.youtube.com/@FIFA";
}
