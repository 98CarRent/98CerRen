import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

const url = process.env.TURSO_URL;
const token = process.env.TURSO_AUTH_TOKEN;
if (!url || !token) {
  console.error("ต้องกำหนด TURSO_URL และ TURSO_AUTH_TOKEN ก่อนรันscript เช่น:");
  console.error("  set TURSO_URL=libsql://xxx.turso.io& set TURSO_AUTH_TOKEN=xxx (PowerShell)");
  console.error("  หรือ:  $env:TURSO_URL='...'; $env:TURSO_AUTH_TOKEN='...'");
  process.exit(1);
}

const dbPath = path.join(process.cwd(), "data", "carent.db");
if (!fs.existsSync(dbPath)) {
  console.error(`ไม่พบไฟล์ฐานข้อมูล: ${dbPath}`);
  process.exit(1);
}

const local = new Database(dbPath);
const remote = createClient({ url, authToken: token });

const TABLES = ["users", "cars", "car_images", "bookings", "reviews", "gallery", "gallery_folders", "tourism_places"];

try {
  for (const table of TABLES) {
    const colDefs = local.prepare(`PRAGMA table_info(${table})`).all();
    const cols = colDefs.map((c) => c.name);
    if (cols.length === 0) continue;
    const rows = local.prepare(`SELECT * FROM ${table}`).all();
    if (rows.length === 0) {
      console.log(`- ${table}: ไม่มีข้อมูล (0 แถว) ข้าม`);
      continue;
    }
    const colList = cols.join(", ");
    const placeholders = cols.map(() => "?").join(", ");
    const sql = `INSERT OR IGNORE INTO ${table} (${colList}) VALUES (${placeholders})`;
    let ok = 0;
    for (const row of rows) {
      const args = cols.map((c) => (row[c] === undefined ? null : row[c]));
      const res = await remote.execute({ sql, args });
      ok += Number(res.rowsAffected) > 0 ? 1 : 0;
    }
    console.log(`- ${table}: สำเร็จ ${ok}/${rows.length} แถว`);
  }
  console.log("เสร็จสิ้น — ข้อมูลถูกย้ายไป Turso แล้ว");
} catch (err) {
  console.error("เกิดข้อผิดพลาด:", err);
  process.exit(1);
}

local.close();
process.exit(0);