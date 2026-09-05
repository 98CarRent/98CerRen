"use client";

import { useI18n } from "@/components/LanguageProvider";

export default function MobileContactBar() {
  const { t } = useI18n();

  const phone = t.contact.phone1.replace(/[^0-9]/g, "");
  const lineId = t.contact.line1.replace("@", "");

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
      <a
        href={`tel:${phone}`}
        className="flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-emerald-600 transition active:bg-emerald-50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.2.3.1.7-.2 1l-2.3 2.2z" />
        </svg>
        {t.nav.call}
      </a>
      <a
        href={`https://line.me/ti/p/~${encodeURIComponent(lineId)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 border-l border-slate-200 py-3.5 text-sm font-bold text-green-600 transition active:bg-green-50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.5 2 2 5.9 2 10.7c0 2.8 1.5 5.3 3.9 7-.4 1.2-1.1 2.5-1.1 2.5s1.8-.2 3.2-1.1c1.2.4 2.6.6 4 .6 5.5 0 10-3.9 10-8.7S17.5 2 12 2zm-3.6 8.9H6.1c-.3 0-.5-.2-.5-.5V7.8c0-.3.2-.5.5-.5s.5.2.5.5v2.1h1.7c.3 0 .5.2.5.5s-.1.5-.4.5zm1.2-2.6c0-.3.2-.5.5-.5h1.2v.8c0 .3-.2.5-.5.5s-.5-.2-.5-.5v-.3c0 0-.4 1.4-.4 1.4-.1.2-.3.3-.5.2-.2-.1-.3-.3-.2-.5l.5-1.5-.1.4zm7.6 2.6h-1.7v2.2c0 .3-.2.5-.5.5s-.5-.2-.5-.5V7.8c0-.3.2-.5.5-.5h2.2c.3 0 .5.2.5.5s-.2.5-.5.5zm4.1-2.4c.3 0 .5.2.5.5s-.2.5-.5.5h-1.7v.7h1.7c.3 0 .5.2.5.5s-.2.5-.5.5h-1.7v.7h1.7c.3 0 .5.2.5.5s-.2.5-.5.5h-2.2c-.3 0-.5-.2-.5-.5V7.8c0-.3.2-.5.5-.5h2.2z" />
        </svg>
        LINE
      </a>
    </div>
  );
}