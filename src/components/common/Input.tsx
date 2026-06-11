import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-full border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-black",
        className,
      )}
      {...props}
    />
  );
}

