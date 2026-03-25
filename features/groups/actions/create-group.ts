"use server";

import { revalidatePath } from "next/cache";

import { buildGroupSlug } from "@/features/groups/lib/build-group-slug";
import { getGroupCategorySlug } from "@/features/groups/lib/group-categories";
import { logServerError } from "@/lib/server/logger";
import { ensureProfileForUser } from "@/lib/supabase/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

type CreateGroupInput = {
  name: string;
  category: string;
  description: string;
  inviteEmails: string[];
};

type CreateGroupResult =
  | { ok: true; slug: string; inviteCount: number; inviteWarning?: boolean }
  | { ok: false; message: string };

function normalizeInviteEmails(inviteEmails: string[]) {
  return inviteEmails
    .map((email) => email.trim().toLowerCase())
    .filter((email, index, emails) => {
      return email.includes("@") && emails.indexOf(email) === index;
    });
}

export async function createGroup(
  input: CreateGroupInput,
): Promise<CreateGroupResult> {
  const name = input.name.trim();
  const description = input.description.trim();
  const categorySlug = getGroupCategorySlug(input.category);
  const inviteEmails = normalizeInviteEmails(input.inviteEmails);

  if (name.length < 3) {
    return {
      ok: false,
      message: "Use um nome com pelo menos 3 caracteres.",
    };
  }

  if (!categorySlug) {
    return {
      ok: false,
      message: "Selecione uma categoria válida para o grupo.",
    };
  }

  if (description.length > 240) {
    return {
      ok: false,
      message: "A descrição pode ter no máximo 240 caracteres.",
    };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Sua sessão expirou. Entre novamente para criar o grupo.",
    };
  }

  await ensureProfileForUser(supabase, user);

  let createdGroup:
    | {
        id: string;
        slug: string;
      }
    | undefined;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidateSlug = buildGroupSlug(name, attempt);
    const { data, error } = await supabase.rpc("create_group", {
      group_slug: candidateSlug,
      group_name: name,
      group_category_slug: categorySlug,
      group_description: description || null,
    });

    if (!error) {
      createdGroup = data;
      break;
    }

    if (error.code !== "23505") {
      logServerError("create_group_failed", error, {
        groupName: name,
        categorySlug,
      });
      return {
        ok: false,
        message: "Não foi possível criar o grupo agora.",
      };
    }
  }

  if (!createdGroup) {
    return {
      ok: false,
      message: "Não foi possível gerar um slug disponível para esse grupo.",
    };
  }

  if (inviteEmails.length > 0) {
    const { error: invitesError } = await supabase.from("group_invites").insert(
      inviteEmails.map((email) => ({
        group_id: createdGroup.id,
        invited_email: email,
        role: "member",
        invited_by_profile_id: user.id,
      })),
    );

    if (invitesError) {
      logServerError("create_group_invites_failed", invitesError, {
        groupId: createdGroup.id,
        inviteCount: inviteEmails.length,
      });
      revalidatePath("/dashboard");
      revalidatePath("/grupos");
      revalidatePath(`/grupos/${createdGroup.slug}`);

      return {
        ok: true,
        slug: createdGroup.slug,
        inviteCount: 0,
        inviteWarning: true,
      };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/grupos");
  revalidatePath(`/grupos/${createdGroup.slug}`);

  return {
    ok: true,
    slug: createdGroup.slug,
    inviteCount: inviteEmails.length,
  };
}
