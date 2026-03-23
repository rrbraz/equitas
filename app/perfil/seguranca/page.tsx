import { ChangePasswordScreen } from "@/features/profile/components/change-password-screen";

export default async function PerfilSegurancaPage({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>;
}) {
  const params = await searchParams;
  const scenario = params.scenario === "new" ? "new" : "default";

  return <ChangePasswordScreen scenario={scenario} />;
}
