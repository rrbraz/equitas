import "server-only";

import { getCurrentViewer } from "@/features/profile/data/get-current-viewer";
import {
  getGroupCategoryLabel,
  getGroupTone,
} from "@/features/groups/lib/group-categories";
import type { Group } from "@/features/groups/types";
import { queryCurrentUserGroups } from "@/features/groups/data/query-current-user-groups";

export async function getGroupsScreenData() {
  const [viewer, { groups }] = await Promise.all([
    getCurrentViewer(),
    queryCurrentUserGroups(),
  ]);

  return {
    viewer,
    groups: groups.map(
      (group): Group => ({
        id: group.id,
        slug: group.slug,
        name: group.name,
        tone: getGroupTone(group.categorySlug),
        category: getGroupCategoryLabel(group.categorySlug),
        memberCount: group.memberCount,
        balance: group.balance,
        totalSpend: 0,
        description: group.description,
        trend: "Real",
        members: [],
        expenses: [],
        settlements: [],
      }),
    ),
    quickStartContacts: [],
  };
}
