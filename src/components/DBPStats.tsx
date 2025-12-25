"use client";

import { useState } from "react";
import { useDBPData, TeamDBPDataItem } from "@/context/DBPContext";
import { ABBREVIATION_TO_TEAM, colors } from "@/lib/consts";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StatValue } from "@/lib/scraping/defensebyposition";

const DBP_INDEX_TO_STAT: Record<number, keyof Omit<TeamDBPDataItem, "range" | "position" | "team">> = {
  0: "pts",
  1: "reb",
  2: "ast",
  3: "tpm",
  4: "stl",
  5: "blk",
  6: "to",
};

const STAT_LABELS = ["PTS", "REB", "AST", "TPM", "STL", "BLK", "TO"];
const POSITIONS = ["PG", "SG", "SF", "PF", "C"];

interface DBPStatsProps {
  team: string;
}

export default function DBPStats({ team }: DBPStatsProps) {
  const { getTeamDBPData } = useDBPData();
  const stats = getTeamDBPData(team);

  stats.sort(
    (a, b) => POSITIONS.indexOf(a.position) - POSITIONS.indexOf(b.position)
  );

  const [range, setRange] = useState(0);

  const getStatColor = (stat: StatValue): string => {
    if (stat.difficulty > 0) return colors.yellow_orange;
    if (stat.difficulty < 0) return colors.green;
    return "";
  };

  return (
    <div className="w-full">
      <h3 className="mb-4 text-lg font-semibold text-[var(--nba-almost-white)]">
        {ABBREVIATION_TO_TEAM[team]} Defense vs Position
      </h3>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-muted-foreground">
          Stat Range (Games):
        </span>
        <Button
          variant={range === 0 ? "default" : "outline"}
          size="sm"
          onClick={() => setRange(0)}
        >
          Season
        </Button>
        <Button
          variant={range === 7 ? "default" : "outline"}
          size="sm"
          onClick={() => setRange(7)}
        >
          7
        </Button>
        <Button
          variant={range === 15 ? "default" : "outline"}
          size="sm"
          onClick={() => setRange(15)}
        >
          15
        </Button>
        <Button
          variant={range === 30 ? "default" : "outline"}
          size="sm"
          onClick={() => setRange(30)}
        >
          30
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pos.</TableHead>
            {STAT_LABELS.map((label) => (
              <TableHead key={label}>{label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats
            .filter((e) => Number.parseInt(e.range) === range)
            .map((row, rowIdx) => (
              <TableRow key={rowIdx}>
                <TableCell className="font-semibold">{row.position}</TableCell>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                  const statKey = DBP_INDEX_TO_STAT[i];
                  const stat = row[statKey] as StatValue;
                  const color = getStatColor(stat);

                  return (
                    <TableCell
                      key={i}
                      className="relative"
                      style={{
                        borderTop:
                          stat.difficulty !== 0
                            ? `3px solid ${color}`
                            : undefined,
                      }}
                    >
                      {stat.difficulty !== 0 && (
                        <div
                          className="absolute inset-0 opacity-25"
                          style={{ backgroundColor: color }}
                        />
                      )}
                      <div className="relative z-10 text-center">
                        {stat.amt}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          ({stat.rank})
                        </span>
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
