"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";

import { ActionFeedback } from "@/components/action-feedback";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
    null,
  );
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit() {
    if (!email.includes("@")) {
      setSubmitErrorMessage(
        "Informe um e-mail válido para iniciar a recuperação.",
      );
      return;
    }

    setSubmitErrorMessage(null);
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setSubmitErrorMessage(
        "Configure as variáveis do Supabase para usar a recuperação real.",
      );
      return;
    }

    setIsPending(true);

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", "/perfil/seguranca?recovery=1");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callbackUrl.toString(),
    });

    if (error) {
      setSubmitErrorMessage(error.message);
      setIsPending(false);
      return;
    }

    router.replace("/login?recovered=1");
    router.refresh();
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
          Envie um link de recuperação para o email da sua conta.
        </p>
      </div>

      <section className="auth-panel">
        {submitErrorMessage ? (
          <ActionFeedback
            title="Não foi possível continuar"
            message={submitErrorMessage}
          />
        ) : null}

        <form
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
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

          <button
            type="submit"
            className="primary-button primary-button--full"
            disabled={isPending}
          >
            <MailCheck size={18} />
            {isPending ? "Enviando..." : "Enviar instruções"}
          </button>
        </form>
      </section>
    </div>
  );
}
