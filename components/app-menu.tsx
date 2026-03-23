"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu } from "lucide-react";

export function AppMenu() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl =
    pathname && searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname || "/dashboard";
  const menuParams = new URLSearchParams({
    from: currentUrl,
  });

  ["scenario", "created", "name", "category", "members"].forEach((key) => {
    const value = searchParams.get(key);

    if (value) {
      menuParams.set(key, value);
    }
  });

  const href = `/menu?${menuParams.toString()}`;

  return (
    <Link href={href} className="icon-button" aria-label="Abrir menu">
      <Menu size={18} />
    </Link>
  );
}
