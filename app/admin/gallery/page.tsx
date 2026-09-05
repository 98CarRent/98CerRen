import db from "@/lib/db";
import { getDict } from "@/lib/lang";
import { getLang } from "@/lib/lang-server";
import {
  addGalleryImages,
  createGalleryFolder,
  deleteGalleryFolder,
  deleteGalleryImage,
} from "@/lib/actions";
import DeleteFormButton from "@/components/admin/DeleteFormButton";
import type { GalleryFolder, GalleryItem } from "@/lib/types";

export default async function AdminGalleryPage() {
  const lang = await getLang();
  const t = getDict(lang);
  const folders = db.prepare("SELECT * FROM gallery_folders ORDER BY id DESC").all() as GalleryFolder[];
  const items = db.prepare("SELECT * FROM gallery ORDER BY id DESC").all() as GalleryItem[];

  const grouped = new Map<number | null, GalleryItem[]>();
  for (const item of items) {
    const key = item.folder_id;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }

  const sortedKeys = [
    ...[...grouped.keys()].filter((k): k is number => k !== null).sort((a, b) => b - a),
    ...(grouped.has(null) ? [null as number | null] : []),
  ];

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900">{t.admin.gallery}</h1>
      <p className="text-sm text-slate-500">
        {items.length} {lang === "en" ? "photos" : "รูป"} · {folders.length}{" "}
        {lang === "en" ? "folders" : "โฟลเดอร์"}
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <form
          action={createGalleryFolder}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-base font-extrabold text-slate-900">📁 {t.gallery.createFolder}</h2>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">
              {t.gallery.folderName}
            </label>
            <input
              name="name"
              required
              placeholder={lang === "en" ? "e.g. Cars / Events / Interior" : "เช่น รถ / กิจกรรม / ภายใน"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
            />
          </div>
          <button className="rounded-xl bg-brand px-6 py-3 font-bold text-white shadow-lg shadow-brand transition hover:bg-brand-strong">
            {t.gallery.createFolder} →
          </button>
        </form>

        {folders.length > 0 && (
          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-base font-extrabold text-slate-900">📁 {t.gallery.folders}</h2>
            <div className="flex flex-wrap gap-2">
              {folders.map((f) => (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-soft bg-brand-soft px-3 py-1 text-xs font-bold text-brand-strong"
                >
                  {f.name}
                  <span className="rounded-full bg-white px-1.5 text-[10px]">
                    {grouped.get(f.id)?.length || 0}
                  </span>
                  <DeleteFormButton
                    action={deleteGalleryFolder}
                    fields={{ id: f.id }}
                    confirmText={`ลบโฟลเดอร์ "${f.name}" พร้อมรูปทั้งหมด?`}
                    label="✕"
                  />
                </span>
              ))}
            </div>
          </div>
        )}
        {folders.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400">
            {t.gallery.noFolders}
          </p>
        )}

        <form
          action={addGalleryImages}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-base font-extrabold text-slate-900">⬆️ {t.gallery.add}</h2>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">
              {t.gallery.selectFolder}
            </label>
            <select
              name="folder_id"
              defaultValue=""
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand"
            >
              <option value="">—</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">
                {t.gallery.caption} (ไทย)
              </label>
              <input
                name="caption_th"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">
                Caption (English)
              </label>
              <input
                name="caption_en"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">
              {t.gallery.multiplePhotos} *
            </label>
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              required
              className="w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white hover:file:bg-brand-strong"
            />
          </div>
          <button className="rounded-xl bg-brand px-8 py-3 font-bold text-white shadow-lg shadow-brand transition hover:bg-brand-strong">
            {t.gallery.add} ({lang === "en" ? "bulk" : "หลายรูป"}) →
          </button>
        </form>
      </div>

      <div className="mt-10 space-y-10">
        {items.length === 0 && (
          <p className="py-10 text-center text-slate-400">{t.gallery.empty}</p>
        )}
        {sortedKeys.map((key) => {
          const folderName =
            key === null && grouped.get(key)!.length > 0
              ? t.gallery.uncategorized
              : folders.find((f) => f.id === key)?.name || t.gallery.uncategorized;
          return (
            <div key={key === null ? "unassigned" : key}>
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                <span>📁</span>
                {folderName}
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand-strong">
                  {grouped.get(key)!.length}
                </span>
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {grouped.get(key)!.map((g) => (
                  <div
                    key={g.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.url} alt="" className="aspect-square w-full object-cover" />
                    <div className="space-y-2 p-3">
                      <p className="line-clamp-1 text-xs font-semibold text-slate-700">
                        {lang === "en"
                          ? g.caption_en || g.caption_th
                          : g.caption_th || g.caption_en || "—"}
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
        })}
      </div>
    </div>
  );
}