import type {
  Activity,
  DashboardGroupPreview,
  DashboardScreenData,
  DashboardTotals,
} from "@/features/dashboard/types";
import type { Group } from "@/features/groups/types";
import { mockCurrentViewer } from "@/features/viewer/data/mock-viewer";

export const mockDashboardTotals: DashboardTotals = {
  netBalance: 1482.5,
  owedToYou: 2140,
  youOwe: 657.5,
};

export const mockRecentActivities: Activity[] = [
  {
    id: "act-1",
    person: "Julian D.",
    initials: "JD",
    tone: "green",
    action: 'adicionou "Whole Foods"',
    amount: -45.12,
    createdAt: "2h atrás",
  },
  {
    id: "act-2",
    person: "Sarah K.",
    initials: "SK",
    tone: "amber",
    action: "pagou a sua parte",
    amount: 85,
    createdAt: "Ontem",
  },
  {
    id: "act-3",
    person: "Marcus L.",
    initials: "ML",
    tone: "rose",
    action: 'criou o grupo "Design Sprint"',
    amount: 0,
    createdAt: "2 dias atrás",
  },
];

export const mockDashboardGroupPreviews: DashboardGroupPreview[] = [
  {
    id: "group-rio",
    slug: "viagem-rio",
    name: "Viagem Rio",
    memberCount: 4,
    balance: 450,
    icon: "plane",
  },
  {
    id: "group-casa",
    slug: "aluguel-casa",
    name: "Aluguel Casa",
    memberCount: 3,
    balance: 0,
    icon: "house",
  },
];

function getDashboardGroupPreview(group: Group): DashboardGroupPreview {
  return {
    id: group.id,
    slug: group.slug,
    name: group.name,
    memberCount: group.memberCount,
    balance: group.balance,
    icon: "sparkles",
  };
}

type DashboardScenario = "default" | "new";

export function getMockDashboardScreenData(
  scenario: DashboardScenario = "default",
  createdGroup?: Group,
  createdGroupQuery?: string,
): DashboardScreenData {
  const isNewJourney = scenario === "new";
  const groupPreviews = isNewJourney ? [] : mockDashboardGroupPreviews;
  const recentActivities = isNewJourney ? [] : mockRecentActivities;

  return {
    viewer: mockCurrentViewer,
    totals: isNewJourney
      ? { netBalance: 0, owedToYou: 0, youOwe: 0 }
      : mockDashboardTotals,
    groupPreviews: createdGroup
      ? [
          getDashboardGroupPreview(createdGroup),
          ...groupPreviews.filter((group) => group.slug !== createdGroup.slug),
        ]
      : groupPreviews,
    recentActivities: createdGroup
      ? [
          {
            id: `act-created-${createdGroup.slug}`,
            person: "Você",
            initials: mockCurrentViewer.initials,
            tone: "amber",
            action: `criou o grupo "${createdGroup.name}"`,
            amount: 0,
            createdAt: "Agora",
          },
          ...recentActivities,
        ]
      : recentActivities,
    expenseHref: isNewJourney ? "/grupos/criar" : "/grupos",
    expenseLabel: isNewJourney ? "Criar primeiro grupo" : "Escolher grupo",
    createdGroupSlug: createdGroup?.slug,
    createdGroupQuery,
  };
}
