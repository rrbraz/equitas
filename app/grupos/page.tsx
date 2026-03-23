import { GroupsScreen } from "@/features/groups/components/groups-screen";
import {
  getMockCreatedGroupDetailScreenData,
  getMockGroupsScreenData,
} from "@/features/groups/data/mock-groups";

export default async function GruposPage({
  searchParams,
}: {
  searchParams: Promise<{
    scenario?: string;
    created?: string;
    name?: string;
    category?: string;
    members?: string;
  }>;
}) {
  const params = await searchParams;
  const scenario = params.scenario === "new" ? "new" : "default";
  const screenData = getMockGroupsScreenData(scenario);
  const createdGroup =
    params.created === "1"
      ? getMockCreatedGroupDetailScreenData({
          slug:
            params.name
              ?.toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "") ?? "novo-grupo",
          name: params.name,
          category: params.category,
          members: params.members?.split("|").filter(Boolean),
        })?.group
      : undefined;
  const createdGroupQuery =
    params.created === "1"
      ? new URLSearchParams({
          created: "1",
          ...(params.name ? { name: params.name } : {}),
          ...(params.category ? { category: params.category } : {}),
          ...(params.members ? { members: params.members } : {}),
        }).toString()
      : undefined;
  const groups = createdGroup
    ? [
        createdGroup,
        ...screenData.groups.filter(
          (group) => group.slug !== createdGroup.slug,
        ),
      ]
    : screenData.groups;

  return (
    <GroupsScreen
      {...screenData}
      groups={groups}
      createdGroupSlug={createdGroup?.slug}
      createdGroupQuery={createdGroupQuery}
    />
  );
}
