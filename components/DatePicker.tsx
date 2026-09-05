"use client";

import { useState } from "react";

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DatePicker({
  value,
  onChange,
  min,
  isDisabled,
  months,
  weekdays,
}: {
  value: string;
  onChange: (v: string) => void;
  min: string;
  isDisabled: (d: string) => boolean;
  months: readonly string[];
  weekdays: readonly string[];
}) {
  const today = toISO(new Date());
  const initial = value || min || today;
  const [view, setView] = useState(() => {
    const d = initial ? new Date(initial + "T00:00:00") : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function shift(delta: number) {
    setView((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1));
  }

  const cells: (string | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toISO(new Date(year, month, d)));

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="rounded-lg px-2 py-1 text-sm font-bold text-slate-500 hover:bg-white hover:text-brand"
          aria-label="เดือนก่อนหน้า"
        >
          ‹
        </button>
        <p className="text-sm font-black text-slate-800">
          {months[month]} {year}
        </p>
        <button
          type="button"
          onClick={() => shift(1)}
          className="rounded-lg px-2 py-1 text-sm font-bold text-slate-500 hover:bg-white hover:text-brand"
          aria-label="เดือนถัดไป"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400">
        {weekdays.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1 text-center">
        {cells.map((d, i) => {
          if (!d) return <span key={`x${i}`} />;
          const disabled = d < min || isDisabled(d);
          const selected = d === value;
          const isToday = d === today;
          return (
            <button
              key={d}
              type="button"
              disabled={disabled}
              onClick={() => onChange(d)}
              className={`aspect-square rounded-lg text-xs font-semibold transition
                ${selected
                  ? "bg-brand text-white shadow ring-2 ring-brand-soft"
                  : disabled
                    ? "cursor-not-allowed bg-slate-200 text-slate-400 line-through"
                    : isToday
                      ? "bg-brand-soft text-brand-strong hover:bg-brand hover:text-white"
                      : "bg-white text-slate-700 hover:bg-brand hover:text-white"}`}
            >
              {Number(d.slice(8))}
            </button>
          );
        })}
      </div>
      <p className="mt-2 min-h-4 text-[11px] font-bold text-brand">
        {value
          ? `✓ ${Number(value.slice(8))} ${months[Number(value.slice(5, 7)) - 1]} ${value.slice(0, 4)}`
          : ""}
      </p>
    </div>
  );
}