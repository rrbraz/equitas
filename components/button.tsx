import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary";

type SharedButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  className?: string;
};

type ButtonProps = SharedButtonProps & ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonLinkProps = SharedButtonProps &
  Omit<ComponentProps<typeof Link>, "className">;

export function getButtonClassName({
  variant = "primary",
  fullWidth = false,
  className,
}: Omit<SharedButtonProps, "children">) {
  return cn(
    `${variant}-button`,
    fullWidth && `${variant}-button--full`,
    className,
  );
}

export function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={getButtonClassName({ variant, fullWidth, className })}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  variant = "primary",
  fullWidth = false,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={getButtonClassName({ variant, fullWidth, className })}
      {...props}
    >
      {children}
    </Link>
  );
}
