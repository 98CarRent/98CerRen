import Link from "next/link";
import db from "@/lib/db";
import { getDict } from "@/lib/lang";
import { getLang } from "@/lib/lang-server";
import BookingForm from "@/components/BookingForm";
import type { Car } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; ref?: string }>;
}) {
  const [{ success, ref }, lang] = await Promise.all([searchParams, getLang()]);
  const t = getDict(lang);
  const cars = db.prepare("SELECT * FROM cars ORDER BY id DESC").all() as Car[];

  const today = new Date().toISOString().slice(0, 10);
  const blocked = (
    db
      .prepare(
        `SELECT car_id, start_date, end_date FROM bookings
          WHERE status != 'canceled' AND end_date >= ?`
      )
      .all(today) as { car_id: number; start_date: string; end_date: string }[]
  ).map((b) => ({ carId: b.car_id, start: b.start_date, end: b.end_date }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {success ? (
        <div className="mx-auto max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
          <p className="text-5xl">✅</p>
          <h1 className="mt-4 text-2xl font-black text-emerald-800">
            {t.booking.success}
          </h1>
          <p className="mt-2 text-emerald-700">{t.booking.successDesc}</p>
          {ref && (
            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-emerald-600">
              {t.booking.refLabel}
            </p>
          )}
          {ref && (
            <p className="mt-1 inline-block rounded-xl bg-emerald-600 px-6 py-3 text-lg font-black tracking-widest text-white">
              {ref}
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/booking/track"
              className="rounded-xl border-2 border-emerald-600 px-6 py-3 font-bold text-emerald-700 transition hover:bg-emerald-50"
            >
              {t.booking.trackTitle} →
            </Link>
            <a
              href="/booking"
              className="rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-700"
            >
              {t.booking.bookAgain} →
            </a>
          </div>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <h1 className="text-3xl font-black text-slate-900">{t.booking.title}</h1>
            <p className="mt-2 max-w-2xl text-slate-500">{t.booking.subtitle}</p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <BookingForm cars={cars} t={t} blocked={blocked} />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-slate-900 p-6 text-white">
              <h2 className="font-black">{t.booking.myBookingTitle}</h2>
              <ol className="mt-4 space-y-4 text-sm">
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-400/20 font-black text-sky-300">
                    1
                  </span>
                  <span className="text-slate-300">{t.booking.step1}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-400/20 font-black text-sky-300">
                    2
                  </span>
                  <span className="text-slate-300">{t.booking.step2}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-400/20 font-black text-sky-300">
                    3
                  </span>
                  <span className="text-slate-300">{t.booking.step3}</span>
                </li>
              </ol>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-black text-slate-900">{t.contact.title}</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>📞 {t.contact.phone1}</li>
                <li>📞 {t.contact.phone2}</li>
                <li>💬 {t.contact.line1}</li>
                <li>💬 {t.contact.line2}</li>
                <li>📍 {t.contact.address}</li>
              </ul>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}