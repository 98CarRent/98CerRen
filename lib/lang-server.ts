import { cookies } from "next/headers";
import type { Lang } from "./lang";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const v = store.get("lang")?.value;
  return v === "en" ? "en" : "th";
}