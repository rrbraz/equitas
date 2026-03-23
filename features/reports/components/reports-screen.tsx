import { Menu } from "lucide-react";

import { Avatar } from "@/components/avatar";
import { BottomNav } from "@/components/bottom-nav";
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
          <span className="eyebrow-note">Equilibrium analysis</span>
          <h1>Financial atelier.</h1>
          <p>
            Uma visão editorial do comportamento financeiro dos seus grupos com
            foco em fluxo, categoria e saúde de settlement.
          </p>
        </section>

        <section className="report-card">
          <div className="section-heading">
            <div>
              <span className="section-label">Overview balance</span>
              <h2>Spending over time</h2>
            </div>
            <strong className="money-negative">
              {formatCurrency(totals.youOwe)}
            </strong>
          </div>
          <div className="metric-grid">
            <div className="summary-card">
              <span className="section-label">You owe</span>
              <strong className="money-negative">
                {formatCurrency(totals.youOwe)}
              </strong>
            </div>
            <div className="summary-card">
              <span className="section-label">Owed to you</span>
              <strong className="money-positive">
                {formatCurrency(totals.owedToYou)}
              </strong>
            </div>
          </div>
          <ReportBars items={monthlyBalances} />
        </section>

        <section className="stack-column">
          <div className="section-heading">
            <h2>By category</h2>
            <span className="ghost-link">Monthly</span>
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

        <section className="report-card stack-column">
          <span className="section-label">Settlement health</span>
          <h2>8.4</h2>
          <p className="supporting-copy">
            Seu sistema está estável. A maioria dos grupos liquida rápido e
            apenas um grupo exige atenção no curto prazo.
          </p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
