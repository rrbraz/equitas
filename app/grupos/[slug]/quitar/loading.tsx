import { PageLoadingState } from "@/components/loading-state";

export default function Loading() {
  return (
    <PageLoadingState
      eyebrow="Abrindo quitação"
      title="Preparando o fechamento do grupo"
      description="Carregando contexto do grupo e o resumo da liquidação."
      blocks={2}
    />
  );
}
