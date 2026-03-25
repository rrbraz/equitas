import "server-only";

import type { ReportsScreenData } from "@/features/reports/types";
import { queryReportingDataset } from "@/features/reports/data/query-reporting-dataset";
import { queryCurrentUserGroups } from "@/features/groups/data/query-current-user-groups";
import { getCurrentViewer } from "@/features/profile/data/get-current-viewer";

type GetReportsScreenDataInput = {
  rangeDays: 30 | 90;
  groupSlug?: string;
};

export async function getReportsScreenData({
  rangeDays,
  groupSlug,
}: GetReportsScreenDataInput): Promise<ReportsScreenData> {
  const [viewer, { userId, groups }] = await Promise.all([
    getCurrentViewer(),
    queryCurrentUserGroups("/relatorios"),
  ]);
  const selectedGroupSlug = groups.some((group) => group.slug === groupSlug)
    ? groupSlug
    : undefined;
  const dataset = await queryReportingDataset({
    userId,
    viewerInitials: viewer.initials,
    groups,
    rangeDays,
    groupSlug: selectedGroupSlug,
  });
  const totals = groups.reduce(
    (accumulator, group) => ({
      owedToYou: accumulator.owedToYou + Math.max(group.balance, 0),
      youOwe: accumulator.youOwe + Math.abs(Math.min(group.balance, 0)),
    }),
    {
      owedToYou: 0,
      youOwe: 0,
    },
  );

  return {
    viewer,
    totals: {
      ...totals,
      totalExpenses: dataset.totalExpenses,
      pendingSettlementTotal: dataset.pendingSettlementTotal,
      pendingGroupCount: dataset.pendingGroupCount,
    },
    monthlyBalances: dataset.monthlyBalances,
    reportCategories: dataset.reportCategories,
    historyItems: dataset.historyItems,
    availableGroups: groups.map((group) => ({
      slug: group.slug,
      name: group.name,
    })),
    selectedGroupSlug,
    selectedRangeDays: rangeDays,
  };
}
