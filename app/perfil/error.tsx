"use client";

import { RouteErrorScreen } from "@/components/route-error-screen";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorScreen
      title="Não foi possível abrir seu perfil"
      description="Os dados do perfil falharam ao carregar. Tente novamente para recuperar suas informações."
      backHref="/dashboard"
      backLabel="Voltar ao dashboard"
      error={error}
      reset={reset}
    />
  );
}
