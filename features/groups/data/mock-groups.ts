import type { Group, GroupContact } from "@/features/groups/types";
import { mockCurrentViewer } from "@/features/viewer/data/mock-viewer";

type MockExpenseInput = {
  title: string;
  amount: number;
  paidBy: string;
  category: string;
  split: Array<{
    member: string;
    amount: number;
  }>;
};

type MockTransferInput = {
  payer: string;
  receiver: string;
  amount: number;
};

export const mockGroups: Group[] = [
  {
    id: "group-rio",
    slug: "viagem-rio",
    name: "Viagem Rio",
    tone: "indigo",
    category: "Viagem",
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
        category: "Comida",
        paidBy: "Você",
        amount: 450,
        splitPreview: "Você + Leo + Ana",
      },
      {
        id: "exp-airbnb",
        title: "Hospedagem Airbnb",
        category: "Hospedagem",
        paidBy: "Você",
        amount: 2800,
        splitPreview: "4 pessoas",
      },
      {
        id: "exp-uber",
        title: "Uber Aeroporto",
        category: "Transporte",
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
    category: "Casa",
    memberCount: 3,
    balance: 0,
    totalSpend: 6120,
    description:
      "Custos fixos do apartamento compartilhado e contas recorrentes.",
    trend: "Estável",
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
        category: "Casa",
        paidBy: "Marina",
        amount: 199.9,
        splitPreview: "3 pessoas",
      },
      {
        id: "exp-luz",
        title: "Conta de luz",
        category: "Casa",
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
    category: "Comida",
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
        category: "Comida",
        paidBy: "Joana",
        amount: 74.4,
        splitPreview: "6 pessoas",
      },
    ],
  },
  {
    id: "group-roadtrip",
    slug: "summer-roadtrip",
    name: "Roadtrip de Verao",
    tone: "amber",
    category: "Viagem",
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
        role: "Responsável",
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
  { name: "Priya", initials: "PR", tone: "green" },
];

export const mockSelectedGroupMembers: GroupContact[] = [
  { name: "Sarah Johnson", initials: "SJ", tone: "amber" },
  { name: "Marcus K.", initials: "MK", tone: "indigo" },
  { name: "David Wu", initials: "DW", tone: "green" },
];

export const mockGroupCategories = ["Viagem", "Casa", "Refeição", "Outro"];

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function buildSplitPreview(split: MockExpenseInput["split"]) {
  if (split.length === 0) {
    return "Sem participantes";
  }

  if (split.length >= 4) {
    return `${split.length} pessoas`;
  }

  return split.map(({ member }) => member).join(", ");
}

export function getMockGroupBySlug(slug: string) {
  return mockGroups.find((group) => group.slug === slug);
}

type GroupsScenario = "default" | "new";

function getContactTone(index: number): GroupContact["tone"] {
  const tones: GroupContact["tone"][] = ["amber", "green", "indigo", "rose"];

  return tones[index % tones.length];
}

function getInitials(name: string) {
  return name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("");
}

function getContactByName(name: string) {
  return [
    ...mockQuickStartContacts,
    ...mockFrequentConnections,
    ...mockSelectedGroupMembers,
  ].find((contact) => contact.name === name);
}

function buildCreatedGroup({
  slug,
  name,
  category,
  memberNames,
}: {
  slug: string;
  name: string;
  category: string;
  memberNames: string[];
}): Group {
  const uniqueMembers = memberNames.filter(
    (member, index, members) => members.indexOf(member) === index,
  );

  return {
    id: `group-${slug}`,
    slug,
    name,
    tone: "amber",
    category,
    memberCount: uniqueMembers.length + 1,
    balance: 0,
    totalSpend: 0,
    description: "Grupo recém-criado em modo mock para validar a jornada.",
    trend: "Novo",
    members: [
      {
        member: "Você",
        initials: mockCurrentViewer.initials,
        tone: "amber",
        role: "Responsável",
        expenseCount: 0,
        balance: 0,
      },
      ...uniqueMembers.map((memberName, index) => {
        const knownContact = getContactByName(memberName);

        return {
          member: memberName,
          initials: knownContact?.initials ?? getInitials(memberName),
          tone: knownContact?.tone ?? getContactTone(index + 1),
          role: memberName.includes("@") ? "Convidado por email" : "Convidado",
          expenseCount: 0,
          balance: 0,
        };
      }),
    ],
    expenses: [],
  };
}

export function getMockGroupsScreenData(scenario: GroupsScenario = "default") {
  return {
    viewer: mockCurrentViewer,
    groups: scenario === "new" ? [] : mockGroups,
    quickStartContacts: mockQuickStartContacts,
  };
}

export function getMockCreateGroupScreenData(memberName?: string) {
  const extraMember = [
    ...mockQuickStartContacts,
    ...mockFrequentConnections,
  ].find((contact) => contact.name === memberName);
  const selectedMembers = extraMember
    ? [...mockSelectedGroupMembers, extraMember].filter(
        (member, index, members) =>
          members.findIndex(({ name }) => name === member.name) === index,
      )
    : mockSelectedGroupMembers;

  return {
    viewer: mockCurrentViewer,
    categories: mockGroupCategories,
    selectedMembers,
    frequentConnections: mockFrequentConnections,
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

export function getMockCreatedGroupDetailScreenData({
  slug,
  name,
  category,
  members,
}: {
  slug: string;
  name?: string;
  category?: string;
  members?: string[];
}) {
  if (!name || !category) {
    return null;
  }

  return {
    viewer: mockCurrentViewer,
    group: buildCreatedGroup({
      slug,
      name,
      category,
      memberNames: members ?? [],
    }),
  };
}

export function applyMockExpenseToGroup(
  group: Group,
  expense: MockExpenseInput,
) {
  return {
    ...group,
    totalSpend: roundCurrency(group.totalSpend + expense.amount),
    expenses: [
      {
        id: `exp-mock-${group.slug}`,
        title: expense.title,
        category: expense.category,
        paidBy: expense.paidBy,
        amount: expense.amount,
        splitPreview: buildSplitPreview(expense.split),
      },
      ...group.expenses,
    ],
    members: group.members.map((member) => {
      const memberShare =
        expense.split.find((item) => item.member === member.member)?.amount ??
        0;
      const payerCredit = member.member === expense.paidBy ? expense.amount : 0;
      const nextBalance = roundCurrency(
        member.balance + payerCredit - memberShare,
      );

      return {
        ...member,
        balance: nextBalance,
        expenseCount:
          member.member === expense.paidBy
            ? member.expenseCount + 1
            : member.expenseCount,
        role:
          member.member === expense.paidBy
            ? `${member.expenseCount + 1} despesas pagas`
            : member.role,
      };
    }),
  };
}

export function applyMockTransferToGroup(
  group: Group,
  transfer: MockTransferInput,
) {
  return {
    ...group,
    members: group.members.map((member) => {
      if (member.member === transfer.payer) {
        return {
          ...member,
          balance: roundCurrency(member.balance + transfer.amount),
        };
      }

      if (member.member === transfer.receiver) {
        return {
          ...member,
          balance: roundCurrency(member.balance - transfer.amount),
        };
      }

      return member;
    }),
  };
}
