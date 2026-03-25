import { PageLoadingState } from "@/components/loading-state";

export default function Loading() {
  return (
    <PageLoadingState
      eyebrow="Abrindo perfil"
      title="Carregando dados da conta"
      description="Preparando informações pessoais, estatísticas e atalhos de configuração."
    />
  );
}
