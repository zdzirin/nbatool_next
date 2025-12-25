"use client";

import {
  createContext,
  useEffect,
  useState,
  useContext,
  ReactNode,
} from "react";
import { getYearForResults } from "@/lib/consts";
import type { DBPData, StatValue } from "@/lib/scraping/defensebyposition";

interface DBPContextType {
  DBPData: DBPData;
  usePrevDBP: boolean;
  setUsePrevDBP: (value: boolean) => void;
}

export const DBPContext = createContext<DBPContextType | undefined>(undefined);

interface DBPContextProviderProps {
  children: ReactNode;
}

export interface TeamDBPDataItem {
  range: string;
  position: string;
  team: string;
  pts: StatValue;
  reb: StatValue;
  ast: StatValue;
  tpm: StatValue;
  stl: StatValue;
  blk: StatValue;
  to: StatValue;
}

export const DBPContextProvider = ({ children }: DBPContextProviderProps) => {
  const [DBPData, setDBPData] = useState<DBPData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [usePrevDBP, setUsePrevDBP] = useState(false);

  useEffect(() => {
    const year = usePrevDBP ? getYearForResults() - 1 : getYearForResults();

    setLoading(true);
    fetch("/api/full_dbp_stats?year=" + year)
      .then((res) => res.json())
      .then((data) => {
        setDBPData(data);
      })
      .catch((e) => {
        console.error("Error fetching DBP data:", e);
        setError(e);
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
    <DBPContext.Provider value={{ DBPData, usePrevDBP, setUsePrevDBP }}>
      {children}
    </DBPContext.Provider>
  );
};

export const useDBPData = () => {
  const context = useContext(DBPContext);
  if (!context) {
    throw new Error("useDBPData must be used within a DBPContextProvider");
  }

  const { DBPData, usePrevDBP, setUsePrevDBP } = context;

  const getTeamDBPData = (team: string): TeamDBPDataItem[] => {
    const teamData: TeamDBPDataItem[] = [];

    Object.keys(DBPData).forEach((range) => {
      Object.keys(DBPData[range]).forEach((position) => {
        if (position === "ALL") return;

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

  return { getTeamDBPData, usePrevDBP, setUsePrevDBP };
};
