"use server";

import { revalidatePath } from "next/cache";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";

type CreateGroupInviteInput = {
  groupId: string;
  groupSlug: string;
  mode: "email" | "link";
  invitedEmail?: string;
};

type CreateGroupInviteResult =
  | {
      ok: true;
      message: string;
      token?: string;
    }
  | {
      ok: false;
      message: string;
    };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createGroupInvite(
  input: CreateGroupInviteInput,
): Promise<CreateGroupInviteResult> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Sua sessão expirou. Entre novamente para convidar membros.",
    };
  }

  const invitedEmail =
    input.mode === "email" ? normalizeEmail(input.invitedEmail ?? "") : null;

  if (input.mode === "email" && !invitedEmail?.includes("@")) {
    return {
      ok: false,
      message: "Informe um e-mail válido para criar o convite.",
    };
  }

  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from("group_invites")
    .insert({
      group_id: input.groupId,
      invited_email: invitedEmail,
      role: "member",
      invited_by_profile_id: user.id,
      expires_at: expiresAt,
    })
    .select("token")
    .single<{ token: string }>();

  if (error) {
    if (error.code === "23505" && invitedEmail) {
      return {
        ok: false,
        message: "Já existe um convite pendente para esse e-mail neste grupo.",
      };
    }

    return {
      ok: false,
      message: "Não foi possível criar o convite agora.",
    };
  }

  revalidatePath(`/grupos/${input.groupSlug}`);

  return {
    ok: true,
    message:
      input.mode === "email"
        ? "Convite por e-mail criado com sucesso."
        : "Link interno criado com sucesso.",
    token: data.token,
  };
}
