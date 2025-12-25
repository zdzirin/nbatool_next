"use client";

import { useState } from "react";
import { usePBPRosters } from "@/context/PBPContext";
import { Gamelog } from "@/components/Gamelog";
import { PlayerSelect } from "@/components/PlayerSelect";
import { getPlayerIDFromLink } from "@/components/PBPRoster";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PLAYER_TO_LABELS: Record<string, string> = {
  player: "Name",
  team_id: "Team",
  pos: "Pos.",
  g: "G",
  mp: "MP",
  pct_1: "PG",
  pct_2: "SG",
  pct_3: "SF",
  pct_4: "PF",
  pct_5: "C",
  plus_minus_net: "+/-",
  plus_minus_on: "+/- (On)",
};

interface SelectedPlayer {
  name: string;
  id: string;
}

export default function PlayersPage() {
  const { PBPRoster } = usePBPRosters();
  const [selectedPlayer, setSelectedPlayer] = useState<SelectedPlayer | null>(
    null
  );

  return (
    <div className="w-full">
      <Dialog
        open={!!selectedPlayer?.id}
        onOpenChange={(open) => !open && setSelectedPlayer(null)}
      >
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedPlayer?.name} Gamelog</DialogTitle>
          </DialogHeader>
          {selectedPlayer && (
            <Gamelog
              id={selectedPlayer.id}
              name={selectedPlayer.name}
              closeModal={() => setSelectedPlayer(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Card className="bg-card/80">
        <CardContent className="pt-4">
          <PlayerSelect
            selectedPlayer={selectedPlayer}
            onChange={(id, player) =>
              setSelectedPlayer({ name: player.name, id })
            }
            className="mb-6 max-w-md"
          />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.values(PLAYER_TO_LABELS).map((label) => (
                    <TableHead
                      key={label}
                      className={
                        label === "+/-" ||
                        label === "+/- (On)" ||
                        label === "Pos." ||
                        label === "MP"
                          ? "hidden md:table-cell"
                          : ""
                      }
                    >
                      {label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {PBPRoster.map((player, idx) => {
                  const playerId = getPlayerIDFromLink(player.player_link || "");
                  const onClick = () =>
                    setSelectedPlayer({ name: player.player, id: playerId });

                  return (
                    <TableRow key={idx}>
                      {Object.keys(PLAYER_TO_LABELS).map((key) => {
                        const value = player[key as keyof typeof player];

                        if (key === "player" || key === "team_id") {
                          return (
                            <TableCell
                              key={key}
                              onClick={onClick}
                              className="underline cursor-pointer hover:text-[var(--nba-logo-orange)]"
                            >
                              {value}
                            </TableCell>
                          );
                        }

                        if (
                          key === "plus_minus_net" ||
                          key === "plus_minus_on" ||
                          key === "pos" ||
                          key === "mp"
                        ) {
                          return (
                            <TableCell
                              key={key}
                              className="hidden md:table-cell"
                            >
                              {value}
                            </TableCell>
                          );
                        }

                        return <TableCell key={key}>{value}</TableCell>;
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
