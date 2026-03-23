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
      title="Não foi possível abrir a criação de grupo"
      description="O formulário falhou ao carregar. Tente novamente antes de convidar participantes."
      backHref="/grupos"
      backLabel="Voltar para grupos"
      reset={reset}
    />
  );
}
