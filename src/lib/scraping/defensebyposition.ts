import * as cheerio from "cheerio";
import { TEAM_TO_ABBREVIATION, DBP_INDEX_TO_STAT } from "../consts";

const url =
  "https://www.fantasypros.com/daily-fantasy/nba/fanduel-defense-vs-position.php";

export interface StatValue {
  difficulty: number;
  amt: string;
  rank?: number;
}

export interface DBPTeamData {
  team: string;
  pts: StatValue;
  reb: StatValue;
  ast: StatValue;
  tpm: StatValue;
  stl: StatValue;
  blk: StatValue;
  to: StatValue;
}

export interface DBPData {
  [range: string]: {
    [position: string]: DBPTeamData[];
  };
}

interface CheerioElement {
  attribs?: Record<string, string>;
  children?: CheerioElement[];
  data?: string;
  name?: string;
}

function findRankings(dbpData: DBPData): void {
  const ranges = Object.keys(dbpData);
  if (ranges.length === 0) return;

  const positions = Object.keys(dbpData[ranges[0]]);
  if (positions.length === 0) return;

  const firstTeamData = dbpData[ranges[0]][positions[0]][0];
  if (!firstTeamData) return;

  const statsObj = { ...firstTeamData };
  delete (statsObj as Record<string, unknown>).team;
  const stats = Object.keys(statsObj) as (keyof Omit<DBPTeamData, "team">)[];

  ranges.forEach((range) => {
    positions.forEach((position) => {
      let row = [...dbpData[range][position]];

      stats.forEach((stat) => {
        row = row
          .sort((a, b) => {
            return parseFloat(a[stat].amt) - parseFloat(b[stat].amt);
          })
          .map((e, i) => ({
            ...e,
            [stat]: { ...e[stat], rank: i + 1 },
          }));
      });

      dbpData[range][position] = row;
    });
  });
}

export async function getDBPFull(year: number): Promise<DBPData> {
  const res = await fetch(`${url}?year=${year - 1}`);
  const data = await res.text();

  const start = data.indexOf("<table");
  const end = data.indexOf("</table>") + 8;
  const table = data.substring(start, end);

  const $ = cheerio.load(table);

  const dbpData: DBPData = {};

  $("table tbody tr").each((i, e) => {
    const el = e as unknown as CheerioElement;
    const classes = el.attribs?.class?.split(" ") || [];
    const position = classes[1];
    const range = classes[0]?.split("-")[1];

    if (!range || !position) return;

    if (!dbpData[range]) {
      dbpData[range] = {};
      dbpData[range][position] = [];
    } else if (!dbpData[range][position]) {
      dbpData[range][position] = [];
    }

    const row: Record<string, unknown> = {};
    const children = el.children || [];

    children.forEach((child, idx) => {
      const childEl = child as CheerioElement;

      if (idx === 0) {
        const teamNameEl = childEl.children?.[1] as CheerioElement;
        const teamName = teamNameEl?.data;
        if (teamName) {
          row.team = TEAM_TO_ABBREVIATION[teamName];
        }
      } else if (idx > 1 && idx < 9) {
        const elClass = childEl.attribs?.class?.split(" ") || [];
        const difficulty = elClass.length > 1 ? (elClass[1] === "hard" ? 1 : -1) : 0;
        const amtEl = childEl.children?.[0] as CheerioElement;
        const amtTextEl = amtEl?.children?.[0] as CheerioElement;
        const amt = amtTextEl?.data || "";
        row[DBP_INDEX_TO_STAT[idx - 1]] = { difficulty, amt };
      }
    });

    if (row.team) {
      dbpData[range][position].push(row as unknown as DBPTeamData);
    }
  });

  findRankings(dbpData);
  return dbpData;
}
