import Link from "next/link";
import { Plus } from "lucide-react";

type FloatingActionProps = {
  href: string;
  label: string;
};

export function FloatingAction({ href, label }: FloatingActionProps) {
  return (
    <Link
      href={href}
      className="floating-action"
      aria-label={label}
      title={label}
    >
      <Plus size={22} strokeWidth={2.5} />
      <span className="floating-action__label">{label}</span>
    </Link>
  );
}
