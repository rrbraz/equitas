"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";

type AcceptGroupInviteResult =
  | { ok: true; slug: string }
  | { ok: false; message: string };

export async function acceptGroupInvite(
  token: string,
): Promise<AcceptGroupInviteResult> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Entre novamente para aceitar o convite.",
    };
  }

  const { data: membership, error } = await supabase.rpc(
    "accept_group_invite",
    {
      invite_token: token,
    },
  );

  if (error || !membership) {
    return {
      ok: false,
      message: "Não foi possível aceitar este convite.",
    };
  }

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("slug")
    .eq("id", membership.group_id)
    .single<{ slug: string }>();

  if (groupError || !group) {
    return {
      ok: false,
      message: "O convite foi aceito, mas não foi possível abrir o grupo.",
    };
  }

  return {
    ok: true,
    slug: group.slug,
  };
}
