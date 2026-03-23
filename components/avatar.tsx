import { cn } from "@/lib/cn";

const toneClasses = {
  indigo: "avatar--indigo",
  amber: "avatar--amber",
  green: "avatar--green",
  rose: "avatar--rose",
};

type AvatarProps = {
  name: string;
  initials: string;
  tone?: keyof typeof toneClasses;
  size?: "sm" | "md" | "lg" | "xl";
  src?: string;
};

const sizeClasses = {
  sm: "avatar--sm",
  md: "avatar--md",
  lg: "avatar--lg",
  xl: "avatar--xl",
};

export function Avatar({
  name,
  initials,
  tone = "indigo",
  size = "md",
  src,
}: AvatarProps) {
  return (
    <div
      className={cn("avatar", toneClasses[tone], sizeClasses[size])}
      aria-label={name}
      title={name}
    >
      {src ? (
        // Avatar pode vir de provedores externos variados durante a fase de transição.
        // Mantemos <img> aqui até a estratégia de imagens remotas ser fechada.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="avatar__image" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
