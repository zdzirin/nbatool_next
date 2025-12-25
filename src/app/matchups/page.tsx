"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Matchup } from "@/components/Matchup";
import { Button } from "@/components/ui/button";

export default function MatchupsPage() {
  const [matchups, setMatchups] = useState<number[]>([0]);

  const addMatchup = () => {
    setMatchups([...matchups, Date.now()]);
  };

  const removeMatchup = (matchup: number) => {
    setMatchups(matchups.filter((m) => m !== matchup));
  };

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <Button onClick={addMatchup} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Matchup
        </Button>
      </div>

      {matchups.map((m) => (
        <Matchup key={m} remove={() => removeMatchup(m)} />
      ))}

      <Button onClick={addMatchup} className="mt-2">
        <Plus className="w-4 h-4 mr-1" />
        Add Matchup
      </Button>
    </div>
  );
}
