"use client";

import { useEffect, useState } from "react";
import { useGamelogData } from "@/context/GamelogContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { colors } from "@/lib/consts";
import type { GameLogEntry } from "@/lib/scraping/gamelogs";

const EXCLUDED_HOME_AWAY_COLUMNS = [
    "team_name_abbr",
    "game_location",
    "opp_name_abbr",
    "game_result",
    "mp",
];

const COLUMN_TO_LABEL: Record<string, string> = {
    date: "Date",
    team_name_abbr: "Team",
    game_location: "",
    opp_name_abbr: "Vs.",
    game_result: "Result",
    mp: "MP",
    pts: "PTS",
    fg: "FG",
    fga: "FGA",
    fg_pct: "FG%",
    fg3: "3PM",
    fg3a: "3PA",
    fg3_pct: "3P%",
    fg2: "2PM",
    fg2a: "2PA",
    fg2_pct: "2P%",
    efg_pct: "eFG%",
    ft: "FT",
    fta: "FTA",
    ft_pct: "FT%",
    orb: "OR",
    drb: "DR",
    trb: "TR",
    ast: "AST",
    stl: "STL",
    blk: "BLK",
    tov: "TO",
    pf: "PF",
    game_score: "GmSc",
    plus_minus: "+/-",
};

const PropMap: Record<string, string | string[]> = {
    Points: "pts",
    Rebounds: "trb",
    Assists: "ast",
    Threes: "fg3",
    PRA: ["pts", "trb", "ast"],
    PA: ["pts", "ast"],
    PR: ["pts", "trb"],
    RA: ["trb", "ast"],
    Steals: "stl",
    Blocks: "blk",
    Turnovers: "tov",
};

const PROP_SELECT_DATA = Object.keys(PropMap).map((key) => ({
    name: key,
    value: key,
}));

interface GamelogProps {
    name: string;
    id: string;
    closeModal: () => void;
}

interface PropInfo {
    games?: number;
    gamesHit?: number;
    gamesHitList?: number[];
}

export function Gamelog({ name, id, closeModal }: GamelogProps) {
    const {
        getPlayerGamelog,
        addPlayerGamelog,
        GamelogColumns,
        setGamelogColumns,
    } = useGamelogData();

    const [gameLogInfo, setGamelogInfo] = useState<GameLogEntry[]>([]);
    const [homeAwaySplits, setHomeAwaySplits] = useState<{
        home?: Record<string, number | string>;
        away?: Record<string, number | string>;
    }>({});

    const [selectedProp, setSelectedProp] = useState<string>("");
    const [overUnder, setOverUnder] = useState<string>("O");
    const [checkValue, setCheckValue] = useState<string>("1.5");
    const [propInfo, setPropInfo] = useState<PropInfo>({});
    const [trendInfo, setTrendInfo] = useState<Record<string, number>>({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setPropInfo({});
        setTrendInfo({});
    }, [selectedProp, overUnder, checkValue]);

    useEffect(() => {
        getHomeAwaySplits(gameLogInfo);
    }, [gameLogInfo]);

    const getHomeAwaySplits = (gamelog: GameLogEntry[]) => {
        const homeGames = gamelog.filter((game) => !game.game_location);
        const awayGames = gamelog.filter((game) => game.game_location);

        const calculateAverages = (games: GameLogEntry[]) => {
            const result: Record<string, number | string> = {};
            Object.keys(COLUMN_TO_LABEL).forEach((key) => {
                result[key] = 0;
            });

            games.forEach((game) => {
                Object.keys(result).forEach((key) => {
                    const value = Number(game[key]);
                    if (!isNaN(value)) {
                        result[key] = (result[key] as number) + value;
                    }
                });
            });

            if (games.length > 0) {
                Object.keys(result).forEach((key) => {
                    if (typeof result[key] === "number") {
                        result[key] = (result[key] as number) / games.length;
                    }
                });
            }

            return result;
        };

        setHomeAwaySplits({
            home: { ...calculateAverages(homeGames), date: "HOME" },
            away: { ...calculateAverages(awayGames), date: "AWAY" },
        });
    };

    const clearValues = () => {
        setSelectedProp("");
        setCheckValue("");
        setPropInfo({});
        setTrendInfo({});
    };

    const checkProp = () => {
        const checkNum = parseFloat(checkValue);
        if (!selectedProp || !checkValue || !overUnder || isNaN(checkNum)) {
            alert("Please enter valid values");
            setPropInfo({});
            return;
        }

        let games = 0;
        let gamesHit = 0;
        const gamesHitList: number[] = [];
        const trendInfoObj: Record<string, number> = {};

        let prop = PropMap[selectedProp];
        if (!Array.isArray(prop)) {
            prop = [prop];
        }

        gameLogInfo.forEach((game, i) => {
            // Skip games where player didn't play (no minutes)
            if (!game.mp || game.mp === "0:00") {
                return;
            }
            games++;

            let amount = 0;
            (prop as string[]).forEach((p) => {
                amount += parseInt(game[p] || "0");
            });

            trendInfoObj[game.date || ""] = amount;

            if (
                (amount > checkNum && overUnder === "O") ||
                (amount < checkNum && overUnder === "U")
            ) {
                gamesHit++;
                gamesHitList.push(i);
            }
        });

        setPropInfo({ games, gamesHit, gamesHitList });
        setTrendInfo(trendInfoObj);
    };

    useEffect(() => {
        const gamelog = getPlayerGamelog(id);
        if (gamelog) {
            setGamelogInfo(gamelog);
            setLoading(false);
            return;
        }

        fetch(`/api/gamelog/${id}`)
            .then((res) => res.json())
            .then((res) => {
                if (GamelogColumns.length === 0) {
                    setGamelogColumns(res.statOrder);
                }
                addPlayerGamelog(id, res.gameLog);
                setGamelogInfo(res.gameLog);
            })
            .catch((e) => {
                console.error(`Error fetching gamelog for ${name}:`, e);
                setError(e);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [
        id,
        name,
        GamelogColumns.length,
        getPlayerGamelog,
        addPlayerGamelog,
        setGamelogColumns,
    ]);

    if (loading) {
        return (
            <div className="text-(--nba-almost-white) h-25">
                Loading gamelog...
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500">Error loading gamelog</div>;
    }

    return (
        <div className="p-4 max-w-full overflow-auto">
            <h2 className="text-2xl font-bold mb-4 text-(--nba-almost-white)">
                {name} Gamelog
            </h2>

            <p className="text-lg mb-4 text-(--nba-almost-white)">
                {propInfo.games !== undefined
                    ? `${name} has hit ${overUnder} ${checkValue} ${selectedProp}'s in ${propInfo.gamesHit} / ${propInfo.games} games or ${Math.floor(((propInfo.gamesHit || 0) / propInfo.games) * 100)}% of the time.`
                    : ""}
            </p>

            <div className="flex flex-wrap gap-4 mb-4">
                <Select value={selectedProp} onValueChange={setSelectedProp}>
                    <SelectTrigger className="w-37.5">
                        <SelectValue placeholder="Prop" />
                    </SelectTrigger>
                    <SelectContent>
                        {PROP_SELECT_DATA.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={overUnder} onValueChange={setOverUnder}>
                    <SelectTrigger className="w-25">
                        <SelectValue placeholder="O/U" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="O">Over</SelectItem>
                        <SelectItem value="U">Under</SelectItem>
                    </SelectContent>
                </Select>

                <Input
                    type="number"
                    value={checkValue}
                    onChange={(e) => setCheckValue(e.target.value)}
                    className="w-20"
                    step="0.5"
                />

                <Button variant="outline" onClick={clearValues}>
                    Clear
                </Button>
                <Button onClick={checkProp}>Check Prop</Button>
                <Button variant="destructive" onClick={closeModal}>
                    Close
                </Button>
            </div>

            {Object.keys(trendInfo).length > 0 && (
                <Card className="mb-6 bg-card/50">
                    <CardContent className="p-4">
                        <TrendInfoBarGraph
                            trendInfo={trendInfo}
                            checkValue={parseFloat(checkValue)}
                            overUnder={overUnder}
                        />
                    </CardContent>
                </Card>
            )}

            {homeAwaySplits.home && homeAwaySplits.away && (
                <Card className="mb-6 bg-card/50">
                    <CardContent className="p-4 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {GamelogColumns.filter(
                                        (col) =>
                                            !EXCLUDED_HOME_AWAY_COLUMNS.includes(
                                                col,
                                            ),
                                    ).map((col) => (
                                        <TableHead key={col}>
                                            {COLUMN_TO_LABEL[col]}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    {GamelogColumns.filter(
                                        (col) =>
                                            !EXCLUDED_HOME_AWAY_COLUMNS.includes(
                                                col,
                                            ),
                                    ).map((col) => (
                                        <TableCell key={col}>
                                            {typeof homeAwaySplits.home![
                                                col
                                            ] === "number"
                                                ? (
                                                      homeAwaySplits.home![
                                                          col
                                                      ] as number
                                                  ).toFixed(1)
                                                : homeAwaySplits.home![col]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    {GamelogColumns.filter(
                                        (col) =>
                                            !EXCLUDED_HOME_AWAY_COLUMNS.includes(
                                                col,
                                            ),
                                    ).map((col) => (
                                        <TableCell key={col}>
                                            {typeof homeAwaySplits.away![
                                                col
                                            ] === "number"
                                                ? (
                                                      homeAwaySplits.away![
                                                          col
                                                      ] as number
                                                  ).toFixed(1)
                                                : homeAwaySplits.away![col]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            <Card className="bg-card/50">
                <CardContent className="p-4 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {GamelogColumns.map((col) => (
                                    <TableHead key={col}>
                                        {COLUMN_TO_LABEL[col]}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {gameLogInfo.map((game, g) => {
                                const isHit =
                                    propInfo.gamesHitList?.includes(g);
                                return (
                                    <TableRow
                                        key={g}
                                        className={
                                            isHit ? "bg-(--nba-green)/30" : ""
                                        }
                                    >
                                        {GamelogColumns.map((col, i) => (
                                            <TableCell
                                                key={i}
                                                className={
                                                    i === 0
                                                        ? "sticky left-0 bg-card"
                                                        : ""
                                                }
                                                style={{
                                                    backgroundColor:
                                                        i === 0 && isHit
                                                            ? colors.green
                                                            : undefined,
                                                }}
                                            >
                                                {game[col]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

interface TrendInfoBarGraphProps {
    trendInfo: Record<string, number>;
    checkValue: number;
    overUnder: string;
}

function formatDateShort(date: string): string {
    // Convert "2025-10-22" to "10/22"
    const parts = date.split("-");
    if (parts.length === 3) {
        return `${parts[1]}/${parts[2]}`;
    }
    return date;
}

function TrendInfoBarGraph({
    trendInfo,
    checkValue,
    overUnder,
}: TrendInfoBarGraphProps) {
    const values = Object.values(trendInfo);
    let maxValue = Math.max(...values);
    maxValue += maxValue > 20 ? 5 : 2;

    return (
        <div className="h-75 overflow-x-scroll">
            <div className="h-full flex flex-row flex-nowrap relative w-fit min-w-full">
                {Object.entries(trendInfo).map(([date, value]) => {
                    const propHit =
                        (value > checkValue && overUnder === "O") ||
                        (value < checkValue && overUnder === "U");
                    const height = (value / maxValue) * 100;

                    return (
                        <div
                            key={date}
                            className="h-full w-fit flex flex-col items-center justify-end relative z-10 px-1"
                        >
                            <span className="font-bold text-lg">{value}</span>
                            <div
                                className="w-4 rounded-md border"
                                style={{
                                    height: `${height}%`,
                                    backgroundColor: propHit
                                        ? colors.green
                                        : colors.almostWhite,
                                    borderColor: propHit
                                        ? colors.green
                                        : colors.almostWhite,
                                }}
                            />
                            <span className="text-xs mt-1 whitespace-nowrap">
                                {formatDateShort(date)}
                            </span>
                        </div>
                    );
                })}
                <div
                    className="absolute left-0 right-0 h-0.5"
                    style={{
                        bottom: `calc(${(checkValue / maxValue) * 100}% + 25px)`,
                        backgroundColor: colors.logo_orange,
                    }}
                />
            </div>
        </div>
    );
}
