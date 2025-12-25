"use client";

import { useEffect, useState } from "react";
import { usePBPRosters } from "@/context/PBPContext";
import { getPlayerIDFromLink } from "./PBPRoster";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface PlayerOption {
  name: string;
  value: string;
}

interface PlayerSelectProps {
  selectedPlayer?: { name: string; id: string } | null;
  onChange?: (id: string, player: PlayerOption) => void;
  className?: string;
}

export function PlayerSelect({
  selectedPlayer,
  onChange = () => {},
  className = "",
}: PlayerSelectProps) {
  const { PBPRoster } = usePBPRosters();
  const [playerSelectData, setPlayerSelectData] = useState<PlayerOption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setPlayerSelectData(
      PBPRoster.map((player) => ({
        name: player.player,
        value: getPlayerIDFromLink(player.player_link || ""),
      }))
    );
  }, [PBPRoster]);

  const filteredPlayers = playerSelectData.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleValueChange = (value: string) => {
    const player = playerSelectData.find((p) => p.value === value);
    if (player) {
      onChange(value, player);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Input
        placeholder="Search players..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />
      <Select
        value={selectedPlayer?.id || undefined}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Player" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {filteredPlayers.slice(0, 100).map((player) => (
            <SelectItem key={player.value} value={player.value}>
              {player.name}
            </SelectItem>
          ))}
          {filteredPlayers.length > 100 && (
            <div className="px-2 py-1 text-sm text-muted-foreground">
              Type to search more players...
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
