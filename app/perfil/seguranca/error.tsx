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
      title="Não foi possível abrir a segurança"
      description="O fluxo de alteração de senha falhou ao carregar. Tente novamente antes de continuar."
      backHref="/perfil"
      backLabel="Voltar ao perfil"
      error={error}
      reset={reset}
    />
  );
}
