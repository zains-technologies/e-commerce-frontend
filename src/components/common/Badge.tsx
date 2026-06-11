import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({ children, active, className }: { children: ReactNode; active?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full border border-neutral-200 px-4 text-[11px] font-bold uppercase",
        active ? "border-black bg-black text-white" : "bg-white text-neutral-700",
        className,
      )}
    >
      {children}
    </span>
  );
}

