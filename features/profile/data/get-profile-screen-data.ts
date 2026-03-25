import "server-only";

import { redirect } from "next/navigation";

import { queryCurrentUserGroups } from "@/features/groups/data/query-current-user-groups";
import { profilePreferences } from "@/features/profile/lib/profile-preferences";
import { mapProfileToViewer } from "@/features/profile/lib/map-profile-to-viewer";
import type { ProfileScreenData } from "@/features/profile/types";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { getProfileForUser } from "@/lib/supabase/profile";

export async function getProfileScreenData(): Promise<ProfileScreenData> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=%2Fperfil");
  }

  const [profile, { groups }] = await Promise.all([
    getProfileForUser(supabase, user),
    queryCurrentUserGroups("/perfil"),
  ]);
  const owedToYou = groups.reduce(
    (total, group) => total + Math.max(group.balance, 0),
    0,
  );
  const youOwe = groups.reduce(
    (total, group) => total + Math.abs(Math.min(group.balance, 0)),
    0,
  );

  return {
    viewer: mapProfileToViewer(profile),
    totals: {
      owedToYou,
      youOwe,
    },
    preferences: profilePreferences,
    scenario: profile.onboarding_completed ? "default" : "new",
  };
}
