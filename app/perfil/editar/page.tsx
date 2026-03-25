import { EditProfileScreen } from "@/features/profile/components/edit-profile-screen";
import { getCurrentViewer } from "@/features/profile/data/get-current-viewer";

export const dynamic = "force-dynamic";

export default async function EditarPerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>;
}) {
  const params = await searchParams;
  const viewer = await getCurrentViewer();
  const scenario = params.scenario === "new" ? "new" : undefined;

  return <EditProfileScreen viewer={viewer} scenario={scenario} />;
}
