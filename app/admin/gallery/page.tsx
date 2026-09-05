import Link from "next/link";
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

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  const lang = await getLang();
  const t = getDict(lang);
  const { folder } = await searchParams;
  const folders = db.prepare("SELECT * FROM gallery_folders ORDER BY id DESC").all() as GalleryFolder[];
  const items = db.prepare("SELECT * FROM gallery ORDER BY id DESC").all() as GalleryItem[];

  const grouped = new Map<number | null, GalleryItem[]>();
  for (const item of items) {
    const key = item.folder_id;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }

  const hasUnassigned = grouped.has(null) && grouped.get(null)!.length > 0;
  const folderId = folder === undefined ? undefined : Number(folder) || null;
  const activeFolder = folderId && folderId !== 0 ? folders.find((f) => f.id === folderId) : undefined;
  const isInside = !(folder === undefined);
  const isUnassignedView = folder === "0";

  const folderItems = activeFolder
    ? grouped.get(activeFolder.id) || []
    : isUnassignedView
      ? grouped.get(null) || []
      : [];

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900">{t.admin.gallery}</h1>
      <p className="text-sm text-slate-500">
        {items.length} {lang === "en" ? "photos" : "รูป"} · {folders.length}{" "}
        {lang === "en" ? "folders" : "โฟลเดอร์"}
      </p>

      {/* Upload / create toolbar */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <form
          action={createGalleryFolder}
          className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-bold text-slate-700">
              📁 {t.gallery.folderName}
            </label>
            <input
              name="name"
              required
              placeholder={lang === "en" ? "e.g. Cars / Events" : "เช่น รถ / กิจกรรม"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
            />
          </div>
          <button className="shrink-0 rounded-xl bg-brand px-5 py-2.5 font-bold text-white shadow-lg shadow-brand transition hover:bg-brand-strong">
            {t.gallery.createFolder}
          </button>
        </form>

        <form
          action={addGalleryImages}
          className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          {activeFolder ? (
            <input type="hidden" name="folder_id" value={activeFolder.id} />
          ) : (
            <div className="min-w-[160px] flex-1">
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
          )}
          <div className="flex-1">
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
          <button className="shrink-0 rounded-xl bg-brand px-6 py-2.5 font-bold text-white shadow-lg shadow-brand transition hover:bg-brand-strong">
            ↑ {t.gallery.add}
          </button>
        </form>
      </div>

      {isInside ? (
        /* ================= Inside a folder ================= */
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/gallery"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-brand hover:text-brand-strong"
            >
              ← {lang === "en" ? "Back" : "ย้อนกลับ"}
            </Link>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
              <span>📁</span>
              {activeFolder ? activeFolder.name : t.gallery.uncategorized}
              <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-bold text-brand-strong">
                {folderItems.length}
              </span>
            </h2>
            {activeFolder && (
              <DeleteFormButton
                action={deleteGalleryFolder}
                fields={{ id: activeFolder.id }}
                confirmText={`ลบโฟลเดอร์ "${activeFolder.name}" พร้อมรูปทั้งหมด?`}
                label={t.gallery.delete}
              />
            )}
          </div>

          {folderItems.length === 0 ? (
            <p className="mt-10 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
              {t.gallery.empty}
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {folderItems.map((g) => (
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
          )}
        </div>
      ) : (
        /* ================= Folder explorer ================= */
        <div className="mt-8">
          {folders.length === 0 && !hasUnassigned && (
            <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-400">
              {t.gallery.empty}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {folders.map((f) => {
              const fItems = grouped.get(f.id) || [];
              const thumb = fItems[0]?.url;
              return (
                <div
                  key={f.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
                >
                  <Link href={`/admin/gallery?folder=${f.id}`} className="block">
                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt={f.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-5xl">📁</div>
                      )}
                      <span className="absolute bottom-2 right-2 rounded-full bg-slate-900/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
                        {fItems.length} {lang === "en" ? "photos" : "รูป"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-3">
                      <p className="line-clamp-1 text-sm font-extrabold text-slate-900">{f.name}</p>
                      <span className="text-slate-400 group-hover:text-brand-strong">→</span>
                    </div>
                  </Link>
                  <div className="border-t border-slate-100 px-3 py-2">
                    <DeleteFormButton
                      action={deleteGalleryFolder}
                      fields={{ id: f.id }}
                      confirmText={`ลบโฟลเดอร์ "${f.name}" พร้อมรูปทั้งหมด?`}
                      label={t.gallery.delete}
                    />
                  </div>
                </div>
              );
            })}

            {hasUnassigned && (
              <Link
                href="/admin/gallery?folder=0"
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
          </div>
        </div>
      )}
    </div>
  );
}