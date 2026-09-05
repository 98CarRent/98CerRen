"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import db from "./db";
import { loginAdmin, logoutAdmin, requireAdmin } from "./auth";
import { deleteUploaded, saveUpload } from "./utils";
import { calcPrice } from "./money";
import { notifyBooking } from "./line-notify";
import type { BookingStatus } from "./types";

/* ------------------------------ Auth ------------------------------ */

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  if (!username || !password) return { ok: false };
  const ok = await loginAdmin(username, password);
  if (!ok) return { ok: false };
  redirect("/admin");
}

export async function logoutAction() {
  await logoutAdmin();
  redirect("/");
}

/* ------------------------------ Cars ------------------------------ */

export async function createCar(formData: FormData) {
  await requireAdmin();
  const image = (formData.get("image") as File | null) || null;
  const imagePath = await saveUpload(image);
  await db.prepare(
    `INSERT INTO cars (brand, model, year, plate, seats, transmission, fuel, type, price_per_day, price_week, price_month, deposit, status, image, description_th, description_en)
     VALUES (@brand, @model, @year, @plate, @seats, @transmission, @fuel, @type, @price, @price_week, @price_month, @deposit, @status, @image, @descth, @descen)`
  ).run({
    brand: str(formData.get("brand")),
    model: str(formData.get("model")),
    year: num(formData.get("year")) || null,
    plate: str(formData.get("plate")),
    seats: num(formData.get("seats")) || 5,
    transmission: str(formData.get("transmission")) || "auto",
    fuel: str(formData.get("fuel")) || "diesel",
    type: str(formData.get("type")) === "with_driver" ? "with_driver" : "self",
    price: num(formData.get("price_per_day")) || 0,
    price_week: num(formData.get("price_week")) || 0,
    price_month: num(formData.get("price_month")) || 0,
    deposit: num(formData.get("deposit")) || 0,
    status: str(formData.get("status")) || "available",
    image: imagePath,
    descth: str(formData.get("description_th")),
    descen: str(formData.get("description_en")),
  });
  revalidatePath("/admin/cars");
  revalidatePath("/");
  revalidatePath("/cars");
  redirect("/admin/cars");
}

export async function updateCar(formData: FormData) {
  await requireAdmin();
  const id = num(formData.get("id"));
  if (!id) return;
  const existing = await db.prepare("SELECT * FROM cars WHERE id = ?").get(id) as
    | { image: string | null }
    | undefined;
  const image = (formData.get("image") as File | null) || null;
  let imagePath = existing?.image ?? null;
  if (image && image.size > 0) {
    const newPath = await saveUpload(image);
    if (newPath) {
      deleteUploaded(imagePath);
      imagePath = newPath;
    }
  }
  await db.prepare(
    `UPDATE cars SET brand=@brand, model=@model, year=@year, plate=@plate, seats=@seats,
     transmission=@transmission, fuel=@fuel, type=@type, price_per_day=@price,
     price_week=@price_week, price_month=@price_month, deposit=@deposit,
     status=@status, image=@image, description_th=@descth, description_en=@descen
     WHERE id=@id`
  ).run({
    id,
    brand: str(formData.get("brand")),
    model: str(formData.get("model")),
    year: num(formData.get("year")) || null,
    plate: str(formData.get("plate")),
    seats: num(formData.get("seats")) || 5,
    transmission: str(formData.get("transmission")) || "auto",
    fuel: str(formData.get("fuel")) || "diesel",
    type: str(formData.get("type")) === "with_driver" ? "with_driver" : "self",
    price: num(formData.get("price_per_day")) || 0,
    price_week: num(formData.get("price_week")) || 0,
    price_month: num(formData.get("price_month")) || 0,
    deposit: num(formData.get("deposit")) || 0,
    status: str(formData.get("status")) || "available",
    image: imagePath,
    descth: str(formData.get("description_th")),
    descen: str(formData.get("description_en")),
  });
  revalidatePath("/admin/cars");
  revalidatePath("/");
  revalidatePath("/cars");
  redirect("/admin/cars");
}

export async function deleteCar(formData: FormData) {
  await requireAdmin();
  const id = num(formData.get("id"));
  if (!id) return;
  const car = await db.prepare("SELECT * FROM cars WHERE id = ?").get(id) as
    | { image: string | null }
    | undefined;
  if (car) deleteUploaded(car.image);
  const images = await db.prepare("SELECT url FROM car_images WHERE car_id = ?").all(id) as {
    url: string;
  }[];
  for (const img of images) deleteUploaded(img.url);
  await db.prepare("DELETE FROM car_images WHERE car_id = ?").run(id);
  await db.prepare("DELETE FROM bookings WHERE car_id = ?").run(id);
  await db.prepare("DELETE FROM cars WHERE id = ?").run(id);
  revalidatePath("/admin/cars");
  revalidatePath("/");
  revalidatePath("/cars");
  redirect("/admin/cars");
}

export async function addCarImage(formData: FormData) {
  await requireAdmin();
  const id = num(formData.get("id"));
  const file = (formData.get("image") as File | null) || null;
  if (!id || !file || file.size === 0) return;
  const path = await saveUpload(file);
  if (path) await db.prepare("INSERT INTO car_images (car_id, url) VALUES (?, ?)").run(id, path);
  revalidatePath("/admin/cars");
  revalidatePath(`/cars/${id}`);
}

export async function removeCarImage(formData: FormData) {
  await requireAdmin();
  const imageId = num(formData.get("imageId"));
  const carId = num(formData.get("carId"));
  if (!imageId || !carId) return;
  const img = await db.prepare("SELECT url FROM car_images WHERE id = ?").get(imageId) as
    | { url: string }
    | undefined;
  if (img) deleteUploaded(img.url);
  await db.prepare("DELETE FROM car_images WHERE id = ?").run(imageId);
  revalidatePath("/admin/cars");
  revalidatePath(`/cars/${carId}`);
}

/* ------------------------------ Bookings ------------------------------ */

export async function createBooking(formData: FormData) {
  const name = str(formData.get("customer_name"));
  const phone = str(formData.get("customer_phone"));
  if (!name || !phone) return { ok: false };
  const carId = num(formData.get("car_id"));
  const start = str(formData.get("start_date"));
  const end = str(formData.get("end_date"));
  if (!start || !end) return { ok: false };
  const car = carId
    ? (await db.prepare("SELECT id, brand, model, price_per_day FROM cars WHERE id = ?").get(carId) as
        | { id: number; brand: string; model: string; price_per_day: number }
        | undefined)
    : undefined;
  const total = car
    ? calcPrice(car.price_per_day, start, end)
    : num(formData.get("total_price")) || 0;
  const rentalType =
    str(formData.get("rental_type")) === "with_driver" ? "with_driver" : "self";
  const ref = await makeRefCode();
  await db.prepare(
    `INSERT INTO bookings (car_id, customer_name, customer_phone, customer_line, rental_type, start_date, end_date, total_price, pickup_location, note, status, ref_code)
     VALUES (@car_id, @name, @phone, @line, @rental_type, @start, @end, @total, @pickup, @note, 'pending', @ref)`
  ).run({
    car_id: carId,
    name,
    phone,
    line: str(formData.get("customer_line")),
    rental_type: rentalType,
    start,
    end,
    total,
    pickup: str(formData.get("pickup_location")),
    note: str(formData.get("note")),
    ref,
  });
  await notifyBooking({
    ref,
    customerName: name,
    customerPhone: phone,
    carLabel: car ? `${car.brand} ${car.model}` : "-",
    start,
    end,
    total,
    pickup: str(formData.get("pickup_location")) || "-",
  });
  revalidatePath("/admin/bookings");
  redirect(`/booking?success=1&ref=${encodeURIComponent(ref)}`);
}

export async function setBookingStatus(formData: FormData) {
  await requireAdmin();
  const id = num(formData.get("id"));
  const status = str(formData.get("status")) as BookingStatus;
  if (!id || !["pending", "confirmed", "canceled", "completed"].includes(status)) return;
  await db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(status, id);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}

export async function deleteBooking(formData: FormData) {
  await requireAdmin();
  const id = num(formData.get("id"));
  if (!id) return;
  await db.prepare("DELETE FROM bookings WHERE id = ?").run(id);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}

/* ------------------------------ Gallery ------------------------------ */

export async function createGalleryFolder(formData: FormData) {
  await requireAdmin();
  const name = str(formData.get("name"));
  if (!name) return;
  await db.prepare("INSERT OR IGNORE INTO gallery_folders (name) VALUES (?)").run(name);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  redirect("/admin/gallery");
}

export async function deleteGalleryFolder(formData: FormData) {
  await requireAdmin();
  const id = num(formData.get("id"));
  if (!id) return;
  const rows = await db.prepare("SELECT url FROM gallery WHERE folder_id = ?").all(id) as {
    url: string;
  }[];
  for (const row of rows) deleteUploaded(row.url);
  await db.prepare("DELETE FROM gallery WHERE folder_id = ?").run(id);
  await db.prepare("DELETE FROM gallery_folders WHERE id = ?").run(id);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  redirect("/admin/gallery");
}

export async function addGalleryImages(formData: FormData) {
  await requireAdmin();
  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return;
  const folderId = num(formData.get("folder_id")) || null;
  const caption_th = str(formData.get("caption_th"));
  const caption_en = str(formData.get("caption_en"));
  let saved = 0;
  for (const file of files) {
    const imagePath = await saveUpload(file);
    if (!imagePath) continue;
    await db.prepare(
      "INSERT INTO gallery (url, caption_th, caption_en, folder_id) VALUES (?, ?, ?, ?)"
    ).run(imagePath, caption_th, caption_en, folderId);
    saved++;
  }
  if (saved > 0) {
    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
  }
  redirect("/admin/gallery");
}

export async function deleteGalleryImage(formData: FormData) {
  await requireAdmin();
  const id = num(formData.get("id"));
  if (!id) return;
  const img = await db.prepare("SELECT url FROM gallery WHERE id = ?").get(id) as
    | { url: string }
    | undefined;
  if (img) deleteUploaded(img.url);
  await db.prepare("DELETE FROM gallery WHERE id = ?").run(id);
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

/* ------------------------------ Reviews ------------------------------ */

export async function createReview(formData: FormData) {
  const name = str(formData.get("customer_name"));
  if (!name) return { ok: false };
  const file = (formData.get("image") as File | null) || null;
  const imagePath = await saveUpload(file);
  const rating = Math.min(5, Math.max(1, num(formData.get("rating")) || 5));
  await db.prepare("INSERT INTO reviews (customer_name, rating, comment, image) VALUES (?, ?, ?, ?)").run(
    name,
    rating,
    str(formData.get("comment")),
    imagePath
  );
  revalidatePath("/");
  revalidatePath("/reviews");
  revalidatePath("/admin/reviews");
  redirect("/reviews?thanks=1");
}

export async function deleteReview(formData: FormData) {
  await requireAdmin();
  const id = num(formData.get("id"));
  if (!id) return;
  const review = await db.prepare("SELECT * FROM reviews WHERE id = ?").get(id) as
    | { image: string | null }
    | undefined;
  if (review) deleteUploaded(review.image);
  await db.prepare("DELETE FROM reviews WHERE id = ?").run(id);
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
}

function str(v: FormDataEntryValue | null): string {
  return String(v || "").trim();
}

async function makeRefCode(): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let i = 0; i < 20; i++) {
    let code = "98-";
    for (let j = 0; j < 6; j++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    const exists = await db.prepare("SELECT 1 FROM bookings WHERE ref_code = ?").get(code);
    if (!exists) return code;
  }
  return `98-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

function num(v: FormDataEntryValue | null): number {
  if (!v) return 0;
  const n = Number(String(v).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}