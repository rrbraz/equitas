import "server-only";

import { getExpenseCategoryLabel } from "@/features/expenses/lib/expense-categories";
import { getPendingSettlementTotal } from "@/features/groups/lib/balance-snapshot";
import { getGroupTone } from "@/features/groups/lib/group-categories";
import type { UserGroupSummary } from "@/features/groups/types";
import { formatCurrency } from "@/lib/format";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import type {
  MonthlyBalance,
  ReportCategory,
  ReportHistoryItem,
} from "@/features/reports/types";

type ExpenseRow = {
  id: string;
  group_id: string;
  title: string;
  amount: number;
  category_slug: string;
  paid_by_profile_id: string;
  expense_date: string;
  created_at: string;
};

type SettlementRow = {
  id: string;
  group_id: string;
  payer_profile_id: string;
  receiver_profile_id: string;
  amount: number;
  settled_at: string;
  created_at: string;
};

type ExpenseSplitRow = {
  expense_id: string;
  amount_owed: number;
};

type SnapshotRow = {
  group_id: string;
  profile_id: string;
  full_name: string;
  balance: number;
};

type ReportingDatasetInput = {
  userId: string;
  viewerInitials: string;
  groups: UserGroupSummary[];
  rangeDays: 30 | 90;
  groupSlug?: string;
  limit?: number;
};

type ReportingDataset = {
  historyItems: ReportHistoryItem[];
  monthlyBalances: MonthlyBalance[];
  reportCategories: ReportCategory[];
  totalExpenses: number;
  pendingSettlementTotal: number;
  pendingGroupCount: number;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDateLabel(dateString: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(dateString));
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
  }).format(date);
}

function formatDateInput(date: Date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getRangeStart(rangeDays: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (rangeDays - 1));

  return date;
}

function buildMonthSeries(rangeStart: Date) {
  const months: Date[] = [];
  const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  const lastMonth = new Date();
  lastMonth.setDate(1);
  lastMonth.setHours(0, 0, 0, 0);

  while (cursor <= lastMonth) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

const categoryTones: ReportCategory["tone"][] = [
  "indigo",
  "green",
  "rose",
  "amber",
];

export async function queryReportingDataset({
  userId,
  viewerInitials,
  groups,
  rangeDays,
  groupSlug,
  limit,
}: ReportingDatasetInput): Promise<ReportingDataset> {
  const relevantGroups = groupSlug
    ? groups.filter((group) => group.slug === groupSlug)
    : groups;

  if (relevantGroups.length === 0) {
    return {
      historyItems: [],
      monthlyBalances: [],
      reportCategories: [],
      totalExpenses: 0,
      pendingSettlementTotal: 0,
      pendingGroupCount: 0,
    };
  }

  const rangeStart = getRangeStart(rangeDays);
  const groupIds = relevantGroups.map((group) => group.id);
  const groupById = new Map(relevantGroups.map((group) => [group.id, group]));
  const supabase = await getSupabaseServerClient();

  const [
    { data: expenses, error: expensesError },
    { data: settlements, error: settlementsError },
    { data: snapshotRows, error: snapshotError },
  ] = await Promise.all([
    supabase
      .from("expenses")
      .select(
        "id, group_id, title, amount, category_slug, paid_by_profile_id, expense_date, created_at",
      )
      .in("group_id", groupIds)
      .gte("expense_date", formatDateInput(rangeStart))
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("settlements")
      .select(
        "id, group_id, payer_profile_id, receiver_profile_id, amount, settled_at, created_at",
      )
      .in("group_id", groupIds)
      .gte("settled_at", rangeStart.toISOString())
      .order("settled_at", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("group_balance_snapshot")
      .select("group_id, profile_id, full_name, balance")
      .in("group_id", groupIds),
  ]);

  if (expensesError) {
    throw expensesError;
  }

  if (settlementsError) {
    throw settlementsError;
  }

  if (snapshotError) {
    throw snapshotError;
  }

  const expenseRows = (expenses ?? []) as ExpenseRow[];
  const settlementRows = (settlements ?? []) as SettlementRow[];
  const snapshot = (snapshotRows ?? []) as SnapshotRow[];

  const nameByGroupProfileId = new Map<string, string>();
  const positiveBalanceByGroupId = new Map<string, number>();

  snapshot.forEach((row) => {
    nameByGroupProfileId.set(
      `${row.group_id}:${row.profile_id}`,
      row.full_name,
    );

    if (Number(row.balance) > 0) {
      positiveBalanceByGroupId.set(
        row.group_id,
        (positiveBalanceByGroupId.get(row.group_id) ?? 0) + Number(row.balance),
      );
    }
  });

  const expenseIds = expenseRows.map((expense) => expense.id);
  const { data: viewerSplits, error: viewerSplitsError } =
    expenseIds.length > 0
      ? await supabase
          .from("expense_splits")
          .select("expense_id, amount_owed")
          .eq("profile_id", userId)
          .in("expense_id", expenseIds)
      : { data: [], error: null };

  if (viewerSplitsError) {
    throw viewerSplitsError;
  }

  const viewerShareByExpenseId = new Map<string, number>(
    ((viewerSplits ?? []) as ExpenseSplitRow[]).map((split) => [
      split.expense_id,
      Number(split.amount_owed),
    ]),
  );

  const categoryTotals = new Map<string, { amount: number; count: number }>();
  const monthTotals = new Map<string, number>();

  expenseRows.forEach((expense) => {
    const categoryLabel = getExpenseCategoryLabel(expense.category_slug);
    const currentCategory = categoryTotals.get(categoryLabel) ?? {
      amount: 0,
      count: 0,
    };

    categoryTotals.set(categoryLabel, {
      amount: currentCategory.amount + Number(expense.amount),
      count: currentCategory.count + 1,
    });

    const expenseDate = new Date(`${expense.expense_date}T12:00:00`);
    const monthKey = `${expenseDate.getFullYear()}-${String(
      expenseDate.getMonth() + 1,
    ).padStart(2, "0")}`;
    monthTotals.set(
      monthKey,
      (monthTotals.get(monthKey) ?? 0) + Number(expense.amount),
    );
  });

  const historyItems = [
    ...expenseRows.map((expense): ReportHistoryItem => {
      const group = groupById.get(expense.group_id);
      const payerName =
        nameByGroupProfileId.get(
          `${expense.group_id}:${expense.paid_by_profile_id}`,
        ) ?? "Participante";
      const viewerShare = viewerShareByExpenseId.get(expense.id) ?? 0;
      const amountImpact =
        expense.paid_by_profile_id === userId
          ? Number(expense.amount) - viewerShare
          : -viewerShare;
      const person = expense.paid_by_profile_id === userId ? "Você" : payerName;

      return {
        id: `expense-${expense.id}`,
        groupSlug: group?.slug ?? "",
        groupName: group?.name ?? "Grupo",
        kind: "expense",
        person,
        initials: person === "Você" ? viewerInitials : getInitials(person),
        tone: group ? getGroupTone(group.categorySlug) : "indigo",
        action: `lançou "${expense.title}" em ${group?.name ?? "um grupo"}`,
        amount: amountImpact,
        occurredAt: `${expense.expense_date}T12:00:00`,
        occurredAtLabel: formatDateLabel(`${expense.expense_date}T12:00:00`),
      };
    }),
    ...settlementRows.map((settlement): ReportHistoryItem => {
      const group = groupById.get(settlement.group_id);
      const payerName =
        nameByGroupProfileId.get(
          `${settlement.group_id}:${settlement.payer_profile_id}`,
        ) ?? "Participante";
      const receiverName =
        nameByGroupProfileId.get(
          `${settlement.group_id}:${settlement.receiver_profile_id}`,
        ) ?? "Participante";
      const person =
        settlement.payer_profile_id === userId ? "Você" : payerName;
      const amountImpact =
        settlement.payer_profile_id === userId
          ? -Number(settlement.amount)
          : settlement.receiver_profile_id === userId
            ? Number(settlement.amount)
            : 0;

      return {
        id: `settlement-${settlement.id}`,
        groupSlug: group?.slug ?? "",
        groupName: group?.name ?? "Grupo",
        kind: "settlement",
        person,
        initials: person === "Você" ? viewerInitials : getInitials(person),
        tone: group ? getGroupTone(group.categorySlug) : "green",
        action: `transferiu para ${receiverName} em ${group?.name ?? "um grupo"}`,
        amount: amountImpact,
        occurredAt: settlement.settled_at,
        occurredAtLabel: formatDateLabel(settlement.settled_at),
      };
    }),
  ]
    .sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() -
        new Date(left.occurredAt).getTime(),
    )
    .slice(0, limit ?? 20);

  const totalExpenses = expenseRows.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );
  const pendingSettlementTotals = relevantGroups.map((group) =>
    getPendingSettlementTotal([positiveBalanceByGroupId.get(group.id) ?? 0]),
  );
  const pendingSettlementTotal = pendingSettlementTotals.reduce(
    (total, value) => total + value,
    0,
  );
  const pendingGroupCount = pendingSettlementTotals.filter(
    (value) => value > 0,
  ).length;

  const monthSeries = buildMonthSeries(rangeStart);
  const monthPeak = Math.max(
    0,
    ...Array.from(monthTotals.values()).map((value) => Math.abs(value)),
  );
  const monthlyBalances: MonthlyBalance[] = monthSeries.map((monthDate) => {
    const monthKey = `${monthDate.getFullYear()}-${String(
      monthDate.getMonth() + 1,
    ).padStart(2, "0")}`;
    const value = monthTotals.get(monthKey) ?? 0;

    return {
      month: formatMonthLabel(monthDate),
      value,
      tone:
        value === 0
          ? "muted"
          : value === monthPeak
            ? "rose"
            : value >= monthPeak / 2
              ? "green"
              : "soft",
    };
  });

  const reportCategories = Array.from(categoryTotals.entries())
    .sort((left, right) => right[1].amount - left[1].amount)
    .map(([name, data], index) => ({
      name,
      share:
        totalExpenses > 0 ? Math.round((data.amount / totalExpenses) * 100) : 0,
      note: `${formatCurrency(data.amount)} em ${data.count} lançamento(s)`,
      tone: categoryTones[index % categoryTones.length],
      amount: data.amount,
    }));

  return {
    historyItems,
    monthlyBalances,
    reportCategories,
    totalExpenses,
    pendingSettlementTotal,
    pendingGroupCount,
  };
}
