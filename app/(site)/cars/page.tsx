import db from "@/lib/db";
import { getDict } from "@/lib/lang";
import { getLang } from "@/lib/lang-server";
import CarsViewer from "@/components/CarsViewer";
import type { Car } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CarsPage() {
  const lang = await getLang();
  const t = getDict(lang);
  const cars = await db.prepare("SELECT * FROM cars ORDER BY id DESC").all() as Car[];

  return <CarsViewer cars={cars} t={t} />;
}