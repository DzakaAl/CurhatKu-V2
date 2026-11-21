"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/Logo";
import { Icon } from "./icons";
import { ACCOUNT_NAV, ADMIN_NAV, MAIN_NAV, isActive, type NavItem } from "./routes";
import { useMe, useNotifications } from "@/lib/api/hooks";

/** Navigasi samping (desktop ≥ md). */
export default function Sidebar() {
  const path = usePathname();
  const me = useMe();
  const unread = useNotifications().data?.unread ?? 0;
  const account = me.data?.role === "admin" ? [...ACCOUNT_NAV, ADMIN_NAV] : ACCOUNT_NAV;

  const item = (n: NavItem) => {
    const on = isActive(path, n);
    return (
      <Link
        key={n.href}
        href={n.href}
        aria-current={on ? "page" : undefined}
        className={
          "flex min-h-10 items-center gap-3 rounded-[10px] px-2.5 text-[13.5px] font-medium transition-colors " +
          (on
            ? "bg-surface font-semibold text-ink shadow-[0_0_0_1px_var(--ck-line),0_1px_2px_rgba(20,28,56,.04)] [&>svg]:text-invert"
            : "text-ink-muted hover:bg-surface-strong/60 hover:text-ink")
        }
      >
        <Icon name={n.icon} />
        <span>{n.label}</span>
        {n.href === "/notifikasi" && unread ? (
          <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-invert px-1.5 text-[11px] font-bold text-on-invert">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line md:flex">
      <Link href="/dashboard" className="flex h-16 items-center px-5" aria-label="CurhatKu, ke beranda">
        <Wordmark size={28} />
      </Link>
      <nav aria-label="Navigasi utama" className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
        {MAIN_NAV.map(item)}
        <p className="px-2.5 pb-1.5 pt-5 text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-muted/70">Akun</p>
        {account.map(item)}
      </nav>
      {me.data ? (
        <Link href="/profil" className="flex items-center gap-3 border-t border-line p-3 hover:bg-surface-strong/50">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-strong text-[13px] font-bold">
            {me.data.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold">{me.data.name}</span>
            <span className="block truncate text-[11.5px] text-ink-muted">{me.data.anonHandle}</span>
          </span>
        </Link>
      ) : null}
    </aside>
  );
}
