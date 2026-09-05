import db from "@/lib/db";
import { getDict } from "@/lib/lang";
import { getLang } from "@/lib/lang-server";
import TourismTabs from "@/components/TourismTabs";
import type { TourismPlace } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TourismPage() {
  const lang = await getLang();
  const t = getDict(lang);
  const places = db
    .prepare("SELECT * FROM tourism_places ORDER BY id")
    .all() as TourismPlace[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600">
          {t.tourism.khor}
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
          {t.tourism.title}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-500">{t.tourism.subtitle}</p>
      </div>

      {places.length > 0 ? (
        <TourismTabs places={places} t={t} lang={lang} />
      ) : (
        <p className="mt-16 text-center text-slate-400">
          {t.admin.noData}
        </p>
      )}
    </div>
  );
}