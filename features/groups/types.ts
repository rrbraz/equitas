export type GroupBalance = {
  profileId: string;
  member: string;
  initials: string;
  tone: "amber" | "indigo" | "green" | "rose";
  role: string;
  expenseCount: number;
  balance: number;
  canRemove?: boolean;
};

export type GroupExpense = {
  id: string;
  title: string;
  category: string;
  paidBy: string;
  amount: number;
  splitPreview: string;
  canManage: boolean;
};

export type GroupSettlement = {
  id: string;
  payer: string;
  receiver: string;
  amount: number;
  settledAt: string;
};

export type Group = {
  id: string;
  slug: string;
  name: string;
  tone: "amber" | "indigo" | "green" | "rose";
  category: string;
  memberCount: number;
  balance: number;
  totalSpend: number;
  description: string;
  trend: string;
  members: GroupBalance[];
  expenses: GroupExpense[];
  settlements: GroupSettlement[];
};

export type GroupContact = {
  name: string;
  initials: string;
  tone: "amber" | "indigo" | "green" | "rose";
};

export type UserGroupSummary = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  description: string;
  memberCount: number;
  balance: number;
  createdAt: string;
};

export type GroupInviteSummary = {
  id: string;
  token: string;
  invitedEmail: string | null;
  role: "admin" | "member";
  status: "pending" | "accepted" | "revoked" | "expired";
  createdAt: string;
  inviteHref: string;
};
