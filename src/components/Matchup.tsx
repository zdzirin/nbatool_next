"use client";

import { useState, useEffect } from "react";
import { TeamSelect } from "./TeamSelect";
import PBPRoster from "./PBPRoster";
import DBPStats from "./DBPStats";
import { Gamelog } from "./Gamelog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ABBREVIATION_TO_TEAM } from "@/lib/consts";

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

interface SelectedPlayer {
    name: string;
    id: string;
}

interface MatchupProps {
    remove: () => void;
}

export function Matchup({ remove }: MatchupProps) {
    const [teamA, setTeamA] = useState<string>("");
    const [teamB, setTeamB] = useState<string>("");
    const [selectedPlayer, setSelectedPlayer] = useState<SelectedPlayer | null>(
        null,
    );
    const isDesktop = useMediaQuery("(min-width: 1024px)");

    const teamAName = teamA ? ABBREVIATION_TO_TEAM[teamA] : "Team A";
    const teamBName = teamB ? ABBREVIATION_TO_TEAM[teamB] : "Team B";

    const isOpen = !!selectedPlayer?.id;
    const onClose = () => setSelectedPlayer(null);

    return (
        <Card className="mb-6 bg-card/80">
            {/* Desktop: Dialog */}
            {isDesktop ? (
                <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
                                closeModal={onClose}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            ) : (
                /* Mobile: Drawer */
                <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
                                    closeModal={onClose}
                                />
                            )}
                        </div>
                    </DrawerContent>
                </Drawer>
            )}

            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Matchup</CardTitle>
                <Button variant="destructive" size="sm" onClick={remove}>
                    Remove Matchup
                </Button>
            </CardHeader>

            <CardContent>
                <div className="flex justify-around gap-4 mb-6 flex-wrap">
                    <TeamSelect value={teamA} onChange={setTeamA} />
                    <TeamSelect value={teamB} onChange={setTeamB} />
                </div>

                {teamA && teamB && (
                    <>
                        {/* Mobile: Tabs Layout */}
                        <div className="lg:hidden">
                            <Tabs defaultValue="teamA-roster" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger value="teamA-roster" className="text-xs">
                                        {teamA} Roster
                                    </TabsTrigger>
                                    <TabsTrigger value="teamB-defense" className="text-xs">
                                        vs {teamB} Def
                                    </TabsTrigger>
                                </TabsList>
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger value="teamB-roster" className="text-xs">
                                        {teamB} Roster
                                    </TabsTrigger>
                                    <TabsTrigger value="teamA-defense" className="text-xs">
                                        vs {teamA} Def
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="teamA-roster">
                                    <Card className="bg-card/50">
                                        <CardContent className="pt-4">
                                            <PBPRoster
                                                team={teamA}
                                                setSelectedPlayer={setSelectedPlayer}
                                                constrain
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="teamB-defense">
                                    <Card className="bg-card/50">
                                        <CardContent className="pt-4">
                                            <DBPStats team={teamB} />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="teamB-roster">
                                    <Card className="bg-card/50">
                                        <CardContent className="pt-4">
                                            <PBPRoster
                                                team={teamB}
                                                setSelectedPlayer={setSelectedPlayer}
                                                constrain
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="teamA-defense">
                                    <Card className="bg-card/50">
                                        <CardContent className="pt-4">
                                            <DBPStats team={teamA} />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Desktop: Grid Layout */}
                        <div className="hidden lg:block">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <Card className="bg-card/50">
                                    <CardContent className="pt-4">
                                        <PBPRoster
                                            team={teamA}
                                            setSelectedPlayer={setSelectedPlayer}
                                            constrain
                                        />
                                    </CardContent>
                                </Card>
                                <Card className="bg-card/50">
                                    <CardContent className="pt-4">
                                        <DBPStats team={teamB} />
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Card className="bg-card/50">
                                    <CardContent className="pt-4">
                                        <PBPRoster
                                            team={teamB}
                                            setSelectedPlayer={setSelectedPlayer}
                                            constrain
                                        />
                                    </CardContent>
                                </Card>
                                <Card className="bg-card/50">
                                    <CardContent className="pt-4">
                                        <DBPStats team={teamA} />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
