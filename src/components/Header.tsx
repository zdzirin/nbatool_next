"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Layers, Shield, Users, type LucideIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { usePBPRosters } from "@/context/PBPContext";
import { useDBPData } from "@/context/DBPContext";
import { getYearForResults, seasonLabel } from "@/lib/consts";

const PAGES = [
  { name: "Matchups", path: "/matchups" },
  { name: "League Defenses", path: "/league-defense" },
  { name: "Players", path: "/players" },
];

type PrevDataScope = "none" | "all" | "rosters" | "defense";

const CURRENT_SEASON = seasonLabel(getYearForResults());
const PREV_SEASON = seasonLabel(getYearForResults() - 1);

const SEASON_OPTIONS: { value: PrevDataScope; label: string; Icon: LucideIcon }[] = [
  { value: "none", label: CURRENT_SEASON, Icon: CalendarDays },
  { value: "all", label: PREV_SEASON, Icon: Layers },
  { value: "rosters", label: `${PREV_SEASON} rosters`, Icon: Users },
  { value: "defense", label: `${PREV_SEASON} defense`, Icon: Shield },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { usePrevRosters, setUsePrevRosters } = usePBPRosters();
  const { usePrevDBP, setUsePrevDBP } = useDBPData();

  const prevDataScope: PrevDataScope =
    usePrevRosters && usePrevDBP
      ? "all"
      : usePrevRosters
        ? "rosters"
        : usePrevDBP
          ? "defense"
          : "none";

  const setPrevDataScope = (scope: PrevDataScope) => {
    setUsePrevRosters(scope === "all" || scope === "rosters");
    setUsePrevDBP(scope === "all" || scope === "defense");
  };

  return (
    <header className="mb-6 flex items-center gap-3 sm:gap-4">
      <div className="mr-auto flex shrink-0 items-center gap-3">
        <Image
          src="/nbatool-logo.svg"
          alt="NBAtool logo"
          width={40}
          height={40}
          className="shrink-0"
        />
        {/* Hidden on phones to keep the header on one line; still read by screen readers */}
        <h1 className="sr-only text-2xl font-bold text-foreground sm:not-sr-only">
          NBAtool
        </h1>
      </div>

      {/* On phones the selects shrink to share the space left by the logo */}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:flex-none">
        <Select
          value={PAGES.find((p) => p.path === pathname)?.path ?? "/matchups"}
          onValueChange={(path) => router.push(path)}
        >
          <SelectTrigger aria-label="Page" className="min-w-0 px-2 sm:px-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGES.map((page) => (
              <SelectItem key={page.path} value={page.path}>
                {page.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={prevDataScope}
          onValueChange={(scope) => setPrevDataScope(scope as PrevDataScope)}
        >
          <SelectTrigger aria-label="Season data" className="min-w-0 px-2 sm:px-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEASON_OPTIONS.map(({ value, label, Icon }) => (
              <SelectItem key={value} value={value}>
                <Icon />
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ThemeToggle />
      </div>
    </header>
  );
}
