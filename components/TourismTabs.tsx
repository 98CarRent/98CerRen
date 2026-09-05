"use client";

import { useState } from "react";
import type { Dict } from "@/lib/lang";
import type { TourismPlace } from "@/lib/types";

export default function TourismTabs({
  places,
  t,
  lang,
}: {
  places: TourismPlace[];
  t: Dict;
  lang: string;
}) {
  const [city, setCity] = useState<"mukdahan" | "nakhonphanom">("mukdahan");
  const filtered = places.filter((p) => p.city === city);

  const fallback = "/images/placeholder.svg";

  return (
    <div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => setCity("mukdahan")}
          className={`rounded-xl px-6 py-3 font-bold transition ${
            city === "mukdahan"
              ? "bg-brand text-white shadow-lg shadow-brand"
              : "border border-slate-300 bg-white text-slate-700 hover:border-brand"
          }`}
        >
          🏙️ {t.tourism.mukdahan}
        </button>
        <button
          onClick={() => setCity("nakhonphanom")}
          className={`rounded-xl px-6 py-3 font-bold transition ${
            city === "nakhonphanom"
              ? "bg-brand text-white shadow-lg shadow-brand"
              : "border border-slate-300 bg-white text-slate-700 hover:border-brand"
          }`}
        >
          🛕 {t.tourism.nakhonphanom}
        </button>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const name = lang === "en" ? p.name_en : p.name_th;
          const desc = lang === "en" ? p.description_en : p.description_th;
          return (
            <article
              key={p.id}
              className="group lift overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image || fallback}
                  alt={name}
                  loading="lazy"
                  onError={(e) => {
                    if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                  }}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-extrabold text-slate-900">{name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-12 rounded-2xl border border-brand-soft bg-brand-soft p-6">
        <h3 className="font-black text-brand-deep">🗺️ {t.tourism.explore}</h3>
        <div className="mt-3 space-y-2 text-sm text-brand-deep">
          <p>
            <span className="font-bold">🏙️ {t.tourism.mukdahan}:</span> {t.tourism.routeMk}
          </p>
          <p>
            <span className="font-bold">🛕 {t.tourism.nakhonphanom}:</span> {t.tourism.routeNp}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-200">
        <h3 className="font-black text-amber-900">💡 {t.tourism.tip}</h3>
        <p className="mt-2 text-sm text-amber-800">{t.tourism.tipText}</p>
        <a
          href="/booking"
          className="mt-4 inline-block rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-amber-600"
        >
          🚗 {t.tourism.viaCar}
        </a>
      </div>
    </div>
  );
}