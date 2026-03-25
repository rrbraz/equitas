import { ProfileScreen } from "@/features/profile/components/profile-screen";
import { getProfileScreenData } from "@/features/profile/data/get-profile-screen-data";

export const dynamic = "force-dynamic";

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
      ? "Perfil atualizado com sucesso."
      : params.passwordUpdated === "1"
        ? "Senha atualizada com sucesso."
        : params.feature === "notifications"
          ? "Notificações ainda não têm integração própria nesta etapa."
          : params.feature === "payments"
            ? "Configurações de pagamento ainda não têm integração dedicada nesta etapa."
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
  const profileScreenData = await getProfileScreenData();

  return (
    <ProfileScreen
      {...profileScreenData}
      flashMessage={flashMessage}
      flashTone={flashMessage ? (flashTone ?? "success") : undefined}
    />
  );
}
