import type { ReactNode } from "react";

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 className="text-2xl font-medium tracking-[-0.03em] md:text-3xl">{title}</h2>
      {action}
    </div>
  );
}

