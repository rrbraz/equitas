"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { ActionFeedback } from "@/components/action-feedback";
import { Button } from "@/components/button";
import { BottomNav } from "@/components/bottom-nav";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { PageIntro } from "@/components/page-intro";
import { TopBar } from "@/components/top-bar";

type ChangePasswordScreenProps = {
  recoveryMode?: boolean;
  scenario?: "default" | "new";
};

export function ChangePasswordScreen({
  recoveryMode = false,
  scenario,
}: ChangePasswordScreenProps) {
  const router = useRouter();
  const profileHref = scenario === "new" ? "/perfil?scenario=new" : "/perfil";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
    null,
  );
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit() {
    if (newPassword.length < 8) {
      setSubmitErrorMessage(
        "A nova senha precisa ter pelo menos 8 caracteres.",
      );
      return;
    }

    if (confirmPassword !== newPassword) {
      setSubmitErrorMessage("A confirmação precisa bater com a nova senha.");
      return;
    }

    setSubmitErrorMessage(null);
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setSubmitErrorMessage(
        "Configure as variáveis do Supabase para alterar a senha.",
      );
      return;
    }

    setIsPending(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setSubmitErrorMessage(error.message);
      setIsPending(false);
      return;
    }

    router.replace(
      scenario === "new"
        ? "/perfil?passwordUpdated=1&scenario=new"
        : "/perfil?passwordUpdated=1",
    );
    router.refresh();
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
        <PageIntro
          eyebrow={recoveryMode ? "Recuperação validada" : "Credenciais"}
          title="Trocar senha"
          description={
            recoveryMode
              ? "Defina a nova senha para concluir a retomada de acesso da conta."
              : "Atualize a senha da sessão atual sem sair do fluxo principal."
          }
        />

        <ActionFeedback
          tone="info"
          title={recoveryMode ? "Defina a nova senha" : "Alterar senha"}
          message={
            recoveryMode
              ? "O link foi validado. Defina a nova senha para concluir a recuperação."
              : "Atualize a senha da sua sessão atual usando o Supabase Auth."
          }
        />

        {submitErrorMessage ? (
          <ActionFeedback
            title="Não foi possível atualizar a senha"
            message={submitErrorMessage}
          />
        ) : null}

        <section className="surface-card stack-column">
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
          <label>
            <span className="field-label">Confirmar nova senha</span>
            <input
              className="input-plain"
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setSubmitErrorMessage(null);
              }}
            />
          </label>
        </section>

        <Button fullWidth onClick={handleSubmit} disabled={isPending}>
          {isPending ? <ShieldCheck size={18} /> : <KeyRound size={18} />}
          {isPending ? "Atualizando..." : "Atualizar senha"}
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}
