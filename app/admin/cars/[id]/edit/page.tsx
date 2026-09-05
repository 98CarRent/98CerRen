import Link from "next/link";
import { notFound } from "next/navigation";
import db from "@/lib/db";
import { getDict } from "@/lib/lang";
import { getLang } from "@/lib/lang-server";
import { removeCarImage } from "@/lib/actions";
import CarForm from "@/components/admin/CarForm";
import CarImageUpload from "@/components/admin/CarImageUpload";
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
        <p className="text-sm text-slate-500">{t.car.emptyImage}</p>

        <CarImageUpload carId={car.id} btnLabel={t.car.addPhoto} hint={t.car.addPhotoHint} />

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