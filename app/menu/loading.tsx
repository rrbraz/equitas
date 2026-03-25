import { PageLoadingState } from "@/components/loading-state";

export default function Loading() {
  return (
    <PageLoadingState
      eyebrow="Abrindo menu"
      title="Montando a navegação principal"
      description="Carregando atalhos, contexto do usuário e áreas disponíveis."
      blocks={2}
    />
  );
}
