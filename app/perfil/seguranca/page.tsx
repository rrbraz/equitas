import { ChangePasswordScreen } from "@/features/profile/components/change-password-screen";

export default async function PerfilSegurancaPage({
  searchParams,
}: {
  searchParams: Promise<{ recovery?: string; scenario?: string }>;
}) {
  const params = await searchParams;
  const scenario = params.scenario === "new" ? "new" : "default";

  return (
    <ChangePasswordScreen
      recoveryMode={params.recovery === "1"}
      scenario={scenario}
    />
  );
}
