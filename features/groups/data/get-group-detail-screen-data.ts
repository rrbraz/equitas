import "server-only";

import { notFound, redirect } from "next/navigation";

import { getCurrentViewer } from "@/features/profile/data/get-current-viewer";
import { getExpenseCategoryLabel } from "@/features/expenses/lib/expense-categories";
import {
  getContactTone,
  getGroupCategoryLabel,
  getGroupTone,
} from "@/features/groups/lib/group-categories";
import type {
  Group,
  GroupBalance,
  GroupExpense,
  GroupInviteSummary,
  GroupSettlement,
} from "@/features/groups/types";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

type GroupMemberRow = {
  profile_id: string;
  role: "admin" | "member";
};

type ProfileRow = {
  id: string;
  full_name: string;
};

type GroupInviteRow = {
  id: string;
  token: string;
  invited_email: string | null;
  role: "admin" | "member";
  status: "pending" | "accepted" | "revoked" | "expired";
  created_at: string;
};

type ExpenseSplitRow = {
  expense_id: string;
  profile_id: string;
};

type SettlementRow = {
  id: string;
  payer_profile_id: string;
  receiver_profile_id: string;
  amount: number;
  settled_at: string;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getMemberDisplayRole(
  isOwner: boolean,
  role: GroupMemberRow["role"],
  expenseCount: number,
) {
  if (isOwner) {
    return expenseCount > 0
      ? `${expenseCount} despesas pagas`
      : "Owner do grupo";
  }

  if (expenseCount > 0) {
    return `${expenseCount} despesas pagas`;
  }

  return role === "admin" ? "Admin" : "Membro";
}

export async function getGroupDetailScreenData(slug: string): Promise<{
  viewer: Awaited<ReturnType<typeof getCurrentViewer>>;
  group: Group;
  invites: GroupInviteSummary[];
  canManageInvites: boolean;
  canRemoveMembers: boolean;
}> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/grupos/${slug}`)}`);
  }

  const viewer = await getCurrentViewer();
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id, slug, name, category_slug, description, owner_profile_id")
    .eq("slug", slug)
    .maybeSingle();

  if (groupError) {
    throw groupError;
  }

  if (!group) {
    notFound();
  }

  const { data: currentMembership, error: currentMembershipError } =
    await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", group.id)
      .eq("profile_id", user.id)
      .maybeSingle<{ role: "admin" | "member" }>();

  if (currentMembershipError) {
    throw currentMembershipError;
  }

  if (!currentMembership) {
    notFound();
  }

  const canManageInvites =
    group.owner_profile_id === user.id || currentMembership.role === "admin";
  const canRemoveMembers = group.owner_profile_id === user.id;

  const [
    { data: memberships, error: membershipsError },
    { data: balances, error: balancesError },
    { data: expenses, error: expensesError },
    { data: settlements, error: settlementsError },
    { data: invites, error: invitesError },
  ] = await Promise.all([
    supabase
      .from("group_members")
      .select("profile_id, role")
      .eq("group_id", group.id),
    supabase
      .from("group_balance_snapshot")
      .select("profile_id, balance")
      .eq("group_id", group.id),
    supabase
      .from("expenses")
      .select(
        "id, title, category_slug, amount, paid_by_profile_id, created_by_profile_id",
      )
      .eq("group_id", group.id)
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("settlements")
      .select("id, payer_profile_id, receiver_profile_id, amount, settled_at")
      .eq("group_id", group.id)
      .order("settled_at", { ascending: false })
      .order("created_at", { ascending: false }),
    canManageInvites
      ? supabase
          .from("group_invites")
          .select("id, token, invited_email, role, status, created_at")
          .eq("group_id", group.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (membershipsError) {
    throw membershipsError;
  }

  if (balancesError) {
    throw balancesError;
  }

  if (expensesError) {
    throw expensesError;
  }

  if (settlementsError) {
    throw settlementsError;
  }

  if (invitesError) {
    throw invitesError;
  }

  const profileIds = (memberships ?? []).map(
    (membership) => membership.profile_id,
  );
  const expenseIds = (expenses ?? []).map((expense) => expense.id);
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", profileIds);

  const { data: expenseSplits, error: expenseSplitsError } =
    expenseIds.length > 0
      ? await supabase
          .from("expense_splits")
          .select("expense_id, profile_id")
          .in("expense_id", expenseIds)
      : { data: [], error: null };

  if (profilesError) {
    throw profilesError;
  }

  if (expenseSplitsError) {
    throw expenseSplitsError;
  }

  const profileById = new Map<string, ProfileRow>(
    (profiles ?? []).map((profile) => [profile.id, profile as ProfileRow]),
  );
  const balanceByProfileId = new Map<string, number>(
    (balances ?? []).map((balanceRow) => [
      balanceRow.profile_id,
      Number(balanceRow.balance),
    ]),
  );
  const expenseCountByProfileId = new Map<string, number>();
  const splitCountByExpenseId = new Map<string, number>();

  (expenses ?? []).forEach((expense) => {
    expenseCountByProfileId.set(
      expense.paid_by_profile_id,
      (expenseCountByProfileId.get(expense.paid_by_profile_id) ?? 0) + 1,
    );
  });

  ((expenseSplits ?? []) as ExpenseSplitRow[]).forEach((split) => {
    splitCountByExpenseId.set(
      split.expense_id,
      (splitCountByExpenseId.get(split.expense_id) ?? 0) + 1,
    );
  });

  const members: GroupBalance[] = (memberships ?? []).map(
    (membership, index) => {
      const profile = profileById.get(membership.profile_id);
      const expenseCount =
        expenseCountByProfileId.get(membership.profile_id) ?? 0;
      const isViewer = membership.profile_id === viewer.id;
      const isOwner = membership.profile_id === group.owner_profile_id;

      return {
        profileId: membership.profile_id,
        member: isViewer ? "Você" : (profile?.full_name ?? "Participante"),
        initials: profile ? getInitials(profile.full_name) : "EQ",
        tone: isViewer ? "amber" : getContactTone(index + 1),
        role: getMemberDisplayRole(isOwner, membership.role, expenseCount),
        expenseCount,
        balance: balanceByProfileId.get(membership.profile_id) ?? 0,
        canRemove:
          canRemoveMembers &&
          !isOwner &&
          !isViewer &&
          expenseCount === 0 &&
          (balanceByProfileId.get(membership.profile_id) ?? 0) === 0,
      };
    },
  );

  const memberNameByProfileId = new Map<string, string>(
    members.map((member) => [member.profileId, member.member]),
  );

  const mappedExpenses: GroupExpense[] = (expenses ?? []).map((expense) => ({
    id: expense.id,
    title: expense.title,
    category: getExpenseCategoryLabel(expense.category_slug),
    paidBy:
      memberNameByProfileId.get(expense.paid_by_profile_id) ?? "Participante",
    amount: Number(expense.amount),
    splitPreview: `${splitCountByExpenseId.get(expense.id) ?? 0} pessoa(s)`,
    canManage:
      expense.created_by_profile_id === viewer.id ||
      group.owner_profile_id === viewer.id,
  }));
  const mappedSettlements: GroupSettlement[] = (
    (settlements ?? []) as SettlementRow[]
  ).map((settlement) => ({
    id: settlement.id,
    payer:
      memberNameByProfileId.get(settlement.payer_profile_id) ?? "Participante",
    receiver:
      memberNameByProfileId.get(settlement.receiver_profile_id) ??
      "Participante",
    amount: Number(settlement.amount),
    settledAt: settlement.settled_at,
  }));

  const viewerBalance =
    members.find((member) => member.member === "Você")?.balance ?? 0;

  return {
    viewer,
    invites: ((invites ?? []) as GroupInviteRow[]).map((invite) => ({
      id: invite.id,
      token: invite.token,
      invitedEmail: invite.invited_email,
      role: invite.role,
      status: invite.status,
      createdAt: invite.created_at,
      inviteHref: `/convites/${invite.token}`,
    })),
    canManageInvites,
    canRemoveMembers,
    group: {
      id: group.id,
      slug: group.slug,
      name: group.name,
      tone: getGroupTone(group.category_slug),
      category: getGroupCategoryLabel(group.category_slug),
      memberCount: members.length,
      balance: viewerBalance,
      totalSpend: mappedExpenses.reduce(
        (total, expense) => total + expense.amount,
        0,
      ),
      description:
        group.description?.trim() ||
        "Grupo criado para organizar despesas compartilhadas.",
      trend: mappedExpenses.length > 0 ? "Com despesas" : "Sem despesas",
      members,
      expenses: mappedExpenses,
      settlements: mappedSettlements,
    },
  };
}
