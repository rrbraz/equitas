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
    href: "/perfil/editar",
  },
  {
    icon: "notifications",
    title: "Notificações",
    description: "Push alerts para lembretes e fechamentos.",
    href: "/perfil?feature=notifications",
  },
  {
    icon: "payments",
    title: "Pagamentos",
    description: "Métodos bancários e PIX para quitação.",
    href: "/perfil?feature=payments",
  },
  {
    icon: "security",
    title: "Segurança",
    description: "Senha, biometria e 2FA.",
    href: "/perfil/seguranca",
  },
];

export const mockProfileSummaryTotals: ProfileSummaryTotals = {
  owedToYou: 2140,
  youOwe: 657.5,
};

type ProfileScenario = "default" | "new";

export function getMockProfileScreenData(
  scenario: ProfileScenario = "default",
): ProfileScreenData {
  return {
    viewer: mockCurrentViewer,
    totals:
      scenario === "new"
        ? { owedToYou: 0, youOwe: 0 }
        : mockProfileSummaryTotals,
    preferences: mockProfilePreferences,
    scenario,
  };
}
