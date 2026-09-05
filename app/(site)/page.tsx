import Link from "next/link";
import fs from "fs";
import path from "path";
import db from "@/lib/db";
import { getDict } from "@/lib/lang";
import { getLang } from "@/lib/lang-server";
import CarCard from "@/components/CarCard";
import HeroGallery from "@/components/HeroGallery";
import type { Car, Review } from "@/lib/types";

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i}>★</span>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const lang = await getLang();
  const t = getDict(lang);
  const isEn = lang === "en";

  const cars = await db
    .prepare(
      "SELECT * FROM cars WHERE status = 'available' ORDER BY id ASC LIMIT 3"
    )
    .all() as Car[];

  const reviews = await db
    .prepare("SELECT * FROM reviews ORDER BY id DESC LIMIT 3")
    .all() as Review[];

  const exists = (url: string) => fs.existsSync(path.join(process.cwd(), "public", url));
  const folderRows = await db.prepare("SELECT * FROM gallery_folders ORDER BY id").all() as {
    id: number;
    name: string;
  }[];
  const galleryRows = await db
    .prepare("SELECT folder_id, url FROM gallery ORDER BY id")
    .all() as { folder_id: number | null; url: string }[];
  const firstByFolder = new Map<number | null, string>();
  const countByFolder = new Map<number | null, number>();
  for (const g of galleryRows) {
    if (!exists(g.url)) continue;
    if (!firstByFolder.has(g.folder_id)) firstByFolder.set(g.folder_id, g.url);
    countByFolder.set(g.folder_id, (countByFolder.get(g.folder_id) || 0) + 1);
  }
  const slides = [
    ...folderRows
      .filter((f) => firstByFolder.has(f.id))
      .map((f) => ({
        url: firstByFolder.get(f.id)!,
        name: f.name,
        count: countByFolder.get(f.id)!,
      })),
    ...(firstByFolder.has(null)
      ? [
          {
            url: firstByFolder.get(null)!,
            name: isEn ? "General" : t.gallery.uncategorized,
            count: countByFolder.get(null)!,
          },
        ]
      : []),
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.25),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(37,99,235,0.35),transparent_60%),radial-gradient(ellipse_at_center,rgba(139,92,246,0.12),transparent_65%)]" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-brand-strong/25 blur-3xl" />
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full text-white/10"
          aria-hidden="true"
        >
          <defs>
            <pattern id="heroDots" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroDots)" opacity="0.35" />
          <g fill="none" stroke="currentColor">
            <path d="M -60 260 L 230 60 L 540 210 Z" strokeWidth="2" opacity="0.5" />
            <circle cx="78%" cy="28%" r="170" strokeWidth="1.5" opacity="0.45" />
            <circle cx="78%" cy="28%" r="130" strokeWidth="1" opacity="0.3" />
            <circle cx="6%" cy="74%" r="95" strokeWidth="1.5" opacity="0.5" />
            <path d="M 210 90 h 130 v 170 h -130 z" strokeWidth="1.5" opacity="0.35" />
            <path d="M 720 620 l 130 -170" strokeWidth="2" opacity="0.4" />
            <path d="M 40 140 l -28 48" strokeWidth="2" opacity="0.4" />
          </g>
        </svg>
        <div className="pointer-events-none absolute left-[14%] top-[16%] hidden h-44 w-44 rotate-45 rounded-[2rem] border border-white/10 lg:block" />
        <div className="pointer-events-none absolute bottom-[14%] right-[36%] hidden h-24 w-24 rounded-full border border-dashed border-white/15 lg:block" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-40 bg-brand-10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-pale">
              🚙 {t.siteSlogan}
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              {t.hero.title}
              <span className="mt-3 block bg-brand-text-grad">
                98CarRent
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              {t.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/booking"
                className="lift rounded-xl bg-brand-grad px-7 py-3.5 font-bold text-white shadow-xl shadow-brand hover:brightness-110"
              >
                {t.hero.ctaBook} →
              </Link>
              <Link
                href="/cars"
                className="lift rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 font-bold text-white backdrop-blur hover:bg-white/10"
              >
                {t.hero.ctaCars}
              </Link>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {[
                { n: "24", l: isEn ? "Hours" : "ชม." },
                { n: String(cars.length), l: isEn ? "Ready cars" : "คันพร้อม" },
                { n: "100%", l: isEn ? "Service" : "บริการ" },
              ].map((s) => (
                <div key={s.n} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur">
                  <p className="text-2xl font-black text-brand-pale">{s.n}</p>
                  <p className="text-xs text-slate-400">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden items-center justify-center lg:flex">
            <HeroGallery slides={slides} lang={lang} />
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-3xl font-black text-slate-900">{t.home.whyTitle}</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: "✅", title: t.home.why1, desc: t.home.why1d },
            { icon: "💰", title: t.home.why2, desc: t.home.why2d },
            { icon: "⚡", title: t.home.why3, desc: t.home.why3d },
            { icon: "🧑‍✈️", title: t.home.why4, desc: t.home.why4d },
          ].map((w) => (
            <div
              key={w.title}
              className="lift rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <span className="text-3xl">{w.icon}</span>
              <h3 className="mt-3 font-extrabold text-slate-900">{w.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured cars */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900">{t.home.featured}</h2>
              <p className="mt-1 text-slate-500">{t.home.featuredSub}</p>
            </div>
            <Link
              href="/cars"
              className="font-bold text-brand-strong underline-offset-4 hover:underline"
            >
              {t.home.viewAll} →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* Reviews preview */}
      {reviews.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900">{t.review.title}</h2>
            </div>
            <Link href="/reviews" className="font-bold text-brand-strong underline-offset-4 hover:underline">
              {t.nav.reviews} →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {reviews.map((r) => (
              <div key={r.id} className="lift rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <Stars n={r.rating} />
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  “{r.comment || "—"}”
                </p>
                <p className="mt-4 font-bold text-slate-900">— {r.customer_name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className="bg-brand-grad py-16 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-3xl font-black sm:text-4xl">{t.home.contactCta}</h2>
          <p className="mt-3 text-brand-pale">{t.home.contactCtaSub}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="tel:0615493256" className="lift rounded-xl bg-white px-6 py-3.5 font-bold text-brand-strong shadow-xl hover:bg-brand-soft">
              📞 {t.home.callNow} · 061-5493256
            </a>
            <a
              href="https://line.me/ti/p/~98CarRent"
              target="_blank"
              rel="noopener noreferrer"
              className="lift rounded-xl bg-emerald-500 px-6 py-3.5 font-bold text-white shadow-xl hover:bg-emerald-600"
            >
              💬 {t.home.lineNow} · 98CarRent
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=100066806268712"
              target="_blank"
              rel="noopener noreferrer"
              className="lift rounded-xl bg-white/10 px-6 py-3.5 font-bold text-white ring-1 ring-white/30 hover:bg-white/20"
            >
              📘 {t.home.fbNow}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}