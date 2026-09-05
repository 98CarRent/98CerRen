import Link from "next/link";
import { notFound } from "next/navigation";
import db from "@/lib/db";
import { getDict } from "@/lib/lang";
import { getLang } from "@/lib/lang-server";
import { setBookingStatus, deleteBooking } from "@/lib/actions";
import DeleteFormButton from "@/components/admin/DeleteFormButton";
import { formatBaht } from "@/lib/money";
import type { BookingWithCar } from "@/lib/types";

type PageProps = { params: Promise<{ id: string }> };

const badge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-brand-softer text-brand-strong",
  completed: "bg-emerald-100 text-emerald-700",
  canceled: "bg-rose-100 text-rose-600",
};

export default async function BookingDetailPage(props: PageProps) {
  const { id } = await props.params;
  const lang = await getLang();
  const t = getDict(lang);

  const booking = await db
    .prepare(
      `SELECT b.*, c.brand, c.model, c.price_per_day, c.image FROM bookings b
       LEFT JOIN cars c ON c.id = b.car_id WHERE b.id = ?`
    )
    .get(Number(id)) as (BookingWithCar & { price_per_day: number; image: string }) | undefined;

  if (!booking) notFound();

  const actions: { status: "confirmed" | "completed" | "canceled"; label: string }[] = [
    { status: "confirmed", label: t.admin.markConfirmed },
    { status: "completed", label: t.admin.markCompleted },
    { status: "canceled", label: t.admin.markCanceled },
  ];

  const rows: { label: string; value: string }[] = [
    { label: t.admin.customer, value: booking.customer_name },
    { label: t.admin.phone, value: booking.customer_phone || "-" },
    { label: t.booking.line, value: booking.customer_line || "-" },
    { label: t.booking.rentalType, value: booking.rental_type === "with_driver" ? t.car.with_driver : t.car.self },
    { label: t.booking.startDate, value: booking.start_date },
    { label: t.booking.endDate, value: booking.end_date },
    { label: t.booking.pickup, value: booking.pickup_location || "-" },
    { label: t.admin.createdAt, value: booking.created_at },
  ];

  return (
    <div>
      <Link href="/admin/bookings" className="text-sm font-bold text-brand-strong hover:underline">
        ← {t.admin.backToList}
      </Link>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-slate-900">
          {t.admin.bookingDetail} #{booking.id}
        </h1>
        {booking.ref_code && (
          <p className="rounded-lg bg-brand-soft px-4 py-2 font-mono text-sm font-bold tracking-widest text-brand-strong ring-1 ring-brand-soft">
            {t.booking.refLabel}: {booking.ref_code}
          </p>
        )}
        <span className={`rounded-full px-4 py-1.5 text-sm font-bold ${badge[booking.status] || badge.pending}`}>
          {t.status[booking.status] || booking.status}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-black text-slate-900">{t.admin.customer}</h2>
          <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {rows.map((r) => (
              <div key={r.label}>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{r.label}</dt>
                <dd className="mt-1 font-semibold text-slate-900">{r.value}</dd>
              </div>
            ))}
          </dl>
          {booking.note && (
            <div className="mt-4 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">📝 {t.booking.note}</p>
              <p className="mt-1 text-sm text-amber-900">{booking.note}</p>
            </div>
          )}
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm font-bold text-slate-700">
              <span>{t.booking.total}</span>
              <span className="text-xl font-black text-brand-strong">
                {formatBaht(booking.total_price)} {t.common.baht}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-black text-slate-900">{t.admin.carName}</h2>
            <div className="mt-4 flex items-center gap-4">
              {booking.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={booking.image} alt="" className="h-20 w-28 rounded-xl object-cover" />
              ) : (
                <span className="flex h-20 w-28 items-center justify-center rounded-xl bg-slate-100 text-3xl">
                  🚗
                </span>
              )}
              <div>
                <p className="font-bold text-slate-900">
                  {booking.brand ? `${booking.brand} ${booking.model}` : "-"}
                </p>
                {booking.price_per_day > 0 && (
                  <p className="text-sm text-slate-500">
                    {formatBaht(booking.price_per_day)} {t.car.pricePerDay}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-black text-slate-900">{t.admin.actions}</h2>
            <div className="mt-4 space-y-2">
              {actions
                .filter((a) => a.status !== booking.status)
                .map((a) => (
                  <form key={a.status} action={setBookingStatus}>
                    <input type="hidden" name="id" value={booking.id} />
                    <input type="hidden" name="status" value={a.status} />
                    <button
                      className={`w-full rounded-xl px-4 py-3 text-sm font-bold transition ${
                        a.status === "confirmed"
                          ? "bg-brand text-white hover:bg-brand-strong"
                          : a.status === "completed"
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-amber-500 text-white hover:bg-amber-600"
                      }`}
                    >
                      ✓ {a.label}
                    </button>
                  </form>
                ))}
              {actions.every((a) => a.status === booking.status) && (
                <p className="text-sm text-slate-400">—</p>
              )}
              <DeleteFormButton
                action={deleteBooking}
                fields={{ id: booking.id }}
                confirmText={t.admin.deleteBookingConfirm}
                label={t.admin.deleteBookingConfirm.replace("?", "")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}