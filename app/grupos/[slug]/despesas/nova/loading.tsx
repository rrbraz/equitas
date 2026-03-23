import { PageLoadingState } from "@/components/loading-state";

export default function Loading() {
  return (
    <PageLoadingState
      eyebrow="Abrindo composer"
      title="Preparando a nova despesa"
      description="Carregando grupo, atalho de split e o formulário principal para registrar o gasto."
      blocks={2}
    />
  );
}
