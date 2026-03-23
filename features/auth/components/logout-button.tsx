"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type LogoutButtonProps = {
  label?: string;
};

export function LogoutButton({ label = "Sair" }: LogoutButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      router.replace("/login?logout=1");
      router.refresh();
      return;
    }

    setIsPending(true);

    try {
      await supabase.auth.signOut();
      router.replace("/login?logout=1");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      className="logout-button"
      onClick={handleLogout}
      disabled={isPending}
    >
      <LogOut size={18} />
      {isPending ? "Saindo..." : label}
    </button>
  );
}
