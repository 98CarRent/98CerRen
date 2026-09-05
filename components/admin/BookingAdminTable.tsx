"use client";

import { useState } from "react";
import Link from "next/link";
import type { Dict } from "@/lib/lang";
import type { BookingWithCar } from "@/lib/types";
import { formatBaht } from "@/lib/money";

const FILTERS = ["all", "pending", "confirmed", "completed", "canceled"] as const;

const badge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-brand-softer text-brand-strong",
  completed: "bg-emerald-100 text-emerald-700",
  canceled: "bg-rose-100 text-rose-600",
};

export default function BookingAdminTable({
  bookings,
  t,
}: {
  bookings: BookingWithCar[];
  t: Dict;
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              filter === f
                ? "bg-slate-900 text-white"
                : "border border-slate-300 bg-white text-slate-600 hover:border-slate-500"
            }`}
          >
            {f === "all" ? t.status.all : t.status[f]}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">{t.booking.refLabel}</th>
              <th className="px-4 py-3">{t.admin.customer}</th>
              <th className="px-4 py-3">{t.admin.carName}</th>
              <th className="px-4 py-3">{t.admin.dateRange}</th>
              <th className="px-4 py-3">{t.admin.status}</th>
              <th className="px-4 py-3">{t.booking.total}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  {t.admin.noData}
                </td>
              </tr>
            )}
            {filtered.map((b) => (
              <tr key={b.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs font-bold text-brand-strong">
                  {b.ref_code || `#${b.id}`}
                </td>
                <td className="px-4 py-3">
                  <p className="font-bold text-slate-900">{b.customer_name}</p>
                  <p className="text-xs text-slate-500">☎ {b.customer_phone || "-"}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-slate-700">
                    {b.brand ? `${b.brand} ${b.model}` : "-"}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-400">
                    {b.rental_type === "with_driver" ? t.car.with_driver : t.car.self}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-700">
                  {b.start_date} → {b.end_date}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge[b.status] || badge.pending}`}>
                    {t.status[b.status] || b.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold text-slate-900">
                  {formatBaht(b.total_price)} {t.common.baht}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/bookings/${b.id}`}
                    className="rounded-lg bg-brand-soft px-3 py-1.5 text-xs font-bold text-brand-strong ring-1 ring-brand-soft transition hover:bg-brand-softer"
                  >
                    {t.common.edit} →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}