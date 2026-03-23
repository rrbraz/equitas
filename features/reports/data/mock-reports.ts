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
  { name: "Moradia", share: 42, note: "Maior concentração", tone: "indigo" },
  { name: "Viagens", share: 27, note: "Subindo este mês", tone: "green" },
  { name: "Jantares", share: 20, note: "Pico no último feriado", tone: "rose" },
  { name: "Diversos", share: 11, note: "Itens ocasionais", tone: "amber" },
];

export const mockReportsOverviewTotals: ReportsOverviewTotals = {
  owedToYou: 2140,
  youOwe: 657.5,
};

export function getMockReportsScreenData(): ReportsScreenData {
  return {
    viewer: mockCurrentViewer,
    totals: mockReportsOverviewTotals,
    monthlyBalances: mockMonthlyBalances,
    reportCategories: mockReportCategories,
  };
}
