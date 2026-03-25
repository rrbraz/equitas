"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/button";

type RouteErrorScreenProps = {
  title: string;
  description: string;
  reset: () => void;
  backHref?: string;
  backLabel?: string;
};

export function RouteErrorScreen({
  title,
  description,
  reset,
  backHref = "/dashboard",
  backLabel = "Voltar ao app",
}: RouteErrorScreenProps) {
  return (
    <div className="screen-shell">
      <main className="page-content page-content--centered">
        <section className="state-card" role="alert">
          <div className="state-card__icon">
            <AlertTriangle size={24} />
          </div>
          <span className="section-label">Algo saiu do trilho</span>
          <div className="state-card__copy">
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <div className="state-card__actions">
            <Button type="button" fullWidth onClick={reset}>
              <RefreshCw size={18} />
              Tentar novamente
            </Button>
            <Link href={backHref} className="ghost-link">
              {backLabel}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
