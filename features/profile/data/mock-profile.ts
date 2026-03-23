import type {
  ProfilePreference,
  ProfileScreenData,
  ProfileSummaryTotals,
} from "@/features/profile/types";
import { mockCurrentViewer } from "@/features/viewer/data/mock-viewer";

export const mockProfilePreferences: ProfilePreference[] = [
  {
    icon: "account",
    title: "Conta",
    description: "Gerencie identidade, perfil e apelidos.",
  },
  {
    icon: "notifications",
    title: "Notificações",
    description: "Push alerts para lembretes e fechamentos.",
  },
  {
    icon: "payments",
    title: "Pagamentos",
    description: "Métodos bancários e PIX para settlement.",
  },
  {
    icon: "security",
    title: "Segurança",
    description: "Senha, biometria e 2FA.",
  },
];

export const mockProfileSummaryTotals: ProfileSummaryTotals = {
  owedToYou: 2140,
  youOwe: 657.5,
};

export function getMockProfileScreenData(): ProfileScreenData {
  return {
    viewer: mockCurrentViewer,
    totals: mockProfileSummaryTotals,
    preferences: mockProfilePreferences,
  };
}
