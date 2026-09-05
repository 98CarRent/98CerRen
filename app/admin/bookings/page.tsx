import db from "@/lib/db";
import { getDict } from "@/lib/lang";
import { getLang } from "@/lib/lang-server";
import BookingAdminTable from "@/components/admin/BookingAdminTable";
import type { BookingWithCar } from "@/lib/types";

export default async function AdminBookingsPage() {
  const lang = await getLang();
  const t = getDict(lang);

  const bookings = db
    .prepare(
      `SELECT b.*, c.brand, c.model FROM bookings b
       LEFT JOIN cars c ON c.id = b.car_id
       ORDER BY b.id DESC`
    )
    .all() as BookingWithCar[];

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900">{t.admin.bookings}</h1>
      <p className="text-sm text-slate-500">
        {bookings.length} {lang === "en" ? "bookings" : "รายการ"}
      </p>
      <div className="mt-6">
        <BookingAdminTable bookings={bookings} t={t} />
      </div>
    </div>
  );
}