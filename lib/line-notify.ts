const TOKEN = process.env.LINE_NOTIFY_TOKEN || "";

export interface BookingNotifyData {
  ref?: string;
  customerName: string;
  customerPhone: string;
  carLabel: string;
  start: string;
  end: string;
  total: number;
  pickup: string;
}

export async function notifyBooking(data: BookingNotifyData): Promise<boolean> {
  if (!TOKEN) return false;
  try {
    const msg = [
      "📣 *จองใหม่ 98CarRent*",
      `🔎 รหัสอ้างอิง: ${data.ref || "-"}`,
      `🧑 ${data.customerName} ☎ ${data.customerPhone}`,
      `🚗 ${data.carLabel}`,
      `📅 ${data.start} → ${data.end}`,
      `💰 ${data.total.toLocaleString()} บาท`,
      data.pickup ? `📍 ${data.pickup}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const res = await fetch("https://notify-api.line.me/api/notify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ message: msg }),
    });
    return res.ok;
  } catch {
    return false;
  }
}