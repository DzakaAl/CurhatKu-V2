"use client";

import Link from "next/link";
import EmptyState from "@/components/curhat/EmptyState";
import Button from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/nav/icons";
import { ErrorBox, PageHeader, Skeleton, timeAgo } from "@/components/ui/States";
import { useNotifications, useReadAll } from "@/lib/api/hooks";

/** Ikon menurut jenis/tautan notifikasi. */
function iconFor(type: string, link: string | null): IconName {
  if (type.includes("forum") || type.includes("reply") || link?.startsWith("/forum")) return "chat";
  if (type.includes("booking") || type.includes("payment") || link?.startsWith("/konsultasi")) return "shield";
  if (type.includes("message")) return "chat";
  return "bell";
}

/** Notifikasi in-app: balasan forum, status booking, pesan chat, pengingat. */
export default function NotifikasiPage() {
  const notifs = useNotifications();
  const readAll = useReadAll();
  const unread = notifs.data?.unread ?? 0;

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Notifikasi"
        subtitle={notifs.data ? (unread ? `${unread} belum dibaca` : "Semua sudah dibaca") : undefined}
        action={
          unread ? (
            <Button variant="surface" className="min-h-9 px-3.5 text-[12.5px]" onClick={() => readAll.mutate()} disabled={readAll.isPending}>
              Tandai semua dibaca
            </Button>
          ) : null
        }
      />
      {notifs.isPending ? (
        <Skeleton />
      ) : notifs.isError ? (
        <ErrorBox error={notifs.error} onRetry={() => notifs.refetch()} />
      ) : notifs.data.data.length === 0 ? (
        <EmptyState title="Belum ada notifikasi" body="Balasan di forum dan kabar sesi konsultasi akan muncul di sini." />
      ) : (
        <ul className="border-y border-line">
          {notifs.data.data.map((n) => {
            const inner = (
              <>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-surface-strong text-ink-soft">
                  <Icon name={iconFor(n.type, n.link)} className="h-[17px] w-[17px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={"block " + (n.read ? "font-medium" : "font-semibold")}>{n.title}</span>
                  {n.body ? <span className="block text-[13px] text-ink-muted">{n.body}</span> : null}
                  <span className="mt-1 block text-[12px] text-ink-muted">{timeAgo(n.createdAt)}</span>
                </span>
                {!n.read ? <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-invert" aria-label="Belum dibaca" /> : null}
              </>
            );
            const cls = "-mx-3 flex items-start gap-3 rounded-[14px] px-3 py-4";
            return (
              <li key={n.id} className="border-t border-line first:border-t-0">
                {n.link ? (
                  <Link href={n.link} className={cls + " hover:bg-surface-strong/50"}>
                    {inner}
                  </Link>
                ) : (
                  <div className={cls}>{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
