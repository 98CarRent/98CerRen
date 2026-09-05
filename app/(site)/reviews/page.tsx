import db from "@/lib/db";
import { getDict } from "@/lib/lang";
import { getLang } from "@/lib/lang-server";
import ReviewForm from "@/components/ReviewForm";
import type { Review } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ thanks?: string }>;
}) {
  const [{ thanks }, lang] = await Promise.all([searchParams, getLang()]);
  const t = getDict(lang);
  const reviews = await db.prepare("SELECT * FROM reviews ORDER BY id DESC").all() as Review[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{t.review.title}</h1>
          <p className="mt-2 text-slate-500">{t.review.subtitle}</p>

          {thanks && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 font-bold text-emerald-700">
              ✅ {t.review.success}
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="mt-12 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
              {t.review.noReview}
            </p>
          ) : (
            <div className="mt-8 space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-extrabold text-slate-900">{r.customer_name}</p>
                    <span className="text-amber-400">
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </span>
                  </div>
                  {r.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.image}
                      alt={r.customer_name}
                      className="mt-3 h-40 w-full rounded-xl object-cover"
                    />
                  )}
                  <p className="mt-3 leading-relaxed text-slate-600">
                    {r.comment || "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside>
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-900">{t.review.write}</h2>
            <div className="mt-5">
              <ReviewForm t={t} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}