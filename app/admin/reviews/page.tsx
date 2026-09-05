import db from "@/lib/db";
import { getDict } from "@/lib/lang";
import { getLang } from "@/lib/lang-server";
import { deleteReview } from "@/lib/actions";
import DeleteFormButton from "@/components/admin/DeleteFormButton";
import type { Review } from "@/lib/types";

export default async function AdminReviewsPage() {
  const lang = await getLang();
  const t = getDict(lang);
  const reviews = db.prepare("SELECT * FROM reviews ORDER BY id DESC").all() as Review[];

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900">{t.admin.reviews}</h1>
      <p className="text-sm text-slate-500">
        {reviews.length} {lang === "en" ? "reviews" : "รายการ"}
      </p>

      <div className="mt-6 space-y-4">
        {reviews.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
            {t.review.noReview}
          </p>
        )}
        {reviews.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-4">
              {r.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.image} alt="" className="h-20 w-28 rounded-xl object-cover" />
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-extrabold text-slate-900">{r.customer_name}</p>
                  <span className="text-sm text-amber-400">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </span>
                </div>
                <p className="mt-1 max-w-2xl text-sm text-slate-600">{r.comment || "—"}</p>
              </div>
            </div>
            <DeleteFormButton
              action={deleteReview}
              fields={{ id: r.id }}
              confirmText="ลบรีวิวนี้?"
              label={t.review.delete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}