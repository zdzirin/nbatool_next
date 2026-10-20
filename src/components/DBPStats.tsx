"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { useDBPData } from "@/context/DBPContext";
import { ABBREVIATION_TO_TEAM, DBP_STATS, colors } from "@/lib/consts";
import { SeasonBadge } from "@/components/SeasonBadge";
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

const STAT_LABELS = ["PTS", "REB", "AST", "TPM", "STL", "BLK", "TO"];
const POSITIONS = ["PG", "SG", "SF", "PF", "C"];

interface DBPStatsProps {
  team: string;
}

export default function DBPStats({ team }: DBPStatsProps) {
  const { getTeamDBPData, ranges, season, requestedSeason } = useDBPData();
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

  if (ranges.length === 0) {
    return (
      <div className="w-full">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Shield className="h-5 w-5 shrink-0" />
          {ABBREVIATION_TO_TEAM[team]} Defense vs Position
        </h3>
        <p className="text-sm text-muted-foreground">
          Defense vs position data is unavailable right now.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="mb-4 flex flex-wrap items-center gap-2 text-lg font-semibold text-foreground">
        <Shield className="h-5 w-5 shrink-0" />
        {ABBREVIATION_TO_TEAM[team]} Defense vs Position
        <SeasonBadge
          season={season}
          requestedSeason={requestedSeason}
          dataName="defense"
        />
      </h3>
      {/* Recent ranges only exist while the season is in progress */}
      {ranges.length > 1 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">
            Stat Range (Days):
          </span>
          {ranges.map((r) => (
            <Button
              key={r}
              variant={range === r ? "default" : "outline"}
              size="sm"
              onClick={() => setRange(r)}
            >
              {r === 0 ? "Season" : r}
            </Button>
          ))}
        </div>
      )}

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
                {DBP_STATS.map((statKey) => {
                  const stat = row[statKey];
                  const color = getStatColor(stat);

                  return (
                    <TableCell
                      key={statKey}
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
