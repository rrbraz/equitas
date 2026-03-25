import "server-only";

import type {
  Activity,
  DashboardGroupPreview,
  DashboardScreenData,
} from "@/features/dashboard/types";
import { queryCurrentUserGroups } from "@/features/groups/data/query-current-user-groups";
import { getDashboardGroupIcon } from "@/features/groups/lib/group-categories";
import { getCurrentViewer } from "@/features/profile/data/get-current-viewer";
import { queryReportingDataset } from "@/features/reports/data/query-reporting-dataset";

function formatRelativeDate(dateString: string) {
  const timestamp = new Date(dateString).getTime();
  const diffInMinutes = Math.round((timestamp - Date.now()) / 60000);
  const formatter = new Intl.RelativeTimeFormat("pt-BR", {
    numeric: "auto",
  });

  const absDiff = Math.abs(diffInMinutes);

  if (absDiff < 60) {
    return formatter.format(Math.round(diffInMinutes), "minute");
  }

  if (absDiff < 60 * 24) {
    return formatter.format(Math.round(diffInMinutes / 60), "hour");
  }

  return formatter.format(Math.round(diffInMinutes / (60 * 24)), "day");
}

export async function getDashboardScreenData(): Promise<DashboardScreenData> {
  const [viewer, { userId, groups }] = await Promise.all([
    getCurrentViewer(),
    queryCurrentUserGroups("/dashboard"),
  ]);
  const dataset = await queryReportingDataset({
    userId,
    viewerInitials: viewer.initials,
    groups,
    rangeDays: 90,
    limit: 5,
  });

  const groupPreviews: DashboardGroupPreview[] = groups
    .slice()
    .sort((left, right) => Math.abs(right.balance) - Math.abs(left.balance))
    .slice(0, 3)
    .map((group) => ({
      id: group.id,
      slug: group.slug,
      name: group.name,
      memberCount: group.memberCount,
      balance: group.balance,
      icon: getDashboardGroupIcon(group.categorySlug),
    }));
  const owedToYou = groups.reduce(
    (total, group) => total + Math.max(group.balance, 0),
    0,
  );
  const youOwe = groups.reduce(
    (total, group) => total + Math.abs(Math.min(group.balance, 0)),
    0,
  );
  const recentActivities: Activity[] = dataset.historyItems.map((item) => ({
    id: item.id,
    person: item.person,
    initials: item.initials,
    tone: item.tone,
    action: item.action,
    amount: item.amount,
    createdAt: formatRelativeDate(item.occurredAt),
  }));

  return {
    viewer,
    totals: {
      netBalance: owedToYou - youOwe,
      owedToYou,
      youOwe,
    },
    groupCount: groups.length,
    pendingCount: groups.filter((group) => group.balance < 0).length,
    recentActivityCount: recentActivities.length,
    groupPreviews,
    recentActivities,
    expenseHref: groups.length > 0 ? "/grupos" : "/grupos/criar",
    expenseLabel: groups.length > 0 ? "Escolher grupo" : "Criar primeiro grupo",
  };
}
