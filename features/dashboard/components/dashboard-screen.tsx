import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  House,
  Menu,
  Plane,
  Settings2,
  Sparkles,
} from "lucide-react";

import { Avatar } from "@/components/avatar";
import { BottomNav } from "@/components/bottom-nav";
import { EmptyState } from "@/components/empty-state";
import { FloatingAction } from "@/components/floating-action";
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
  groupPreviews,
  recentActivities,
  expenseHref,
  expenseLabel,
}: DashboardScreenData) {
  return (
    <div className="screen-shell">
      <TopBar
        title="Equitas"
        leading={
          <button className="icon-button" type="button" aria-label="Abrir menu">
            <Menu size={18} />
          </button>
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
        <section className="hero-card hero-card--light">
          <span className="section-label">Net balance</span>
          <h1 className="hero-amount">{formatCurrency(totals.netBalance)}</h1>
          <div className="hero-balance-row">
            <div className="metric-card money-positive">
              <span>
                <ArrowUpRight size={14} />
                Owed to you
              </span>
              <strong>{formatCurrency(totals.owedToYou)}</strong>
            </div>
            <div className="metric-card money-negative">
              <span>
                <ArrowDownRight size={14} />
                You owe
              </span>
              <strong>{formatCurrency(totals.youOwe)}</strong>
            </div>
          </div>
        </section>

        <section className="stack-column">
          <div className="section-heading">
            <h2>Your Groups</h2>
            <Link href="/grupos" className="ghost-link">
              See all
            </Link>
          </div>
          {groupPreviews.length > 0 ? (
            <div className="list-stack">
              {groupPreviews.map((group) => {
                const GroupIcon = groupIcons[group.icon];

                return (
                  <Link
                    key={group.id}
                    href={`/grupos/${group.slug}`}
                    className="list-card"
                  >
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
                      <span>{group.balance >= 0 ? "Owed" : "Owe"}</span>
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
        </section>

        <section className="stack-column">
          <div className="section-heading">
            <h2>Recent Activity</h2>
            <Link href="/relatorios" className="ghost-link">
              History
            </Link>
          </div>
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
              actionHref="/grupos"
              actionLabel="Explorar grupos"
            />
          )}
        </section>

        <section className="report-card">
          <div className="section-heading">
            <div>
              <span className="section-label">Quick pulse</span>
              <h2>Momento financeiro</h2>
            </div>
            <button
              className="icon-button icon-button--soft"
              type="button"
              aria-label="Ajustar painel"
            >
              <Settings2 size={16} />
            </button>
          </div>
          <p className="supporting-copy">
            O grupo de viagem segue puxando caixa positivo e as últimas
            quitações melhoraram o balanço geral.
          </p>
          <div className="metric-grid">
            <div className="summary-card">
              <span className="section-label">Transactions</span>
              <strong>18</strong>
              <p className="list-card__meta">últimos 30 dias</p>
            </div>
            <div className="summary-card">
              <span className="section-label">Pending</span>
              <strong>3</strong>
              <p className="list-card__meta">settlements abertos</p>
            </div>
          </div>
        </section>
      </main>

      <FloatingAction href={expenseHref} label={expenseLabel} />
      <BottomNav />
    </div>
  );
}
