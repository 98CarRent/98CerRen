"use client";

import { useState } from "react";

export default function CarPhotoGallery({
  urls,
  name,
}: {
  urls: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const imgs = urls.filter(Boolean);
  const current = imgs[Math.min(active, imgs.length - 1)];

  if (imgs.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-7xl">
        🚗
      </div>
    );
  }

  return (
    <div>
      <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current}
          src={current}
          alt={name}
          className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      {imgs.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {imgs.map((u, i) => (
            <button
              key={u + i}
              type="button"
              onClick={() => setActive(i)}
              className={`overflow-hidden rounded-xl border-2 transition ${
                i === active
                  ? "border-brand ring-2 ring-brand-soft"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}