import { DashboardScreen } from "@/features/dashboard/components/dashboard-screen";
import { getMockDashboardScreenData } from "@/features/dashboard/data/mock-dashboard";
import { getMockCreatedGroupDetailScreenData } from "@/features/groups/data/mock-groups";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    scenario?: string;
    journey?: string;
    created?: string;
    name?: string;
    category?: string;
    members?: string;
  }>;
}) {
  const params = await searchParams;
  const scenario = params.scenario === "new" ? "new" : "default";
  const journey =
    params.journey === "signup" || params.journey === "login"
      ? params.journey
      : undefined;
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

  return (
    <DashboardScreen
      {...getMockDashboardScreenData(
        scenario,
        journey,
        createdGroup,
        createdGroupQuery,
      )}
    />
  );
}
