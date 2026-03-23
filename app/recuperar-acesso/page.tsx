import { redirectIfAuthenticated } from "@/lib/supabase/auth";
import { ForgotPasswordScreen } from "@/features/auth/components/forgot-password-screen";

export default async function RecuperarAcessoPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  await redirectIfAuthenticated(params.next);

  return <ForgotPasswordScreen />;
}
