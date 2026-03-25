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
      title="Não foi possível abrir os relatórios"
      description="Os indicadores falharam ao carregar. Tente novamente para recuperar a leitura financeira."
      backHref="/dashboard"
      backLabel="Voltar ao dashboard"
      error={error}
      reset={reset}
    />
  );
}
