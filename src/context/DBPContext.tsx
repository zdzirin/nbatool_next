"use client";

import {
  createContext,
  useEffect,
  useState,
  useContext,
  ReactNode,
} from "react";
import { getYearForResults } from "@/lib/consts";
import type {
  DBPData,
  DBPResponse,
  DBPTeamData,
} from "@/lib/scraping/defensebyposition";

interface DBPContextType {
  DBPData: DBPData;
  season: string;
  requestedSeason: string;
  usePrevDBP: boolean;
  setUsePrevDBP: (value: boolean) => void;
}

export const DBPContext = createContext<DBPContextType | undefined>(undefined);

interface DBPContextProviderProps {
  children: ReactNode;
}

export type TeamDBPDataItem = {
  range: string;
  position: string;
} & DBPTeamData;

export const DBPContextProvider = ({ children }: DBPContextProviderProps) => {
  const [DBPData, setDBPData] = useState<DBPData>({});
  const [season, setSeason] = useState("");
  const [requestedSeason, setRequestedSeason] = useState("");
  const [loading, setLoading] = useState(true);
  const [usePrevDBP, setUsePrevDBP] = useState(false);

  useEffect(() => {
    const year = usePrevDBP ? getYearForResults() - 1 : getYearForResults();

    setLoading(true);
    fetch("/api/full_dbp_stats?year=" + year)
      .then((res) => {
        if (!res.ok) throw new Error(`DBP request failed: ${res.status}`);
        return res.json();
      })
      .then((res: DBPResponse) => {
        setDBPData(res.data);
        setSeason(res.season);
        setRequestedSeason(res.requestedSeason);
      })
      .catch((e) => {
        // Don't block the rest of the app on a scraped source; DBPStats
        // shows the empty state
        console.error("Error fetching DBP data:", e);
        setDBPData({});
        setSeason("");
        setRequestedSeason("");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [usePrevDBP]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-[var(--nba-almost-white)] text-xl">
          Loading Defense-By-Position Data...
        </h1>
      </div>
    );
  }

  return (
    <DBPContext.Provider value={{ DBPData, season, requestedSeason, usePrevDBP, setUsePrevDBP }}>
      {children}
    </DBPContext.Provider>
  );
};

export const useDBPData = () => {
  const context = useContext(DBPContext);
  if (!context) {
    throw new Error("useDBPData must be used within a DBPContextProvider");
  }

  const { DBPData, season, requestedSeason, usePrevDBP, setUsePrevDBP } =
    context;

  const getTeamDBPData = (team: string): TeamDBPDataItem[] => {
    const teamData: TeamDBPDataItem[] = [];

    Object.keys(DBPData).forEach((range) => {
      Object.keys(DBPData[range]).forEach((position) => {
        const data = DBPData[range][position].find((e) => e.team === team);
        if (!data) {
          console.log(`Can't find ${team} in ${range}: ${position}`);
          return;
        }

        teamData.push({ range, position, ...data });
      });
    });

    return teamData;
  };

  const ranges = Object.keys(DBPData)
    .map((range) => parseInt(range))
    .sort((a, b) => a - b);

  return {
    getTeamDBPData,
    ranges,
    season,
    requestedSeason,
    usePrevDBP,
    setUsePrevDBP,
  };
};
