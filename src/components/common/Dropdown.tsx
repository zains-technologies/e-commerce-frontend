"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type DropdownOption = {
  label: string;
  value: string;
};

export function Dropdown({
  value,
  options,
  onChange,
  placeholder = "Select",
  disabled = false,
  size = "md",
  className,
}: {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-full border border-neutral-200 bg-white text-left text-sm outline-none transition hover:border-black disabled:cursor-not-allowed disabled:opacity-60",
          size === "sm" ? "h-9 px-3 text-xs font-bold uppercase" : "h-11 px-4",
          open && "border-black shadow-sm",
        )}
        aria-controls={id}
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={cn("truncate", selected ? "text-black" : "text-neutral-400")}>{selected?.label || placeholder}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div
          id={id}
          className="animate-pop-in absolute left-0 right-0 top-[calc(100%+8px)] z-[80] overflow-hidden rounded-[22px] border border-neutral-200 bg-white p-1 shadow-2xl"
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-[18px] px-3 py-2.5 text-left text-sm font-bold hover:bg-neutral-50",
                  active && "bg-black text-white hover:bg-black",
                )}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <span>{option.label}</span>
                {active && <CheckMiniIcon />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckMiniIcon() {
  return (
    <svg aria-hidden="true" className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}
