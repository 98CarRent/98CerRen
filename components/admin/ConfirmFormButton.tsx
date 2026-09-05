"use client";

import { useState } from "react";

export default function ConfirmFormButton({
  action,
  fields,
  confirmText,
  className,
  children,
}: {
  action: (fd: FormData) => void;
  fields: Record<string, string | number>;
  confirmText: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [busy, setBusy] = useState(false);

  function onSubmit(fd: FormData) {
    if (busy) return;
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    action(fd);
  }

  return (
    <form action={onSubmit} onSubmit={() => setBusy(true)}>
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button
        type="submit"
        disabled={busy}
        className={`${className || ""} disabled:opacity-50`}
      >
        {busy ? "..." : children}
      </button>
    </form>
  );
}