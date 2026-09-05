import Link from "next/link";
import { notFound } from "next/navigation";
import db from "@/lib/db";
import { getDict } from "@/lib/lang";
import { getLang } from "@/lib/lang-server";
import { formatBaht } from "@/lib/money";
import { imageExists } from "@/lib/utils";
import CarPhotoGallery from "@/components/CarPhotoGallery";
import type { Car } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CarDetailPage(props: PageProps<"/cars/[id]">) {
  const { id } = await props.params;
  const lang = await getLang();
  const t = getDict(lang);

  const car = await db.prepare("SELECT * FROM cars WHERE id = ?").get(Number(id)) as
    | Car
    | undefined;
  if (!car) notFound();

  const images = await db
    .prepare("SELECT url FROM car_images WHERE car_id = ? ORDER BY id")
    .all(car.id) as { url: string }[];

  const allUrls = Array.from(
    new Set(
      [car.image, ...images.map((im) => im.url)].filter(
        (u): u is string => Boolean(u) && imageExists(u)
      )
    )
  );

  const name = `${car.brand} ${car.model}`;
  const statusLabel = t.car[car.status];
  const desc = lang === "en" ? car.description_en : car.description_th;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="text-sm text-slate-500">
        <Link href="/cars" className="hover:text-brand-strong">
          {t.nav.cars}
        </Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-slate-800">{name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <CarPhotoGallery urls={allUrls} name={name} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${
              car.status === "available"
                ? "bg-emerald-100 text-emerald-700"
                : car.status === "rented"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-200 text-slate-600"
            }`}>
              {statusLabel}
            </span>
            <span className="rounded-full bg-brand-softer px-3 py-1 text-xs font-bold text-brand-strong">
              {car.type === "with_driver" ? t.car.with_driver : t.car.self}
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">{name}</h1>

          <div className="mt-4 rounded-2xl border border-brand-soft bg-brand-soft p-5">
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 text-base">
              <span className="flex items-baseline gap-1.5">
                <span className="font-semibold text-slate-600">{t.car.priceDaily}</span>
                <span className="font-black text-brand-strong">
                  {formatBaht(car.price_per_day)} {t.common.baht}
                </span>
              </span>
              <span className="flex items-baseline gap-1.5">
                <span className="font-semibold text-slate-600">{t.car.priceWeekly}</span>
                <span className="font-black text-brand-strong">
                  {formatBaht(car.price_week)} {t.common.baht}
                </span>
              </span>
              <span className="flex items-baseline gap-1.5">
                <span className="font-semibold text-slate-600">{t.car.priceMonthly}</span>
                <span className="font-black text-brand-strong">
                  {formatBaht(car.price_month)} {t.common.baht}
                </span>
              </span>
            </div>
            <p className="mt-4 border-t border-brand-softer pt-3 text-xs font-medium text-slate-500">
              💡 {t.car.priceNote}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { k: t.car.year, v: car.year ? String(car.year) : "-" },
              { k: t.car.seats, v: `${car.seats}` },
              { k: t.car.transmission, v: car.transmission === "auto" ? t.car.auto : t.car.manual },
              { k: t.car.fuel, v: car.fuel === "diesel" ? t.car.diesel : t.car.petrol },
              { k: t.car.deposit, v: `${formatBaht(car.deposit)} ${t.common.baht}` },
              { k: t.car.plate, v: car.plate || "-" },
            ].map((s) => (
              <div key={s.k} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold text-slate-500">{s.k}</p>
                <p className="mt-0.5 font-bold text-slate-900">{s.v}</p>
              </div>
            ))}
          </div>

          {desc && (
            <div className="mt-6">
              <h2 className="text-lg font-extrabold text-slate-900">{t.car.description}</h2>
              <p className="mt-2 leading-relaxed text-slate-600">{desc}</p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/booking?car=${car.id}`}
              className="lift flex-1 rounded-xl bg-brand px-6 py-3.5 text-center text-lg font-bold text-white shadow-xl shadow-brand hover:bg-brand-strong"
            >
              {t.car.book} →
            </Link>
            <Link
              href="/booking"
              className="lift rounded-xl border border-slate-300 px-6 py-3.5 font-bold text-slate-700 hover:border-brand hover:text-brand-strong"
            >
              {t.booking.title}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}