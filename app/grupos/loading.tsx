import { PageLoadingState } from "@/components/loading-state";

export default function Loading() {
  return (
    <PageLoadingState
      eyebrow="Abrindo grupos"
      title="Buscando seus círculos ativos"
      description="Carregando saldos, contatos frequentes e atalhos para começar novos splits."
    />
  );
}
