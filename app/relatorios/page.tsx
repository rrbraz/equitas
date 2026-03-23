import { ReportsScreen } from "@/features/reports/components/reports-screen";
import { getMockReportsScreenData } from "@/features/reports/data/mock-reports";

export default function RelatoriosPage() {
  return <ReportsScreen {...getMockReportsScreenData()} />;
}
