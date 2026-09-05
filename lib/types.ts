export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number | null;
  plate: string;
  seats: number;
  transmission: string;
  fuel: string;
  type: "self" | "with_driver";
  price_per_day: number;
  price_week: number;
  price_month: number;
  deposit: number;
  status: "available" | "rented" | "maintenance";
  image: string;
  description_th: string;
  description_en: string;
  created_at: string;
}

export interface Booking {
  id: number;
  ref_code: string;
  car_id: number | null;
  customer_name: string;
  customer_phone: string;
  customer_line: string;
  rental_type: "self" | "with_driver";
  start_date: string;
  end_date: string;
  total_price: number;
  pickup_location: string;
  note: string;
  status: "pending" | "confirmed" | "canceled" | "completed";
  created_at: string;
}

export interface BookingWithCar extends Booking {
  brand: string;
  model: string;
}

export interface Review {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  image: string;
  created_at: string;
}

export interface GalleryItem {
  id: number;
  url: string;
  caption_th: string;
  caption_en: string;
  category: string;
  folder_id: number | null;
  created_at: string;
}

export interface GalleryFolder {
  id: number;
  name: string;
  created_at: string;
}

export interface TourismPlace {
  id: number;
  name_th: string;
  name_en: string;
  city: string;
  description_th: string;
  description_en: string;
  image: string;
  created_at: string;
}

export type BookingStatus = Booking["status"];
export type Lang = "th" | "en";

export const STATUS_LIST = ["pending", "confirmed", "canceled", "completed"] as const;