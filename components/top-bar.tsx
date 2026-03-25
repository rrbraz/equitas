import type { ReactNode } from "react";

type TopBarProps = {
  eyebrow?: string;
  title: string;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function TopBar({ eyebrow, title, leading, trailing }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="top-bar__side">{leading}</div>
      <div className="top-bar__copy">
        {eyebrow ? <span className="top-bar__eyebrow">{eyebrow}</span> : null}
        <h1 className="top-bar__title">{title}</h1>
      </div>
      <div className="top-bar__side top-bar__side--right">{trailing}</div>
    </header>
  );
}
