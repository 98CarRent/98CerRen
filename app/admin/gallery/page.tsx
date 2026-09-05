import db from "@/lib/db";
import { getDict } from "@/lib/lang";
import { getLang } from "@/lib/lang-server";
import { addGalleryImage, deleteGalleryImage } from "@/lib/actions";
import DeleteFormButton from "@/components/admin/DeleteFormButton";
import type { GalleryItem } from "@/lib/types";

export default async function AdminGalleryPage() {
  const lang = await getLang();
  const t = getDict(lang);
  const items = db.prepare("SELECT * FROM gallery ORDER BY id DESC").all() as GalleryItem[];

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900">{t.admin.gallery}</h1>
      <p className="text-sm text-slate-500">
        {items.length} {lang === "en" ? "photos" : "รูป"}
      </p>

      <form
        action={addGalleryImage}
        className="mt-6 max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-700">{t.gallery.caption} (ไทย)</label>
          <input
            name="caption_th"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-700">Caption (English)</label>
          <input
            name="caption_en"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-700">{t.car.addPhoto} *</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            required
            className="w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white hover:file:bg-blue-700"
          />
        </div>
        <button className="rounded-xl bg-blue-600 px-8 py-3 font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700">
          {t.gallery.add} →
        </button>
      </form>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.length === 0 && (
          <p className="col-span-full py-10 text-center text-slate-400">{t.gallery.empty}</p>
        )}
        {items.map((g) => (
          <div key={g.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.url} alt="" className="aspect-square w-full object-cover" />
            <div className="space-y-2 p-3">
              <p className="line-clamp-1 text-xs font-semibold text-slate-700">
                {lang === "en" ? g.caption_en || g.caption_th : g.caption_th || g.caption_en || "—"}
              </p>
              <DeleteFormButton
                action={deleteGalleryImage}
                fields={{ id: g.id }}
                confirmText="ลบรูปนี้?"
                label={t.gallery.delete}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}