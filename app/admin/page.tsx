import Link from "next/link";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";
import { getDict } from "@/lib/lang";
import { getLang } from "@/lib/lang-server";
import { MonthlyChart, StatusChart } from "@/components/DashboardCharts";
import { formatBaht } from "@/lib/money";
import type { BookingWithCar } from "@/lib/types";

export const dynamic = "force-dynamic";

const TH_MONTHS = ["", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

export default async function AdminDashboard() {
  const admin = await verifyAdmin();
  if (!admin) redirect("/login");
  const lang = await getLang();
  const t = getDict(lang);

  const totalCars = (await db.prepare("SELECT COUNT(*) AS c FROM cars").get() as { c: number }).c;
  const availableCars = (
    await db.prepare("SELECT COUNT(*) AS c FROM cars WHERE status='available'").get() as { c: number }
  ).c;
  const totalBookings = (
    await db.prepare("SELECT COUNT(*) AS c FROM bookings").get() as { c: number }
  ).c;
  const pendingBookings = (
    await db.prepare("SELECT COUNT(*) AS c FROM bookings WHERE status='pending'").get() as { c: number }
  ).c;
  const revenue = (
    await db.prepare(
      "SELECT COALESCE(SUM(total_price),0) AS s FROM bookings WHERE status='completed'"
    ).get() as { s: number }
  ).s;

  const monthlyRaw = await db
    .prepare(
      `SELECT strftime('%Y-%m', created_at) AS ym, COUNT(*) AS c
       FROM bookings WHERE created_at >= date('now','localtime','-6 months')
       GROUP BY ym ORDER BY ym DESC LIMIT 6`
    )
    .all() as { ym: string; c: number }[];

  const monthly = monthlyRaw
    .slice()
    .reverse()
    .map((m) => {
      const [, mm] = m.ym.split("-");
      return {
        month: lang === "en" ? m.ym : TH_MONTHS[Number(mm)] || mm,
        count: m.c,
      };
    });

  const statusRows = await db
    .prepare("SELECT status, COUNT(*) AS c FROM bookings GROUP BY status")
    .all() as { status: string; c: number }[];

  const statusLabels: Record<string, string> = {
    pending: t.status.pending,
    confirmed: t.status.confirmed,
    canceled: t.status.canceled,
    completed: t.status.completed,
  };
  const statusData = statusRows.map((r) => ({
    name: statusLabels[r.status] || r.status,
    value: r.c,
  }));

  const latest = await db
    .prepare(
      `SELECT b.*, c.brand, c.model FROM bookings b
       LEFT JOIN cars c ON c.id = b.car_id
       ORDER BY b.id DESC LIMIT 5`
    )
    .all() as (BookingWithCar & { brand: string; model: string })[];

  const metrics = [
    { label: t.dashboard.totalCars, value: `${totalCars}`, icon: "🚗", color: "bg-brand-grad", href: "/admin/cars" },
    { label: t.dashboard.availableCars, value: `${availableCars}`, icon: "✅", color: "from-emerald-500 to-teal-500", href: "/admin/cars" },
    { label: t.dashboard.totalBookings, value: `${totalBookings}`, icon: "📅", color: "from-violet-500 to-purple-500", href: "/admin/bookings" },
    { label: t.dashboard.pendingBookings, value: `${pendingBookings}`, icon: "⏳", color: "from-amber-500 to-orange-500", href: "/admin/bookings" },
    { label: t.dashboard.revenue, value: `${formatBaht(revenue)}`, icon: "💰", color: "from-rose-500 to-pink-500", href: "/admin/bookings" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{t.dashboard.title}</h1>
          <p className="text-sm text-slate-500">
            {t.dashboard.welcome}, <span className="font-bold">{admin.username}</span> 👋
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/cars/new"
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand transition hover:bg-brand-strong"
          >
            + {t.admin.addCar}
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-lg"
          >
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${m.color} text-lg text-white shadow transition group-hover:scale-110`}>
              {m.icon}
            </span>
            <p className="mt-3 text-2xl font-black text-slate-900">{m.value}</p>
            <p className="text-xs font-semibold text-slate-500 group-hover:text-brand-strong">
              {m.label} →
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-black text-slate-900">{t.dashboard.monthlyBookings}</h2>
          <div className="mt-4">
            <MonthlyChart data={monthly} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-black text-slate-900">{t.dashboard.bookingStatus}</h2>
          <div className="mt-4">
            <StatusChart data={statusData} />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-slate-900">{t.dashboard.latestBookings}</h2>
          <Link href="/admin/bookings" className="text-sm font-bold text-brand-strong hover:underline">
            {t.dashboard.viewAll} →
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-3 pr-4">{t.admin.customer}</th>
                <th className="pb-3 pr-4">{t.admin.status}</th>
                <th className="pb-3 pr-4">{t.admin.dateRange}</th>
                <th className="pb-3">{t.booking.total}</th>
              </tr>
            </thead>
            <tbody>
              {latest.map((b) => (
                <Link
                  key={b.id}
                  href={`/admin/bookings/${b.id}`}
                  className="group contents"
                >
                  <tr className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-brand-soft/50">
                    <td className="py-3 pr-4">
                      <p className="font-bold text-slate-900 group-hover:text-brand-strong">
                        {b.customer_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {b.brand ? `${b.brand} ${b.model}` : "-"}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          b.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : b.status === "confirmed"
                              ? "bg-brand-softer text-brand-strong"
                              : b.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-600"
                        }`}
                      >
                        {statusLabels[b.status] || b.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-slate-700">
                      {b.start_date} → {b.end_date}
                    </td>
                    <td className="py-3 font-bold text-slate-900">
                      {formatBaht(b.total_price)} {t.common.baht}
                    </td>
                  </tr>
                </Link>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}