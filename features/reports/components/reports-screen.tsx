import Link from "next/link";

import { AppMenu } from "@/components/app-menu";
import { Avatar } from "@/components/avatar";
import { BottomNav } from "@/components/bottom-nav";
import { EmptyState } from "@/components/empty-state";
import { MetaPills } from "@/components/meta-pills";
import { PageIntro } from "@/components/page-intro";
import { SectionBlock, SectionHeader } from "@/components/section-block";
import { TopBar } from "@/components/top-bar";
import { ReportBars } from "@/features/reports/components/report-bars";
import type { ReportsScreenData } from "@/features/reports/types";
import { formatCurrency, formatSignedCurrency } from "@/lib/format";

export function ReportsScreen({
  viewer,
  totals,
  monthlyBalances,
  reportCategories,
  historyItems,
  availableGroups,
  selectedGroupSlug,
  selectedRangeDays,
}: ReportsScreenData) {
  const hasReportData =
    monthlyBalances.some((item) => item.value > 0) ||
    reportCategories.length > 0 ||
    historyItems.length > 0;

  function buildReportHref(groupSlug?: string, rangeDays = selectedRangeDays) {
    const params = new URLSearchParams();

    if (rangeDays !== 90) {
      params.set("range", String(rangeDays));
    }

    if (groupSlug) {
      params.set("group", groupSlug);
    }

    return params.toString()
      ? `/relatorios?${params.toString()}`
      : "/relatorios";
  }

  const selectedGroupName = availableGroups.find(
    (group) => group.slug === selectedGroupSlug,
  )?.name;

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
          eyebrow="Leitura financeira"
          title="Relatórios reais por período e grupo."
          description="Acompanhe volume, categorias, histórico e pendências usando apenas dados persistidos de despesas e settlements."
          tone="card"
          meta={
            <MetaPills
              items={[
                `Últimos ${selectedRangeDays} dias`,
                selectedGroupName ?? "Todos os grupos",
                `${historyItems.length} evento(s)`,
              ]}
            />
          }
        />

        <section className="surface-card stack-column">
          <SectionHeader
            eyebrow="Filtros"
            title={selectedGroupName ?? "Todos os grupos"}
            trailing={
              <span className="section-label">
                Últimos {selectedRangeDays} dias
              </span>
            }
          />

          <div>
            <span className="field-label">Período</span>
            <div className="pill-row">
              {[30, 90].map((range) => (
                <Link
                  key={range}
                  href={buildReportHref(selectedGroupSlug, range as 30 | 90)}
                  className={`split-pill ${
                    selectedRangeDays === range ? "is-active" : ""
                  }`}
                >
                  {range} dias
                </Link>
              ))}
            </div>
          </div>

          <div>
            <span className="field-label">Grupo</span>
            <div className="pill-row">
              <Link
                href={buildReportHref(undefined, selectedRangeDays)}
                className={`split-pill ${!selectedGroupSlug ? "is-active" : ""}`}
              >
                Todos
              </Link>
              {availableGroups.map((group) => (
                <Link
                  key={group.slug}
                  href={buildReportHref(group.slug, selectedRangeDays)}
                  className={`split-pill ${
                    selectedGroupSlug === group.slug ? "is-active" : ""
                  }`}
                >
                  {group.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="report-card">
          <SectionHeader
            eyebrow="Resumo"
            title="Fluxo financeiro do período"
            trailing={<strong>{formatCurrency(totals.totalExpenses)}</strong>}
          />
          <div className="metric-grid">
            <div className="summary-card">
              <span className="section-label">Volume</span>
              <strong>{formatCurrency(totals.totalExpenses)}</strong>
              <p className="list-card__meta">em despesas registradas</p>
            </div>
            <div className="summary-card">
              <span className="section-label">Você deve</span>
              <strong className="money-negative">
                {formatCurrency(totals.youOwe)}
              </strong>
              <p className="list-card__meta">saldo líquido atual</p>
            </div>
            <div className="summary-card">
              <span className="section-label">Devem para você</span>
              <strong className="money-positive">
                {formatCurrency(totals.owedToYou)}
              </strong>
              <p className="list-card__meta">saldo líquido atual</p>
            </div>
            <div className="summary-card">
              <span className="section-label">Pendente</span>
              <strong>{formatCurrency(totals.pendingSettlementTotal)}</strong>
              <p className="list-card__meta">
                {totals.pendingGroupCount} grupo(s) ainda em aberto
              </p>
            </div>
          </div>

          {monthlyBalances.some((item) => item.value > 0) ? (
            <ReportBars items={monthlyBalances} />
          ) : (
            <div className="report-card__empty">
              <EmptyState
                eyebrow="Sem volume suficiente"
                title="Ainda não há lançamentos no período filtrado"
                description="Troque o período ou o grupo para ampliar a leitura, ou registre novas despesas para alimentar os relatórios."
                actionHref="/grupos"
                actionLabel="Ver grupos"
              />
            </div>
          )}
        </section>

        {reportCategories.length > 0 ? (
          <SectionBlock
            title="Por categoria"
            description="Como o gasto do período se distribui entre os tipos de despesa."
            trailing={
              <span className="section-label">Participação no período</span>
            }
          >
            {reportCategories.map((category) => (
              <article key={category.name} className="report-card stack-column">
                <SectionHeader
                  title={category.name}
                  description={category.note}
                  trailing={
                    <div className="list-card__value">
                      <span>{formatCurrency(category.amount)}</span>
                      <strong>{category.share}%</strong>
                    </div>
                  }
                />
                <div className="progress">
                  <div
                    className={`progress__fill progress__fill--${category.tone}`}
                    style={{ width: `${category.share}%` }}
                  />
                </div>
              </article>
            ))}
          </SectionBlock>
        ) : null}

        <SectionBlock
          title="Histórico global"
          description="Sequência consolidada de despesas e transferências do recorte."
          trailing={
            <span className="section-label">
              {historyItems.length} evento(s)
            </span>
          }
        >
          {historyItems.length > 0 ? (
            <div className="list-stack">
              {historyItems.map((item) => (
                <article key={item.id} className="list-card">
                  <Avatar
                    name={item.person}
                    initials={item.initials}
                    tone={item.tone}
                    size="sm"
                  />
                  <div className="list-card__copy">
                    <div className="list-card__title">{item.person}</div>
                    <p className="list-card__meta">{item.action}</p>
                    <p className="list-card__meta">
                      {item.groupName} · {item.occurredAtLabel}
                    </p>
                  </div>
                  <div className="list-card__value">
                    <strong
                      className={
                        item.amount >= 0 ? "money-positive" : "money-negative"
                      }
                    >
                      {formatSignedCurrency(item.amount)}
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              eyebrow="Sem histórico"
              title="Ainda não há eventos neste recorte"
              description="O histórico combina despesas e transfers reais. Ajuste o filtro ou registre novas movimentações."
              actionHref="/grupos"
              actionLabel="Ver grupos"
            />
          )}
        </SectionBlock>

        {hasReportData ? (
          <SectionBlock
            eyebrow="Saúde de quitação"
            title={
              totals.pendingGroupCount === 0
                ? "Tudo em dia"
                : `${totals.pendingGroupCount} grupo(s) pedem atenção`
            }
            description={
              totals.pendingGroupCount === 0
                ? "Não há saldo pendente entre membros neste recorte."
                : `Ainda existem ${formatCurrency(
                    totals.pendingSettlementTotal,
                  )} em transferências pendentes para zerar os grupos filtrados.`
            }
          />
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
}
