import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  trailing?: ReactNode;
  className?: string;
};

type SectionBlockProps = SectionHeaderProps & {
  children?: ReactNode;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  trailing,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("section-heading", className)}>
      <div>
        {eyebrow ? <span className="section-label">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {description ? <p className="supporting-copy">{description}</p> : null}
      </div>
      {trailing}
    </div>
  );
}

export function SectionBlock({
  eyebrow,
  title,
  description,
  trailing,
  children,
  className,
}: SectionBlockProps) {
  return (
    <section className={cn("surface-section section-stack", className)}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        trailing={trailing}
      />
      {children}
    </section>
  );
}
