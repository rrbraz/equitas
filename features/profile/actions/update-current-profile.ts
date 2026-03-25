"use server";

import { revalidatePath } from "next/cache";

import { ensureProfileForUser } from "@/lib/supabase/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

type UpdateCurrentProfileInput = {
  fullName: string;
  city: string;
};

type UpdateCurrentProfileResult = { ok: true } | { ok: false; message: string };

export async function updateCurrentProfile(
  input: UpdateCurrentProfileInput,
): Promise<UpdateCurrentProfileResult> {
  const fullName = input.fullName.trim();
  const city = input.city.trim();

  if (fullName.length < 2) {
    return {
      ok: false,
      message: "Defina um nome com pelo menos 2 caracteres.",
    };
  }

  if (city.length < 2) {
    return {
      ok: false,
      message: "Defina uma cidade com pelo menos 2 caracteres.",
    };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Sua sessão expirou. Entre novamente para editar o perfil.",
    };
  }

  await ensureProfileForUser(supabase, user);

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      city,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (error) {
    return {
      ok: false,
      message: "Não foi possível salvar o perfil agora.",
    };
  }

  revalidatePath("/perfil");
  revalidatePath("/perfil/editar");
  revalidatePath("/menu");

  return { ok: true };
}
