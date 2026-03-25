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
      title="Não foi possível abrir a nova despesa"
      description="O composer falhou ao carregar. Tente novamente antes de registrar o gasto neste grupo."
      backHref="/grupos"
      backLabel="Voltar para grupos"
      error={error}
      reset={reset}
    />
  );
}
