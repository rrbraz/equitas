import { CreateGroupScreen } from "@/features/groups/components/create-group-screen";
import { getMockCreateGroupScreenData } from "@/features/groups/data/mock-groups";

export default async function CriarGrupoPage({
  searchParams,
}: {
  searchParams: Promise<{ member?: string }>;
}) {
  const params = await searchParams;

  return <CreateGroupScreen {...getMockCreateGroupScreenData(params.member)} />;
}
