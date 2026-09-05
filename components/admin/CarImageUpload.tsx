"use client";

import { useRef, useState } from "react";
import { addCarImage } from "@/lib/actions";

export default function CarImageUpload({
  carId,
  btnLabel,
  hint,
}: {
  carId: number;
  btnLabel: string;
  hint: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const imgs = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (imgs.length === 0) return;
    setFiles((prev) => [...prev, ...imgs]);
  }

  function removeAt(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function onSubmit() {
    if (busy || files.length === 0) return;
    const fd = new FormData();
    fd.set("id", String(carId));
    files.forEach((f) => fd.append("images", f));
    setBusy(true);
    addCarImage(fd);
    setFiles([]);
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`mt-4 cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition
          ${drag ? "border-brand bg-brand-soft" : "border-slate-300 bg-slate-50 hover:border-brand hover:bg-brand-softer"}`}
      >
        <p className="text-3xl">📸</p>
        <p className="mt-1 text-sm font-bold text-brand-strong">{hint}</p>
        <p className="mt-1 text-xs text-slate-400">JPG · PNG · WebP · HEIC</p>
        <input
          ref={inputRef}
          type="file"
          name="images"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(f)}
                  alt=""
                  className="aspect-square w-full rounded-lg border border-slate-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white opacity-90 hover:bg-rose-700"
                  aria-label="remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={busy}
            className="mt-3 rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-strong disabled:opacity-50"
          >
            {busy ? "..." : `⬆ ${btnLabel} (${files.length})`}
          </button>
        </>
      )}
    </div>
  );
}