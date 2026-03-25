import type { ReactNode } from "react";

import { ButtonLink } from "@/components/button";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: ReactNode;
};

export function EmptyState({
  eyebrow = "Nada por aqui",
  title,
  description,
  actionHref,
  actionLabel,
  icon,
}: EmptyStateProps) {
  return (
    <article className="state-card">
      {icon ? <div className="state-card__icon">{icon}</div> : null}
      <span className="section-label">{eyebrow}</span>
      <div className="state-card__copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <ButtonLink href={actionHref} fullWidth>
          {actionLabel}
        </ButtonLink>
      ) : null}
    </article>
  );
}
