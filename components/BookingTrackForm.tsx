"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Dict } from "@/lib/lang";

export default function BookingTrackForm({ t }: { t: Dict }) {
  const router = useRouter();
  const [ref, setRef] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = ref.trim().toUpperCase();
    if (!code) return;
    router.push(`/booking/track?ref=${encodeURIComponent(code)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 sm:flex-row"
      role="search"
      aria-label={t.booking.trackTitle}
    >
      <input
        value={ref}
        onChange={(e) => setRef(e.target.value)}
        placeholder={t.booking.trackPlaceholder}
        className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-wider outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
      <button
        type="submit"
        className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
      >
        {t.booking.trackButton} →
      </button>
    </form>
  );
}