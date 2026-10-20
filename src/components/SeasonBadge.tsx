import { Badge } from "@/components/ui/badge";
import { colors } from "@/lib/consts";

interface SeasonBadgeProps {
  season: string;
  requestedSeason: string;
  // What the data is, for the tooltip, e.g. "defense"
  dataName: string;
}

// Shows the season a card's data comes from, flagged when the requested
// season isn't available yet and an older one is shown instead
export function SeasonBadge({ season, requestedSeason, dataName }: SeasonBadgeProps) {
  if (!season) return null;

  if (season === requestedSeason) {
    return (
      <span className="text-sm font-normal text-muted-foreground">
        {season}
      </span>
    );
  }

  return (
    <Badge
      variant="outline"
      style={{ borderColor: colors.yellow_orange, color: colors.yellow_orange }}
      title={`${requestedSeason} ${dataName} data isn't available yet, so this is the full ${season} season`}
    >
      {season} data ({requestedSeason} not available yet)
    </Badge>
  );
}
