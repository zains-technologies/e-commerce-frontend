export function LoadingState({ label = "Loading collection..." }: { label?: string }) {
  return <div className="rounded-[24px] border border-neutral-200 p-8 text-sm text-neutral-500">{label}</div>;
}

export function ErrorState({ message }: { message: string }) {
  return <div className="rounded-[24px] border border-red-200 bg-red-50 p-5 text-sm text-red-700">{message}</div>;
}

export function EmptyState({ message = "Nothing to show yet." }: { message?: string }) {
  return <div className="rounded-[24px] border border-neutral-200 p-8 text-sm text-neutral-500">{message}</div>;
}

