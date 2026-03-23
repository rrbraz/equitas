"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Apple, ArrowRight, Chrome } from "lucide-react";
import { ActionFeedback } from "@/components/action-feedback";
import { useState, useTransition } from "react";

type SignUpScreenProps = {
  actionErrorMessage?: string;
};

export function SignUpScreen({ actionErrorMessage }: SignUpScreenProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const feedbackMessage = actionErrorMessage ?? submitErrorMessage;

  function handleSubmit() {
    if (!fullName.trim()) {
      setSubmitErrorMessage("Informe seu nome completo para continuar.");
      return;
    }

    if (!email.includes("@")) {
      setSubmitErrorMessage("Use um e-mail válido para criar sua conta.");
      return;
    }

    if (password.length < 8) {
      setSubmitErrorMessage("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    setSubmitErrorMessage(null);
    startTransition(() => {
      router.push("/dashboard");
    });
  }

  return (
    <div className="auth-shell">
      <div className="auth-header">
        <div className="brand-mark">Equitas</div>
        <p className="eyebrow-note">Join the atelier.</p>
        <h1 className="auth-headline">
          Clareza financeira para grupos elegantes.
        </h1>
        <p className="auth-subcopy">
          Crie sua conta, organize despesas compartilhadas e leve o backend para
          o Supabase desde o primeiro deploy.
        </p>
      </div>

      <section className="auth-panel">
        {feedbackMessage ? (
          <ActionFeedback
            title="Não foi possível criar sua conta"
            message={feedbackMessage}
          />
        ) : null}

        <div className="form-stack">
          <label>
            <span className="field-label">Nome completo</span>
            <input
              className="input-plain"
              placeholder="Ex.: Julian Smith"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                setSubmitErrorMessage(null);
              }}
            />
          </label>
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
              placeholder="Min. 8 caracteres"
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
          {isPending ? "Criando conta..." : "Criar conta"}
          <ArrowRight size={18} />
        </button>

        <div className="center-divider">ou continue com</div>

        <div className="social-grid">
          <button className="social-button" type="button">
            <Chrome size={18} />
            Google
          </button>
          <button className="social-button" type="button">
            <Apple size={18} />
            Apple
          </button>
        </div>

        <p className="mono-caption">
          Já tem conta?{" "}
          <Link href="/dashboard" className="inline-link">
            Entrar no app
          </Link>
        </p>
      </section>

      <div className="footer-links">
        <span>Privacidade</span>
        <span>Termos</span>
        <span>Segurança</span>
      </div>
    </div>
  );
}
