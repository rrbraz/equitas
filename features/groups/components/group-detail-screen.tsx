import Link from "next/link";
import { ArrowLeft, BanknoteArrowUp, Plus } from "lucide-react";

import { ActionFeedback } from "@/components/action-feedback";
import { Avatar } from "@/components/avatar";
import { BottomNav } from "@/components/bottom-nav";
import { EmptyState } from "@/components/empty-state";
import { TopBar } from "@/components/top-bar";
import type { Group } from "@/features/groups/types";
import { formatCurrency } from "@/lib/format";
import type { Viewer } from "@/features/viewer/types";

type GroupDetailScreenProps = {
  viewer: Viewer;
  group: Group;
  flashMessage?: string;
  groupQuery?: string;
};

export function GroupDetailScreen({
  viewer,
  group,
  flashMessage,
  groupQuery,
}: GroupDetailScreenProps) {
  const querySuffix = groupQuery ? `?${groupQuery}` : "";

  return (
    <div className="screen-shell">
      <TopBar
        title={group.name}
        leading={
          <Link
            href={groupQuery ? `/grupos?${groupQuery}` : "/grupos"}
            className="icon-button"
            aria-label="Voltar"
          >
            <ArrowLeft size={18} />
          </Link>
        }
        trailing={
          <Avatar
            name={viewer.name}
            initials={viewer.initials}
            tone="amber"
            size="sm"
          />
        }
      />

      <main className="page-content">
        {flashMessage ? (
          <ActionFeedback
            tone="success"
            title="Fluxo concluído"
            message={flashMessage}
          />
        ) : null}

        <section className="hero-card">
          <span className="section-label">Total do grupo</span>
          <h1 className="hero-amount">{formatCurrency(group.totalSpend)}</h1>
          <div className="button-row">
            <Link
              href={`/grupos/${group.slug}/quitar${querySuffix}`}
              className="secondary-button"
            >
              <BanknoteArrowUp size={18} />
              Quitar
            </Link>
            <Link
              href={`/grupos/${group.slug}/despesas/nova${querySuffix}`}
              className="secondary-button"
            >
              <Plus size={18} />
              Adicionar despesa
            </Link>
          </div>
        </section>

        <section className="stack-column">
          <div className="section-heading">
            <h2>Saldos por membro</h2>
            <span className="section-label">Momento atual</span>
          </div>
          <div className="list-stack">
            {group.members.map((member) => (
              <article key={member.member} className="list-card">
                <Avatar
                  name={member.member}
                  initials={member.initials}
                  tone={member.tone}
                  size="sm"
                />
                <div className="list-card__copy">
                  <div className="list-card__title">{member.member}</div>
                  <p className="list-card__meta">{member.role}</p>
                </div>
                <div className="list-card__value">
                  <span>
                    {member.balance > 0
                      ? "A receber"
                      : member.balance < 0
                        ? "A pagar"
                        : "Sem saldo"}
                  </span>
                  <strong
                    className={
                      member.balance >= 0 ? "money-positive" : "money-negative"
                    }
                  >
                    {formatCurrency(Math.abs(member.balance))}
                  </strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="stack-column">
          <div className="section-heading">
            <h2>Despesas recentes</h2>
            <Link href="/relatorios" className="ghost-link">
              Ver relatórios
            </Link>
          </div>
          {group.expenses.length > 0 ? (
            <div className="list-stack">
              {group.expenses.map((expense) => (
                <article key={expense.id} className="list-card">
                  <div className="inline-card__avatar inline-card__avatar--soft">
                    {expense.category.slice(0, 1)}
                  </div>
                  <div className="list-card__copy">
                    <div className="list-card__title">{expense.title}</div>
                    <p className="list-card__meta">
                      Pago por {expense.paidBy} · {expense.splitPreview}
                    </p>
                  </div>
                  <div className="list-card__value">
                    <strong>{formatCurrency(expense.amount)}</strong>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              eyebrow="Sem despesas ainda"
              title="Este grupo ainda não começou a dividir gastos"
              description="Adicione a primeira despesa para abrir a timeline e começar a acompanhar os saldos dos participantes."
              actionHref={`/grupos/${group.slug}/despesas/nova${querySuffix}`}
              actionLabel="Adicionar despesa"
            />
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
