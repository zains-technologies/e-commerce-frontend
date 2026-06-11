export function QuantityControl({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex h-10 items-center rounded-full border border-neutral-200">
      <button disabled={disabled || value <= 1} onClick={() => onChange(value - 1)} className="size-10 text-lg">-</button>
      <span className="w-8 text-center text-sm font-bold">{value}</span>
      <button disabled={disabled} onClick={() => onChange(value + 1)} className="size-10 text-lg">+</button>
    </div>
  );
}

