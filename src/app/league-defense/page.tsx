"use client";

import { useState } from "react";
import DBPStats from "@/components/DBPStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TEAMS } from "@/lib/consts";

export default function LeagueDefensePage() {
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const addSelectedTeam = (team: string) => {
    setSelectedTeams([...selectedTeams, team]);
  };

  const removeSelectedTeam = (team: string) => {
    setSelectedTeams(selectedTeams.filter((t) => t !== team));
  };

  const clearSelectedTeams = () => {
    setSelectedTeams([]);
  };

  const selectAllTeams = () => {
    setSelectedTeams(TEAMS);
  };

  return (
    <div className="w-full">
      <div className="flex flex-row justify-between items-center mb-4 gap-4">
        <h3 className="text-xl font-semibold text-[var(--nba-almost-white)]">
          League Defenses
        </h3>
      </div>

      <Card className="mb-6 bg-card/80">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={selectAllTeams}>
              Select All
            </Button>
            <Button size="sm" variant="outline" onClick={clearSelectedTeams}>
              Clear
            </Button>
            {TEAMS.map((team) => (
              <Button
                key={team}
                size="sm"
                variant={selectedTeams.includes(team) ? "default" : "outline"}
                onClick={() =>
                  selectedTeams.includes(team)
                    ? removeSelectedTeam(team)
                    : addSelectedTeam(team)
                }
              >
                {team}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {selectedTeams.map((team) => (
          <Card key={team} className="bg-card/80">
            <CardContent className="pt-4">
              <DBPStats team={team} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
