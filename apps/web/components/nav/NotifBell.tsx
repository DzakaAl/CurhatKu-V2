"use client";

import Link from "next/link";
import { useNotifications } from "@/lib/api/hooks";

/** Lonceng notifikasi dengan titik jumlah belum dibaca. */
export default function NotifBell() {
  const { data } = useNotifications();
  const unread = data?.unread ?? 0;
  return (
    <Link
      href="/notifikasi"
      aria-label={unread ? `Notifikasi, ${unread} belum dibaca` : "Notifikasi"}
      className="relative grid h-11 w-11 place-items-center rounded-full bg-surface text-ink transition-colors hover:bg-surface-strong"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Z" />
        <path d="M10 20a2 2 0 0 0 4 0" />
      </svg>
      {unread ? (
        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-mood-marah px-1 text-[11px] font-bold text-night">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
