import type { ProfilePreference } from "@/features/profile/types";

export const profilePreferences: ProfilePreference[] = [
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
