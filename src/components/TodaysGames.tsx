"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ScheduledGame } from "@/lib/schedule";

interface TodaysGamesProps {
  matchups: { id: number; teamA: string; teamB: string }[];
  onSelectGame: (away: string, home: string) => void;
}

const formatStatus = (game: ScheduledGame): string => {
  if (game.state === "pre") {
    // Viewer's local time
    return new Date(game.tipoff).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return `${game.awayScore}-${game.homeScore} · ${game.detail}`;
};

export function TodaysGames({ matchups, onSelectGame }: TodaysGamesProps) {
  const [games, setGames] = useState<ScheduledGame[] | null>(null);

  useEffect(() => {
    fetch("/api/todays_games")
      .then((res) => {
        if (!res.ok) throw new Error(`Games request failed: ${res.status}`);
        return res.json();
      })
      .then((data: ScheduledGame[]) => setGames(data))
      .catch((e) => {
        // Picking teams by hand still works, so fail quietly
        console.error("Error fetching today's games:", e);
        setGames([]);
      });
  }, []);

  // Matchup already on the page for this game, in either team order
  const findMatchup = (game: ScheduledGame) =>
    matchups.find(
      (m) =>
        (m.teamA === game.away && m.teamB === game.home) ||
        (m.teamA === game.home && m.teamB === game.away)
    );

  const handleClick = (game: ScheduledGame) => {
    const existing = findMatchup(game);
    if (existing) {
      document
        .getElementById(`matchup-${existing.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    onSelectGame(game.away, game.home);
  };

  return (
    <section className="mb-4">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
        <CalendarDays className="h-4 w-4 shrink-0" />
        Today&apos;s Games
      </h2>
      {games === null ? (
        <p className="h-8 text-sm text-muted-foreground">Loading games...</p>
      ) : games.length === 0 ? (
        <p className="text-sm text-muted-foreground">No games today.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {games.map((game) => {
            const added = !!findMatchup(game);
            return (
              <Button
                key={game.id}
                variant={added ? "secondary" : "outline"}
                size="sm"
                onClick={() => handleClick(game)}
                title={added ? "Go to matchup" : "Add matchup"}
              >
                {added && <Check className="h-4 w-4" />}
                <span className="font-semibold">
                  {game.away} @ {game.home}
                </span>
                <span className="font-normal text-muted-foreground">
                  {formatStatus(game)}
                </span>
              </Button>
            );
          })}
        </div>
      )}
    </section>
  );
}
