"use client";

import Link from "next/link";
import EmptyState from "@/components/curhat/EmptyState";
import { ErrorBox, PageHeader, Skeleton } from "@/components/ui/States";
import { useArticles } from "@/lib/api/hooks";

/** Artikel edukatif — yang belum dibaca ditandai titik. */
export default function ArtikelPage() {
  const articles = useArticles();

  return (
    <main className="flex flex-col gap-6">
      <PageHeader title="Artikel" subtitle="Bacaan singkat tentang kesehatan mental, dengan bahasa sehari-hari." />
      {articles.isPending ? (
        <Skeleton />
      ) : articles.isError ? (
        <ErrorBox error={articles.error} onRetry={() => articles.refetch()} />
      ) : articles.data.length === 0 ? (
        <EmptyState title="Belum ada artikel" body="Artikel pertama sedang ditulis. Cek lagi nanti." />
      ) : (
        <ol className="flex flex-col divide-y divide-line border-y border-line">
          {articles.data.map((a) => (
            <li key={a.id}>
              <Link href={`/artikel/${a.slug}`} className="group flex flex-col gap-1.5 py-5">
                <span className="flex items-center gap-2 text-caption text-ink-muted">
                  {!a.read ? <span className="h-2 w-2 rounded-full bg-invert" aria-hidden="true" /> : null}
                  {a.read ? "Sudah dibaca" : "Belum dibaca"} · {a.readMinutes} menit
                </span>
                <span className="text-h2 font-semibold leading-tight group-hover:underline group-hover:underline-offset-4">
                  {a.title}
                </span>
                <span className="text-caption text-ink-muted">{a.excerpt}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
