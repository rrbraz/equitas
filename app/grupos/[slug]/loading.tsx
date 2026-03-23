import { PageLoadingState } from "@/components/loading-state";

export default function Loading() {
  return (
    <PageLoadingState
      eyebrow="Abrindo grupo"
      title="Buscando saldos e despesas"
      description="Preparando membros, timeline e ações principais deste grupo."
      blocks={2}
    />
  );
}
