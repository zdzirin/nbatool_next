import { ESPN_TO_ABBREVIATION } from "./consts";

// ESPN's public scoreboard JSON. Undocumented but keyless; everything ESPN
// specific stays in this file so the source can be swapped in one place.
// With no `dates` param it returns ESPN's current US game day.
const url =
  "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";

export interface ScheduledGame {
  id: string;
  // Our abbreviations, e.g. "GSW"
  away: string;
  home: string;
  // ISO timestamp of tipoff
  tipoff: string;
  state: "pre" | "in" | "post";
  // ESPN's short status, e.g. "2:12 - 3rd" or "Final"
  detail: string;
  awayScore: string;
  homeScore: string;
}

interface ESPNCompetitor {
  homeAway: "home" | "away";
  score?: string;
  team: { abbreviation: string };
}

interface ESPNEvent {
  id: string;
  date: string;
  status: {
    type: { state: ScheduledGame["state"]; shortDetail: string };
  };
  competitions: { competitors: ESPNCompetitor[] }[];
}

const toAbbreviation = (espnAbbr: string) =>
  ESPN_TO_ABBREVIATION[espnAbbr] || espnAbbr;

export async function getTodaysGames(): Promise<ScheduledGame[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ESPN scoreboard fetch failed: ${res.status}`);
  const { events = [] }: { events?: ESPNEvent[] } = await res.json();

  return events.flatMap((event) => {
    const competitors = event.competitions[0]?.competitors ?? [];
    const away = competitors.find((c) => c.homeAway === "away");
    const home = competitors.find((c) => c.homeAway === "home");
    if (!away || !home) return [];

    return {
      id: event.id,
      away: toAbbreviation(away.team.abbreviation),
      home: toAbbreviation(home.team.abbreviation),
      tipoff: event.date,
      state: event.status.type.state,
      detail: event.status.type.shortDetail,
      awayScore: away.score ?? "",
      homeScore: home.score ?? "",
    };
  });
}
