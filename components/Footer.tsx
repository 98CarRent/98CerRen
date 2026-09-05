import Link from "next/link";
import type { Dict } from "@/lib/lang";

export default function Footer({ t, lang }: { t: Dict; lang: string }) {
  const contact = t.contact;
  return (
    <footer id="contact" className="bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-white.svg"
              alt="98CarRent"
              className="h-10 w-10"
            />
            <div>
              <p className="font-extrabold text-white">98CarRent</p>
              <p className="text-[11px] text-brand-pale">{t.siteSlogan}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">{t.footer.about}</p>
          <p className="mt-4 text-xs font-semibold text-amber-400">{t.contact.hours}</p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
            {t.footer.quickLinks}
          </h3>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {[
              { href: "/cars", label: t.nav.cars },
              { href: "/booking", label: t.nav.booking },
              { href: "/gallery", label: t.nav.gallery },
              { href: "/tourism", label: t.nav.tourism },
              { href: "/reviews", label: t.nav.reviews },
              { href: "/admin", label: t.nav.admin },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition hover:text-brand-pale">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
            {t.footer.contact}
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">📞</span>
              <span>
                {contact.phone1}
                <br />
                {contact.phone2}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/15 text-green-400">💬</span>
              <span>
                {contact.line1}
                <br />
                {contact.line2}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-15 text-brand-pale">📘</span>
              <a
                href="https://www.facebook.com/profile.php?id=100066806268712"
                target="_blank"
                rel="noopener noreferrer"
                className="break-all transition hover:text-brand-pale"
              >
                {contact.facebookTitle}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">📍</span>
              <span>{contact.address}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} 98CarRent · {lang === "en" ? "Mukdahan Car Rental" : "รถเช่ามุกดาหาร"}{" "}
        · {t.footer.rights}
      </div>
    </footer>
  );
}