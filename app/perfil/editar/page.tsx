import { EditProfileScreen } from "@/features/profile/components/edit-profile-screen";
import { getMockProfileScreenData } from "@/features/profile/data/mock-profile";

export default async function EditarPerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>;
}) {
  const params = await searchParams;
  const scenario = params.scenario === "new" ? "new" : "default";
  const { viewer } = getMockProfileScreenData(scenario);

  return <EditProfileScreen viewer={viewer} scenario={scenario} />;
}
