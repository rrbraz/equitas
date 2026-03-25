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
      title="Não foi possível abrir esta tela"
      description="A página falhou ao montar. Tente novamente ou volte para um fluxo estável."
      error={error}
      reset={reset}
    />
  );
}
