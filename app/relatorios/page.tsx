import { ReportsScreen } from "@/features/reports/components/reports-screen";
import { getReportsScreenData } from "@/features/reports/data/get-reports-screen-data";

export const dynamic = "force-dynamic";

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; group?: string }>;
}) {
  const params = await searchParams;
  const rangeDays = params.range === "30" ? 30 : 90;
  const screenData = await getReportsScreenData({
    rangeDays,
    groupSlug: params.group,
  });

  return <ReportsScreen {...screenData} />;
}
