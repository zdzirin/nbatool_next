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
        <Card className="mb-6 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Matchup</CardTitle>
                <Button variant="destructive" size="icon" onClick={remove}>
                    <Trash2 />
                </Button>
            </CardHeader>

            <CardContent>
                <div className="flex justify-around gap-4 mb-6 flex-wrap">
                    <TeamSelect value={teamA} onChange={onTeamAChange} />
                    <TeamSelect value={teamB} onChange={onTeamBChange} />
                </div>

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
                                        <CardContent className="pt-4">
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
                                            setSelectedPlayer={onSelectPlayer}
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
                                            setSelectedPlayer={onSelectPlayer}
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
