import type { ProfileScreenData } from "@/features/profile/types";
import type { ProfileRow } from "@/lib/supabase/profile";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) {
    return "EQ";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function mapProfileToViewer(
  profile: ProfileRow,
): ProfileScreenData["viewer"] {
  const createdAt = new Date(profile.created_at);
  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
  }).format(createdAt);

  return {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    initials: getInitials(profile.full_name),
    role: "Conta Equitas",
    city: profile.city,
    since: String(createdAt.getUTCFullYear()),
    memberSinceLabel: `Conta criada em ${monthLabel}`,
    avatarUrl: profile.avatar_url,
  };
}
