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
      title="Não foi possível abrir este grupo"
      description="Os dados do grupo falharam ao carregar. Tente novamente antes de seguir com novas despesas."
      backHref="/grupos"
      backLabel="Voltar para grupos"
      reset={reset}
    />
  );
}
