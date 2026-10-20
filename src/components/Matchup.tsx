"use client";

import { TeamSelect } from "./TeamSelect";
import PBPRoster from "./PBPRoster";
import DBPStats from "./DBPStats";
import { PropTargets } from "./PropTargets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2 } from "lucide-react";

export interface SelectedPlayer {
    name: string;
    id: string;
}

interface MatchupProps {
    remove: () => void;
    teamA: string;
    teamB: string;
    onTeamAChange: (team: string) => void;
    onTeamBChange: (team: string) => void;
    onSelectPlayer: (player: SelectedPlayer) => void;
}

export function Matchup({
    remove,
    teamA,
    teamB,
    onTeamAChange,
    onTeamBChange,
    onSelectPlayer,
}: MatchupProps) {
    return (
        // Full bleed on mobile: cancel the page gutter and drop the side
        // borders/radius to give the tables more width
        <Card className="-mx-4 mb-6 rounded-none border-x-0 bg-card/80 sm:mx-0 sm:rounded-xl sm:border-x">
            <CardHeader className="flex flex-row items-center justify-between px-3 sm:px-6">
                <CardTitle className="flex items-center gap-2">
                    <TeamSelect compact value={teamA} onChange={onTeamAChange} />
                    <span className="font-normal text-muted-foreground">v</span>
                    <TeamSelect compact value={teamB} onChange={onTeamBChange} />
                </CardTitle>
                <Button variant="destructive" size="icon" onClick={remove}>
                    <Trash2 />
                </Button>
            </CardHeader>

            <CardContent className="px-3 sm:px-6">
                {teamA && teamB && (
                    <>
                        {/* Highlighted Plays - Collapsible */}
                        <PropTargets
                            teamA={teamA}
                            teamB={teamB}
                            setSelectedPlayer={onSelectPlayer}
                        />

                        {/* Mobile: Tabs Layout */}
                        <div className="lg:hidden">
                            <Tabs
                                defaultValue="teamA-roster"
                                className="w-full"
                            >
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger
                                        value="teamA-roster"
                                        className="text-xs"
                                    >
                                        {teamA} Roster
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="teamB-defense"
                                        className="text-xs"
                                    >
                                        vs {teamB} Def
                                    </TabsTrigger>
                                </TabsList>
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger
                                        value="teamB-roster"
                                        className="text-xs"
                                    >
                                        {teamB} Roster
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="teamA-defense"
                                        className="text-xs"
                                    >
                                        vs {teamA} Def
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="teamA-roster">
                                    <Card className="bg-card/50">
                                        <CardContent className="px-3 sm:px-6">
                                            <PBPRoster
                                                team={teamA}
                                                setSelectedPlayer={
                                                    onSelectPlayer
                                                }
                                                constrain
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="teamB-defense">
                                    <Card className="bg-card/50">
                                        <CardContent className="px-3 sm:px-6">
                                            <DBPStats team={teamB} />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="teamB-roster">
                                    <Card className="bg-card/50">
                                        <CardContent className="px-3 sm:px-6">
                                            <PBPRoster
                                                team={teamB}
                                                setSelectedPlayer={
                                                    onSelectPlayer
                                                }
                                                constrain
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="teamA-defense">
                                    <Card className="bg-card/50">
                                        <CardContent className="px-3 sm:px-6">
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
                                    <CardContent>
                                        <PBPRoster
                                            team={teamA}
                                            setSelectedPlayer={onSelectPlayer}
                                            constrain
                                        />
                                    </CardContent>
                                </Card>
                                <Card className="bg-card/50">
                                    <CardContent>
                                        <DBPStats team={teamB} />
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Card className="bg-card/50">
                                    <CardContent>
                                        <PBPRoster
                                            team={teamB}
                                            setSelectedPlayer={onSelectPlayer}
                                            constrain
                                        />
                                    </CardContent>
                                </Card>
                                <Card className="bg-card/50">
                                    <CardContent>
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
