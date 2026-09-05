import db from "@/lib/db";
import { getDict } from "@/lib/lang";
import { getLang } from "@/lib/lang-server";
import type { GalleryItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const lang = await getLang();
  const t = getDict(lang);

  const gallery = db.prepare("SELECT * FROM gallery ORDER BY id DESC").all() as GalleryItem[];

  const carImages = db
    .prepare(
      `SELECT ci.url, c.brand, c.model FROM car_images ci
       JOIN cars c ON c.id = ci.car_id ORDER BY ci.id DESC`
    )
    .all() as { url: string; brand: string; model: string }[];

  const items = [
    ...gallery.map((g) => ({
      url: g.url,
      caption: lang === "en" ? g.caption_en || g.caption_th : g.caption_th || g.caption_en,
    })),
    ...carImages.map((ci) => ({
      url: ci.url,
      caption: `${ci.brand} ${ci.model}`,
    })),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-black text-slate-900">{t.gallery.title}</h1>
      <p className="mt-2 text-slate-500">{t.gallery.subtitle}</p>

      {items.length === 0 ? (
        <p className="mt-16 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
          {t.gallery.empty}
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, i) => (
            <figure
              key={i}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="aspect-square overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.caption}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                />
              </div>
              {item.caption && (
                <figcaption className="px-3 py-2 text-xs font-semibold text-slate-600">
                  {item.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}