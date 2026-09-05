import Link from "next/link";
import { notFound } from "next/navigation";
import db from "@/lib/db";
import { getDict } from "@/lib/lang";
import { getLang } from "@/lib/lang-server";
import { addCarImage, removeCarImage } from "@/lib/actions";
import CarForm from "@/components/admin/CarForm";
import DeleteFormButton from "@/components/admin/DeleteFormButton";
import type { Car } from "@/lib/types";

export default async function EditCarPage(props: PageProps<"/admin/cars/[id]/edit">) {
  const { id } = await props.params;
  const lang = await getLang();
  const t = getDict(lang);

  const car = await db.prepare("SELECT * FROM cars WHERE id = ?").get(Number(id)) as
    | Car
    | undefined;
  if (!car) notFound();

  const images = await db
    .prepare("SELECT id, url FROM car_images WHERE car_id = ? ORDER BY id")
    .all(car.id) as { id: number; url: string }[];

  return (
    <div>
      <Link href="/admin/cars" className="text-sm font-bold text-brand-strong hover:underline">
        ← {t.admin.backToList}
      </Link>
      <h1 className="mt-2 text-2xl font-black text-slate-900">
        {t.admin.editCar} · {car.brand} {car.model}
      </h1>

      <div className="mt-6">
        <CarForm car={car} t={t} />
      </div>

      <div className="mt-8 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-black text-slate-900">{t.car.photos}</h2>
        <p className="text-sm text-slate-500">{t.car.addPhoto}</p>

        <form action={addCarImage} className="mt-4 flex flex-wrap items-center gap-3">
          <input type="hidden" name="id" value={car.id} />
          <input
            type="file"
            name="image"
            accept="image/*"
            className="flex-1 text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white hover:file:bg-brand-strong"
          />
          <button className="rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-strong">
            {t.gallery.add} →
          </button>
        </form>

        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((im) => (
              <div key={im.id} className="overflow-hidden rounded-xl border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.url} alt="" className="aspect-square w-full object-cover" />
                <div className="p-2">
                  <DeleteFormButton
                    action={removeCarImage}
                    fields={{ imageId: im.id, carId: car.id }}
                    confirmText="ลบรูปนี้?"
                    label={t.gallery.delete}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}