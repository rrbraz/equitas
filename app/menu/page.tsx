import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Avatar } from "@/components/avatar";
import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/top-bar";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { getMockProfileScreenData } from "@/features/profile/data/mock-profile";

const menuItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Resumo de saldo, atividade e atalhos principais.",
  },
  {
    href: "/grupos",
    label: "Grupos",
    description: "Abrir grupos, criar novos e adicionar participantes.",
  },
  {
    href: "/relatorios",
    label: "Relatórios",
    description: "Leitura de gastos, categorias e saúde de quitação.",
  },
  {
    href: "/perfil",
    label: "Perfil",
    description: "Editar cadastro, revisar preferências e segurança.",
  },
];

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    scenario?: string;
    created?: string;
    name?: string;
    category?: string;
    members?: string;
  }>;
}) {
  const params = await searchParams;
  const backHref =
    params.from && params.from.startsWith("/") ? params.from : "/dashboard";
  const withPreservedQuery = (href: string) => {
    const nextParams = new URLSearchParams();

    if (params.scenario === "new") {
      nextParams.set("scenario", "new");
    }
    if (params.created === "1") {
      nextParams.set("created", "1");
    }
    if (params.name) {
      nextParams.set("name", params.name);
    }
    if (params.category) {
      nextParams.set("category", params.category);
    }
    if (params.members) {
      nextParams.set("members", params.members);
    }

    return nextParams.toString() ? `${href}?${nextParams.toString()}` : href;
  };
  const { viewer } = getMockProfileScreenData();

  return (
    <div className="screen-shell">
      <TopBar
        title="Menu"
        leading={
          <Link href={backHref} className="icon-button" aria-label="Voltar">
            <ArrowLeft size={18} />
          </Link>
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
          <span className="eyebrow-note">Navegação principal</span>
          <h1>Ir para</h1>
          <p>
            Atalhos claros para as áreas centrais do app enquanto o shell final
            ainda evolui.
          </p>
        </section>

        <section className="settings-list">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={withPreservedQuery(item.href)}
              className="setting-row"
            >
              <div>
                <strong>{item.label}</strong>
                <p>{item.description}</p>
              </div>
            </Link>
          ))}
        </section>

        <LogoutButton label="Sair do app" />
      </main>

      <BottomNav />
    </div>
  );
}
