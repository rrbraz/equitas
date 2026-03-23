"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {items.map((item) => {
        const active = item.matches.some(
          (match) => pathname === match || pathname.startsWith(`${match}/`),
        );
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
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
