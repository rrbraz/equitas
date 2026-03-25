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
      title="Não foi possível abrir a edição de perfil"
      description="O formulário falhou ao carregar. Tente novamente antes de salvar suas alterações."
      backHref="/perfil"
      backLabel="Voltar ao perfil"
      error={error}
      reset={reset}
    />
  );
}
