import { NextRequest, NextResponse } from "next/server";
import { getLeaguePBPRoster } from "@/lib/scraping/pbproster";
import { getYearForResults } from "@/lib/consts";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam) : getYearForResults();

  try {
    const data = await getLeaguePBPRoster(year);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching PBP roster:", error);
    return NextResponse.json(
      { error: "Failed to fetch PBP roster data" },
      { status: 500 }
    );
  }
}
