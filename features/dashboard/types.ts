export type DashboardTotals = {
  netBalance: number;
  owedToYou: number;
  youOwe: number;
};

export type DashboardGroupPreview = {
  id: string;
  slug: string;
  name: string;
  memberCount: number;
  balance: number;
  icon: "house" | "plane" | "sparkles";
};

export type Activity = {
  id: string;
  person: string;
  initials: string;
  tone: "amber" | "green" | "indigo" | "rose";
  action: string;
  amount: number;
  createdAt: string;
};

export type DashboardScreenData = {
  viewer: {
    id: string;
    name: string;
    initials: string;
    role: string;
    city: string;
    since: string;
    memberSinceLabel: string;
  };
  totals: DashboardTotals;
  groupPreviews: DashboardGroupPreview[];
  recentActivities: Activity[];
  expenseHref: string;
  expenseLabel: string;
  createdGroupSlug?: string;
  createdGroupQuery?: string;
  flashMessage?: string;
  flashTone?: "success" | "info";
};
