import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export function Input({ className, error, ...props }: InputProps) {
  return (
    <label className="block w-full">
      <input
        className={cn(
          "h-11 w-full rounded-full border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-black",
          error && "border-red-400 bg-red-50/40 focus:border-red-500",
          className,
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && <span className="mt-1.5 block px-4 text-xs font-bold text-red-600">{error}</span>}
    </label>
  );
}
