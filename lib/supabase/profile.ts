import type { SupabaseClient, User } from "@supabase/supabase-js";

export type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  city: string;
  avatar_url: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

const PROFILE_COLUMNS =
  "id, full_name, email, city, avatar_url, onboarding_completed, created_at, updated_at";

const DEFAULT_CITY = "Sao Paulo";

function getUserEmail(user: User) {
  return user.email?.trim().toLowerCase() ?? "";
}

function getUserFullName(user: User) {
  const metadataName =
    user.user_metadata.full_name ??
    user.user_metadata.name ??
    user.user_metadata.user_name;

  if (typeof metadataName === "string" && metadataName.trim().length >= 2) {
    return metadataName.trim();
  }

  const email = getUserEmail(user);

  if (!email) {
    return "Usuário Equitas";
  }

  const [localPart] = email.split("@");

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function getUserAvatarUrl(user: User) {
  const metadataAvatar =
    user.user_metadata.avatar_url ?? user.user_metadata.picture;

  return typeof metadataAvatar === "string" && metadataAvatar.trim()
    ? metadataAvatar.trim()
    : null;
}

function buildProfileInsertPayload(user: User) {
  return {
    id: user.id,
    full_name: getUserFullName(user),
    email: getUserEmail(user),
    city: DEFAULT_CITY,
    avatar_url: getUserAvatarUrl(user),
  };
}

export async function ensureProfileForUser(
  supabase: SupabaseClient,
  user: User,
) {
  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (existingProfileError) {
    throw existingProfileError;
  }

  if (!existingProfile) {
    const { error } = await supabase
      .from("profiles")
      .upsert(buildProfileInsertPayload(user), { onConflict: "id" });

    if (error) {
      throw error;
    }

    return;
  }

  const nextEmail = getUserEmail(user);
  const nextAvatarUrl = getUserAvatarUrl(user);
  const updates: Partial<ProfileRow> = {};

  if (nextEmail && existingProfile.email !== nextEmail) {
    updates.email = nextEmail;
  }

  if (nextAvatarUrl && existingProfile.avatar_url !== nextAvatarUrl) {
    updates.avatar_url = nextAvatarUrl;
  }

  if (existingProfile.full_name.trim().length < 2) {
    updates.full_name = getUserFullName(user);
  }

  if (existingProfile.city.trim().length < 2) {
    updates.city = DEFAULT_CITY;
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    throw error;
  }
}

export async function getProfileForUser(
  supabase: SupabaseClient,
  user: User,
): Promise<ProfileRow> {
  await ensureProfileForUser(supabase, user);

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      `Profile not found for user ${user.id} after ensureProfileForUser`,
    );
  }

  return data;
}
