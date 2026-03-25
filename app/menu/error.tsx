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
      title="Não foi possível abrir o menu"
      description="A navegação principal falhou ao carregar. Tente novamente para acessar as áreas do app."
      reset={reset}
    />
  );
}
