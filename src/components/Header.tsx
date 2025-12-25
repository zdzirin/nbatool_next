"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeToggle } from "@/components/ThemeToggle";
import { usePBPRosters } from "@/context/PBPContext";
import { useDBPData } from "@/context/DBPContext";

const PAGES = [
  { name: "Matchups", path: "/matchups" },
  { name: "League Defenses", path: "/league-defense" },
  { name: "Players", path: "/players" },
];

export function Header() {
  const pathname = usePathname();
  const { usePrevRosters, setUsePrevRosters } = usePBPRosters();
  const { usePrevDBP, setUsePrevDBP } = useDBPData();

  return (
    <header className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Image
            src="/nbatool-logo.svg"
            alt="NBAtool logo"
            width={40}
            height={40}
            className="shrink-0"
          />
          <h1 className="text-2xl font-bold text-foreground">
            NBAtool
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-foreground">
            <div className="flex items-center gap-2">
              <Checkbox
                id="usePrevRosters"
                checked={usePrevRosters}
                onCheckedChange={(checked) => setUsePrevRosters(checked === true)}
              />
              <label htmlFor="usePrevRosters" className="cursor-pointer whitespace-nowrap">
                Prev Rosters
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="usePrevDBP"
                checked={usePrevDBP}
                onCheckedChange={(checked) => setUsePrevDBP(checked === true)}
              />
              <label htmlFor="usePrevDBP" className="cursor-pointer whitespace-nowrap">
                Prev Defense
              </label>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <nav className="flex flex-wrap gap-2">
        {PAGES.map((page) => (
          <Link key={page.path} href={page.path}>
            <Button
              variant={pathname === page.path ? "default" : "outline"}
              size="sm"
            >
              {page.name}
            </Button>
          </Link>
        ))}
      </nav>
    </header>
  );
}
