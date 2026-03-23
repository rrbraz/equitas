import type { Group, GroupContact } from "@/features/groups/types";
import { mockCurrentViewer } from "@/features/viewer/data/mock-viewer";

export const mockGroups: Group[] = [
  {
    id: "group-rio",
    slug: "viagem-rio",
    name: "Viagem Rio",
    tone: "indigo",
    category: "Travel",
    memberCount: 4,
    balance: 450,
    totalSpend: 4280,
    description:
      "Planejamento da viagem com hospedagem, transporte e jantares.",
    trend: "+4.2%",
    members: [
      {
        member: "Você",
        initials: "JV",
        tone: "amber",
        role: "4 despesas pagas",
        expenseCount: 4,
        balance: 840,
      },
      {
        member: "Beatriz",
        initials: "BT",
        tone: "green",
        role: "2 despesas pagas",
        expenseCount: 2,
        balance: -320,
      },
      {
        member: "Ricardo",
        initials: "RC",
        tone: "indigo",
        role: "Acertado",
        expenseCount: 1,
        balance: 0,
      },
    ],
    expenses: [
      {
        id: "exp-jantar",
        title: "Jantar no Copacabana Palace",
        category: "Food",
        paidBy: "Você",
        amount: 450,
        splitPreview: "Você + Leo + Ana",
      },
      {
        id: "exp-airbnb",
        title: "Hospedagem Airbnb",
        category: "Stay",
        paidBy: "Você",
        amount: 2800,
        splitPreview: "4 pessoas",
      },
      {
        id: "exp-uber",
        title: "Uber Aeroporto",
        category: "Transit",
        paidBy: "Ricardo",
        amount: 120,
        splitPreview: "Você, Ricardo, Bia",
      },
    ],
  },
  {
    id: "group-casa",
    slug: "aluguel-casa",
    name: "Aluguel Casa",
    tone: "green",
    category: "Utilities",
    memberCount: 3,
    balance: 0,
    totalSpend: 6120,
    description:
      "Custos fixos do apartamento compartilhado e contas recorrentes.",
    trend: "Estavel",
    members: [
      {
        member: "Você",
        initials: "JV",
        tone: "amber",
        role: "1 despesa em aberto",
        expenseCount: 1,
        balance: 0,
      },
      {
        member: "Marina",
        initials: "MR",
        tone: "green",
        role: "Pago em dia",
        expenseCount: 2,
        balance: 0,
      },
      {
        member: "Lucas",
        initials: "LC",
        tone: "indigo",
        role: "Pago em dia",
        expenseCount: 2,
        balance: 0,
      },
    ],
    expenses: [
      {
        id: "exp-internet",
        title: "Internet Fibra",
        category: "Utilities",
        paidBy: "Marina",
        amount: 199.9,
        splitPreview: "3 pessoas",
      },
      {
        id: "exp-luz",
        title: "Conta de luz",
        category: "Utilities",
        paidBy: "Você",
        amount: 287.4,
        splitPreview: "3 pessoas",
      },
    ],
  },
  {
    id: "group-onboarding",
    slug: "jantar-de-ontem",
    name: "Jantar de Ontem",
    tone: "rose",
    category: "Food",
    memberCount: 6,
    balance: -12.4,
    totalSpend: 74.4,
    description: "Fechamento rápido das despesas do grupo do jantar.",
    trend: "Novo",
    members: [
      {
        member: "Você",
        initials: "JV",
        tone: "amber",
        role: "Aguardando acerto",
        expenseCount: 1,
        balance: -12.4,
      },
      {
        member: "Joana",
        initials: "JO",
        tone: "rose",
        role: "Pagou a conta",
        expenseCount: 1,
        balance: 62,
      },
    ],
    expenses: [
      {
        id: "exp-vinho",
        title: "Vinho e sobremesa",
        category: "Food",
        paidBy: "Joana",
        amount: 74.4,
        splitPreview: "6 pessoas",
      },
    ],
  },
  {
    id: "group-roadtrip",
    slug: "summer-roadtrip",
    name: "Summer Roadtrip",
    tone: "amber",
    category: "Travel",
    memberCount: 4,
    balance: 0,
    totalSpend: 0,
    description: "Grupo recém-criado para dividir custos da próxima viagem.",
    trend: "Novo",
    members: [
      {
        member: "Você",
        initials: "JV",
        tone: "amber",
        role: "Owner",
        expenseCount: 0,
        balance: 0,
      },
      {
        member: "Sarah Johnson",
        initials: "SJ",
        tone: "green",
        role: "Convidada",
        expenseCount: 0,
        balance: 0,
      },
      {
        member: "Marcus K.",
        initials: "MK",
        tone: "indigo",
        role: "Convidado",
        expenseCount: 0,
        balance: 0,
      },
      {
        member: "David Wu",
        initials: "DW",
        tone: "green",
        role: "Convidado",
        expenseCount: 0,
        balance: 0,
      },
    ],
    expenses: [],
  },
];

export const mockQuickStartContacts: GroupContact[] = [
  { name: "Ana", initials: "AN", tone: "amber" },
  { name: "Leo", initials: "LE", tone: "indigo" },
  { name: "Alex", initials: "AX", tone: "green" },
  { name: "Mia", initials: "MI", tone: "rose" },
];

export const mockFrequentConnections: GroupContact[] = [
  { name: "Alex", initials: "AX", tone: "indigo" },
  { name: "Elena", initials: "EL", tone: "amber" },
  { name: "Jake", initials: "JK", tone: "rose" },
  { name: "Convidar", initials: "+", tone: "green" },
];

export const mockSelectedGroupMembers: GroupContact[] = [
  { name: "Sarah Johnson", initials: "SJ", tone: "amber" },
  { name: "Marcus K.", initials: "MK", tone: "indigo" },
  { name: "David Wu", initials: "DW", tone: "green" },
];

export const mockGroupCategories = ["Travel", "Home", "Dining", "Other"];

export function getMockGroupBySlug(slug: string) {
  return mockGroups.find((group) => group.slug === slug);
}

export function getMockGroupsScreenData() {
  return {
    viewer: mockCurrentViewer,
    groups: mockGroups,
    quickStartContacts: mockQuickStartContacts,
  };
}

export function getMockCreateGroupScreenData() {
  return {
    viewer: mockCurrentViewer,
    categories: mockGroupCategories,
    selectedMembers: mockSelectedGroupMembers,
    frequentConnections: mockFrequentConnections,
    createGroupHref: "/grupos/summer-roadtrip",
  };
}

export function getMockGroupDetailScreenData(slug: string) {
  const group = getMockGroupBySlug(slug);

  if (!group) {
    return null;
  }

  return {
    viewer: mockCurrentViewer,
    group,
  };
}
