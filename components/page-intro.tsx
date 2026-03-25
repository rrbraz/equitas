import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type PageIntroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  meta?: ReactNode;
  actions?: ReactNode;
  tone?: "plain" | "card";
  className?: string;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  meta,
  actions,
  tone = "plain",
  className,
}: PageIntroProps) {
  return (
    <section
      className={cn(
        "hero-copy",
        tone === "card" && "hero-copy--card",
        className,
      )}
    >
      {eyebrow ? <span className="eyebrow-note">{eyebrow}</span> : null}
      <h1>{title}</h1>
      <p>{description}</p>
      {meta ? <div>{meta}</div> : null}
      {actions ? <div className="page-intro__actions">{actions}</div> : null}
    </section>
  );
}
