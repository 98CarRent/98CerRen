"use client";

import { useState } from "react";

export default function DeleteFormButton({
  action,
  fields,
  confirmText,
  label,
  className,
}: {
  action: (fd: FormData) => void;
  fields: Record<string, string | number>;
  confirmText: string;
  label: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  function onConfirm(fd: FormData) {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    action(fd);
  }

  return (
    <form
      action={onConfirm}
      className={className}
      onSubmit={() => setBusy(true)}
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-100 disabled:opacity-50"
      >
        {busy ? "..." : `🗑 ${label}`}
      </button>
    </form>
  );
}