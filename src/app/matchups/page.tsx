"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Matchup, SelectedPlayer } from "@/components/Matchup";
import { Gamelog } from "@/components/Gamelog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";

interface MatchupData {
    id: number;
    teamA: string;
    teamB: string;
}

function parseMatchupsFromURL(param: string | null): MatchupData[] {
    if (!param) return [{ id: 0, teamA: "", teamB: "" }];

    const matchups = param.split(",").map((m, i) => {
        const [teamA, teamB] = m.split("-");
        return {
            id: i,
            teamA: teamA || "",
            teamB: teamB || "",
        };
    });

    return matchups.length > 0 ? matchups : [{ id: 0, teamA: "", teamB: "" }];
}

function parsePlayerFromURL(param: string | null): SelectedPlayer | null {
    if (!param) return null;
    const [id, ...nameParts] = param.split("_");
    const name = nameParts.join("_");
    if (id && name) {
        return { id, name: decodeURIComponent(name) };
    }
    return null;
}

function serializeMatchupsToURL(matchups: MatchupData[]): string {
    const filtered = matchups.filter((m) => m.teamA || m.teamB);
    if (filtered.length === 0) return "";
    return filtered.map((m) => `${m.teamA}-${m.teamB}`).join(",");
}

function serializePlayerToURL(player: SelectedPlayer | null): string {
    if (!player) return "";
    return `${player.id}_${encodeURIComponent(player.name)}`;
}

function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        setMatches(media.matches);

        const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [query]);

    return matches;
}

export default function MatchupsPage() {
    const searchParams = useSearchParams();
    const [matchups, setMatchups] = useState<MatchupData[]>(() =>
        parseMatchupsFromURL(searchParams.get("m")),
    );
    const [selectedPlayer, setSelectedPlayer] = useState<SelectedPlayer | null>(
        () => parsePlayerFromURL(searchParams.get("p")),
    );
    const isDesktop = useMediaQuery("(min-width: 1024px)");

    const updateURL = (
        newMatchups: MatchupData[],
        newPlayer: SelectedPlayer | null,
    ) => {
        const newParams = new URLSearchParams(window.location.search);

        const serializedMatchups = serializeMatchupsToURL(newMatchups);
        if (serializedMatchups) {
            newParams.set("m", serializedMatchups);
        } else {
            newParams.delete("m");
        }

        const serializedPlayer = serializePlayerToURL(newPlayer);
        if (serializedPlayer) {
            newParams.set("p", serializedPlayer);
        } else {
            newParams.delete("p");
        }

        const paramString = newParams.toString();
        const newURL = paramString ? `/matchups?${paramString}` : "/matchups";
        window.history.replaceState(null, "", newURL);
    };

    const addMatchup = () => {
        setMatchups([...matchups, { id: Date.now(), teamA: "", teamB: "" }]);
    };

    const removeMatchup = (id: number) => {
        const newMatchups = matchups.filter((m) => m.id !== id);
        const result =
            newMatchups.length > 0
                ? newMatchups
                : [{ id: Date.now(), teamA: "", teamB: "" }];
        setMatchups(result);
        updateURL(result, selectedPlayer);
    };

    const updateTeamA = (id: number, teamA: string) => {
        const newMatchups = matchups.map((m) =>
            m.id === id ? { ...m, teamA } : m,
        );
        setMatchups(newMatchups);
        updateURL(newMatchups, selectedPlayer);
    };

    const updateTeamB = (id: number, teamB: string) => {
        const newMatchups = matchups.map((m) =>
            m.id === id ? { ...m, teamB } : m,
        );
        setMatchups(newMatchups);
        updateURL(newMatchups, selectedPlayer);
    };

    const handleSelectPlayer = (player: SelectedPlayer) => {
        setSelectedPlayer(player);
        updateURL(matchups, player);
    };

    const handleClosePlayer = () => {
        setSelectedPlayer(null);
        updateURL(matchups, null);
    };

    const isOpen = !!selectedPlayer?.id;

    return (
        <div className="w-full">
            {/* Desktop: Dialog */}
            {isDesktop ? (
                <Dialog
                    open={isOpen}
                    onOpenChange={(open) => !open && handleClosePlayer()}
                >
                    <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {selectedPlayer?.name} Gamelog
                            </DialogTitle>
                        </DialogHeader>
                        {selectedPlayer && (
                            <Gamelog
                                id={selectedPlayer.id}
                                name={selectedPlayer.name}
                                closeModal={handleClosePlayer}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            ) : (
                /* Mobile: Drawer */
                <Drawer
                    open={isOpen}
                    onOpenChange={(open) => !open && handleClosePlayer()}
                >
                    <DrawerContent className="max-h-[90vh]">
                        <DrawerHeader>
                            <DrawerTitle>
                                {selectedPlayer?.name} Gamelog
                            </DrawerTitle>
                        </DrawerHeader>
                        <div className="overflow-auto px-4 pb-4">
                            {selectedPlayer && (
                                <Gamelog
                                    id={selectedPlayer.id}
                                    name={selectedPlayer.name}
                                    closeModal={handleClosePlayer}
                                />
                            )}
                        </div>
                    </DrawerContent>
                </Drawer>
            )}

            <div className="flex justify-end mb-4">
                <Button onClick={addMatchup} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Matchup
                </Button>
            </div>

            {matchups.map((m) => (
                <Matchup
                    key={m.id}
                    remove={() => removeMatchup(m.id)}
                    teamA={m.teamA}
                    teamB={m.teamB}
                    onTeamAChange={(team) => updateTeamA(m.id, team)}
                    onTeamBChange={(team) => updateTeamB(m.id, team)}
                    onSelectPlayer={handleSelectPlayer}
                />
            ))}

            <Button onClick={addMatchup} className="mt-2">
                <Plus className="w-4 h-4 mr-1" />
                Add Matchup
            </Button>
        </div>
    );
}
