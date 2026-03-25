import { PageLoadingState } from "@/components/loading-state";

export default function Loading() {
  return (
    <PageLoadingState
      eyebrow="Preparando edição"
      title="Montando o formulário de perfil"
      description="Carregando dados atuais da conta para você revisar e atualizar."
      blocks={2}
    />
  );
}
