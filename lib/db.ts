import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const dataDir = path.join(process.cwd(), "data");
const uploadsDir = path.join(process.cwd(), "public", "uploads");

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

const db = new Database(path.join(dataDir, "carent.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS cars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER,
      plate TEXT,
      seats INTEGER DEFAULT 5,
      transmission TEXT DEFAULT 'auto',
      fuel TEXT DEFAULT 'diesel',
      type TEXT DEFAULT 'self',
      price_per_day REAL NOT NULL DEFAULT 0,
      deposit REAL DEFAULT 0,
      status TEXT DEFAULT 'available',
      image TEXT,
      description_th TEXT,
      description_en TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS car_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      car_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      car_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_line TEXT,
      rental_type TEXT DEFAULT 'self',
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      total_price REAL DEFAULT 0,
      pickup_location TEXT,
      note TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      comment TEXT,
      image TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      caption_th TEXT,
      caption_en TEXT,
      category TEXT DEFAULT 'car',
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS tourism_places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_th TEXT NOT NULL,
      name_en TEXT NOT NULL,
      city TEXT NOT NULL,
      description_th TEXT,
      description_en TEXT,
      image TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE UNIQUE INDEX IF NOT EXISTS uq_tourism_name ON tourism_places(name_th);
    CREATE UNIQUE INDEX IF NOT EXISTS uq_cars_name ON cars(brand, model);
  `);

  const cols = db.prepare("PRAGMA table_info(bookings)").all() as { name: string }[];
  if (!cols.some((c) => c.name === "ref_code")) {
    db.exec(
      "ALTER TABLE bookings ADD COLUMN ref_code TEXT; CREATE UNIQUE INDEX IF NOT EXISTS uq_bookings_ref ON bookings(ref_code);"
    );
  }
}

function seedAdmin() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const hash = bcrypt.hashSync(password, 10);
  db.prepare(
    "INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, 'admin')"
  ).run(username, hash);
}

function seedTourism() {
  const W = "https://commons.wikimedia.org/wiki/Special:FilePath/";
  const img = (file: string) => `${W}${encodeURIComponent(file)}?width=1000`;

  const places = [
    {
      name_th: "หอแก้วมุกดาหาร",
      name_en: "Mukdahan Tower",
      city: "mukdahan",
      description_th:
        "หอคอยแก้วสูง 65.5 เมตร สัญลักษณ์ของจังหวัดมุกดาหาร ชมวิวเมือง 2 ฝั่งโขง และเมืองสะหวันนะเขต สปป.ลาว จุดชมพระอาทิตย์ตกที่สวยที่สุดแห่งหนึ่งของภาคอีสาน",
      description_en:
        "A 65.5-metre glass tower and the iconic landmark of Mukdahan. Enjoy panoramic views over the Mekong and Savannakhet, Laos — one of the best sunset spots in Isan.",
      image: img("Mukdahan Haw Kaew.JPG"),
    },
    {
      name_th: "สะพานมิตรภาพไทย-ลาว แห่งที่ 2",
      name_en: "Second Thai-Lao Friendship Bridge",
      city: "mukdahan",
      description_th:
        "สะพานข้ามแม่น้ำโขงเชื่อมจังหวัดมุกดาหารกับเมืองสะหวันนะเขต สปป.ลาว เป็นประตูสู่อินโดจีน ตลาดอินโดจีนริมหาดทรายทองมีของฝากหลากหลาย",
      description_en:
        "The Mekong bridge connecting Mukdahan to Savannakhet, Laos — a gateway to Indochina. The Indo-China market nearby offers a wide range of souvenirs.",
      image: img("Second Thai–Lao Friendship Bridge.JPG"),
    },
    {
      name_th: "อุทยานแห่งชาติภูผาเทิบ",
      name_en: "Phu Pha Thoep National Park",
      city: "mukdahan",
      description_th:
        "เทือกเขาหินทรายรูปทรงแปลกตาและทุ่งดอกไม้ป่า จุดชมวิวทะเลหมอกสวยงาม ชมภาพเขียนสีโบราณอายุหลายพันปีบริเวณถ้ำ",
      description_en:
        "Strange-shaped sandstone rock formations and wildflower fields, famous for beautiful sea-of-mist viewpoints and ancient cave paintings thousands of years old.",
      image: img("Phu Pha Thoep National Park (MGK21333).jpg"),
    },
    {
      name_th: "เขื่อนน้ำก่ำ ริมแม่น้ำโขง",
      name_en: "Mekong Riverside, Mukdahan",
      city: "mukdahan",
      description_th:
        "บรรยากาศริมหาดทรายขาวสะอาดตามแนวแม่น้ำโขง เดินเล่นชมวิวสองฝั่งโขง กินอาหารท้องถิ่น และถ่ายรูปพระอาทิตย์ตกยามเย็น",
      description_en:
        "Clean white-sand beaches along the Mekong. Take a stroll, enjoy the riverside view of the two countries, taste local food, and capture the sunset.",
      image: "",
    },
    {
      name_th: "วัดศรีมงคลใต้ (พระแก้วมุกดาหาร)",
      name_en: "Wat Si Mongkhon Tai",
      city: "mukdahan",
      description_th:
        "วัดเก่าแก่คู่เมืองมุกดาหาร ประดิษฐานพระพุทธรูปศักดิ์สิทธิ์คู่บ้านคู่เมือง และเป็นศูนย์รวมจิตใจของชาวเมืองริมโขง",
      description_en:
        "An old temple of Mukdahan housing sacred Buddha images that have long been the spiritual centre of the Mekong riverside community.",
      image: "",
    },
    {
      name_th: "ตลาดอินโดจีน",
      name_en: "Indo-China Market",
      city: "mukdahan",
      description_th:
        "แหล่งช้อปปิ้งสินค้านำเข้าจากเวียดนาม สปป.ลาว และจีน ริมเมืองมุกดาหาร เหมาะสำหรับซื้อของฝากและของมือสองคุณภาพดี",
      description_en:
        "A shopping hub for imported goods from Vietnam, Laos and China in Mukdahan — great for souvenirs and quality second-hand items.",
      image: "",
    },
    {
      name_th: "วัดพระธาตุพนมวรมหาวิหาร",
      name_en: "Wat Phra That Phanom",
      city: "nakhonphanom",
      description_th:
        "พระธาตุศักดิ์สิทธิ์คู่แผ่นดินอีสาน อายุกว่า 1,000 ปี เป็นที่ประดิษฐานพระอุรังคธาตุของพระพุทธเจ้า ถือเป็นพระธาตุประจำวันเกิดวันอาทิตย์",
      description_en:
        "More than a thousand years old, this sacred stupa enshrines a relic of the Buddha and is considered the Sunday-birthday stupa — the soul of Isan.",
      image: img("Wat Phra That Phanom 2006-01.jpg"),
    },
    {
      name_th: "ถนนเฉลิมพฤกษ์ (ถนนสวรรค์)",
      name_en: "Chaloem Phrakiat Walking Street, Nakhon Phanom",
      city: "nakhonphanom",
      description_th:
        "ถนนชมวิวริมแม่น้ำโขงประจำเมืองนครพนม กลางคืนเป็นถนนคนเดินของกินอร่อย ของฝากหลากหลาย บรรยากาศสวยติดริมโขง",
      description_en:
        "The iconic Mekong riverside road of Nakhon Phanom. At night it becomes a lively walking street with tasty food, souvenirs and a beautiful riverside vibe.",
      image: "",
    },
    {
      name_th: "สักการสถานพระมารดาแห่งมรณสักขี",
      name_en: "Martyrs' Mother Shrine",
      city: "nakhonphanom",
      description_th:
        "อนุสรณ์สถานเพื่อรำลึกถึงมารดาที่สละชีพเพื่อลูกทั้ง 7 คนในเหตุการณ์ลาดตระเวนชายแดนครั้งประวัติศาสตร์ เป็นแหล่งเรียนรู้ที่สำคัญของจังหวัด",
      description_en:
        "A memorial honouring the mother who gave her life for her seven children during a historic border patrol incident — an important historic site of the province.",
      image: "",
    },
    {
      name_th: "อุทยานแห่งชาติภูลังกา",
      name_en: "Phu Langka National Park",
      city: "nakhonphanom",
      description_th:
        "ภูเขาสูงตระหง่านกลางผืนป่าอีสาน จุดชมทะเลหมอกยามเช้าชื่อดัง แหล่งท่องเที่ยวเชิงธรรมชาติที่ต้องไปให้ได้ซักครั้ง",
      description_en:
        "A towering mountain rising from the Isan forest, famous for its spectacular early morning sea of mist — a must-visit natural destination.",
      image: img("อุทยานแห่งชาติภูลังกา-นครพนม-2-600x360.jpg"),
    },
  ];

  const insert = db.prepare(
    `INSERT OR IGNORE INTO tourism_places (name_th, name_en, city, description_th, description_en, image)
     VALUES (@name_th, @name_en, @city, @description_th, @description_en, @image)`
  );
  const tx = db.transaction((rows: typeof places) => {
    for (const row of rows) insert.run(row as never);
  });
  tx(places);
}

function seedCars() {
  const cars = [
    {
      brand: "Toyota",
      model: "Hilux Revo",
      year: 2021,
      plate: "กพ 1234 มุกดาหาร",
      seats: 5,
      transmission: "manual",
      fuel: "diesel",
      type: "self",
      price_per_day: 1200,
      deposit: 5000,
      status: "available",
      description_th:
        "รถกระบะแข็งแรง เหมาะสำหรับเดินทางไกล ลุยทริปภูผาเทิบและภูลังกาได้สบาย",
      description_en:
        "A sturdy pickup truck, perfect for long trips and rough roads like Phu Pha Thoep and Phu Langka.",
      image: "/uploads/hilux.svg",
    },
    {
      brand: "Toyota",
      model: "Camry",
      year: 2020,
      plate: "จท 4567 นครพนม",
      seats: 5,
      transmission: "auto",
      fuel: "petrol",
      type: "with_driver",
      price_per_day: 1800,
      deposit: 8000,
      status: "available",
      description_th:
        "รถยนต์นั่งหรูหรา มาพร้อมคนขับมืออาชีพ เหมาะสำหรับรับรองแขกสำคัญและทริปครอบครัว",
      description_en:
        "A luxurious sedan with a professional driver, ideal for VIP guests and family trips.",
      image: "/uploads/camry.svg",
    },
    {
      brand: "Honda",
      model: "City",
      year: 2022,
      plate: "อค 8901 มุกดาหาร",
      seats: 5,
      transmission: "auto",
      fuel: "petrol",
      type: "self",
      price_per_day: 900,
      deposit: 3000,
      status: "available",
      description_th:
        "รถเก๋งประหยัดน้ำมัน ขับง่าย จอดสะดวก เหมาะสำหรับเช่าเที่ยวในตัวเมือง",
      description_en:
        "A fuel-efficient sedan that is easy to drive and park — great for city trips.",
      image: "/uploads/city.svg",
    },
    {
      brand: "Isuzu",
      model: "D-Max",
      year: 2019,
      plate: "บป 2345 มุกดาหาร",
      seats: 5,
      transmission: "manual",
      fuel: "diesel",
      type: "self",
      price_per_day: 1100,
      deposit: 5000,
      status: "rented",
      description_th:
        "รถกระบะตัวแรง เครื่องยนต์ดีเซล ทนทาน คุ้มค่า เหมาะกับงานขนของและทริปลุยป่า",
      description_en:
        "A powerful diesel pickup, tough and good value — great for hauling goods and off-road trips.",
      image: "/uploads/dmaz.svg",
    },
    {
      brand: "Mitsubishi",
      model: "Xpander",
      year: 2021,
      plate: "วผ 5678 นครพนม",
      seats: 7,
      transmission: "auto",
      fuel: "petrol",
      type: "with_driver",
      price_per_day: 1600,
      deposit: 7000,
      status: "available",
      description_th:
        "รถ MPV 7 ที่นั่ง พร้อมคนขับ เหมาะสำหรับท่องเที่ยวทั้งครอบครัวหรือคณะเพื่อน",
      description_en:
        "A 7-seat MPV with a driver — perfect for family or group excursions.",
      image: "/uploads/xpander.svg",
    },
    {
      brand: "Nissan",
      model: "Terra",
      year: 2022,
      plate: "ศย 6789 มุกดาหาร",
      seats: 7,
      transmission: "auto",
      fuel: "diesel",
      type: "self",
      price_per_day: 1500,
      deposit: 7000,
      status: "maintenance",
      description_th:
        "รถยนต์เอสยูวี 7 ที่นั่ง ขับขี่มั่นใจทุกเส้นทาง เครื่องยนต์ดีเซลทรงพลัง",
      description_en:
        "A 7-seat SUV with confident handling on every road and a powerful diesel engine.",
      image: "/uploads/terra.svg",
    },
  ];

  const insert = db.prepare(
    `INSERT OR IGNORE INTO cars (brand, model, year, plate, seats, transmission, fuel, type, price_per_day, deposit, status, image, description_th, description_en)
     VALUES (@brand, @model, @year, @plate, @seats, @transmission, @fuel, @type, @price_per_day, @deposit, @status, @image, @description_th, @description_en)`
  );
  const tx = db.transaction((rows: typeof cars) => {
    for (const row of rows) insert.run(row as never);
  });
  tx(cars);

  const carRows = db
    .prepare("SELECT id, image FROM cars ORDER BY id")
    .all() as { id: number; image: string | null }[];
  const imgInsert = db.prepare("INSERT INTO car_images (car_id, url) VALUES (?, ?)");
  for (const car of carRows) {
    if (!car.image) continue;
    const existing = db
      .prepare("SELECT COUNT(*) AS c FROM car_images WHERE car_id = ?")
      .get(car.id) as { c: number };
    if (existing.c === 0) imgInsert.run(car.id, car.image);
  }
}

export function seedDatabase() {
  db.transaction(() => {
    seedAdmin();
    seedTourism();
    seedCars();
  })();
}

initSchema();
seedDatabase();

export default db;