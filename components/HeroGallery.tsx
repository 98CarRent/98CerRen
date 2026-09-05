"use client";

import { useEffect, useState } from "react";

export interface HeroSlide {
  url: string;
  name: string;
  count: number;
}

export default function HeroGallery({ slides, lang }: { slides: HeroSlide[]; lang: "th" | "en" }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setActive((p) => (p + 1) % slides.length), 4500);
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="relative h-[420px] w-full max-w-md">
        <div className="absolute inset-0 rotate-3 rounded-3xl bg-brand-strong-25" />
        <div className="absolute inset-0 -rotate-3 flex items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
          <span className="text-[11rem] leading-none drop-shadow-2xl">🚗</span>
          <span className="absolute bottom-8 right-8 rounded-xl bg-brand-15 px-4 py-2 text-sm font-bold text-brand-pale">
            Mukdahan City
          </span>
        </div>
      </div>
    );
  }

  const current = slides[active];

  return (
    <div className="relative h-[420px] w-full max-w-md">
      <div className="absolute inset-0 rotate-3 rounded-3xl bg-brand-strong-25" />
      <div className="pointer-events-none absolute -left-3 top-6 h-24 w-24 rounded-full bg-brand-20 blur-2xl" />
      <div className="pointer-events-none absolute -right-4 bottom-8 h-24 w-24 rounded-full bg-brand-strong/30 blur-2xl" />
      <div className="absolute inset-0 -rotate-3 overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
        {slides.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={s.url}
            alt={s.name}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent p-5 pt-14">
          <p className="text-xl font-black text-white">📁 {current.name}</p>
          <p className="mt-0.5 text-xs font-semibold text-white/75">
            {current.count} {lang === "en" ? "photos" : "รูป"}
          </p>
        </div>
      </div>
      <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1.5 backdrop-blur">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-5 bg-brand-pale" : "w-1.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}