export const PBP_PLAYER_DATA = [
  "player",
  "g",
  "mp",
  "pct_1",
  "pct_2",
  "pct_3",
  "pct_4",
  "pct_5",
  "plus_minus_on",
  "plus_minus_net",
];

export const DBP_INDEX_TO_STAT: Record<number, string> = {
  1: "pts",
  2: "reb",
  3: "ast",
  4: "tpm",
  5: "stl",
  6: "blk",
  7: "to",
};

export const ABBREVIATION_TO_TEAM: Record<string, string> = {
  ATL: "Atlanta Hawks",
  BOS: "Boston Celtics",
  BRK: "Brooklyn Nets",
  CHO: "Charlotte Hornets",
  CHI: "Chicago Bulls",
  CLE: "Cleveland Cavaliers",
  DAL: "Dallas Mavericks",
  DEN: "Denver Nuggets",
  DET: "Detroit Pistons",
  GSW: "Golden State Warriors",
  HOU: "Houston Rockets",
  IND: "Indiana Pacers",
  LAC: "Los Angeles Clippers",
  LAL: "Los Angeles Lakers",
  MEM: "Memphis Grizzlies",
  MIA: "Miami Heat",
  MIL: "Milwaukee Bucks",
  MIN: "Minnesota Timberwolves",
  NOP: "New Orleans Pelicans",
  NYK: "New York Knicks",
  OKC: "Oklahoma City Thunder",
  ORL: "Orlando Magic",
  PHI: "Philadelphia 76ers",
  PHO: "Phoenix Suns",
  POR: "Portland Trail Blazers",
  SAC: "Sacramento Kings",
  SAS: "San Antonio Spurs",
  TOR: "Toronto Raptors",
  UTA: "Utah Jazz",
  WAS: "Washington Wizards",
};

export const TEAM_TO_ABBREVIATION: Record<string, string> = {
  "Atlanta Hawks": "ATL",
  "Boston Celtics": "BOS",
  "Brooklyn Nets": "BRK",
  "Charlotte Hornets": "CHO",
  "Chicago Bulls": "CHI",
  "Cleveland Cavaliers": "CLE",
  "Dallas Mavericks": "DAL",
  "Denver Nuggets": "DEN",
  "Detroit Pistons": "DET",
  "Golden State Warriors": "GSW",
  "Houston Rockets": "HOU",
  "Indiana Pacers": "IND",
  "Los Angeles Clippers": "LAC",
  "Los Angeles Lakers": "LAL",
  "Memphis Grizzlies": "MEM",
  "Miami Heat": "MIA",
  "Milwaukee Bucks": "MIL",
  "Minnesota Timberwolves": "MIN",
  "New Orleans Pelicans": "NOP",
  "New York Knicks": "NYK",
  "Oklahoma City Thunder": "OKC",
  "Orlando Magic": "ORL",
  "Philadelphia 76ers": "PHI",
  "Phoenix Suns": "PHO",
  "Portland Trail Blazers": "POR",
  "Sacramento Kings": "SAC",
  "San Antonio Spurs": "SAS",
  "Toronto Raptors": "TOR",
  "Utah Jazz": "UTA",
  "Washington Wizards": "WAS",
};

export const colors = {
  logo_pale: "#D0B9AC",
  logo_brown: "#553D38",
  logo_orange: "#D54F42",
  green: "#0B6E4F",
  yellow_orange: "#E6A340",
  almostWhite: "#e7e0da",
};

export const getYearForResults = (): number => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  return currentMonth >= 9 ? currentYear + 1 : currentYear;
};

export const TEAM_SELECT_DATA = Object.keys(ABBREVIATION_TO_TEAM).map((abbr) => ({
  name: ABBREVIATION_TO_TEAM[abbr],
  value: abbr,
}));

export const TEAMS = Object.keys(ABBREVIATION_TO_TEAM);
