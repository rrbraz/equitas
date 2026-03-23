import { LoginScreen } from "@/features/auth/components/login-screen";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ recovered?: string; logout?: string }>;
}) {
  const params = await searchParams;
  const infoMessage =
    params.recovered === "1"
      ? "Cheque seu e-mail quando o auth real entrar. Por enquanto, use esse fluxo para validar a jornada."
      : params.logout === "1"
        ? "Saída mock concluída. Você voltou para a entrada pública do app."
        : undefined;

  return <LoginScreen infoMessage={infoMessage} />;
}
