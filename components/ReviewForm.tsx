"use client";

import { useState } from "react";
import { createReview } from "@/lib/actions";
import type { Dict } from "@/lib/lang";

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-soft";

export default function ReviewForm({ t }: { t: Dict }) {
  const [error, setError] = useState("");

  function onSubmit(fd: FormData) {
    const name = String(fd.get("customer_name") || "").trim();
    if (!name) {
      setError(t.booking.requiredField);
      return;
    }
    createReview(fd);
  }

  return (
    <form action={onSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
          ⚠️ {error}
        </p>
      )}
      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-700">
          {t.review.name} *
        </label>
        <input name="customer_name" className={inputCls} placeholder="คุณลูกค้า" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-700">
          {t.review.rating} *
        </label>
        <select name="rating" className={inputCls} defaultValue={5}>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {"★".repeat(r)}
              {"☆".repeat(5 - r)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-700">
          {t.review.comment}
        </label>
        <textarea
          name="comment"
          rows={4}
          className={inputCls}
          placeholder={t.review.ratePlaceholder}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-700">
          {t.review.imageLabel}
        </label>
        <input
          type="file"
          name="image"
          accept="image/*"
          className="w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white hover:file:bg-brand-strong"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-xl bg-brand px-6 py-3.5 font-bold text-white shadow-lg shadow-brand transition hover:bg-brand-strong"
      >
        {t.review.submit} →
      </button>
    </form>
  );
}