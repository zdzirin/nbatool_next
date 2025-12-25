"use client";

import { createContext, useState, useContext, ReactNode } from "react";
import type { GameLogEntry } from "@/lib/scraping/gamelogs";

interface GamelogContextType {
  PlayerGamelogs: Record<string, GameLogEntry[]>;
  setPlayerGamelogs: React.Dispatch<
    React.SetStateAction<Record<string, GameLogEntry[]>>
  >;
  GamelogColumns: string[];
  setGamelogColumns: React.Dispatch<React.SetStateAction<string[]>>;
}

export const GamelogContext = createContext<GamelogContextType | undefined>(
  undefined
);

const defaultColumns = [
  "date",
  "team_name_abbr",
  "game_location",
  "opp_name_abbr",
  "game_result",
  "mp",
  "pts",
  "fg",
  "fga",
  "fg_pct",
  "fg3",
  "fg3a",
  "fg3_pct",
  "fg2",
  "fg2a",
  "fg2_pct",
  "efg_pct",
  "ft",
  "fta",
  "ft_pct",
  "orb",
  "drb",
  "trb",
  "ast",
  "stl",
  "blk",
  "tov",
  "pf",
  "game_score",
  "plus_minus",
];

interface GamelogContextProviderProps {
  children: ReactNode;
}

export const GamelogContextProvider = ({
  children,
}: GamelogContextProviderProps) => {
  const [PlayerGamelogs, setPlayerGamelogs] = useState<
    Record<string, GameLogEntry[]>
  >({});
  const [GamelogColumns, setGamelogColumns] = useState<string[]>(defaultColumns);

  return (
    <GamelogContext.Provider
      value={{
        PlayerGamelogs,
        setPlayerGamelogs,
        GamelogColumns,
        setGamelogColumns,
      }}
    >
      {children}
    </GamelogContext.Provider>
  );
};

export const useGamelogData = () => {
  const context = useContext(GamelogContext);
  if (!context) {
    throw new Error(
      "useGamelogData must be used within a GamelogContextProvider"
    );
  }

  const {
    PlayerGamelogs,
    setPlayerGamelogs,
    GamelogColumns,
    setGamelogColumns,
  } = context;

  const getPlayerGamelog = (playerId: string): GameLogEntry[] | false => {
    if (PlayerGamelogs.hasOwnProperty(playerId)) {
      return PlayerGamelogs[playerId];
    }
    return false;
  };

  const addPlayerGamelog = (playerId: string, gamelog: GameLogEntry[]) => {
    setPlayerGamelogs({ ...PlayerGamelogs, [playerId]: gamelog });
  };

  return {
    getPlayerGamelog,
    addPlayerGamelog,
    GamelogColumns,
    setGamelogColumns,
  };
};
