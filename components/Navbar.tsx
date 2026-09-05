"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/LanguageProvider";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function Navbar() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/cars", label: t.nav.cars },
    { href: "/gallery", label: t.nav.gallery },
    { href: "/booking", label: t.nav.booking },
    { href: "/booking/track", label: t.nav.checkStatus },
    { href: "/tourism", label: t.nav.tourism },
    { href: "/reviews", label: t.nav.reviews },
    { href: "/#contact", label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.svg"
            alt="98CarRent"
            className="h-11 w-11 rounded-2xl shadow-lg shadow-brand"
          />
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight text-slate-900">
              98CarRent
            </span>
            <span className="hidden text-[11px] font-medium text-brand-strong sm:block">
              {t.siteSlogan}
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-brand-soft hover:text-brand-strong"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <ThemeSwitcher title={t.nav.theme} />
          </div>
          <button
            onClick={() => setLang(lang === "th" ? "en" : "th")}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-brand hover:text-brand-strong"
            aria-label={t.nav.language}
          >
            {t.nav.language}
          </button>
          <Link
            href="/booking"
            className="hidden rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white shadow-md shadow-brand transition hover:bg-brand-strong sm:block"
          >
            {t.nav.booking}
          </Link>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="menu"
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 lg:hidden">
          <div className="grid gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-brand-soft hover:text-brand-strong"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-2 py-3">
              <ThemeSwitcher />
            </div>
            <Link
              href="/booking"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-bold text-white"
            >
              {t.nav.booking}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}