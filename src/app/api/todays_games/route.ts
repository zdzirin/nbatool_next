import { NextResponse } from "next/server";
import { getTodaysGames } from "@/lib/schedule";

export async function GET() {
  try {
    const games = await getTodaysGames();
    // Live games change status, so only cache briefly
    return NextResponse.json(games, {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  } catch (error) {
    console.error("Error fetching today's games:", error);
    return NextResponse.json(
      { error: "Failed to fetch today's games" },
      { status: 500 }
    );
  }
}
