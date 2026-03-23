import { ReportsScreen } from "@/features/reports/components/reports-screen";
import { getMockReportsScreenData } from "@/features/reports/data/mock-reports";

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>;
}) {
  const params = await searchParams;
  const scenario = params.scenario === "new" ? "new" : "default";

  return <ReportsScreen {...getMockReportsScreenData(scenario)} />;
}
