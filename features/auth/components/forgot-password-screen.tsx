"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";

import { ActionFeedback } from "@/components/action-feedback";

export function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
    null,
  );

  function handleSubmit() {
    if (!email.includes("@")) {
      setSubmitErrorMessage(
        "Informe um e-mail válido para iniciar a recuperação.",
      );
      return;
    }

    setSubmitErrorMessage(null);
    router.push("/login?recovered=1");
  }

  return (
    <div className="auth-shell">
      <div className="auth-header">
        <Link href="/login" className="ghost-link auth-link-row">
          <ArrowLeft size={16} />
          Voltar para login
        </Link>
        <div className="brand-mark">Equitas</div>
        <p className="eyebrow-note">Recuperar acesso.</p>
        <h1 className="auth-headline">Redefina o próximo passo.</h1>
        <p className="auth-subcopy">
          Este fluxo ainda é mockado, mas precisa parecer uma jornada real do
          produto.
        </p>
      </div>

      <section className="auth-panel">
        {submitErrorMessage ? (
          <ActionFeedback
            title="Não foi possível continuar"
            message={submitErrorMessage}
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
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
        </div>

        <button
          type="button"
          className="primary-button primary-button--full"
          onClick={handleSubmit}
        >
          <MailCheck size={18} />
          Enviar instruções
        </button>
      </section>
    </div>
  );
}
