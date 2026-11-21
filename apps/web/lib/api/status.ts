import type { BookingStatus } from "./types";

/** Warna status booking — semantik: kuning menunggu, biru beres, merah ditolak. */
export const STATUS_STYLE: Record<BookingStatus, string> = {
  pending_payment: "bg-warn-soft text-warn",
  awaiting_verification: "bg-warn-soft text-warn",
  confirmed: "bg-accent-soft text-invert",
  rejected: "bg-danger-soft text-danger",
  cancelled: "bg-surface-strong text-ink-muted",
};


/** Warna garis kategori forum (pinjam palet emosi, informatif per kategori). */
export const CATEGORY_BG: Record<string, string> = {
  cerita: "bg-mood-senang",
  "kuliah-kerja": "bg-mood-waspada",
  keluarga: "bg-mood-sedih",
  hubungan: "bg-mood-terkejut",
  dukungan: "bg-mood-takut",
};
