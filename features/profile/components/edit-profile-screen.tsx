"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { useState, useTransition } from "react";

import { ActionFeedback } from "@/components/action-feedback";
import { Button } from "@/components/button";
import { BottomNav } from "@/components/bottom-nav";
import { PageIntro } from "@/components/page-intro";
import { updateCurrentProfile } from "@/features/profile/actions/update-current-profile";
import { TopBar } from "@/components/top-bar";
import type { ProfileScreenData } from "@/features/profile/types";

type EditProfileScreenProps = {
  viewer: ProfileScreenData["viewer"];
  scenario?: "default" | "new";
};

export function EditProfileScreen({
  viewer,
  scenario,
}: EditProfileScreenProps) {
  const router = useRouter();
  const profileHref = scenario === "new" ? "/perfil?scenario=new" : "/perfil";
  const [name, setName] = useState(viewer.name);
  const [city, setCity] = useState(viewer.city);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (name.trim().length < 2) {
      setSubmitErrorMessage("Defina um nome com pelo menos 2 caracteres.");
      return;
    }

    if (city.trim().length < 2) {
      setSubmitErrorMessage("Defina uma cidade com pelo menos 2 caracteres.");
      return;
    }

    setSubmitErrorMessage(null);
    startTransition(async () => {
      const result = await updateCurrentProfile({
        fullName: name,
        city,
      });

      if (!result.ok) {
        setSubmitErrorMessage(result.message);
        return;
      }

      router.push(
        scenario === "new"
          ? "/perfil?updated=1&scenario=new"
          : "/perfil?updated=1",
      );
    });
  }

  return (
    <div className="screen-shell">
      <TopBar
        title="Editar perfil"
        leading={
          <Link href={profileHref} className="icon-button" aria-label="Voltar">
            <ArrowLeft size={18} />
          </Link>
        }
      />

      <main className="page-content">
        <PageIntro
          eyebrow="Conta real"
          title="Editar perfil"
          description="Atualize os dados básicos que alimentam sua identidade dentro do app e dos grupos."
        />

        <ActionFeedback
          tone="info"
          title="Perfil real"
          message="As alterações são salvas no profile vinculado à sua sessão do Supabase."
        />

        {submitErrorMessage ? (
          <ActionFeedback
            title="Não foi possível salvar o perfil"
            message={submitErrorMessage}
          />
        ) : null}

        <section className="surface-card stack-column">
          <label>
            <span className="field-label">Nome</span>
            <input
              className="input-plain"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSubmitErrorMessage(null);
              }}
            />
          </label>
          <label>
            <span className="field-label">Email</span>
            <input
              className="input-plain"
              value={viewer.email}
              readOnly
              aria-readonly="true"
            />
          </label>
          <label>
            <span className="field-label">Cidade</span>
            <input
              className="input-plain"
              value={city}
              onChange={(event) => {
                setCity(event.target.value);
                setSubmitErrorMessage(null);
              }}
            />
          </label>
        </section>

        <Button fullWidth onClick={handleSubmit} disabled={isPending}>
          <Save size={18} />
          {isPending ? "Salvando..." : "Salvar perfil"}
          <ArrowRight size={18} />
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}
