"use client";

import { ArrowRight, Link2 } from "lucide-react";
import { useState, useTransition } from "react";

import { ActionFeedback } from "@/components/action-feedback";
import { acceptGroupInvite } from "@/features/groups/actions/accept-group-invite";

type AcceptInviteCardProps = {
  token: string;
};

export function AcceptInviteCard({ token }: AcceptInviteCardProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAccept() {
    startTransition(async () => {
      const result = await acceptGroupInvite(token);

      if (!result.ok) {
        setFeedback(result.message);
        return;
      }

      window.location.assign(`/grupos/${result.slug}?joined=1`);
    });
  }

  return (
    <section className="surface-card stack-column">
      <div className="hero-copy">
        <span className="eyebrow-note">Convite interno</span>
        <h1>Aceite o convite para entrar no grupo.</h1>
        <p>
          O acesso só é concluído na sua sessão autenticada e respeita as regras
          do token gerado pelo grupo.
        </p>
      </div>

      {feedback ? (
        <ActionFeedback title="Convite não aceito" message={feedback} />
      ) : null}

      <button
        type="button"
        className="primary-button primary-button--full"
        onClick={handleAccept}
        disabled={isPending}
      >
        <Link2 size={18} />
        {isPending ? "Aceitando..." : "Aceitar convite"}
        <ArrowRight size={18} />
      </button>
    </section>
  );
}
