"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { useState, useTransition } from "react";

import { ActionFeedback } from "@/components/action-feedback";
import { BottomNav } from "@/components/bottom-nav";
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
    if (!name.trim()) {
      setSubmitErrorMessage("Defina um nome para salvar o perfil.");
      return;
    }

    if (!city.trim()) {
      setSubmitErrorMessage("Defina uma cidade para completar o perfil.");
      return;
    }

    setSubmitErrorMessage(null);
    startTransition(() => {
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
        <ActionFeedback
          tone="info"
          title="Fluxo mock"
          message="Os dados ainda não persistem, mas esta etapa já valida edição, retorno e feedback do perfil."
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

        <button
          type="button"
          className="primary-button primary-button--full"
          onClick={handleSubmit}
          disabled={isPending}
        >
          <Save size={18} />
          {isPending ? "Salvando..." : "Salvar perfil"}
          <ArrowRight size={18} />
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
