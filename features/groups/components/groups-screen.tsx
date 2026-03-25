import Link from "next/link";
import { Plus, Wallet } from "lucide-react";

import { AppMenu } from "@/components/app-menu";
import { Avatar } from "@/components/avatar";
import { BottomNav } from "@/components/bottom-nav";
import { EmptyState } from "@/components/empty-state";
import { FloatingAction } from "@/components/floating-action";
import { MetaPills } from "@/components/meta-pills";
import { PageIntro } from "@/components/page-intro";
import { SectionBlock } from "@/components/section-block";
import { TopBar } from "@/components/top-bar";
import { getGroupsTotalBalance } from "@/features/groups/lib/get-groups-total-balance";
import type { Group, GroupContact } from "@/features/groups/types";
import { formatCurrency } from "@/lib/format";
import type { Viewer } from "@/features/viewer/types";

type GroupsScreenProps = {
  viewer: Viewer;
  groups: Group[];
  quickStartContacts: GroupContact[];
  createdGroupSlug?: string;
  createdGroupQuery?: string;
};

export function GroupsScreen({
  viewer,
  groups,
  quickStartContacts,
  createdGroupSlug,
  createdGroupQuery,
}: GroupsScreenProps) {
  const totalBalance = getGroupsTotalBalance(groups);
  const hasGroups = groups.length > 0;

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
        <PageIntro
          eyebrow="Círculos ativos"
          title="Grupos"
          description="Gerencie despesas compartilhadas, organize membros e acelere novos splits sem sair do fluxo principal."
        />

        <section className="hero-card">
          <span className="section-label">Saldo consolidado</span>
          <h2 className="hero-amount">{formatCurrency(totalBalance)}</h2>
          <MetaPills className="hero-card__meta">
            <span
              className={`meta-pill ${hasGroups ? "meta-pill--positive" : ""}`}
            >
              {hasGroups ? "Dados reais" : "Sem histórico"}
            </span>
            <span className="meta-pill">{groups.length} grupos</span>
          </MetaPills>
        </section>

        <SectionBlock
          title="Grupos ativos"
          description="Sua entrada principal para saldos, membros e despesas."
          trailing={
            <Link href="/grupos/criar" className="ghost-link">
              Criar novo
            </Link>
          }
        >
          {groups.length > 0 ? (
            <div className="list-stack">
              {groups.map((group) => (
                <Link
                  key={group.id}
                  href={
                    createdGroupSlug === group.slug && createdGroupQuery
                      ? `/grupos/${group.slug}?${createdGroupQuery}`
                      : `/grupos/${group.slug}`
                  }
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
                    <span>{group.balance >= 0 ? "Aberto" : "Pendente"}</span>
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
        </SectionBlock>

        {quickStartContacts.length > 0 ? (
          <SectionBlock
            title="Começar rápido"
            description="Atalhos simples para iniciar um novo grupo com quem aparece com frequência."
            trailing={
              <Link href="/grupos/criar" className="ghost-link">
                Abrir criador
              </Link>
            }
          >
            <div className="quick-grid">
              {quickStartContacts.map((contact) => (
                <Link
                  key={contact.name}
                  href={`/grupos/criar?member=${encodeURIComponent(contact.name)}`}
                  className="quick-card"
                >
                  <Avatar
                    name={contact.name}
                    initials={contact.initials}
                    tone={contact.tone}
                    size="md"
                  />
                  <strong>{contact.name}</strong>
                  <p className="list-card__meta">Começar com {contact.name}</p>
                </Link>
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
          </SectionBlock>
        ) : null}

        <section className="report-card stack-column">
          <div className="section-heading">
            <div>
              <h2>{hasGroups ? "Leitura por carteira" : "Próximo passo"}</h2>
              <p className="supporting-copy">
                Bloco de contexto para manter a listagem operável sem poluir a
                tela.
              </p>
            </div>
            <Wallet size={18} color="var(--primary-bright)" />
          </div>
          <p className="supporting-copy">
            {hasGroups
              ? "Os grupos reais da sua conta já aparecem aqui. Conforme despesas e quitações entrarem, este bloco passa a resumir ritmo e pendências com dados do backend."
              : "Assim que o primeiro grupo nascer, este bloco passa a resumir ritmo, categorias e sinais de atenção da carteira compartilhada."}
          </p>
        </section>
      </main>

      <FloatingAction href="/grupos/criar" label="Criar grupo" />
      <BottomNav />
    </div>
  );
}
