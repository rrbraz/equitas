"use client";

import { RouteErrorScreen } from "@/components/route-error-screen";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorScreen
      title="Não foi possível abrir a edição de despesa"
      description="O composer falhou ao carregar. Tente novamente antes de alterar esta despesa."
      backHref="/grupos"
      backLabel="Voltar para grupos"
      reset={reset}
    />
  );
}
