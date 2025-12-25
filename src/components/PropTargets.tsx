"use client";

import { useState, useMemo } from "react";
import { usePBPRosters } from "@/context/PBPContext";
import { useDBPData, TeamDBPDataItem } from "@/context/DBPContext";
import { colors } from "@/lib/consts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import type { PBPPlayer } from "@/lib/scraping/pbproster";

const POSITION_TO_PCT: Record<string, keyof PBPPlayer> = {
    PG: "pct_1",
    SG: "pct_2",
    SF: "pct_3",
    PF: "pct_4",
    C: "pct_5",
};

const POSITIONS = ["PG", "SG", "SF", "PF", "C"];

const STAT_LABELS: Record<string, string> = {
    pts: "PTS",
    reb: "REB",
    ast: "AST",
    tpm: "3PM",
};

interface SelectedPlayer {
    name: string;
    id: string;
}

interface PropTargetsProps {
    teamA: string;
    teamB: string;
    setSelectedPlayer: (player: SelectedPlayer) => void;
}

interface PlayerPropRecommendation {
    player: PBPPlayer;
    playerId: string;
    team: string;
    opponent: string;
    propsToTarget: string[];
    propsToAvoid: string[];
}

const getPlayerIDFromLink = (link: string): string => {
    const split = link.split("/")[3];
    return split?.split(".")[0] || "";
};

function calculateMatchupScore(
    player: PBPPlayer,
    opponentDefense: TeamDBPDataItem[],
    stat: keyof Omit<TeamDBPDataItem, "range" | "position" | "team">,
): number {
    // Filter to season-long stats (range = "0")
    const seasonDefense = opponentDefense.filter((d) => d.range === "0");

    let weightedScore = 0;
    let totalWeight = 0;

    POSITIONS.forEach((pos) => {
        const pctKey = POSITION_TO_PCT[pos];
        const pctStr = player[pctKey]?.toString() || "0";
        const pct = parseInt(pctStr.replace("%", "")) || 0;

        if (pct > 0) {
            const defenseAtPos = seasonDefense.find((d) => d.position === pos);
            if (defenseAtPos) {
                const statData = defenseAtPos[stat];
                if (statData) {
                    // Weight by percentage of time played at this position
                    weightedScore += (pct / 100) * statData.difficulty;
                    totalWeight += pct / 100;
                }
            }
        }
    });

    // Normalize by total weight
    return totalWeight > 0 ? weightedScore / totalWeight : 0;
}

function analyzePlayerProps(
    player: PBPPlayer,
    opponentDefense: TeamDBPDataItem[],
    team: string,
    opponent: string,
): PlayerPropRecommendation {
    const stats: (keyof Omit<
        TeamDBPDataItem,
        "range" | "position" | "team"
    >)[] = ["pts", "reb", "ast", "tpm"];

    const propsToTarget: string[] = [];
    const propsToAvoid: string[] = [];

    stats.forEach((stat) => {
        const score = calculateMatchupScore(player, opponentDefense, stat);
        // Negative score = defense is weak = target
        // Positive score = defense is strong = avoid
        if (score < -0.3) {
            propsToTarget.push(STAT_LABELS[stat]);
        } else if (score > 0.3) {
            propsToAvoid.push(STAT_LABELS[stat]);
        }
    });

    return {
        player,
        playerId: getPlayerIDFromLink(player.player_link || ""),
        team,
        opponent,
        propsToTarget,
        propsToAvoid,
    };
}

export function PropTargets({
    teamA,
    teamB,
    setSelectedPlayer,
}: PropTargetsProps) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const { getTeamPBPRoster } = usePBPRosters();
    const { getTeamDBPData } = useDBPData();

    const recommendations = useMemo(() => {
        if (!teamA || !teamB) return { targets: [], avoids: [] };

        // Get rosters (top 12 by minutes)
        const teamARoster = getTeamPBPRoster(teamA).slice(0, 12);
        const teamBRoster = getTeamPBPRoster(teamB).slice(0, 12);

        // Get defensive stats
        const teamADefense = getTeamDBPData(teamA);
        const teamBDefense = getTeamDBPData(teamB);

        const allRecommendations: PlayerPropRecommendation[] = [];

        // Analyze Team A players vs Team B defense
        teamARoster.forEach((player) => {
            const rec = analyzePlayerProps(player, teamBDefense, teamA, teamB);
            if (rec.propsToTarget.length > 0 || rec.propsToAvoid.length > 0) {
                allRecommendations.push(rec);
            }
        });

        // Analyze Team B players vs Team A defense
        teamBRoster.forEach((player) => {
            const rec = analyzePlayerProps(player, teamADefense, teamB, teamA);
            if (rec.propsToTarget.length > 0 || rec.propsToAvoid.length > 0) {
                allRecommendations.push(rec);
            }
        });

        // Split into targets and avoids
        const targets = allRecommendations.filter(
            (r) => r.propsToTarget.length > 0,
        );
        const avoids = allRecommendations.filter(
            (r) => r.propsToAvoid.length > 0,
        );

        return { targets, avoids };
    }, [teamA, teamB, getTeamPBPRoster, getTeamDBPData]);

    const handlePlayerClick = (rec: PlayerPropRecommendation) => {
        setSelectedPlayer({ name: rec.player.player, id: rec.playerId });
    };

    const TargetTable = ({ data }: { data: PlayerPropRecommendation[] }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>vs</TableHead>
                    <TableHead>Props to Target</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <TableRow>
                        <TableCell
                            colSpan={4}
                            className="text-center text-muted-foreground"
                        >
                            No clear targets found
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((rec, idx) => (
                        <TableRow key={`${rec.playerId}-${idx}`}>
                            <TableCell
                                onClick={() => handlePlayerClick(rec)}
                                className="font-medium underline cursor-pointer hover:text-[var(--nba-logo-orange)]"
                            >
                                {rec.player.player}
                            </TableCell>
                            <TableCell>{rec.team}</TableCell>
                            <TableCell className="text-muted-foreground">
                                {rec.opponent}
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1 flex-wrap">
                                    {rec.propsToTarget.map((prop) => (
                                        <span
                                            key={prop}
                                            className="px-2 py-0.5 rounded text-xs font-medium"
                                            style={{
                                                backgroundColor: `${colors.green}40`,
                                                borderLeft: `3px solid ${colors.green}`,
                                            }}
                                        >
                                            {prop}
                                        </span>
                                    ))}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );

    const AvoidTable = ({ data }: { data: PlayerPropRecommendation[] }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>vs</TableHead>
                    <TableHead>Props to Avoid</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <TableRow>
                        <TableCell
                            colSpan={4}
                            className="text-center text-muted-foreground"
                        >
                            No clear avoids found
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((rec, idx) => (
                        <TableRow key={`${rec.playerId}-${idx}`}>
                            <TableCell
                                onClick={() => handlePlayerClick(rec)}
                                className="font-medium underline cursor-pointer hover:text-[var(--nba-logo-orange)]"
                            >
                                {rec.player.player}
                            </TableCell>
                            <TableCell>{rec.team}</TableCell>
                            <TableCell className="text-muted-foreground">
                                {rec.opponent}
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1 flex-wrap">
                                    {rec.propsToAvoid.map((prop) => (
                                        <span
                                            key={prop}
                                            className="px-2 py-0.5 rounded text-xs font-medium"
                                            style={{
                                                backgroundColor: `${colors.yellow_orange}40`,
                                                borderLeft: `3px solid ${colors.yellow_orange}`,
                                            }}
                                        >
                                            {prop}
                                        </span>
                                    ))}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );

    if (!teamA || !teamB) return null;

    return (
        <Card className="bg-card/50 mb-6">
            <CardHeader
                className="pb-2 cursor-pointer select-none"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-(--nba-logo-orange)" />
                        Highlighted Plays
                    </span>
                    {isCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    )}
                </CardTitle>
            </CardHeader>

            {!isCollapsed && (
                <CardContent>
                    <Tabs defaultValue="target" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger
                                value="target"
                                className="text-xs flex items-center gap-1"
                            >
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: colors.green }}
                                />
                                Target
                            </TabsTrigger>
                            <TabsTrigger
                                value="avoid"
                                className="text-xs flex items-center gap-1"
                            >
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{
                                        backgroundColor: colors.yellow_orange,
                                    }}
                                />
                                Avoid
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent
                            value="target"
                            className="max-h-[350px] overflow-y-auto"
                        >
                            <TargetTable data={recommendations.targets} />
                        </TabsContent>
                        <TabsContent
                            value="avoid"
                            className="max-h-[350px] overflow-y-auto"
                        >
                            <AvoidTable data={recommendations.avoids} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            )}
        </Card>
    );
}
