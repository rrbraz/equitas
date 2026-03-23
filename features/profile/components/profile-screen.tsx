import { Bell, LockKeyhole, LogOut, UserRound, Wallet } from "lucide-react";
import Link from "next/link";

import { ActionFeedback } from "@/components/action-feedback";
import { AppMenu } from "@/components/app-menu";
import { Avatar } from "@/components/avatar";
import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/top-bar";
import { formatCurrency } from "@/lib/format";
import type { ProfileScreenData } from "@/features/profile/types";

const preferenceIcons = {
  account: UserRound,
  notifications: Bell,
  payments: Wallet,
  security: LockKeyhole,
};

export function ProfileScreen({
  viewer,
  totals,
  preferences,
  scenario,
  flashMessage,
  flashTone,
}: ProfileScreenData) {
  const scenarioSuffix = scenario === "new" ? "?scenario=new" : "";

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
        {flashMessage ? (
          <ActionFeedback
            tone={flashTone ?? "success"}
            title="Conta atualizada"
            message={flashMessage}
          />
        ) : null}

        <section className="surface-card profile-hero">
          <Avatar
            name={viewer.name}
            initials={viewer.initials}
            tone="amber"
            size="xl"
          />
          <span className="spotlight-tag">PRO</span>
          <div>
            <h1 className="profile-name">{viewer.name}</h1>
            <p className="profile-role">
              {viewer.role} · {viewer.memberSinceLabel}
            </p>
          </div>
          <Link
            href={`/perfil/editar${scenarioSuffix}`}
            className="primary-button"
          >
            Editar perfil
          </Link>
        </section>

        <section className="metric-grid">
          <article className="summary-card">
            <span className="section-label">Devem para você</span>
            <strong className="money-positive">
              {formatCurrency(totals.owedToYou)}
            </strong>
          </article>
          <article className="summary-card">
            <span className="section-label">Você deve</span>
            <strong className="money-negative">
              {formatCurrency(totals.youOwe)}
            </strong>
          </article>
        </section>

        <section className="settings-list">
          {preferences.map((item) => {
            const Icon = preferenceIcons[item.icon];
            const content = (
              <>
                <span className="setting-row__icon">
                  <Icon size={18} />
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
              </>
            );

            if (item.href) {
              return (
                <Link
                  key={item.title}
                  href={
                    scenario === "new" && item.href.startsWith("/perfil")
                      ? `${item.href}${item.href.includes("?") ? "&" : "?"}scenario=new`
                      : item.href
                  }
                  className="setting-row"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                key={item.title}
                className="setting-row"
                aria-disabled="true"
              >
                {content}
              </div>
            );
          })}
        </section>

        <Link href="/login?logout=1" className="logout-button">
          <LogOut size={18} />
          Sair
        </Link>

        <p className="mono-caption">Versão 0.1.0 · protótipo navegável</p>
      </main>

      <BottomNav />
    </div>
  );
}
