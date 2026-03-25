import type {
  MonthlyBalance,
  ReportCategory,
  ReportsOverviewTotals,
  ReportsScreenData,
} from "@/features/reports/types";
import { mockCurrentViewer } from "@/features/viewer/data/mock-viewer";

export const mockMonthlyBalances: MonthlyBalance[] = [
  { month: "JAN", value: 920, tone: "muted" },
  { month: "MAR", value: 1680, tone: "green" },
  { month: "MAY", value: -1430, tone: "rose" },
  { month: "JUL", value: 1180, tone: "soft" },
];

export const mockReportCategories: ReportCategory[] = [
  {
    name: "Moradia",
    share: 42,
    note: "Maior concentração",
    tone: "indigo",
    amount: 1764,
  },
  {
    name: "Viagens",
    share: 27,
    note: "Subindo este mês",
    tone: "green",
    amount: 1134,
  },
  {
    name: "Jantares",
    share: 20,
    note: "Pico no último feriado",
    tone: "rose",
    amount: 840,
  },
  {
    name: "Diversos",
    share: 11,
    note: "Itens ocasionais",
    tone: "amber",
    amount: 462,
  },
];

export const mockReportsOverviewTotals: ReportsOverviewTotals = {
  owedToYou: 2140,
  youOwe: 657.5,
  totalExpenses: 4200,
  pendingSettlementTotal: 1482.5,
  pendingGroupCount: 2,
};

type ReportsScenario = "default" | "new";

export function getMockReportsScreenData(
  scenario: ReportsScenario = "default",
): ReportsScreenData {
  const isNewScenario = scenario === "new";

  return {
    viewer: mockCurrentViewer,
    totals: isNewScenario
      ? {
          owedToYou: 0,
          youOwe: 0,
          totalExpenses: 0,
          pendingSettlementTotal: 0,
          pendingGroupCount: 0,
        }
      : mockReportsOverviewTotals,
    monthlyBalances: isNewScenario ? [] : mockMonthlyBalances,
    reportCategories: isNewScenario ? [] : mockReportCategories,
    historyItems: [],
    availableGroups: [],
    selectedRangeDays: 90,
  };
}
