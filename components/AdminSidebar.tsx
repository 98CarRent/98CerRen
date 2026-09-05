"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/components/LanguageProvider";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { logoutAction } from "@/lib/actions";

export default function AdminSidebar() {
  const { t, setLang, lang } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/admin", label: t.admin.dashboard, icon: "📊" },
    { href: "/admin/cars", label: t.admin.cars, icon: "🚗" },
    { href: "/admin/bookings", label: t.admin.bookings, icon: "📅" },
    { href: "/admin/gallery", label: t.admin.gallery, icon: "🖼️" },
    { href: "/admin/reviews", label: t.admin.reviews, icon: "⭐" },
  ];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-slate-300 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.jpg" alt="98CarRent" className="h-10 w-10 rounded-lg object-cover" />
          <div>
            <p className="font-extrabold text-white">98CarRent</p>
            <p className="text-[11px] text-slate-400">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                isActive(l.href)
                  ? "bg-brand text-white shadow-lg shadow-brand"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-3 border-t border-slate-800 px-3 py-4">
          <div className="flex items-center justify-center rounded-xl bg-slate-800/60 py-3">
            <ThemeSwitcher title="เปลี่ยนโทนสีเว็บ" />
          </div>
          <button
            onClick={() => setLang(lang === "th" ? "en" : "th")}
            className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-bold text-slate-300 hover:bg-slate-800"
          >
            🌐 {lang === "th" ? "English" : "ไทย"}
          </button>
          <Link
            href="/"
            className="block rounded-xl px-4 py-2.5 text-sm font-bold text-slate-300 hover:bg-slate-800"
          >
            🏠 {t.nav.home}
          </Link>
          <form action={logoutAction}>
            <button className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-bold text-rose-300 hover:bg-slate-800">
              🚪 {t.admin.logout}
            </button>
          </form>
        </div>
      </aside>

      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg lg:hidden"
        aria-label="menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>
    </>
  );
}