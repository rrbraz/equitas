"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { useState, useTransition } from "react";

import { ActionFeedback } from "@/components/action-feedback";
import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/top-bar";

type ChangePasswordScreenProps = {
  scenario?: "default" | "new";
};

export function ChangePasswordScreen({ scenario }: ChangePasswordScreenProps) {
  const router = useRouter();
  const profileHref = scenario === "new" ? "/perfil?scenario=new" : "/perfil";
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (currentPassword.length < 8) {
      setSubmitErrorMessage(
        "Informe a senha atual com pelo menos 8 caracteres.",
      );
      return;
    }

    if (newPassword.length < 8) {
      setSubmitErrorMessage(
        "A nova senha precisa ter pelo menos 8 caracteres.",
      );
      return;
    }

    setSubmitErrorMessage(null);
    startTransition(() => {
      router.push(
        scenario === "new"
          ? "/perfil?passwordUpdated=1&scenario=new"
          : "/perfil?passwordUpdated=1",
      );
    });
  }

  return (
    <div className="screen-shell">
      <TopBar
        title="Trocar senha"
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
          message="A alteração ainda não persiste, mas a jornada precisa parecer real antes da integração com auth."
        />

        {submitErrorMessage ? (
          <ActionFeedback
            title="Não foi possível atualizar a senha"
            message={submitErrorMessage}
          />
        ) : null}

        <section className="surface-card stack-column">
          <label>
            <span className="field-label">Senha atual</span>
            <input
              className="input-plain"
              type="password"
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value);
                setSubmitErrorMessage(null);
              }}
            />
          </label>
          <label>
            <span className="field-label">Nova senha</span>
            <input
              className="input-plain"
              type="password"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
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
          {isPending ? <ShieldCheck size={18} /> : <KeyRound size={18} />}
          {isPending ? "Atualizando..." : "Atualizar senha"}
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
