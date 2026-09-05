"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBooking } from "@/lib/actions";
import { calcPrice } from "@/lib/money";
import DatePicker from "./DatePicker";
import type { Dict } from "@/lib/lang";
import type { Car } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-soft";

export default function BookingForm({
  cars,
  t,
  blocked,
  lang,
}: {
  cars: Car[];
  t: Dict;
  blocked: { carId: number; start: string; end: string }[];
  lang: "th" | "en";
}) {
  const params = useSearchParams();
  const preselected = Number(params.get("car") || 0);

  const [carId, setCarId] = useState<number>(
    cars.some((c) => c.id === preselected) ? preselected : 0
  );
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [rentalType, setRentalType] = useState<"self" | "with_driver">("self");
  const [error, setError] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const car = cars.find((c) => c.id === carId);
  const blockedRanges = useMemo(
    () => blocked.filter((b) => b.carId === carId),
    [blocked, carId]
  );

  function overlapsAny(s: string, e: string): boolean {
    return blockedRanges.some((b) => s <= b.end && b.start <= e);
  }

  const startIsDisabled = (d: string) => overlapsAny(d, end || d);
  const endIsDisabled = (d: string) => overlapsAny(start || d, d);

  function pickStart(v: string) {
    setError("");
    if (overlapsAny(v, end || v)) return;
    setStart(v);
    if (end && v > end) setEnd("");
  }

  function pickEnd(v: string) {
    setError("");
    const s = start || v;
    if (overlapsAny(s, v)) return;
    setEnd(v);
  }

  const total = useMemo(
    () => (car && start && end ? calcPrice(car.price_per_day, start, end) : 0),
    [car, start, end]
  );
  const days = useMemo(() => {
    if (!start || !end) return 0;
    const s = new Date(start + "T00:00:00");
    const e = new Date(end + "T00:00:00");
    const diff = Math.round((e.getTime() - s.getTime()) / 86400000);
    return diff > 0 ? diff : 1;
  }, [start, end]);

  function onSubmit(fd: FormData) {
    const name = String(fd.get("customer_name") || "").trim();
    const phone = String(fd.get("customer_phone") || "").trim();
    if (!name || !phone || !start || !end || !carId) {
      setError(t.booking.requiredField);
      return;
    }
    if (overlapsAny(start, end)) {
      setError(t.booking.dateBusy);
      return;
    }
    fd.set("car_id", String(carId));
    fd.set("start_date", start);
    fd.set("end_date", end);
    fd.set("rental_type", rentalType);
    createBooking(fd);
  }

  return (
    <form action={onSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
          ⚠️ {error}
        </p>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-700">
          {t.booking.car} *
        </label>
        <select
          value={carId}
          onChange={(e) => {
            setCarId(Number(e.target.value));
            setStart("");
            setEnd("");
            setError("");
          }}
          className={inputCls}
        >
          <option value={0}>{t.booking.selectCar}</option>
          {cars.map((c) => (
            <option key={c.id} value={c.id}>
              {c.brand} {c.model} ·{" "}
              {c.type === "with_driver" ? t.car.with_driver : t.car.self}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-700">
            {t.booking.rentalType} *
          </label>
          <select
            value={rentalType}
            onChange={(e) => setRentalType(e.target.value as "self" | "with_driver")}
            className={inputCls}
          >
            <option value="self">{t.car.self}</option>
            <option value="with_driver">{t.car.with_driver}</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-700">
            {t.booking.line}
          </label>
          <input name="customer_line" className={inputCls} placeholder="98CarRent" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-700">
            {t.booking.startDate} *
          </label>
          <DatePicker
            value={start}
            onChange={pickStart}
            min={today}
            isDisabled={startIsDisabled}
            months={t.booking.months}
            weekdays={t.booking.weekdays}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-700">
            {t.booking.endDate} *
          </label>
          <DatePicker
            value={end}
            onChange={pickEnd}
            min={start || today}
            isDisabled={endIsDisabled}
            months={t.booking.months}
            weekdays={t.booking.weekdays}
          />
        </div>
      </div>

      <p className="rounded-lg bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-500">
        📅 {t.booking.calHint}
      </p>

      {carId && blockedRanges.length > 0 && (
        <p className="rounded-lg bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600">
          📅 {t.booking.busyDates}:{" "}
          {blockedRanges.map((b) => `${b.start} → ${b.end}`).join(", ")}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-700">
            {t.booking.name} *
          </label>
          <input name="customer_name" required className={inputCls} placeholder="สมชาย ใจดี" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-700">
            {t.booking.phone} *
          </label>
          <input
            name="customer_phone"
            required
            inputMode="tel"
            className={inputCls}
            placeholder="061-5493256"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-700">
          {t.booking.pickup} *
        </label>
        <input
          name="pickup_location"
          required
          className={inputCls}
          placeholder={t.booking.pickSchool}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-700">
          {t.booking.note}
        </label>
        <textarea
          name="note"
          rows={3}
          className={inputCls}
          placeholder="เช่น รับ-ส่งที่สนามบิน, จุดท่องเที่ยวที่ต้องการไป..."
        />
      </div>

      {rentalType === "with_driver" && (
        <p className="rounded-lg bg-brand-soft px-4 py-3 text-sm text-brand-strong">
          🧑‍✈️ {t.booking.withDriverNote}
        </p>
      )}

      {car && start && end && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-soft px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-brand-deep">{t.booking.total}</p>
            <p className="text-xs text-brand">
              {days} {t.booking.days} × {car.price_per_day.toLocaleString()} {t.common.baht}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-brand-strong">
              {total.toLocaleString()} <span className="text-sm">{t.common.baht}</span>
            </p>
            <div className="mt-1 flex flex-wrap items-baseline justify-end gap-x-3 gap-y-0.5 text-xs">
              <span className="flex items-baseline gap-1">
                <span className="font-medium text-slate-500">{t.car.priceDaily}</span>
                <span className="font-bold text-slate-700">
                  {car.price_per_day.toLocaleString()} {t.common.baht}
                </span>
              </span>
              <span className="flex items-baseline gap-1">
                <span className="font-medium text-slate-500">{t.car.priceWeekly}</span>
                <span className="font-bold text-slate-700">
                  {car.price_week.toLocaleString()} {t.common.baht}
                </span>
              </span>
              <span className="flex items-baseline gap-1">
                <span className="font-medium text-slate-500">{t.car.priceMonthly}</span>
                <span className="font-bold text-slate-700">
                  {car.price_month.toLocaleString()} {t.common.baht}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="lift w-full rounded-xl bg-brand px-6 py-4 text-lg font-bold text-white shadow-xl shadow-brand hover:bg-brand-strong"
      >
        {t.booking.submit} →
      </button>
    </form>
  );
}