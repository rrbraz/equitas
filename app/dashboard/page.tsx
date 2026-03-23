import { DashboardScreen } from "@/features/dashboard/components/dashboard-screen";
import { getMockDashboardScreenData } from "@/features/dashboard/data/mock-dashboard";

export default function DashboardPage() {
  return <DashboardScreen {...getMockDashboardScreenData()} />;
}
