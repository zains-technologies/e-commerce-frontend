import type { ReactNode } from "react";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";

export function AdminCard({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-[28px] border border-neutral-200 bg-white p-5 md:p-6", className)}>{children}</section>;
}

export function Drawer({
  open,
  title,
  subtitle,
  children,
  onClose,
  size = "default",
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  size?: "default" | "wide";
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button className="animate-fade-in absolute inset-0 bg-black/40 backdrop-blur-[2px]" aria-label="Close drawer" onClick={onClose} />
      <aside className={cn("animate-drawer-in absolute right-0 top-0 flex h-full w-full flex-col overflow-hidden rounded-l-[32px] bg-white shadow-2xl", size === "wide" ? "max-w-4xl" : "max-w-xl")}>
        <div className="border-b border-neutral-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase text-neutral-500">Admin action</p>
              <h2 className="mt-2 text-4xl font-medium leading-none tracking-[-0.07em]">{title}</h2>
              {subtitle && <p className="mt-3 text-sm leading-6 text-neutral-500">{subtitle}</p>}
            </div>
            <button className="grid size-10 shrink-0 place-items-center rounded-full border border-neutral-200 text-xl hover:bg-neutral-100" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </aside>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title = "Delete this item?",
  message = "This action cannot be undone.",
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  message?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="animate-fade-in fixed inset-0 z-[60] grid place-items-center bg-black/45 p-4 backdrop-blur-[2px]">
      <div className="animate-pop-in w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <h2 className="text-3xl font-medium tracking-[-0.06em]">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-neutral-600">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>Cancel</Button>
          <Button type="button" disabled={busy} onClick={onConfirm}>{busy ? "Deleting..." : "Delete"}</Button>
        </div>
      </div>
    </div>
  );
}

export function ToastMessage({ message, tone = "success", onClose }: { message: string; tone?: "success" | "error"; onClose: () => void }) {
  return (
    <div className="animate-toast-in fixed right-5 top-20 z-50 flex max-w-md items-center gap-3 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-bold shadow-xl">
      <span className={cn("grid size-7 place-items-center rounded-full text-white", tone === "success" ? "bg-black" : "bg-red-600")}>
        {tone === "success" ? "✓" : "!"}
      </span>
      <span>{message}</span>
      <button className="ml-2 text-neutral-400 hover:text-black" onClick={onClose} aria-label="Close message">×</button>
    </div>
  );
}

export function MetricCard({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <AdminCard>
      <p className="text-[11px] font-bold uppercase text-neutral-500">{label}</p>
      <p className="mt-3 text-4xl font-medium tracking-[-0.07em]">{value}</p>
      {helper && <p className="mt-2 text-xs text-neutral-500">{helper}</p>}
    </AdminCard>
  );
}

export function AdminTable({
  columns,
  rows,
  empty = "No records yet.",
}: {
  columns: string[];
  rows: ReactNode[][];
  empty?: string;
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-neutral-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-neutral-50 text-[11px] uppercase text-neutral-500">
            <tr>{columns.map((column) => <th key={column} className="px-4 py-3">{column}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-neutral-500">{empty}</td></tr>
            )}
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-neutral-100 hover:bg-neutral-50/70">
                {row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 align-top">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
