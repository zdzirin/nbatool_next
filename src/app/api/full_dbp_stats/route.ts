import { NextRequest, NextResponse } from "next/server";
import { getDBPFull } from "@/lib/scraping/defensebyposition";
import { getYearForResults } from "@/lib/consts";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam) : getYearForResults();

  try {
    const data = await getDBPFull(year);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching DBP stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch defense by position data" },
      { status: 500 }
    );
  }
}
