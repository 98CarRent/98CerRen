import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import type { Lang } from "@/lib/lang";

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "98CarRent | รถเช่ามุกดาหาร รถเช่าขับเอง รถเช่าพร้อมคนขับ",
  description:
    "บริการรถเช่ามุกดาหาร ครบวงจร ทั้งรถเช่าขับเองและรถเช่าพร้อมคนขับ บริการตลอด 24 ชั่วโมง ติดต่อ 061-5493256, 061-5474953",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const store = await cookies();
  const lang: Lang = store.get("lang")?.value === "en" ? "en" : "th";

  return (
    <html lang={lang} data-scroll-behavior="smooth" className={sarabun.variable}>
      <body className="flex min-h-full flex-col bg-white font-sans text-slate-800 antialiased">
        <LanguageProvider initialLang={lang}>{children}</LanguageProvider>
      </body>
    </html>
  );
}