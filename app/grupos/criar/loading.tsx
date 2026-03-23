import { PageLoadingState } from "@/components/loading-state";

export default function Loading() {
  return (
    <PageLoadingState
      eyebrow="Preparando criação"
      title="Montando o fluxo de novo grupo"
      description="Carregando categoria, membros frequentes e atalhos para iniciar o grupo."
      blocks={2}
    />
  );
}
