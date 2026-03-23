import { redirectIfAuthenticated } from "@/lib/supabase/auth";
import { SignUpScreen } from "@/features/auth/components/sign-up-screen";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  await redirectIfAuthenticated(params.next);

  return <SignUpScreen nextPath={params.next} />;
}
