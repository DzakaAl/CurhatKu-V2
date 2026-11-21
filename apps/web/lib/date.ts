/** Waktu SQL dari API (zona server Asia/Jakarta) → Date. */
export const parseSql = (s: string) => new Date(s.replace(" ", "T") + "+07:00");

const DAY = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "short", timeZone: "Asia/Jakarta" });
const TIME = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
const KEY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" });

/** "Hari ini" / "Kemarin" / "Rabu, 19 Nov" */
export function dayLabel(sql: string): string {
  const k = KEY.format(parseSql(sql));
  const today = KEY.format(new Date());
  const yest = KEY.format(new Date(Date.now() - 86_400_000));
  return k === today ? "Hari ini" : k === yest ? "Kemarin" : DAY.format(parseSql(sql));
}

export const timeLabel = (sql: string) => TIME.format(parseSql(sql)).replace(":", ".");
export const dayKey = (sql: string) => KEY.format(parseSql(sql));
