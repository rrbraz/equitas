"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound } from "lucide-react";
import { useState } from "react";

import { ActionFeedback } from "@/components/action-feedback";
import { getSafeNextPath } from "@/features/auth/lib/get-safe-next-path";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type LoginScreenProps = {
  actionErrorMessage?: string;
  infoMessage?: string;
  nextPath?: string;
};

export function LoginScreen({
  actionErrorMessage,
  infoMessage,
  nextPath,
}: LoginScreenProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
    null,
  );
  const [isPending, setIsPending] = useState(false);
  const feedbackMessage = actionErrorMessage ?? submitErrorMessage;

  async function handleSubmit() {
    if (!email.includes("@")) {
      setSubmitErrorMessage("Use um e-mail válido para entrar.");
      return;
    }

    if (password.length < 8) {
      setSubmitErrorMessage("Informe uma senha com pelo menos 8 caracteres.");
      return;
    }

    setSubmitErrorMessage(null);
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setSubmitErrorMessage(
        "Configure as variáveis do Supabase para usar o login real.",
      );
      return;
    }

    setIsPending(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setSubmitErrorMessage(error.message);
      setIsPending(false);
      return;
    }

    router.replace(getSafeNextPath(nextPath));
    router.refresh();
  }

  const signUpHref = nextPath
    ? `/cadastro?next=${encodeURIComponent(nextPath)}`
    : "/cadastro";

  return (
    <div className="auth-shell">
      <div className="auth-header">
        <div className="brand-mark">Equitas</div>
        <p className="eyebrow-note">Entrar.</p>
        <h1 className="auth-headline">Entre e retome seus grupos.</h1>
        <p className="auth-subcopy">
          Acesse dashboard, despesas e saldos com email e senha conectados ao
          Supabase Auth.
        </p>
      </div>

      <section className="auth-panel">
        {infoMessage ? (
          <ActionFeedback
            tone="success"
            title="Acesso disponível"
            message={infoMessage}
          />
        ) : null}

        {feedbackMessage ? (
          <ActionFeedback
            title="Não foi possível entrar"
            message={feedbackMessage}
          />
        ) : null}

        <div className="form-stack">
          <label>
            <span className="field-label">Email</span>
            <input
              className="input-plain"
              placeholder="name@example.com"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setSubmitErrorMessage(null);
              }}
            />
          </label>
          <label>
            <span className="field-label">Senha</span>
            <input
              className="input-plain"
              placeholder="Sua senha"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setSubmitErrorMessage(null);
              }}
            />
          </label>
        </div>

        <button
          type="button"
          className="primary-button primary-button--full"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? "Entrando..." : "Entrar"}
          <ArrowRight size={18} />
        </button>

        <Link href="/recuperar-acesso" className="ghost-link auth-link-row">
          <KeyRound size={16} />
          Esqueci minha senha
        </Link>

        <p className="mono-caption">
          Ainda não tem conta?{" "}
          <Link href={signUpHref} className="inline-link">
            Criar conta
          </Link>
        </p>
      </section>
    </div>
  );
}
