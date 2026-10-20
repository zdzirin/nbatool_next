"use client";

import {
  createContext,
  useEffect,
  useState,
  useContext,
  ReactNode,
} from "react";
import { getYearForResults } from "@/lib/consts";
import type { PBPPlayer, PBPResponse } from "@/lib/scraping/pbproster";

interface PBPContextType {
  PBPData: PBPPlayer[];
  season: string;
  requestedSeason: string;
  setUsePrevRosters: (value: boolean) => void;
  usePrevRosters: boolean;
}

export const PBPContext = createContext<PBPContextType | undefined>(undefined);

interface PBPContextProviderProps {
  children: ReactNode;
}

export const PBPContextProvider = ({ children }: PBPContextProviderProps) => {
  const [PBPData, setPBPData] = useState<PBPPlayer[]>([]);
  const [season, setSeason] = useState("");
  const [requestedSeason, setRequestedSeason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [usePrevRosters, setUsePrevRosters] = useState(false);

  useEffect(() => {
    const year = usePrevRosters
      ? getYearForResults() - 1
      : getYearForResults();

    setLoading(true);
    fetch("/api/pbp_roster?year=" + year)
      .then((res) => {
        if (!res.ok) throw new Error(`PBP request failed: ${res.status}`);
        return res.json();
      })
      .then((res: PBPResponse) => {
        setPBPData(res.data);
        setSeason(res.season);
        setRequestedSeason(res.requestedSeason);
      })
      .catch((e) => {
        console.error("Error fetching PBP data:", e);
        setError(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [usePrevRosters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-[var(--nba-almost-white)] text-xl">
          Loading Play-By-Play Rosters...
        </h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-red-500 text-xl">
          Error loading data. Please try again.
        </h1>
      </div>
    );
  }

  return (
    <PBPContext.Provider value={{
        PBPData,
        season,
        requestedSeason,
        setUsePrevRosters,
        usePrevRosters,
      }}>
      {children}
    </PBPContext.Provider>
  );
};

export const usePBPRosters = () => {
  const context = useContext(PBPContext);
  if (!context) {
    throw new Error("usePBPRosters must be used within a PBPContextProvider");
  }

  const { PBPData, season, requestedSeason, setUsePrevRosters, usePrevRosters } =
    context;

  const getTeamPBPRoster = (team: string): PBPPlayer[] => {
    if (!team) return [];
    return PBPData.filter((e) => e.team_id === team).sort(
      (a, b) => Number(b.mp) - Number(a.mp)
    );
  };

  return {
    PBPRoster: PBPData,
    getTeamPBPRoster,
    season,
    requestedSeason,
    setUsePrevRosters,
    usePrevRosters,
  };
};
