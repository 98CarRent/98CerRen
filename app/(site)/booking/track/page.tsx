import Link from "next/link";
import db from "@/lib/db";
import { getDict } from "@/lib/lang";
import { getLang } from "@/lib/lang-server";
import BookingTrackForm from "@/components/BookingTrackForm";

export const dynamic = "force-dynamic";

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 ring-amber-200",
  confirmed: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  completed: "bg-brand-softer text-brand-strong ring-brand-soft",
  canceled: "bg-rose-100 text-rose-700 ring-rose-200",
};

type Row = {
  ref_code: string;
  customer_name: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  rental_type: string;
  pickup_location: string;
  brand: string | null;
  model: string | null;
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const [{ ref }, lang] = await Promise.all([searchParams, getLang()]);
  const t = getDict(lang);

  const code = ref ? ref.trim().toUpperCase() : "";
  const row = code
    ? (await db
        .prepare(
          `SELECT b.ref_code, b.customer_name, b.start_date, b.end_date, b.total_price,
                  b.status, b.rental_type, b.pickup_location, c.brand, c.model
             FROM bookings b
             LEFT JOIN cars c ON c.id = b.car_id
            WHERE b.ref_code = ?`
        )
        .get(code) as Row | undefined)
    : undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-black text-slate-900">{t.booking.trackTitle}</h1>
      <p className="mt-2 text-slate-500">{t.booking.trackSubtitle}</p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <BookingTrackForm t={t} />
      </div>

      {code && !row && (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-3 font-semibold text-amber-800">{t.booking.trackNotFound}</p>
          <p className="mt-1 text-sm text-amber-600">{code}</p>
        </div>
      )}

      {row && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.booking.trackStatus}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <span
                className={`rounded-full px-4 py-1.5 text-sm font-bold ring-1 ${
                  statusBadge[row.status] ?? statusBadge.pending
                }`}
              >
                {t.status[row.status as keyof typeof t.status] || row.status}
              </span>
              <span className="text-lg font-black tracking-wider text-brand-strong">
                {row.ref_code}
              </span>
            </div>
          </div>
          <dl className="grid gap-4 p-6 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-bold text-slate-500">{t.booking.name}</dt>
              <dd className="mt-1 font-semibold text-slate-900">{row.customer_name}</dd>
            </div>
            <div>
              <dt className="font-bold text-slate-500">{t.booking.car}</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {row.brand} {row.model ?? ""}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-500">{t.booking.rentalType}</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {row.rental_type === "with_driver" ? t.car.with_driver : t.car.self}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-500">{t.booking.total}</dt>
              <dd className="mt-1 font-black text-brand-strong">
                {row.total_price.toLocaleString()} {t.common.baht}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-500">{t.booking.startDate}</dt>
              <dd className="mt-1 font-semibold text-slate-900">{row.start_date}</dd>
            </div>
            <div>
              <dt className="font-bold text-slate-500">{t.booking.endDate}</dt>
              <dd className="mt-1 font-semibold text-slate-900">{row.end_date}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-bold text-slate-500">{t.booking.pickup}</dt>
              <dd className="mt-1 font-semibold text-slate-900">{row.pickup_location || "-"}</dd>
            </div>
          </dl>
        </div>
      )}

      <p className="mt-8 text-center">
        <Link href="/booking" className="text-sm font-semibold text-brand hover:text-brand-strong">
          ← {t.booking.title}
        </Link>
      </p>
    </div>
  );
}