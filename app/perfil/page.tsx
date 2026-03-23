import { ProfileScreen } from "@/features/profile/components/profile-screen";
import { getMockProfileScreenData } from "@/features/profile/data/mock-profile";

export default function PerfilPage() {
  return <ProfileScreen {...getMockProfileScreenData()} />;
}
