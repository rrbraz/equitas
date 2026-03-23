export type GroupBalance = {
  member: string;
  initials: string;
  tone: "amber" | "indigo" | "green" | "rose";
  role: string;
  expenseCount: number;
  balance: number;
};

export type GroupExpense = {
  id: string;
  title: string;
  category: string;
  paidBy: string;
  amount: number;
  splitPreview: string;
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
};

export type GroupContact = {
  name: string;
  initials: string;
  tone: "amber" | "indigo" | "green" | "rose";
};
