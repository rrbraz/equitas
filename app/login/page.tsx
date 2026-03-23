import { redirectIfAuthenticated } from "@/lib/supabase/auth";
import { LoginScreen } from "@/features/auth/components/login-screen";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    logout?: string;
    next?: string;
    recovered?: string;
    registered?: string;
  }>;
}) {
  const params = await searchParams;
  await redirectIfAuthenticated(params.next);
  const infoMessage =
    params.registered === "1"
      ? "Conta criada. Se a confirmação de e-mail estiver ativa no projeto, confirme o endereço antes de entrar."
      : params.recovered === "1"
        ? "Se existir uma conta com esse e-mail, enviamos instruções de recuperação."
        : params.logout === "1"
          ? "Sessão encerrada com sucesso."
          : params.error === "auth-callback"
            ? "Não foi possível concluir a autenticação pelo link recebido."
            : params.error === "missing-env"
              ? "Configure as variáveis do Supabase para usar o auth real."
              : undefined;

  return <LoginScreen infoMessage={infoMessage} nextPath={params.next} />;
}
