import { AppMenu } from "@/components/app-menu";
import { Avatar } from "@/components/avatar";
import { BottomNav } from "@/components/bottom-nav";
import { EmptyState } from "@/components/empty-state";
import { ReportBars } from "@/features/reports/components/report-bars";
import { TopBar } from "@/components/top-bar";
import { formatCurrency } from "@/lib/format";
import type { ReportsScreenData } from "@/features/reports/types";

export function ReportsScreen({
  viewer,
  totals,
  monthlyBalances,
  reportCategories,
}: ReportsScreenData) {
  const hasReportData =
    monthlyBalances.length > 0 || reportCategories.length > 0;
  const groupsHref = hasReportData ? "/grupos" : "/grupos?scenario=new";

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
          />
        }
      />

      <main className="page-content">
        <section className="hero-copy">
          <span className="eyebrow-note">Leitura financeira</span>
          <h1>Relatórios.</h1>
          <p>
            Uma visão editorial do comportamento financeiro dos seus grupos com
            foco em fluxo, categoria e saúde de quitação.
          </p>
        </section>

        <section className="report-card">
          <div className="section-heading">
            <div>
              <span className="section-label">Resumo</span>
              <h2>Gastos ao longo do tempo</h2>
            </div>
            <strong className="money-negative">
              {formatCurrency(totals.youOwe)}
            </strong>
          </div>
          <div className="metric-grid">
            <div className="summary-card">
              <span className="section-label">Você deve</span>
              <strong className="money-negative">
                {formatCurrency(totals.youOwe)}
              </strong>
            </div>
            <div className="summary-card">
              <span className="section-label">Devem para você</span>
              <strong className="money-positive">
                {formatCurrency(totals.owedToYou)}
              </strong>
            </div>
          </div>
          {monthlyBalances.length > 0 ? (
            <ReportBars items={monthlyBalances} />
          ) : (
            <div className="report-card__empty">
              <EmptyState
                eyebrow="Relatório em preparação"
                title="Ainda não há histórico suficiente"
                description="Assim que os grupos começarem a registrar despesas reais, esta área passa a mostrar ritmo, concentração e saúde de quitação."
                actionHref={groupsHref}
                actionLabel="Ver grupos"
              />
            </div>
          )}
        </section>

        {reportCategories.length > 0 ? (
          <section className="stack-column">
            <div className="section-heading">
              <h2>Por categoria</h2>
              <span className="section-label">Mensal</span>
            </div>
            {reportCategories.map((category) => (
              <article key={category.name} className="report-card stack-column">
                <div className="section-heading">
                  <div>
                    <h2>{category.name}</h2>
                    <p className="list-card__meta">{category.note}</p>
                  </div>
                  <strong>{category.share}%</strong>
                </div>
                <div className="progress">
                  <div
                    className={`progress__fill progress__fill--${category.tone}`}
                    style={{ width: `${category.share}%` }}
                  />
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {hasReportData ? (
          <section className="report-card stack-column">
            <span className="section-label">Saúde de quitação</span>
            <h2>8.4</h2>
            <p className="supporting-copy">
              Seu sistema está estável. A maioria dos grupos liquida rápido e
              apenas um grupo exige atenção no curto prazo.
            </p>
          </section>
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
}
