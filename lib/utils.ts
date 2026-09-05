import fs from "fs";
import path from "path";
import { put, del } from "@vercel/blob";

export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso.slice(0, 10) + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isBlobAvailable(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function saveUpload(file: File | null, folder = "uploads"): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif", "svg", "heic"].includes(ext)
    ? ext
    : "jpg";
  const name = `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (isBlobAvailable()) {
    const res = await put(`${folder}/${name}`, bytes, {
      access: "public",
      contentType: file.type || `image/${safeExt}`,
      addRandomSuffix: false,
    });
    return res.url;
  }

  const dir = path.join(process.cwd(), "public", folder);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), bytes);
  return `/${folder}/${name}`;
}

export function deleteUploaded(url: string | null | undefined) {
  if (!url) return;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (isBlobAvailable()) {
      void del(url).catch(() => {});
    }
    return;
  }
  const filePath = path.join(process.cwd(), "public", url);
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // ignore
  }
}

export function imageExists(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.startsWith("http://") || url.startsWith("https://")) return true;
  return fs.existsSync(path.join(process.cwd(), "public", url));
}