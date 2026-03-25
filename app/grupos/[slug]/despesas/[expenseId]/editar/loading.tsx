import { PageLoadingState } from "@/components/loading-state";

export default function Loading() {
  return (
    <PageLoadingState
      eyebrow="Abrindo editor"
      title="Preparando a edição da despesa"
      description="Carregando dados da despesa, membros e o formulário de edição."
      blocks={2}
    />
  );
}
