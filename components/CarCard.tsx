import Link from "next/link";
import type { Car } from "@/lib/types";
import type { Dict } from "@/lib/lang";
import { formatBaht } from "@/lib/money";

export default function CarCard({ car, t }: { car: Car; t: Dict }) {
  const name = `${car.brand} ${car.model}`;
  const type = car.type === "with_driver" ? t.car.with_driver : t.car.self;
  const statusKey = car.status as "available" | "rented" | "maintenance";
  const statusLabel = t.car[statusKey];

  const statusColor =
    car.status === "available"
      ? "bg-emerald-100 text-emerald-700"
      : car.status === "rented"
        ? "bg-amber-100 text-amber-700"
        : "bg-slate-200 text-slate-600";

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand">
      <Link href={`/cars/${car.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {car.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={car.image}
              alt={name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl">
              🚗
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand-strong backdrop-blur">
            {type}
          </span>
          <span
            className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${statusColor}`}
          >
            {statusLabel}
          </span>
          {car.year ? (
            <span className="absolute bottom-3 left-3 rounded-lg bg-slate-900/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
              {car.year}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              <Link href={`/cars/${car.id}`}>{name}</Link>
            </h3>
            <p className="text-xs text-slate-500">
              {t.car.seats} {car.seats} · {t.car.transmission}{" "}
              {car.transmission === "auto" ? t.car.auto : t.car.manual} · {t.car.fuel}{" "}
              {car.fuel === "diesel" ? t.car.diesel : t.car.petrol}
            </p>
          </div>
          <div className="flex flex-wrap items-baseline justify-end gap-x-3 gap-y-1 text-sm">
            <span className="flex items-baseline gap-1">
              <span className="font-medium text-slate-500">{t.car.priceDaily}</span>
              <span className="font-black text-brand-strong">{formatBaht(car.price_per_day)}</span>
            </span>
            <span className="flex items-baseline gap-1">
              <span className="font-medium text-slate-500">{t.car.priceWeekly}</span>
              <span className="font-black text-brand-strong">{formatBaht(car.price_week)}</span>
            </span>
            <span className="flex items-baseline gap-1">
              <span className="font-medium text-slate-500">{t.car.priceMonthly}</span>
              <span className="font-black text-brand-strong">{formatBaht(car.price_month)}</span>
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/booking?car=${car.id}`}
            className="flex-1 rounded-lg bg-brand px-3 py-2 text-center text-sm font-bold text-white transition hover:bg-brand-strong"
          >
            {t.car.book}
          </Link>
          <Link
            href={`/cars/${car.id}`}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand-strong"
          >
            {t.car.details}
          </Link>
        </div>
      </div>
    </article>
  );
}