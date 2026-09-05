import Link from "next/link";
import { getDict } from "@/lib/lang";
import { getLang } from "@/lib/lang-server";
import CarForm from "@/components/admin/CarForm";

export default async function NewCarPage() {
  const lang = await getLang();
  const t = getDict(lang);

  return (
    <div>
      <Link href="/admin/cars" className="text-sm font-bold text-brand-strong hover:underline">
        ← {t.admin.backToList}
      </Link>
      <h1 className="mt-2 text-2xl font-black text-slate-900">{t.admin.addCar}</h1>
      <div className="mt-6">
        <CarForm t={t} />
      </div>
    </div>
  );
}