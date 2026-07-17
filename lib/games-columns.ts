export interface GamesMetricColumn {
  key: string;
  label: string;
}

export const GAMES_METRIC_COLUMNS: GamesMetricColumn[] = [
  { key: "rankChange", label: "Rank Change" },
  { key: "visits", label: "Visits" },
  { key: "favorites", label: "Favorites" },
  { key: "upVotes", label: "Up Votes" },
  { key: "downVotes", label: "Down Votes" },
  { key: "genre", label: "Genre" },
  { key: "created", label: "Created" },
];

export const DEFAULT_GAMES_METRIC_COLUMNS = ["rankChange", "visits"];
