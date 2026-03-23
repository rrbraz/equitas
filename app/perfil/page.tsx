import { ProfileScreen } from "@/features/profile/components/profile-screen";
import { getMockProfileScreenData } from "@/features/profile/data/mock-profile";

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{
    updated?: string;
    passwordUpdated?: string;
    feature?: string;
    scenario?: string;
  }>;
}) {
  const params = await searchParams;
  const flashMessage =
    params.updated === "1"
      ? "Perfil mock atualizado com sucesso."
      : params.passwordUpdated === "1"
        ? "Senha mock alterada. Use este fluxo para validar a jornada."
        : params.feature === "notifications"
          ? "Notificações ainda não estão ativas. O fluxo real entra depois do auth."
          : params.feature === "payments"
            ? "Pagamentos ainda são informativos neste modo mock. A configuração real entra nas próximas histórias."
            : params.scenario === "new"
              ? "Conta nova pronta. Quando você criar grupos e despesas, os totais do perfil começam a ganhar contexto."
              : undefined;

  const flashTone =
    params.passwordUpdated === "1" ||
    params.feature === "notifications" ||
    params.feature === "payments" ||
    params.scenario === "new"
      ? "info"
      : undefined;

  return (
    <ProfileScreen
      {...getMockProfileScreenData(
        params.scenario === "new" ? "new" : "default",
      )}
      flashMessage={flashMessage}
      flashTone={flashMessage ? (flashTone ?? "success") : undefined}
    />
  );
}
