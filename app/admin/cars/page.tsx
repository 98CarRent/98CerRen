import Link from "next/link";
import db from "@/lib/db";
import { getDict } from "@/lib/lang";
import { getLang } from "@/lib/lang-server";
import { formatBaht } from "@/lib/money";
import { deleteCar } from "@/lib/actions";
import DeleteFormButton from "@/components/admin/DeleteFormButton";
import type { Car } from "@/lib/types";

export default async function AdminCarsPage() {
  const lang = await getLang();
  const t = getDict(lang);
  const cars = db.prepare("SELECT * FROM cars ORDER BY id DESC").all() as Car[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{t.admin.cars}</h1>
          <p className="text-sm text-slate-500">
            {cars.length} {lang === "en" ? "cars" : "คัน"}
          </p>
        </div>
        <Link
          href="/admin/cars/new"
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
        >
          + {t.admin.addCar}
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3">รถ</th>
              <th className="px-4 py-3">{t.admin.carType}</th>
              <th className="px-4 py-3">{t.admin.status}</th>
              <th className="px-4 py-3">ราคา/วัน</th>
              <th className="px-4 py-3">{t.admin.actions}</th>
            </tr>
          </thead>
          <tbody>
            {cars.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  {t.admin.noData}
                </td>
              </tr>
            )}
            {cars.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image} alt="" className="h-12 w-16 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-12 w-16 items-center justify-center rounded-lg bg-slate-100 text-xl">
                      🚗
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-bold text-slate-900">
                    {c.brand} {c.model}
                  </p>
                  <p className="text-xs text-slate-500">
                    {c.year || "-"} · {c.plate || "-"}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    {c.type === "with_driver" ? t.car.with_driver : t.car.self}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      c.status === "available"
                        ? "bg-emerald-50 text-emerald-700"
                        : c.status === "rented"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {t.car[c.status]}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold text-slate-900">
                  {formatBaht(c.price_per_day)} {t.common.baht}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/cars/${c.id}/edit`}
                      className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-200 transition hover:bg-blue-100"
                    >
                      ✏️ {t.car.edit}
                    </Link>
                    <DeleteFormButton
                      action={deleteCar}
                      fields={{ id: c.id }}
                      confirmText={t.admin.deleteCarConfirm}
                      label={t.car.delete}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}