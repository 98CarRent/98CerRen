"use client";

import { useEffect, useState } from "react";

const BRAND = [
  { id: "blue", hex: "#2563eb", name: "น้ำเงิน" },
  { id: "emerald", hex: "#059669", name: "เขียว" },
  { id: "violet", hex: "#7c3aed", name: "ม่วง" },
  { id: "amber", hex: "#d97706", name: "ส้ม" },
  { id: "rose", hex: "#e11d48", name: "ชมพู" },
] as const;

const BGS = [
  { id: "white", hex: "#ffffff", ring: "#cbd5e1", name: "พื้นหลังขาว" },
  { id: "gray", hex: "#eef2f7", ring: "#94a3b8", name: "พื้นหลังเทาอ่อน" },
  { id: "cream", hex: "#fdf7ec", ring: "#e3c795", name: "พื้นหลังครีม" },
  { id: "mist", hex: "#eef6ff", ring: "#93c5fd", name: "พื้นหลังฟ้าอ่อน" },
  { id: "rose", hex: "#fdf2f4", ring: "#f4a9b8", name: "พื้นหลังชมพูอ่อน" },
] as const;

export default function ThemeSwitcher({ title }: { title?: string }) {
  const [theme, setTheme] = useState<string>(BRAND[0].id);
  const [bg, setBg] = useState<string>(BGS[0].id);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("98carrent-theme");
    if (savedTheme && BRAND.some((t) => t.id === savedTheme)) applyTheme(savedTheme, false);
    const savedBg = window.localStorage.getItem("98carrent-bg");
    if (savedBg && BGS.some((b) => b.id === savedBg)) applyBg(savedBg, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyTheme(id: string, save = true) {
    setTheme(id);
    document.documentElement.setAttribute("data-theme", id);
    if (save) window.localStorage.setItem("98carrent-theme", id);
  }

  function applyBg(id: string, save = true) {
    setBg(id);
    document.documentElement.setAttribute("data-bg", id);
    if (save) window.localStorage.setItem("98carrent-bg", id);
  }

  return (
    <div className="flex flex-col items-center gap-2" title={title ?? "ธีมเว็บ"}>
      <div className="flex items-center gap-1.5">
        {BRAND.map((t) => (
          <button
            key={t.id}
            aria-label={`theme ${t.name}`}
            title={t.name}
            onClick={() => applyTheme(t.id)}
            style={{ backgroundColor: t.hex }}
            className={`h-5 w-5 rounded-full ring-2 transition ${
              theme === t.id
                ? "ring-slate-900 ring-offset-2"
                : "ring-transparent hover:ring-slate-400"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        {BGS.map((b) => (
          <button
            key={b.id}
            aria-label={b.name}
            title={b.name}
            onClick={() => applyBg(b.id)}
            style={{ backgroundColor: b.hex, border: `1px solid ${b.ring}` }}
            className={`h-4 w-5 rounded-[4px] ring-2 transition ring-offset-1 ${
              bg === b.id
                ? "ring-slate-900"
                : "ring-transparent hover:ring-slate-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}