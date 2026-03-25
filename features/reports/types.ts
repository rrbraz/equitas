import type { Viewer } from "@/features/viewer/types";

export type ReportCategory = {
  name: string;
  share: number;
  note: string;
  tone: "indigo" | "green" | "rose" | "amber";
  amount: number;
};

export type MonthlyBalance = {
  month: string;
  value: number;
  tone: "muted" | "green" | "rose" | "soft";
};

export type ReportsOverviewTotals = {
  owedToYou: number;
  youOwe: number;
  totalExpenses: number;
  pendingSettlementTotal: number;
  pendingGroupCount: number;
};

export type ReportHistoryItem = {
  id: string;
  groupSlug: string;
  groupName: string;
  kind: "expense" | "settlement";
  person: string;
  initials: string;
  tone: "amber" | "indigo" | "green" | "rose";
  action: string;
  amount: number;
  occurredAt: string;
  occurredAtLabel: string;
};

export type ReportGroupOption = {
  slug: string;
  name: string;
};

export type ReportsScreenData = {
  viewer: Viewer;
  totals: ReportsOverviewTotals;
  monthlyBalances: MonthlyBalance[];
  reportCategories: ReportCategory[];
  historyItems: ReportHistoryItem[];
  availableGroups: ReportGroupOption[];
  selectedGroupSlug?: string;
  selectedRangeDays: 30 | 90;
};
