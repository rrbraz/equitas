import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  House,
  Plane,
  Sparkles,
} from "lucide-react";

import { AppMenu } from "@/components/app-menu";
import { Avatar } from "@/components/avatar";
import { BottomNav } from "@/components/bottom-nav";
import { EmptyState } from "@/components/empty-state";
import { FloatingAction } from "@/components/floating-action";
import { MetaPill, MetaPills } from "@/components/meta-pills";
import { SectionBlock } from "@/components/section-block";
import { TopBar } from "@/components/top-bar";
import type { DashboardScreenData } from "@/features/dashboard/types";
import { formatCurrency, formatSignedCurrency } from "@/lib/format";

const groupIcons = {
  house: House,
  plane: Plane,
  sparkles: Sparkles,
};

export function DashboardScreen({
  viewer,
  totals,
  groupCount,
  pendingCount,
  recentActivityCount,
  groupPreviews,
  recentActivities,
  expenseHref,
  expenseLabel,
  createdGroupSlug,
  createdGroupQuery,
}: DashboardScreenData) {
  const isOnboardingState =
    totals.netBalance === 0 &&
    totals.owedToYou === 0 &&
    totals.youOwe === 0 &&
    groupPreviews.length === 0 &&
    recentActivities.length === 0;
  const preservedParams = new URLSearchParams();
  if (createdGroupQuery) {
    const createdParams = new URLSearchParams(createdGroupQuery);

    createdParams.forEach((value, key) => {
      preservedParams.set(key, value);
    });
  }
  const groupsHref = preservedParams.toString()
    ? `/grupos?${preservedParams.toString()}`
    : "/grupos";
  const reportsHref = preservedParams.toString()
    ? `/relatorios?${preservedParams.toString()}`
    : "/relatorios";

  return (
    <div className="screen-shell">
      <TopBar
        title="Equitas"
        leading={<AppMenu />}
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
        <section className="hero-card hero-card--light">
          <span className="section-label">
            {isOnboardingState ? "Começo do app" : "Saldo líquido"}
          </span>
          <h1 className="hero-amount">{formatCurrency(totals.netBalance)}</h1>
          <p className="supporting-copy">
            {isOnboardingState
              ? "Você ainda está no zero operacional. O próximo passo é criar um grupo e registrar a primeira despesa."
              : `Você tem ${groupCount} grupo(s) conectados, ${recentActivityCount} movimento(s) recente(s) e ${pendingCount} pendência(s) ativa(s).`}
          </p>
          <MetaPills className="hero-card__meta">
            <MetaPill>{groupCount} grupo(s)</MetaPill>
            <MetaPill>{recentActivityCount} movimento(s)</MetaPill>
            <MetaPill>{pendingCount} pendência(s)</MetaPill>
          </MetaPills>
          <div className="hero-balance-row">
            <div className="metric-card money-positive">
              <span>
                <ArrowUpRight size={14} />
                Devem para você
              </span>
              <strong>{formatCurrency(totals.owedToYou)}</strong>
            </div>
            <div className="metric-card money-negative">
              <span>
                <ArrowDownRight size={14} />
                Você deve
              </span>
              <strong>{formatCurrency(totals.youOwe)}</strong>
            </div>
          </div>
        </section>

        <SectionBlock
          title="Seus grupos"
          description="Atalhos para os grupos mais relevantes neste momento."
          trailing={
            <Link href={groupsHref} className="ghost-link">
              Ver todos
            </Link>
          }
        >
          {groupPreviews.length > 0 ? (
            <div className="list-stack">
              {groupPreviews.map((group) => {
                const GroupIcon = groupIcons[group.icon];
                const groupHref =
                  createdGroupSlug === group.slug && createdGroupQuery
                    ? `/grupos/${group.slug}?${createdGroupQuery}`
                    : `/grupos/${group.slug}`;

                return (
                  <Link key={group.id} href={groupHref} className="list-card">
                    <div className="inline-card__avatar inline-card__avatar--soft">
                      <GroupIcon size={18} />
                    </div>
                    <div className="list-card__copy">
                      <div className="list-card__title">{group.name}</div>
                      <p className="list-card__meta">
                        {group.memberCount} membros ativos
                      </p>
                    </div>
                    <div className="list-card__value">
                      <span>
                        {group.balance >= 0 ? "A receber" : "A pagar"}
                      </span>
                      <strong
                        className={
                          group.balance >= 0
                            ? "money-positive"
                            : "money-negative"
                        }
                      >
                        {formatCurrency(Math.abs(group.balance))}
                      </strong>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              eyebrow="Sem grupos ativos"
              title="Seu dashboard ainda está em branco"
              description="Crie o primeiro grupo para começar a ver saldos, atalhos e contexto financeiro por aqui."
              actionHref="/grupos/criar"
              actionLabel="Criar primeiro grupo"
            />
          )}
        </SectionBlock>

        <SectionBlock
          title="Atividade recente"
          description="O que acabou de mexer no saldo dos seus grupos."
          trailing={
            <Link href={reportsHref} className="ghost-link">
              Relatórios
            </Link>
          }
        >
          {recentActivities.length > 0 ? (
            <div className="list-stack">
              {recentActivities.map((activity) => (
                <article key={activity.id} className="list-card">
                  <Avatar
                    name={activity.person}
                    initials={activity.initials}
                    tone={activity.tone}
                    size="sm"
                  />
                  <div className="list-card__copy">
                    <div className="list-card__title">{activity.person}</div>
                    <p className="list-card__meta">{activity.action}</p>
                    <p className="list-card__meta">{activity.createdAt}</p>
                  </div>
                  <div className="list-card__value">
                    <strong
                      className={
                        activity.amount >= 0
                          ? "money-positive"
                          : "money-negative"
                      }
                    >
                      {formatSignedCurrency(activity.amount)}
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              eyebrow="Sem atividade recente"
              title="As movimentações aparecem aqui"
              description="Quando alguém criar grupos, lançar despesas ou liquidar valores, o histórico recente passa a alimentar este bloco."
              actionHref={groupsHref}
              actionLabel="Explorar grupos"
            />
          )}
        </SectionBlock>

        <SectionBlock
          eyebrow="Panorama rápido"
          title={
            isOnboardingState
              ? "Próximo passo recomendado"
              : "Momento financeiro"
          }
          trailing={
            <Link href={reportsHref} className="ghost-link">
              Ver leitura
            </Link>
          }
        >
          <p className="supporting-copy">
            {isOnboardingState
              ? "Assim que você criar o primeiro grupo, este bloco passa a resumir volume, pendências e saúde de quitação."
              : `Você já tem ${groupCount} grupo(s) conectados ao dashboard, com saldo, histórico recente e leitura operacional do momento.`}
          </p>
          <div className="metric-grid">
            <div className="summary-card">
              <span className="section-label">
                {isOnboardingState ? "Grupos" : "Movimentos"}
              </span>
              <strong>
                {isOnboardingState ? "0" : String(recentActivityCount)}
              </strong>
              <p className="list-card__meta">
                {isOnboardingState
                  ? "prontos para começar"
                  : "entradas recentes"}
              </p>
            </div>
            <div className="summary-card">
              <span className="section-label">
                {isOnboardingState ? "Pendências" : "Pendências"}
              </span>
              <strong>{isOnboardingState ? "0" : String(pendingCount)}</strong>
              <p className="list-card__meta">
                {isOnboardingState
                  ? "até a primeira despesa"
                  : "grupos com saldo negativo"}
              </p>
            </div>
          </div>
        </SectionBlock>
      </main>

      <FloatingAction href={expenseHref} label={expenseLabel} />
      <BottomNav />
    </div>
  );
}
