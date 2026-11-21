"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/Logo";
import { Icon } from "./icons";
import { pageMeta } from "./routes";
import { useNotifications } from "@/lib/api/hooks";

/** Bar atas: judul halaman (+ kembali), lonceng, dan tombol tulis curhat. */
export default function Topbar() {
  const path = usePathname();
  const { title, back } = pageMeta(path);
  const unread = useNotifications().data?.unread ?? 0;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 md:px-10">
        {back ? (
          <>
            <Link href={back} aria-label="Kembali" className="-ml-1.5 grid h-9 w-9 place-items-center rounded-full text-ink-muted hover:bg-surface-strong hover:text-ink">
              <Icon name="back" className="h-5 w-5" />
            </Link>
            <span className="truncate text-[15px] font-semibold">{title}</span>
          </>
        ) : (
          <>
            <Link href="/dashboard" className="md:hidden" aria-label="CurhatKu, ke beranda">
              <Wordmark size={26} />
            </Link>
            <span className="hidden truncate text-[15px] font-semibold md:block">{title}</span>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/notifikasi"
            aria-label={unread ? `Notifikasi, ${unread} belum dibaca` : "Notifikasi"}
            className="relative grid h-10 w-10 place-items-center rounded-full border border-line-strong text-ink-soft hover:bg-surface-strong"
          >
            <Icon name="bell" />
            {unread ? <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-danger ring-2 ring-bg" /> : null}
          </Link>
          {path !== "/dashboard" ? (
            <Link
              href="/dashboard#tulis"
              className="hidden min-h-9 items-center gap-2 rounded-full bg-invert px-4 text-[13px] font-semibold text-on-invert hover:brightness-110 sm:inline-flex"
            >
              <Icon name="pen" className="h-4 w-4" />
              Tulis curhat
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
