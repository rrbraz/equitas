import { GroupDetailScreen } from "@/features/groups/components/group-detail-screen";
import { getGroupDetailScreenData } from "@/features/groups/data/get-group-detail-screen-data";

export const dynamic = "force-dynamic";

export default async function GrupoDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    created?: string;
    joined?: string;
    expenseSaved?: string;
    expenseUpdated?: string;
    expenseDeleted?: string;
    settlementSaved?: string;
    inviteCount?: string;
    inviteWarning?: string;
  }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const groupQuery = new URLSearchParams();
  if (query.created === "1") {
    groupQuery.set("created", "1");
  }
  if (query.joined === "1") {
    groupQuery.set("joined", "1");
  }
  if (query.inviteCount) {
    groupQuery.set("inviteCount", query.inviteCount);
  }
  if (query.inviteWarning === "1") {
    groupQuery.set("inviteWarning", "1");
  }
  const screenData = await getGroupDetailScreenData(slug);

  const flashMessage =
    query.created === "1"
      ? query.inviteWarning === "1"
        ? "Grupo criado com sucesso. Os convites iniciais não puderam ser registrados agora."
        : query.inviteCount &&
            Number.isInteger(Number(query.inviteCount)) &&
            Number(query.inviteCount) > 0
          ? `Grupo criado com sucesso. ${Number(query.inviteCount)} convite(s) por email ficaram pendentes.`
          : "Grupo criado com sucesso. Você já entrou como owner e membro do grupo."
      : query.joined === "1"
        ? "Convite aceito com sucesso. Você já faz parte deste grupo."
        : query.expenseSaved === "1"
          ? "Despesa salva com sucesso."
          : query.expenseUpdated === "1"
            ? "Despesa atualizada com sucesso."
            : query.expenseDeleted === "1"
              ? "Despesa excluída com sucesso."
              : query.settlementSaved === "1"
                ? "Transferência registrada com sucesso."
                : undefined;

  return (
    <GroupDetailScreen
      viewer={screenData.viewer}
      group={screenData.group}
      invites={screenData.invites}
      canManageInvites={screenData.canManageInvites}
      canRemoveMembers={screenData.canRemoveMembers}
      flashMessage={flashMessage}
      groupQuery={groupQuery.toString() || undefined}
    />
  );
}
