import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileContactBar from "@/components/MobileContactBar";
import { getDict } from "@/lib/lang";
import { getLang } from "@/lib/lang-server";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const lang = await getLang();

  return (
    <div className="flex min-h-screen flex-col pb-14 md:pb-0">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer t={getDict(lang)} lang={lang} />
      <MobileContactBar />
    </div>
  );
}