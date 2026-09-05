"use client";

import { useEffect, useState } from "react";

const THEMES = [
  { id: "blue", hex: "#2563eb", name: "น้ำเงิน" },
  { id: "emerald", hex: "#059669", name: "เขียว" },
  { id: "violet", hex: "#7c3aed", name: "ม่วง" },
  { id: "amber", hex: "#d97706", name: "ส้ม" },
  { id: "rose", hex: "#e11d48", name: "ชมพู" },
] as const;

export default function ThemeSwitcher({ title }: { title?: string }) {
  const [theme, setTheme] = useState<string>("blue");

  useEffect(() => {
    const saved = window.localStorage.getItem("98carrent-theme");
    if (saved && THEMES.some((t) => t.id === saved)) apply(saved, false);
  }, []);

  function apply(id: string, save = true) {
    setTheme(id);
    document.documentElement.setAttribute("data-theme", id);
    if (save) window.localStorage.setItem("98carrent-theme", id);
  }

  return (
    <div className="flex items-center gap-1.5" title={title ?? "เปลี่ยนโทนสี"}>
      {THEMES.map((t) => (
        <button
          key={t.id}
          aria-label={`theme ${t.name}`}
          title={t.name}
          onClick={() => apply(t.id)}
          style={{ backgroundColor: t.hex }}
          className={`h-6 w-6 rounded-full ring-2 transition ${
            theme === t.id
              ? "ring-slate-900 ring-offset-2"
              : "ring-transparent hover:ring-slate-400"
          }`}
        />
      ))}
    </div>
  );
}