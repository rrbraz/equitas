import { PageLoadingState } from "@/components/loading-state";

export default function Loading() {
  return (
    <PageLoadingState
      eyebrow="Abrindo segurança"
      title="Preparando alteração de senha"
      description="Carregando o formulário de segurança e contexto da sua conta."
      blocks={2}
    />
  );
}
