export type ReportCategory = {
  name: string;
  share: number;
  note: string;
  tone: "indigo" | "green" | "rose" | "amber";
};

export type MonthlyBalance = {
  month: string;
  value: number;
  tone: "muted" | "green" | "rose" | "soft";
};

export type ReportsOverviewTotals = {
  owedToYou: number;
  youOwe: number;
};

export type ReportsScreenData = {
  viewer: {
    id: string;
    name: string;
    initials: string;
    role: string;
    city: string;
    since: string;
    memberSinceLabel: string;
  };
  totals: ReportsOverviewTotals;
  monthlyBalances: MonthlyBalance[];
  reportCategories: ReportCategory[];
};
