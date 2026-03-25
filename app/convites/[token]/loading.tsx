import { PageLoadingState } from "@/components/loading-state";

export default function Loading() {
  return (
    <PageLoadingState
      eyebrow="Abrindo convite"
      title="Verificando dados do convite"
      description="Carregando detalhes do grupo e validando o link de convite."
      blocks={2}
    />
  );
}
