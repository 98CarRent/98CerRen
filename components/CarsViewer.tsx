"use client";

import { useMemo, useState } from "react";
import CarCard from "@/components/CarCard";
import type { Car } from "@/lib/types";
import type { Dict } from "@/lib/lang";

export default function CarsViewer({
  cars,
  t,
}: {
  cars: Car[];
  t: Dict;
}) {
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return cars.filter((c) => {
      if (type !== "all" && c.type !== type) return false;
      if (status !== "all" && c.status !== status) return false;
      if (q) {
        const name = `${c.brand} ${c.model}`.toLowerCase();
        if (!name.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [cars, type, status, q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-black text-slate-900">{t.nav.cars}</h1>
      <p className="mt-1 text-slate-500">{t.siteSlogan}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.car.search}
          className="min-w-[180px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">{t.car.allTypes}</option>
          <option value="self">{t.car.self}</option>
          <option value="with_driver">{t.car.with_driver}</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">{t.car.allStatuses}</option>
          <option value="available">{t.car.available}</option>
          <option value="rented">{t.car.rented}</option>
          <option value="maintenance">{t.car.maintenance}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-slate-400">{t.car.noCars}</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((c) => (
            <CarCard key={c.id} car={c} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}