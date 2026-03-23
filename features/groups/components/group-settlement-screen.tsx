"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BanknoteArrowUp,
} from "lucide-react";
import { useTransition } from "react";

import { ActionFeedback } from "@/components/action-feedback";
import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/top-bar";
import type { Group } from "@/features/groups/types";
import { formatCurrency } from "@/lib/format";
import type { Viewer } from "@/features/viewer/types";

type GroupSettlementScreenProps = {
  viewer: Viewer;
  group: Group;
  groupQuery?: string;
};

export function GroupSettlementScreen({
  viewer,
  group,
  groupQuery,
}: GroupSettlementScreenProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const detailParams = new URLSearchParams(groupQuery ?? "");

  function handleConfirm() {
    detailParams.set("settled", "1");
    startTransition(() => {
      router.push(`/grupos/${group.slug}?${detailParams.toString()}`);
    });
  }

  return (
    <div className="screen-shell">
      <TopBar
        title="Iniciar quitação"
        leading={
          <Link
            href={`/grupos/${group.slug}${groupQuery ? `?${groupQuery}` : ""}`}
            className="icon-button"
            aria-label="Voltar"
          >
            <ArrowLeft size={18} />
          </Link>
        }
        trailing={<span className="top-bar__eyebrow">{viewer.initials}</span>}
      />

      <main className="page-content">
        <section className="hero-copy">
          <span className="eyebrow-note">Settlement preview</span>
          <h1>Feche o ciclo deste grupo.</h1>
          <p>
            Esta etapa ainda é mockada, mas já mostra um caminho explícito para
            iniciar a quitação sem deixar um botão morto no detalhe do grupo.
          </p>
        </section>

        <ActionFeedback
          tone="info"
          title="Fluxo de transição"
          message="A liquidação real entra nas próximas histórias. Aqui validamos navegação, contexto e confirmação."
        />

        <section className="surface-card stack-column">
          <span className="section-label">Grupo</span>
          <strong>{group.name}</strong>
          <p className="supporting-copy">
            Total movimentado: {formatCurrency(group.totalSpend)}
          </p>
          <p className="supporting-copy">
            Participantes com saldo:{" "}
            {group.members.filter((member) => member.balance !== 0).length}
          </p>
        </section>

        <section className="surface-card stack-column">
          <div className="inline-card">
            <div className="inline-card__avatar inline-card__avatar--soft">
              <BanknoteArrowUp size={18} />
            </div>
            <div>
              <strong>Próximo passo sugerido</strong>
              <p>
                Confirmar a intenção e retornar ao grupo com feedback visual.
              </p>
            </div>
          </div>
        </section>

        <button
          type="button"
          className="primary-button primary-button--full"
          onClick={handleConfirm}
          disabled={isPending}
        >
          <BadgeCheck size={18} />
          {isPending ? "Confirmando..." : "Confirmar quitação mock"}
          <ArrowRight size={18} />
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
