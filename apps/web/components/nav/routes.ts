import type { IconName } from "./icons";

export type NavItem = { href: string; label: string; icon: IconName; match: string[] };

export const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Beranda", icon: "home", match: ["/dashboard"] },
  { href: "/journal", label: "Jurnal", icon: "book", match: ["/journal"] },
  { href: "/forum", label: "Forum", icon: "chat", match: ["/forum"] },
  { href: "/artikel", label: "Artikel", icon: "doc", match: ["/artikel"] },
  { href: "/konsultasi", label: "Psikolog", icon: "heart", match: ["/konsultasi"] },
];

export const ACCOUNT_NAV: NavItem[] = [
  { href: "/notifikasi", label: "Notifikasi", icon: "bell", match: ["/notifikasi"] },
  { href: "/profil", label: "Profil", icon: "user", match: ["/profil"] },
];

export const ADMIN_NAV: NavItem = { href: "/admin", label: "Panel admin", icon: "shield", match: ["/admin"] };

/** Tab bawah (mobile): Jurnal dicapai dari Beranda, Notifikasi/Admin dari Profil. */
export const TABS: NavItem[] = [
  { href: "/dashboard", label: "Beranda", icon: "home", match: ["/dashboard", "/journal"] },
  { href: "/forum", label: "Forum", icon: "chat", match: ["/forum"] },
  { href: "/artikel", label: "Artikel", icon: "doc", match: ["/artikel"] },
  { href: "/konsultasi", label: "Psikolog", icon: "heart", match: ["/konsultasi"] },
  { href: "/profil", label: "Profil", icon: "user", match: ["/profil", "/notifikasi", "/admin", "/peta"] },
];

export const isActive = (path: string, item: NavItem) =>
  item.match.some((m) => path === m || path.startsWith(m + "/"));

/** Judul halaman + tujuan tombol kembali di topbar. */
export function pageMeta(path: string): { title: string; back?: string } {
  if (path.startsWith("/forum/")) return { title: "Diskusi", back: "/forum" };
  if (path.startsWith("/artikel/")) return { title: "Artikel", back: "/artikel" };
  if (path.startsWith("/konsultasi/booking/")) return { title: "Sesi konsultasi", back: "/konsultasi" };
  if (path.startsWith("/konsultasi/")) return { title: "Jadwal psikolog", back: "/konsultasi" };
  if (path === "/journal") return { title: "Jurnal", back: "/dashboard" };
  if (path === "/notifikasi") return { title: "Notifikasi", back: "/profil" };
  if (path === "/admin") return { title: "Panel admin", back: "/profil" };
  if (path === "/peta") return { title: "Peta layar", back: "/profil" };
  const all = [...MAIN_NAV, ...ACCOUNT_NAV];
  return { title: all.find((n) => isActive(path, n))?.label ?? "CurhatKu" };
}
