import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type MetaPillProps = {
  children: ReactNode;
  className?: string;
};

type MetaPillsProps = {
  items?: ReactNode[];
  children?: ReactNode;
  className?: string;
};

export function MetaPill({ children, className }: MetaPillProps) {
  return <span className={cn("meta-pill", className)}>{children}</span>;
}

export function MetaPills({ items, children, className }: MetaPillsProps) {
  const hasItems = items && items.length > 0;

  if (!hasItems && !children) {
    return null;
  }

  return (
    <div className={cn("page-meta-pills", className)}>
      {hasItems
        ? items.map((item, index) => (
            <Fragment key={index}>
              <MetaPill>{item}</MetaPill>
            </Fragment>
          ))
        : children}
    </div>
  );
}
