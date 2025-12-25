import { NextRequest, NextResponse } from "next/server";
import { getGameLogByPlayer } from "@/lib/scraping/gamelogs";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ player: string }> },
) {
    const { player } = await params;

    try {
        console.log("getting gamelog for", player);
        const data = await getGameLogByPlayer(player);
        return NextResponse.json(data);
    } catch (error) {
        console.error(`Error fetching gamelog for ${player}:`, error);
        return NextResponse.json(
            { error: `Failed to fetch gamelog for ${player}` },
            { status: 500 },
        );
    }
}
