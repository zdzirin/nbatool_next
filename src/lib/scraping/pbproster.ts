import * as cheerio from "cheerio";
import { seasonLabel } from "../consts";

const LINK_ATTRIBUTES = ["player", "team_id", "team_name_abbr", "name_display"];

const PLAYER_DATA = [
  "player",
  "name_display",
  "pos",
  "team_id",
  "team_name_abbr",
  "g",
  "games",
  "mp",
  "pct_1",
  "pct_2",
  "pct_3",
  "pct_4",
  "pct_5",
  "plus_minus_on",
  "plus_minus_net",
];

export interface PBPPlayer {
  player: string;
  team_id: string;
  pos?: string;
  g?: string;
  mp?: string;
  pct_1?: string;
  pct_2?: string;
  pct_3?: string;
  pct_4?: string;
  pct_5?: string;
  plus_minus_on?: string;
  plus_minus_net?: string;
  player_link?: string;
}

export interface PBPResponse {
  // e.g. "2025-26": the season the data actually comes from
  season: string;
  // The season that was asked for. Differs from `season` when
  // basketball-reference has no rows for it yet and we fell back a season.
  requestedSeason: string;
  data: PBPPlayer[];
}

interface CheerioElement {
  attribs?: Record<string, string>;
  children?: CheerioElement[];
  data?: string;
  name?: string;
}

const addAttributeData = (
  player: Record<string, string>,
  attr: string,
  el: CheerioElement
) => {
  if (PLAYER_DATA.includes(attr)) {
    if (LINK_ATTRIBUTES.includes(attr)) {
      const LINK_ATTR_MAP: Record<string, string> = {
        player: "player",
        name_display: "player",
        team_name_abbr: "team_id",
        team_id: "team_id",
      };

      const firstChild = el.children?.[0];

      if (firstChild?.data === "2TM") {
        player[LINK_ATTR_MAP[attr]] = firstChild.data;
        return;
      }

      const nestedChild = firstChild?.children?.[0];
      if (nestedChild?.data) {
        player[LINK_ATTR_MAP[attr]] = nestedChild.data;
      }

      if (attr === "player" || attr === "name_display") {
        const linkAttribs = firstChild?.attribs;
        if (linkAttribs?.href) {
          player["player_link"] = linkAttribs.href;
        }
      }

      return;
    }

    if (["pct_1", "pct_2", "pct_3", "pct_4", "pct_5"].includes(attr)) {
      const firstChild = el.children?.[0];
      player[attr] = firstChild?.data || "0%";
      return;
    }

    if (attr === "plus_minus_on" || attr === "plus_minus_net") {
      const firstChild = el.children?.[0];
      player[attr] = firstChild?.data || "--";
      return;
    }

    if (attr === "mp") {
      const firstChild = el.children?.[0];

      if (firstChild?.name === "strong") {
        const strongChild = firstChild.children?.[0];
        player[attr] = strongChild?.data || "";
      } else {
        player[attr] = firstChild?.data || "";
      }
      return;
    }

    if (attr === "games") {
      const firstChild = el.children?.[0];
      player.g = firstChild?.data || "";
      return;
    }

    const firstChild = el.children?.[0];
    if (firstChild?.data) {
      player[attr] = firstChild.data;
    }
  }
};

const parseRow = (el: CheerioElement): PBPPlayer | null => {
  const player: Record<string, string> = {};

  el.children?.forEach((child) => {
    if (!child.attribs) return;

    const attr = child.attribs["data-stat"];
    if (attr) {
      addAttributeData(player, attr, child);
    }
  });

  return player.team_id !== "2TM" ? (player as unknown as PBPPlayer) : null;
};

async function scrapeSeason(year: number): Promise<PBPPlayer[]> {
  const url = `https://www.basketball-reference.com/leagues/NBA_${year}_play-by-play.html`;
  const players: PBPPlayer[] = [];

  const res = await fetch(url);
  if (!res.ok) throw new Error(`basketball-reference ${year} fetch failed: ${res.status}`);
  const data = await res.text();

  const start = data.indexOf("<table");
  if (start === -1) return players;
  const end = data.indexOf("</table>", start) + 8;
  const table = data.substring(start, end);

  const $ = cheerio.load(table);
  $("tbody tr").each((i, el) => {
    const player = parseRow(el as unknown as CheerioElement);
    if (player) {
      players.push(player);
    }
  });

  return players;
}

// `year` is the season's end year (2027 = 2026-27). basketball-reference
// publishes the page before opening night with no player rows, so an empty
// season falls back to the one before it.
export async function getLeaguePBPRoster(year: number): Promise<PBPResponse> {
  const requestedSeason = seasonLabel(year);

  const players = await scrapeSeason(year);
  if (players.length > 0) {
    return { season: requestedSeason, requestedSeason, data: players };
  }

  return {
    season: seasonLabel(year - 1),
    requestedSeason,
    data: await scrapeSeason(year - 1),
  };
}
