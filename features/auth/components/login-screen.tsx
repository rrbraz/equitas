"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound } from "lucide-react";
import { useState, useTransition } from "react";

import { ActionFeedback } from "@/components/action-feedback";

type LoginScreenProps = {
  actionErrorMessage?: string;
  infoMessage?: string;
};

export function LoginScreen({
  actionErrorMessage,
  infoMessage,
}: LoginScreenProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const feedbackMessage = actionErrorMessage ?? submitErrorMessage;

  function handleSubmit() {
    if (!email.includes("@")) {
      setSubmitErrorMessage("Use um e-mail válido para entrar.");
      return;
    }

    if (password.length < 8) {
      setSubmitErrorMessage("Informe uma senha com pelo menos 8 caracteres.");
      return;
    }

    setSubmitErrorMessage(null);
    startTransition(() => {
      router.push("/dashboard?journey=login");
    });
  }

  return (
    <div className="auth-shell">
      <div className="auth-header">
        <div className="brand-mark">Equitas</div>
        <p className="eyebrow-note">Entrar.</p>
        <h1 className="auth-headline">Entre e retome seus grupos.</h1>
        <p className="auth-subcopy">
          Acesse dashboard, despesas e saldos com um fluxo simples enquanto o
          backend real ainda está em transição.
        </p>
      </div>

      <section className="auth-panel">
        {infoMessage ? (
          <ActionFeedback
            tone="success"
            title="Fluxo preparado"
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
          <Link href="/cadastro" className="inline-link">
            Criar conta
          </Link>
        </p>
      </section>
    </div>
  );
}
