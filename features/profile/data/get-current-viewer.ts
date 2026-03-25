import "server-only";

import { redirect } from "next/navigation";

import { mapProfileToViewer } from "@/features/profile/lib/map-profile-to-viewer";
import type { ProfileScreenData } from "@/features/profile/types";
import { getProfileForUser } from "@/lib/supabase/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export async function getCurrentViewer(): Promise<ProfileScreenData["viewer"]> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfileForUser(supabase, user);

  return mapProfileToViewer(profile);
}
