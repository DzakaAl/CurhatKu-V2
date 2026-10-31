"use client";

import Link from "next/link";
import EmptyState from "@/components/curhat/EmptyState";
import Button from "@/components/ui/Button";
import { ErrorBox, PageHeader, Skeleton, timeAgo } from "@/components/ui/States";
import { useNotifications, useReadAll } from "@/lib/api/hooks";

/** Notifikasi in-app: balasan forum, status booking, pesan chat. */
export default function NotifikasiPage() {
  const notifs = useNotifications();
  const readAll = useReadAll();

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Notifikasi"
        back="/profil"
        action={
          notifs.data?.unread ? (
            <Button variant="surface" onClick={() => readAll.mutate()} disabled={readAll.isPending}>
              Tandai dibaca
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
        <ul className="flex flex-col divide-y divide-line border-y border-line">
          {notifs.data.data.map((n) => {
            const inner = (
              <>
                <span className="flex items-center gap-2">
                  {!n.read ? <span className="h-2 w-2 shrink-0 rounded-full bg-mood-marah" aria-label="Belum dibaca" /> : null}
                  <span className="font-semibold">{n.title}</span>
                </span>
                {n.body ? <span className="text-caption text-ink-muted">{n.body}</span> : null}
                <span className="text-label text-ink-muted">{timeAgo(n.createdAt)}</span>
              </>
            );
            return (
              <li key={n.id}>
                {n.link ? (
                  <Link href={n.link} className="flex flex-col gap-1 py-4 hover:underline hover:underline-offset-4">
                    {inner}
                  </Link>
                ) : (
                  <div className="flex flex-col gap-1 py-4">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
