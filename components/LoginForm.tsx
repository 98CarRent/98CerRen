"use client";

import { useState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions";
import { useI18n } from "@/components/LanguageProvider";

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand-soft";

export default function LoginForm() {
  const { t } = useI18n();
  const [error, setError] = useState("");

  async function onSubmit(fd: FormData) {
    const res = await loginAction(fd);
    if (res && res.ok === false) {
      setError(t.login.error);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
        <div className="text-center">
<span className="inline-flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.svg" alt="98CarRent" className="h-16 w-16 rounded-2xl shadow-lg shadow-brand" />
        </span>
          <h1 className="mt-4 text-2xl font-black text-slate-900">{t.login.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.login.subtitle}</p>
        </div>
        <form action={onSubmit} className="mt-8 space-y-4">
          {error && (
            <p className="rounded-lg bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-600">
              ⚠️ {error}
            </p>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">
              {t.login.username}
            </label>
            <input name="username" autoComplete="username" className={inputCls} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">
              {t.login.password}
            </label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className={inputCls}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-brand px-6 py-3.5 font-bold text-white shadow-lg shadow-brand transition hover:bg-brand-strong"
          >
            {t.login.submit} →
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm font-semibold text-brand-strong hover:underline">
            ← {t.login.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}