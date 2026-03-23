import {
  Bell,
  LockKeyhole,
  LogOut,
  Menu,
  UserRound,
  Wallet,
} from "lucide-react";

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
}: ProfileScreenData) {
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
          <button className="primary-button" type="button">
            Editar perfil
          </button>
        </section>

        <section className="metric-grid">
          <article className="summary-card">
            <span className="section-label">Owed to you</span>
            <strong className="money-positive">
              {formatCurrency(totals.owedToYou)}
            </strong>
          </article>
          <article className="summary-card">
            <span className="section-label">You owe</span>
            <strong className="money-negative">
              {formatCurrency(totals.youOwe)}
            </strong>
          </article>
        </section>

        <section className="settings-list">
          {preferences.map((item) => {
            const Icon = preferenceIcons[item.icon];

            return (
              <div key={item.title} className="setting-row">
                <span className="setting-row__icon">
                  <Icon size={18} />
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
              </div>
            );
          })}
        </section>

        <button className="logout-button" type="button">
          <LogOut size={18} />
          Log out
        </button>

        <p className="mono-caption">Versão 0.1.0 · stitched mobile prototype</p>
      </main>

      <BottomNav />
    </div>
  );
}
