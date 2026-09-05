"use client";

import { createCar, updateCar } from "@/lib/actions";
import type { Dict } from "@/lib/lang";
import type { Car } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-soft";
const labelCls = "mb-1.5 block text-sm font-bold text-slate-700";

export default function CarForm({ car, t }: { car?: Car; t: Dict }) {
  return (
    <form
      action={car ? updateCar : createCar}
      className="max-w-3xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {car && <input type="hidden" name="id" value={car.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{t.admin.carType}</label>
          <select name="type" className={inputCls} defaultValue={car?.type || "self"}>
            <option value="self">{t.car.self}</option>
            <option value="with_driver">{t.car.with_driver}</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>{t.admin.status}</label>
          <select name="status" className={inputCls} defaultValue={car?.status || "available"}>
            <option value="available">{t.car.available}</option>
            <option value="rented">{t.car.rented}</option>
            <option value="maintenance">{t.car.maintenance}</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Brand *</label>
          <input name="brand" required defaultValue={car?.brand || ""} className={inputCls} placeholder="Toyota" />
        </div>
        <div>
          <label className={labelCls}>Model *</label>
          <input name="model" required defaultValue={car?.model || ""} className={inputCls} placeholder="Hilux Revo" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className={labelCls}>{t.car.year}</label>
          <input name="year" defaultValue={car?.year || ""} className={inputCls} inputMode="numeric" />
        </div>
        <div>
          <label className={labelCls}>{t.car.plate}</label>
          <input name="plate" defaultValue={car?.plate || ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{t.car.seats}</label>
          <input name="seats" defaultValue={car?.seats || 5} className={inputCls} inputMode="numeric" />
        </div>
        <div>
          <label className={labelCls}>{t.car.transmission}</label>
          <select name="transmission" className={inputCls} defaultValue={car?.transmission || "auto"}>
            <option value="auto">{t.car.auto}</option>
            <option value="manual">{t.car.manual}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelCls}>{t.car.fuel}</label>
          <select name="fuel" className={inputCls} defaultValue={car?.fuel || "diesel"}>
            <option value="diesel">{t.car.diesel}</option>
            <option value="petrol">{t.car.petrol}</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>{t.car.priceDaily} *</label>
          <input name="price_per_day" required defaultValue={car?.price_per_day || ""} className={inputCls} inputMode="numeric" placeholder="1200" />
        </div>
        <div>
          <label className={labelCls}>{t.car.priceWeekly}</label>
          <input name="price_week" defaultValue={car?.price_week || ""} className={inputCls} inputMode="numeric" placeholder="7560" />
        </div>
        <div>
          <label className={labelCls}>{t.car.priceMonthly}</label>
          <input name="price_month" defaultValue={car?.price_month || ""} className={inputCls} inputMode="numeric" placeholder="28800" />
        </div>
        <div>
          <label className={labelCls}>{t.car.deposit}</label>
          <input name="deposit" defaultValue={car?.deposit || ""} className={inputCls} inputMode="numeric" placeholder="5000" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>คำอธิบาย (ไทย)</label>
          <textarea name="description_th" rows={4} defaultValue={car?.description_th || ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Description (English)</label>
          <textarea name="description_en" rows={4} defaultValue={car?.description_en || ""} className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>{t.car.addPhoto}</label>
        {car?.image && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-slate-200 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={car.image} alt="" className="h-16 w-24 rounded-lg object-cover" />
            <span className="text-xs text-slate-500">{car.image}</span>
          </div>
        )}
        <input
          type="file"
          name="image"
          accept="image/*"
          className="w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white hover:file:bg-brand-strong"
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          className="rounded-xl bg-brand px-8 py-3 font-bold text-white shadow-lg shadow-brand transition hover:bg-brand-strong"
        >
          {t.admin.save} →
        </button>
        <button
          type="reset"
          className="rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-700 transition hover:border-brand"
        >
          {t.admin.cancel}
        </button>
      </div>
    </form>
  );
}