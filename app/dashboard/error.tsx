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
      title="Não foi possível montar o dashboard"
      description="Os blocos principais falharam ao carregar. Tente novamente para recuperar a visão geral."
      reset={reset}
    />
  );
}
