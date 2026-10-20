import * as cheerio from "cheerio";
import {
  DBP_STATS,
  HASHTAG_TO_ABBREVIATION,
  getYearForResults,
  seasonLabel,
} from "../consts";

// FantasyPros moved its DvP table behind a paywall, so this now scrapes
// Hashtag Basketball. It's an ASP.NET WebForms page: the default GET returns
// the current season, and other time ranges are fetched by replaying the
// page's postback with its __VIEWSTATE.
const url = "https://hashtagbasketball.com/nba-defense-vs-position";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const DURATION_FIELD = "ctl00$ContentPlaceHolder1$DDDURATION";

// Hashtag's duration dropdown values. "1" is its latest season, "0" the one
// before (season-long only). 7/14/30 are the last N days of the latest
// season, so they're only meaningful while that season is in progress.
// Values map to our range keys (days).
const LATEST_SEASON_DURATION = "1";
const PREV_SEASON_DURATION = "0";
const RECENT_DURATIONS = ["7", "14", "30"];

// Hashtag column order after Position and Team:
// PTS, FG%, FT%, 3PM, REB, AST, STL, BLK, TO
const COLUMN_TO_STAT: Record<number, DBPStat> = {
  2: "pts",
  5: "tpm",
  6: "reb",
  7: "ast",
  8: "stl",
  9: "blk",
  10: "to",
};

// Ranks 1..TIER_SIZE are flagged as tough matchups, the bottom TIER_SIZE as
// soft ones: the top and bottom fifth of the league.
const TIER_SIZE = 6;

export type DBPStat = (typeof DBP_STATS)[number];

export interface StatValue {
  // 1 = tough matchup for the offense, -1 = soft matchup, 0 = neutral
  difficulty: number;
  amt: string;
  // 1 = toughest matchup at this position
  rank?: number;
}

export type DBPTeamData = { team: string } & Record<DBPStat, StatValue>;

export interface DBPData {
  [range: string]: {
    [position: string]: DBPTeamData[];
  };
}

export interface DBPResponse {
  // e.g. "2025-26": the season the data actually comes from
  season: string;
  // The season that was asked for. Differs from `season` when Hashtag hasn't
  // rolled over to it yet and we fell back to its latest season.
  requestedSeason: string;
  data: DBPData;
}

interface SeasonOption {
  value: string;
  endYear: number;
  label: string;
}

function parseSeasonOptions(page: string): SeasonOption[] {
  const $ = cheerio.load(page.substring(
    page.indexOf("<select"),
    page.indexOf("</select>") + 9
  ));

  return $("option")
    .toArray()
    .flatMap((el) => {
      const match = $(el).text().match(/(\d{4})-(\d{2})/);
      if (!match) return [];
      return [{
        value: $(el).attr("value") || "",
        endYear: parseInt(match[1]) + 1,
        label: match[0],
      }];
    });
}

function parseHiddenFields(page: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const $ = cheerio.load(page.substring(0, page.indexOf("<select")));
  $('input[type="hidden"]').each((_, el) => {
    const name = $(el).attr("name");
    if (name) fields[name] = $(el).attr("value") || "";
  });
  return fields;
}

// The table with every team/position row (the other two are top/bottom 5)
function parseTable(page: string): Record<string, DBPTeamData[]> {
  const start = page.indexOf('id="ContentPlaceHolder1_GridView1"');
  if (start === -1) return {};
  const table = page.substring(page.lastIndexOf("<table", start), page.indexOf("</table>", start) + 8);

  const $ = cheerio.load(table);
  const byPosition: Record<string, DBPTeamData[]> = {};

  $("tr").each((_, tr) => {
    const cells = $(tr).children("td");
    if (cells.length < 11) return;

    // Value cells hold "<value> <rank among all 150 rows>"; keep the value
    const value = (idx: number) => cells.eq(idx).text().trim().split(/\s+/)[0];

    const position = value(0);
    const team = HASHTAG_TO_ABBREVIATION[value(1)] || value(1);

    const row = { team } as DBPTeamData;
    Object.entries(COLUMN_TO_STAT).forEach(([idx, stat]) => {
      row[stat] = { difficulty: 0, amt: value(parseInt(idx)) };
    });

    (byPosition[position] ||= []).push(row);
  });

  return byPosition;
}

function rankPosition(rows: DBPTeamData[]): DBPTeamData[] {
  let ranked = rows;

  DBP_STATS.forEach((stat) => {
    // Allowing fewer of a stat is tougher, except turnovers where forcing
    // more is tougher
    const sign = stat === "to" ? -1 : 1;
    ranked = [...ranked]
      .sort((a, b) => sign * (parseFloat(a[stat].amt) - parseFloat(b[stat].amt)))
      .map((e, i) => {
        const rank = i + 1;
        const difficulty =
          rank <= TIER_SIZE ? 1 : rank > ranked.length - TIER_SIZE ? -1 : 0;
        return { ...e, [stat]: { ...e[stat], rank, difficulty } };
      });
  });

  return ranked;
}

async function postback(
  hiddenFields: Record<string, string>,
  duration: string
): Promise<string> {
  const body = new URLSearchParams({
    ...hiddenFields,
    __EVENTTARGET: DURATION_FIELD,
    __EVENTARGUMENT: "",
    [DURATION_FIELD]: duration,
    "ctl00$ContentPlaceHolder1$DropDownList1": "All positions",
    "ctl00$ContentPlaceHolder1$DropDownList2": "All Teams",
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "User-Agent": USER_AGENT,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) throw new Error(`Hashtag postback ${duration} failed: ${res.status}`);
  return res.text();
}

// `year` is the season's end year (2027 = 2026-27). If Hashtag hasn't rolled
// over to that season yet, falls back to the latest season it has.
export async function getDBPFull(year: number): Promise<DBPResponse> {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Hashtag fetch failed: ${res.status}`);
  const page = await res.text();

  const seasons = parseSeasonOptions(page);
  const latest = seasons.find((s) => s.value === LATEST_SEASON_DURATION);
  const prev = seasons.find((s) => s.value === PREV_SEASON_DURATION);
  if (!latest) throw new Error("Couldn't find latest season on Hashtag");

  const hiddenFields = parseHiddenFields(page);
  const pages: Record<string, Promise<string>> = {};
  let season: string;

  if (prev && prev.endYear === year) {
    season = prev.label;
    pages["0"] = postback(hiddenFields, PREV_SEASON_DURATION);
  } else {
    // Either the requested season, or the fallback when it isn't up yet
    season = latest.label;
    // The default GET already is the latest season
    pages["0"] = Promise.resolve(page);

    if (latest.endYear === year && year === getYearForResults()) {
      RECENT_DURATIONS.forEach((duration) => {
        pages[duration] = postback(hiddenFields, duration);
      });
    }
  }

  const data: DBPData = {};
  await Promise.all(
    Object.entries(pages).map(async ([range, pagePromise]) => {
      const byPosition = parseTable(await pagePromise);
      // Recent ranges are empty until games have been played in them
      if (Object.keys(byPosition).length === 0) return;

      data[range] = {};
      Object.entries(byPosition).forEach(([position, rows]) => {
        data[range][position] = rankPosition(rows);
      });
    })
  );

  return { season, requestedSeason: seasonLabel(year), data };
}
