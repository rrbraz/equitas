import { DashboardScreen } from "@/features/dashboard/components/dashboard-screen";
import { getDashboardScreenData } from "@/features/dashboard/data/get-dashboard-screen-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  return <DashboardScreen {...await getDashboardScreenData()} />;
}
