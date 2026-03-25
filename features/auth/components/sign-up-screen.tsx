"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ActionFeedback } from "@/components/action-feedback";
import { useState } from "react";

import { getSafeNextPath } from "@/features/auth/lib/get-safe-next-path";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type SignUpScreenProps = {
  actionErrorMessage?: string;
  nextPath?: string;
};

export function SignUpScreen({
  actionErrorMessage,
  nextPath,
}: SignUpScreenProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(
    null,
  );
  const [isPending, setIsPending] = useState(false);
  const feedbackMessage = actionErrorMessage ?? submitErrorMessage;

  async function handleSubmit() {
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
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setSubmitErrorMessage(
        "Configure as variáveis do Supabase para usar o cadastro real.",
      );
      return;
    }

    setIsPending(true);

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set(
      "next",
      getSafeNextPath(nextPath, "/dashboard?scenario=new"),
    );

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
        emailRedirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      setSubmitErrorMessage(error.message);
      setIsPending(false);
      return;
    }

    if (data.session) {
      router.replace(getSafeNextPath(nextPath, "/dashboard?scenario=new"));
      router.refresh();
      return;
    }

    router.replace("/login?registered=1");
    router.refresh();
  }

  const loginHref = nextPath
    ? `/login?next=${encodeURIComponent(nextPath)}`
    : "/login";

  return (
    <div className="auth-shell">
      <div className="auth-header">
        <div className="brand-mark">Equitas</div>
        <p className="eyebrow-note">Criar conta.</p>
        <h1 className="auth-headline">Clareza financeira para grupos.</h1>
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

        <form
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
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

          <button
            type="submit"
            className="primary-button primary-button--full"
            disabled={isPending}
          >
            {isPending ? "Criando conta..." : "Criar conta"}
            <ArrowRight size={18} />
          </button>
        </form>

        <ActionFeedback
          tone="info"
          title="Confirmação por e-mail pode estar ativa"
          message="Se o projeto exigir confirmação, você recebe um link e conclui a entrada pelo callback autenticado."
        />

        <p className="mono-caption">
          Já tem conta?{" "}
          <Link href={loginHref} className="inline-link">
            Fazer login
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
