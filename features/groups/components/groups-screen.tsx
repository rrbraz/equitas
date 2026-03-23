import Link from "next/link";
import { Menu, Plus, Wallet } from "lucide-react";

import { Avatar } from "@/components/avatar";
import { BottomNav } from "@/components/bottom-nav";
import { EmptyState } from "@/components/empty-state";
import { FloatingAction } from "@/components/floating-action";
import { TopBar } from "@/components/top-bar";
import { getGroupsTotalBalance } from "@/features/groups/lib/get-groups-total-balance";
import type { Group, GroupContact } from "@/features/groups/types";
import { formatCurrency } from "@/lib/format";
import type { Viewer } from "@/features/viewer/types";

type GroupsScreenProps = {
  viewer: Viewer;
  groups: Group[];
  quickStartContacts: GroupContact[];
};

export function GroupsScreen({
  viewer,
  groups,
  quickStartContacts,
}: GroupsScreenProps) {
  const totalBalance = getGroupsTotalBalance(groups);

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
        <section className="hero-copy">
          <span className="eyebrow-note">Managed circles</span>
          <h1>Grupos</h1>
          <p>
            Gerencie despesas compartilhadas, organize membros e acelere novos
            splits sem sair do fluxo principal.
          </p>
        </section>

        <section className="hero-card">
          <span className="section-label">Net group balance</span>
          <h2 className="hero-amount">{formatCurrency(totalBalance)}</h2>
          <div className="stats-row">
            <span
              className={`stat-chip ${
                groups.length > 0 ? "stat-chip--positive" : ""
              }`}
            >
              {groups.length > 0 ? "+4.2%" : "Sem historico"}
            </span>
            <span className="stat-chip">{groups.length} grupos</span>
          </div>
        </section>

        <section className="stack-column">
          <div className="section-heading">
            <h2>Active circles</h2>
            <Link href="/grupos/criar" className="ghost-link">
              Criar novo
            </Link>
          </div>
          {groups.length > 0 ? (
            <div className="list-stack">
              {groups.map((group) => (
                <Link
                  key={group.id}
                  href={`/grupos/${group.slug}`}
                  className="list-card"
                >
                  <Avatar
                    name={group.name}
                    initials={group.name.slice(0, 2).toUpperCase()}
                    tone={group.tone}
                    size="sm"
                  />
                  <div className="list-card__copy">
                    <div className="list-card__title">{group.name}</div>
                    <p className="list-card__meta">
                      {group.memberCount} membros · {group.category}
                    </p>
                  </div>
                  <div className="list-card__value">
                    <span>{group.balance >= 0 ? "Open" : "Pending"}</span>
                    <strong
                      className={
                        group.balance >= 0 ? "money-positive" : "money-negative"
                      }
                    >
                      {formatCurrency(group.balance)}
                    </strong>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              eyebrow="Nenhum grupo ainda"
              title="Crie seu primeiro círculo"
              description="Quando seus grupos existirem, esta lista vira a entrada principal para saldos, membros e despesas."
              actionHref="/grupos/criar"
              actionLabel="Criar grupo"
            />
          )}
        </section>

        <section className="stack-column">
          <div className="section-heading">
            <h2>Quick start</h2>
            <button className="ghost-link" type="button">
              Sugestões
            </button>
          </div>
          <div className="quick-grid">
            {quickStartContacts.map((contact) => (
              <article key={contact.name} className="quick-card">
                <Avatar
                  name={contact.name}
                  initials={contact.initials}
                  tone={contact.tone}
                  size="md"
                />
                <strong>{contact.name}</strong>
                <p className="list-card__meta">Começar com {contact.name}</p>
              </article>
            ))}
            <Link
              href="/grupos/criar"
              className="quick-card quick-card--invite"
            >
              <div className="inline-card__avatar inline-card__avatar--soft">
                <Plus size={18} />
              </div>
              <strong>Convidar membro</strong>
              <p className="list-card__meta">Novo círculo</p>
            </Link>
          </div>
        </section>

        <section className="report-card">
          <div className="section-heading">
            <h2>Pulse por carteira</h2>
            <Wallet size={18} color="var(--primary-bright)" />
          </div>
          <p className="supporting-copy">
            Os grupos de moradia estão estáveis. Viagens e eventos continuam
            puxando crescimento no volume dividido.
          </p>
        </section>
      </main>

      <FloatingAction href="/grupos/criar" label="Criar grupo" />
      <BottomNav />
    </div>
  );
}
