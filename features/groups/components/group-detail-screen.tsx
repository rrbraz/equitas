import Link from "next/link";
import { ArrowLeft, BanknoteArrowUp, Plus, Settings2 } from "lucide-react";

import { Avatar } from "@/components/avatar";
import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/top-bar";
import type { Group } from "@/features/groups/types";
import { formatCurrency } from "@/lib/format";
import type { Viewer } from "@/features/viewer/types";

type GroupDetailScreenProps = {
  viewer: Viewer;
  group: Group;
};

export function GroupDetailScreen({ viewer, group }: GroupDetailScreenProps) {
  return (
    <div className="screen-shell">
      <TopBar
        title={group.name}
        leading={
          <Link href="/grupos" className="icon-button" aria-label="Voltar">
            <ArrowLeft size={18} />
          </Link>
        }
        trailing={
          <div className="top-bar__action-group">
            <Avatar
              name={viewer.name}
              initials={viewer.initials}
              tone="amber"
              size="sm"
            />
            <button className="icon-button" type="button" aria-label="Ajustes">
              <Settings2 size={18} />
            </button>
          </div>
        }
      />

      <main className="page-content">
        <section className="hero-card">
          <span className="section-label">Total group spend</span>
          <h1 className="hero-amount">{formatCurrency(group.totalSpend)}</h1>
          <div className="button-row">
            <button className="secondary-button" type="button">
              <BanknoteArrowUp size={18} />
              Settle up
            </button>
            <Link
              href={`/grupos/${group.slug}/despesas/nova`}
              className="secondary-button"
            >
              <Plus size={18} />
              Add expense
            </Link>
          </div>
        </section>

        <section className="stack-column">
          <div className="section-heading">
            <h2>Member balances</h2>
            <span className="ghost-link">Live</span>
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
                      ? "You are owed"
                      : member.balance < 0
                        ? "Owes you"
                        : "No balance"}
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
            <h2>Recent expenses</h2>
            <Link href="/relatorios" className="ghost-link">
              View all
            </Link>
          </div>
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
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
