"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  UserRound,
  UsersRound,
} from "lucide-react";

import { cn } from "@/lib/cn";

const items = [
  {
    href: "/dashboard",
    label: "Dashboard",
    matches: ["/dashboard"],
    icon: LayoutDashboard,
  },
  {
    href: "/grupos",
    label: "Grupos",
    matches: ["/grupos"],
    icon: UsersRound,
  },
  {
    href: "/relatorios",
    label: "Relatórios",
    matches: ["/relatorios"],
    icon: BarChart3,
  },
  {
    href: "/perfil",
    label: "Perfil",
    matches: ["/perfil"],
    icon: UserRound,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const preservedParams = new URLSearchParams();

  ["scenario", "created", "name", "category", "members"].forEach((key) => {
    const value = searchParams.get(key);

    if (value) {
      preservedParams.set(key, value);
    }
  });

  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {items.map((item) => {
        const active = item.matches.some(
          (match) => pathname === match || pathname.startsWith(`${match}/`),
        );
        const Icon = item.icon;
        const itemHref = preservedParams.toString()
          ? `${item.href}?${preservedParams.toString()}`
          : item.href;

        return (
          <Link
            key={item.href}
            href={itemHref}
            className={cn("bottom-nav__link", active && "is-active")}
          >
            <Icon size={18} strokeWidth={active ? 2.4 : 2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
