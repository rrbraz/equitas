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
      title="Não foi possível abrir o convite"
      description="Os dados do convite falharam ao carregar. Tente novamente antes de aceitar ou recusar."
      backHref="/grupos"
      backLabel="Voltar para grupos"
      reset={reset}
    />
  );
}
