"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

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
        <section className="state-card">
          <div className="state-card__icon">
            <AlertTriangle size={24} />
          </div>
          <span className="section-label">Algo saiu do trilho</span>
          <div className="state-card__copy">
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <div className="state-card__actions">
            <button
              className="primary-button primary-button--full"
              type="button"
              onClick={reset}
            >
              <RefreshCw size={18} />
              Tentar novamente
            </button>
            <Link href={backHref} className="ghost-link">
              {backLabel}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
