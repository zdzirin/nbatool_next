import * as cheerio from "cheerio";
import { getYearForResults } from "../consts";

// Stats to exclude from the gamelog display
const EXCLUDED_STATS = [
    "ranker",
    "player_game_num_career",
    "team_game_num_season",
];

// Custom column order - pts moved right after mp
const PREFERRED_COLUMN_ORDER = [
    "date",
    "team_name_abbr",
    "game_location",
    "opp_name_abbr",
    "game_result",
    "mp",
    "pts", // Points moved to be first stat after MP
    "fg",
    "fga",
    "fg_pct",
    "fg3",
    "fg3a",
    "fg3_pct",
    "fg2",
    "fg2a",
    "fg2_pct",
    "efg_pct",
    "ft",
    "fta",
    "ft_pct",
    "orb",
    "drb",
    "trb",
    "ast",
    "stl",
    "blk",
    "tov",
    "pf",
    "game_score",
    "plus_minus",
];

export interface GameLogEntry {
    [key: string]: string | undefined;
}

export interface GameLogResponse {
    statOrder: string[];
    gameLog: GameLogEntry[];
}

interface CheerioElement {
    attribs?: Record<string, string>;
    children?: CheerioElement[];
    data?: string;
    name?: string;
}

function getTextContent(el: CheerioElement): string | undefined {
    // Direct text content
    if (el.data) {
        const trimmed = el.data.trim();
        if (trimmed) return trimmed;
    }

    // Check children for text (handles <a> tags wrapping text)
    if (el.children && el.children.length > 0) {
        for (const child of el.children) {
            const text = getTextContent(child);
            if (text) return text;
        }
    }

    return undefined;
}

export async function getGameLogByPlayer(
    player: string,
): Promise<GameLogResponse> {
    const year = getYearForResults();
    // Player ID format: first letter of last name + player ID
    const firstLetter = player.charAt(0);
    const url = `https://www.basketball-reference.com/players/${firstLetter}/${player}/gamelog/${year}`;

    console.log("gamelog url:", url);

    const res = await fetch(url);
    const data = await res.text();

    const start = data.indexOf('<table class="stats_table');
    if (start === -1) {
        console.log("No stats table found");
        return { statOrder: [], gameLog: [] };
    }

    const end = data.indexOf("</table>", start) + 8;
    const table = data.substring(start, end);

    const $ = cheerio.load(table);

    const gameLog: GameLogEntry[] = [];
    const foundStats = new Set<string>();

    $("tbody tr").each((_j, e) => {
        const game: GameLogEntry = {};
        const el = e as unknown as CheerioElement;
        const children = el.children || [];

        // Skip separator rows (they have class "thead" or no data-stat attributes)
        const $row = $(e);
        if ($row.hasClass("thead") || $row.hasClass("partial_table")) {
            return;
        }

        children.forEach((child) => {
            const childEl = child as CheerioElement;

            // Handle both th and td elements (first column is now th)
            if (
                (childEl.name !== "th" && childEl.name !== "td") ||
                !childEl.children ||
                childEl.children.length < 1
            ) {
                return;
            }

            const stat = childEl.attribs?.["data-stat"];
            if (!stat || EXCLUDED_STATS.includes(stat)) return;

            const text = getTextContent(childEl);
            if (text) {
                game[stat] = text;
                foundStats.add(stat);
            }
        });

        if (Object.keys(game).length > 0) {
            gameLog.push(game);
        }
    });

    // Build stat order based on preferred order, only including stats we found
    const statOrder = PREFERRED_COLUMN_ORDER.filter((stat) =>
        foundStats.has(stat),
    );

    // Add any found stats not in preferred order at the end
    foundStats.forEach((stat) => {
        if (!statOrder.includes(stat)) {
            statOrder.push(stat);
        }
    });

    return { statOrder, gameLog };
}
