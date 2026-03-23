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
      title="Não foi possível abrir seus grupos"
      description="A listagem falhou ao carregar. Tente novamente antes de criar ou abrir um grupo."
      backHref="/dashboard"
      backLabel="Voltar ao dashboard"
      reset={reset}
    />
  );
}
