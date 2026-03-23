import { PageLoadingState } from "@/components/loading-state";

export default function Loading() {
  return (
    <PageLoadingState
      eyebrow="Montando dashboard"
      title="Organizando saldos e atividade recente"
      description="Preparando a visão geral dos seus grupos, movimentos e atalhos principais."
    />
  );
}
