import { PageLoadingState } from "@/components/loading-state";

export default function Loading() {
  return (
    <PageLoadingState
      eyebrow="Montando relatórios"
      title="Calculando ritmo e concentração"
      description="Carregando evolução mensal, categorias e saúde de quitação dos seus grupos."
    />
  );
}
