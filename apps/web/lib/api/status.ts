import type { BookingStatus } from "./types";

/** Warna status booking — dipinjam dari palet emosi, teks selalu hitam. */
export const STATUS_STYLE: Record<BookingStatus, string> = {
  pending_payment: "bg-mood-waspada text-black",
  awaiting_verification: "bg-mood-sedih text-black",
  confirmed: "bg-mood-percaya text-black",
  rejected: "bg-mood-marah text-black",
  cancelled: "bg-surface-strong text-ink",
};


/** Warna garis kategori forum (pinjam palet emosi, informatif per kategori). */
export const CATEGORY_BG: Record<string, string> = {
  cerita: "bg-mood-senang",
  "kuliah-kerja": "bg-mood-waspada",
  keluarga: "bg-mood-sedih",
  hubungan: "bg-mood-terkejut",
  dukungan: "bg-mood-takut",
};
