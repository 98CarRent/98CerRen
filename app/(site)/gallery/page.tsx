import fs from "fs";
import path from "path";
import Link from "next/link";
import db from "@/lib/db";
import { getDict } from "@/lib/lang";
import { getLang } from "@/lib/lang-server";
import type { GalleryFolder, GalleryItem } from "@/lib/types";

export const dynamic = "force-dynamic";

function exists(url: string) {
  return fs.existsSync(path.join(process.cwd(), "public", url));
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string; view?: string }>;
}) {
  const lang = await getLang();
  const t = getDict(lang);
  const { folder, view } = await searchParams;

  const folders = db.prepare("SELECT * FROM gallery_folders ORDER BY id").all() as GalleryFolder[];
  const galleryItems = db.prepare("SELECT * FROM gallery ORDER BY id DESC").all() as GalleryItem[];

  const captionFor = (g: GalleryItem) =>
    lang === "en" ? g.caption_en || g.caption_th : g.caption_th || g.caption_en;
  const classify = (g: GalleryItem) => ({ url: g.url, caption: captionFor(g) });

  const grouped = new Map<number | null, GalleryItem[]>();
  for (const g of galleryItems) {
    if (!exists(g.url)) continue;
    const key = g.folder_id;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(g);
  }
  const hasUnassigned = grouped.has(null) && grouped.get(null)!.length > 0;

  const carImages = db
    .prepare(
      `SELECT ci.url, c.brand, c.model FROM car_images ci
       JOIN cars c ON c.id = ci.car_id ORDER BY ci.id DESC`
    )
    .all() as { url: string; brand: string; model: string }[];
  const cars = carImages
    .filter((ci) => exists(ci.url))
    .map((ci) => ({ url: ci.url, caption: `${ci.brand} ${ci.model}` }));

  const folderId = Number(folder) || null;
  const activeFolder = folderId && folderId !== 0 ? folders.find((f) => f.id === folderId) : undefined;
  const isInside = folder !== undefined && folder !== "0" && activeFolder;
  const isCarsView = view === "cars";
  const isUnassignedView = folder === "0";

  const folderItems = isInside
    ? (grouped.get(activeFolder!.id) || []).map(classify)
    : isUnassignedView
      ? (grouped.get(null) || []).map(classify)
      : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-black text-slate-900">{t.gallery.title}</h1>
      <p className="mt-2 text-slate-500">{t.gallery.subtitle}</p>

      {isInside || isUnassignedView || isCarsView ? (
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/gallery"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-brand hover:text-brand-strong"
            >
              ← {lang === "en" ? "Back" : "ย้อนกลับ"}
            </Link>
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
              <span>{isCarsView ? "🚗" : "📁"}</span>
              {isCarsView ? (lang === "en" ? "Our Cars" : "รถของเรา") : isInside ? activeFolder!.name : t.gallery.uncategorized}
              <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-bold text-brand-strong">
                {folderItems.length}
              </span>
            </h2>
          </div>

          {folderItems.length === 0 ? (
            <p className="mt-10 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
              {t.gallery.empty}
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {folderItems.map((item, i) => (
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
      ) : (
        /* ============ Explorer: folder + cars cards ============ */
        <div className="mt-8">
          {folders.length === 0 && !hasUnassigned && cars.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
              {t.gallery.empty}
            </p>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {folders.map((f) => {
              const fItems = grouped.get(f.id) || [];
              if (fItems.length === 0) return null;
              const thumb = fItems[0].url;
              return (
                <Link
                  key={f.id}
                  href={`/gallery?folder=${f.id}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb}
                      alt={f.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <span className="absolute bottom-2 right-2 rounded-full bg-slate-900/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
                      {fItems.length} {lang === "en" ? "photos" : "รูป"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-3">
                    <p className="line-clamp-1 text-sm font-extrabold text-slate-900">{f.name}</p>
                    <span className="text-slate-400 group-hover:text-brand-strong">→</span>
                  </div>
                </Link>
              );
            })}

            {hasUnassigned && (
              <Link
                href="/gallery?folder=0"
                className="group overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white shadow-sm transition hover:shadow-lg"
              >
                <div className="relative flex aspect-square items-center justify-center bg-slate-50 text-5xl">
                  🖼️
                  <span className="absolute bottom-2 right-2 rounded-full bg-slate-900/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
                    {grouped.get(null)!.length} {lang === "en" ? "photos" : "รูป"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <p className="line-clamp-1 text-sm font-extrabold text-slate-900">
                    {t.gallery.uncategorized}
                  </p>
                  <span className="text-slate-400 group-hover:text-brand-strong">→</span>
                </div>
              </Link>
            )}

            {cars.length > 0 && (
              <Link
                href="/gallery?view=cars"
                className="group overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white shadow-sm transition hover:shadow-lg"
              >
                <div className="relative flex aspect-square items-center justify-center bg-slate-50 text-5xl">
                  🚗
                  <span className="absolute bottom-2 right-2 rounded-full bg-slate-900/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
                    {cars.length} {lang === "en" ? "photos" : "รูป"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <p className="line-clamp-1 text-sm font-extrabold text-slate-900">
                    {lang === "en" ? "Our Cars" : "รถของเรา"}
                  </p>
                  <span className="text-slate-400 group-hover:text-brand-strong">→</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}