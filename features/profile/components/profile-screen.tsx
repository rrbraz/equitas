import { Bell, LockKeyhole, UserRound, Wallet } from "lucide-react";
import Link from "next/link";

import { ActionFeedback } from "@/components/action-feedback";
import { AppMenu } from "@/components/app-menu";
import { Avatar } from "@/components/avatar";
import { ButtonLink } from "@/components/button";
import { BottomNav } from "@/components/bottom-nav";
import { MetaPills } from "@/components/meta-pills";
import { SectionBlock } from "@/components/section-block";
import { LogoutButton } from "@/features/auth/components/logout-button";
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
            src={viewer.avatarUrl ?? undefined}
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

        <section className="hero-card hero-card--light profile-hero-card">
          <Avatar
            name={viewer.name}
            initials={viewer.initials}
            tone="amber"
            size="xl"
            src={viewer.avatarUrl ?? undefined}
          />
          <div className="stack-column">
            <span className="eyebrow-note">Conta e identidade</span>
            <div>
              <h1 className="profile-name">{viewer.name}</h1>
              <p className="profile-role">
                {viewer.role} · {viewer.memberSinceLabel}
              </p>
            </div>
            <MetaPills
              items={[
                viewer.city || "Cidade pendente",
                viewer.email,
                "Perfil real",
              ]}
            />
          </div>
          <div className="hero-card__actions">
            <ButtonLink href={`/perfil/editar${scenarioSuffix}`}>
              Editar perfil
            </ButtonLink>
            <ButtonLink
              href={`/perfil/seguranca${scenarioSuffix}`}
              variant="secondary"
            >
              Segurança
            </ButtonLink>
          </div>
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

        <SectionBlock
          title="Preferências e conta"
          description="Pontos de manutenção da conta sem espalhar ações secundárias pela tela."
          className="settings-shell"
        >
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
        </SectionBlock>

        <LogoutButton />

        <p className="mono-caption">Versão 0.1.0 · protótipo navegável</p>
      </main>

      <BottomNav />
    </div>
  );
}
