"use client";

import { useState, useEffect } from "react";
import { ABBREVIATION_TO_TEAM, colors } from "@/lib/consts";
import { usePBPRosters } from "@/context/PBPContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PBPPlayer } from "@/lib/scraping/pbproster";

const POSITION_TO_PCT: Record<string, keyof PBPPlayer> = {
  PG: "pct_1",
  SG: "pct_2",
  SF: "pct_3",
  PF: "pct_4",
  C: "pct_5",
};

export const getPlayerIDFromLink = (link: string): string => {
  const split = link.split("/")[3];
  return split?.split(".")[0] || "";
};

interface SelectedPlayer {
  name: string;
  id: string;
}

interface PBPRosterProps {
  team: string;
  setSelectedPlayer?: (player: SelectedPlayer) => void;
  constrain?: boolean;
}

export default function PBPRoster({
  team,
  setSelectedPlayer = () => {},
  constrain = false,
}: PBPRosterProps) {
  const { getTeamPBPRoster } = usePBPRosters();
  const [roster, setRoster] = useState<PBPPlayer[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string>("");

  const handleSetSelectedPosition = (position: string) => {
    if (position === selectedPosition) {
      setSelectedPosition("");
    } else {
      setSelectedPosition(position);
    }
  };

  useEffect(() => setRoster(getTeamPBPRoster(team)), [team, getTeamPBPRoster]);

  const getRowColor = (player: PBPPlayer): string | null => {
    if (!selectedPosition) return null;
    const pctKey = POSITION_TO_PCT[selectedPosition];
    const pctValue = player[pctKey];
    const minutesPlayed = parseInt(pctValue?.toString() || "0");

    if (minutesPlayed >= 33) return colors.green;
    if (minutesPlayed >= 10) return colors.yellow_orange;
    if (minutesPlayed > 0) return colors.logo_orange;
    return null;
  };

  return (
    <div className="w-full">
      <h3 className="mb-4 text-lg font-semibold text-[var(--nba-almost-white)]">
        {ABBREVIATION_TO_TEAM[team]} Play By Play Roster
      </h3>
      <div className={constrain ? "max-h-[400px] overflow-y-auto" : ""}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Pos.</TableHead>
              <TableHead>GP</TableHead>
              <TableHead>Mins</TableHead>
              {["PG", "SG", "SF", "PF", "C"].map((pos) => (
                <TableHead
                  key={pos}
                  onClick={() => handleSetSelectedPosition(pos)}
                  className={`cursor-pointer hover:bg-accent ${
                    selectedPosition === pos ? "bg-accent" : ""
                  }`}
                >
                  {pos}
                </TableHead>
              ))}
              <TableHead className="hidden md:table-cell">+/- On</TableHead>
              <TableHead className="hidden md:table-cell">+/- Net</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roster.map((player, idx) => {
              const color = getRowColor(player);
              const playerId = getPlayerIDFromLink(player.player_link || "");
              const onClick = () =>
                setSelectedPlayer({ name: player.player, id: playerId });

              const zebraClass = idx % 2 === 0 ? "bg-muted/30" : "bg-muted/10";

              return (
                <TableRow
                  key={idx}
                  className={!color ? zebraClass : ""}
                  style={{
                    background: color ? `${color}40` : undefined,
                    borderTop: color ? `2px solid ${color}` : undefined,
                  }}
                >
                  <TableCell
                    onClick={onClick}
                    className="font-medium underline cursor-pointer hover:text-[var(--nba-logo-orange)]"
                  >
                    {player.player}
                  </TableCell>
                  <TableCell>{player.pos}</TableCell>
                  <TableCell
                    onClick={onClick}
                    className="underline cursor-pointer"
                  >
                    {player.g}
                  </TableCell>
                  <TableCell>{player.mp}</TableCell>
                  <TableCell className="border-x border-border/50">
                    {player.pct_1}
                  </TableCell>
                  <TableCell>{player.pct_2}</TableCell>
                  <TableCell className="border-x border-border/50">
                    {player.pct_3}
                  </TableCell>
                  <TableCell>{player.pct_4}</TableCell>
                  <TableCell className="border-x border-border/50">
                    {player.pct_5}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {player.plus_minus_on?.substring(0, 4)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {player.plus_minus_net?.substring(0, 4)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
