import Link from "next/link";
import { ArrowLeft, BanknoteArrowUp, Plus } from "lucide-react";

import { ActionFeedback } from "@/components/action-feedback";
import { Avatar } from "@/components/avatar";
import { ButtonLink } from "@/components/button";
import { BottomNav } from "@/components/bottom-nav";
import { EmptyState } from "@/components/empty-state";
import { MetaPill, MetaPills } from "@/components/meta-pills";
import { SectionBlock } from "@/components/section-block";
import { GroupMembersPanel } from "@/features/groups/components/group-members-panel";
import { TopBar } from "@/components/top-bar";
import type { Group, GroupInviteSummary } from "@/features/groups/types";
import { formatCurrency } from "@/lib/format";
import type { Viewer } from "@/features/viewer/types";

type GroupDetailScreenProps = {
  viewer: Viewer;
  group: Group;
  invites: GroupInviteSummary[];
  canManageInvites: boolean;
  canRemoveMembers: boolean;
  flashMessage?: string;
  groupQuery?: string;
};

export function GroupDetailScreen({
  viewer,
  group,
  invites,
  canManageInvites,
  canRemoveMembers,
  flashMessage,
  groupQuery,
}: GroupDetailScreenProps) {
  const querySuffix = groupQuery ? `?${groupQuery}` : "";
  const settlements = group.settlements;

  function formatSettlementDate(dateString: string) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(dateString));
  }

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
            src={viewer.avatarUrl ?? undefined}
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
          <span className="section-label">Resumo do grupo</span>
          <h1 className="hero-amount">{formatCurrency(group.totalSpend)}</h1>
          <p>{group.description}</p>
          <MetaPills className="hero-card__meta">
            <MetaPill>{group.category}</MetaPill>
            <MetaPill>{group.memberCount} membro(s)</MetaPill>
            <MetaPill>{group.expenses.length} despesa(s)</MetaPill>
          </MetaPills>
          <div className="hero-card__actions">
            <ButtonLink
              href={`/grupos/${group.slug}/quitar${querySuffix}`}
              variant="secondary"
            >
              <BanknoteArrowUp size={18} />
              Transferir saldo
            </ButtonLink>
            <ButtonLink
              href={`/grupos/${group.slug}/despesas/nova${querySuffix}`}
              variant="secondary"
            >
              <Plus size={18} />
              Adicionar despesa
            </ButtonLink>
          </div>
        </section>

        <GroupMembersPanel
          groupId={group.id}
          groupSlug={group.slug}
          members={group.members}
          invites={invites}
          canManageInvites={canManageInvites}
          canRemoveMembers={canRemoveMembers}
        />

        <SectionBlock
          title="Despesas recentes"
          description="Timeline do grupo com contexto de pagador e divisão."
          trailing={
            <Link
              href={`/relatorios?group=${group.slug}`}
              className="ghost-link"
            >
              Ver relatórios
            </Link>
          }
        >
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
                    {expense.canManage ? (
                      <Link
                        href={`/grupos/${group.slug}/despesas/${expense.id}/editar${querySuffix}`}
                        className="ghost-link ghost-link--compact"
                      >
                        Editar despesa
                      </Link>
                    ) : null}
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
        </SectionBlock>

        {settlements.length > 0 ? (
          <SectionBlock
            title="Transferências registradas"
            description="Quitações já lançadas para encerrar pendências entre membros."
            trailing={
              <span className="section-label">
                {settlements.length} no grupo
              </span>
            }
          >
            <div className="list-stack">
              {settlements.map((settlement) => (
                <article key={settlement.id} className="list-card">
                  <div className="inline-card__avatar inline-card__avatar--soft">
                    T
                  </div>
                  <div className="list-card__copy">
                    <div className="list-card__title">
                      {settlement.payer} pagou para {settlement.receiver}
                    </div>
                    <p className="list-card__meta">
                      Transferência registrada em{" "}
                      {formatSettlementDate(settlement.settledAt)}
                    </p>
                  </div>
                  <div className="list-card__value">
                    <strong>{formatCurrency(settlement.amount)}</strong>
                  </div>
                </article>
              ))}
            </div>
          </SectionBlock>
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
}
