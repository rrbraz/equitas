import "server-only";

import { redirect } from "next/navigation";

import type { UserGroupSummary } from "@/features/groups/types";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

type GroupRow = {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  description: string | null;
  created_at: string;
};

type GroupMemberRow = {
  group_id: string;
};

type GroupBalanceRow = {
  group_id: string;
  balance: number;
};

export async function queryCurrentUserGroups(nextPath = "/grupos"): Promise<{
  userId: string;
  groups: UserGroupSummary[];
}> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("id, slug, name, category_slug, description, created_at")
    .order("created_at", { ascending: false });

  if (groupsError) {
    throw groupsError;
  }

  if (!groups || groups.length === 0) {
    return {
      userId: user.id,
      groups: [],
    };
  }

  const groupIds = groups.map((group) => group.id);
  const [
    { data: members, error: membersError },
    { data: balances, error: balancesError },
  ] = await Promise.all([
    supabase.from("group_members").select("group_id").in("group_id", groupIds),
    supabase
      .from("group_balance_snapshot")
      .select("group_id, balance")
      .eq("profile_id", user.id)
      .in("group_id", groupIds),
  ]);

  if (membersError) {
    throw membersError;
  }

  if (balancesError) {
    throw balancesError;
  }

  const memberCountByGroupId = new Map<string, number>();
  const viewerBalanceByGroupId = new Map<string, number>();

  const memberRows = (members ?? []) as GroupMemberRow[];
  const balanceRows = (balances ?? []) as GroupBalanceRow[];

  memberRows.forEach((member) => {
    memberCountByGroupId.set(
      member.group_id,
      (memberCountByGroupId.get(member.group_id) ?? 0) + 1,
    );
  });

  balanceRows.forEach((balanceRow) => {
    viewerBalanceByGroupId.set(balanceRow.group_id, Number(balanceRow.balance));
  });

  return {
    userId: user.id,
    groups: ((groups ?? []) as GroupRow[]).map((group) => ({
      id: group.id,
      slug: group.slug,
      name: group.name,
      categorySlug: group.category_slug,
      description:
        group.description?.trim() ||
        "Grupo criado para organizar despesas compartilhadas.",
      memberCount: memberCountByGroupId.get(group.id) ?? 0,
      balance: viewerBalanceByGroupId.get(group.id) ?? 0,
      createdAt: group.created_at,
    })),
  };
}
