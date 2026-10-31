"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
  "aria-hidden": true,
};

const TABS = [
  {
    href: "/dashboard",
    match: ["/dashboard", "/journal"],
    label: "Alur",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="7" cy="5.5" r="2" />
        <circle cx="17" cy="12" r="2" />
        <circle cx="7" cy="18.5" r="2" />
        <path d="M8.7 6.6l6.6 4.3M15.3 13.1l-6.6 4.3" />
      </svg>
    ),
  },
  {
    href: "/forum",
    match: ["/forum"],
    label: "Forum",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 4v-4H6a2 2 0 0 1-2-2V6Z" />
      </svg>
    ),
  },
  {
    href: "/artikel",
    match: ["/artikel"],
    label: "Artikel",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
        <path d="M8 10h8M8 13.5h8M8 17h5" />
      </svg>
    ),
  },
  {
    href: "/konsultasi",
    match: ["/konsultasi"],
    label: "Psikolog",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
        <path d="M9 11h6M12 8v6" />
      </svg>
    ),
  },
  {
    href: "/profil",
    match: ["/profil", "/notifikasi", "/admin"],
    label: "Profil",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="12" cy="8.5" r="3.5" />
        <path d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5" />
      </svg>
    ),
  },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const activeIndex = TABS.findIndex((t) => t.match.some((m) => pathname === m || pathname.startsWith(m + "/")));

  return (
    <nav aria-label="Navigasi utama" className="fixed bottom-5 left-1/2 z-50 w-[min(100%-2.5rem,26rem)] -translate-x-1/2">
      <ul className="relative flex items-center rounded-full border border-line bg-nav p-1.5 shadow-[0_12px_32px_rgba(20,18,43,0.18)]">
        {/* Indikator meluncur ke tab aktif (transform → murah, reduced-motion dihormati global) */}
        <span
          aria-hidden="true"
          className={
            "absolute inset-y-1.5 left-1.5 w-[calc((100%-0.75rem)/5)] rounded-full bg-invert transition-[transform,opacity] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] " +
            (activeIndex < 0 ? "opacity-0" : "opacity-100")
          }
          style={{ transform: `translateX(${Math.max(activeIndex, 0) * 100}%)` }}
        />
        {TABS.map((tab, i) => {
          const active = i === activeIndex;
          return (
            <li key={tab.href} className="relative flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={
                  "flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-full text-[11px] leading-none transition-colors duration-300 " +
                  (active ? "font-extrabold text-on-invert" : "text-nav-ink hover:text-ink")
                }
              >
                <span className="h-5 w-5 [&>svg]:h-full [&>svg]:w-full">{tab.icon}</span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
