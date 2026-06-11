import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "dark" | "light" | "outline";
};

export function Button({ children, className, variant = "dark", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-full px-6 text-xs font-bold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-60",
        variant === "dark" && "bg-black text-white hover:bg-neutral-800",
        variant === "light" && "bg-white text-black hover:bg-neutral-100",
        variant === "outline" && "border border-black/30 bg-white text-black hover:border-black",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

