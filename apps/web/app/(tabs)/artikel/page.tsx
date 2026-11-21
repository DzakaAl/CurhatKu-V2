"use client";

import Link from "next/link";
import Cover from "@/components/curhat/Cover";
import EmptyState from "@/components/curhat/EmptyState";
import { ErrorBox, PageHeader, Skeleton } from "@/components/ui/States";
import { useArticles } from "@/lib/api/hooks";

/** Artikel edukatif dalam grid bersampul; yang belum dibaca ditandai "Baru". */
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
        <ul className="grid gap-x-8 md:grid-cols-2">
          {articles.data.map((a) => (
            <li key={a.id} className="border-t border-line">
              <Link href={`/artikel/${a.slug}`} className="group flex h-full flex-col gap-2.5 py-5">
                <Cover seed={a.slug} />
                <span className="flex items-center gap-2 text-[12px] text-ink-muted">
                  <span className={"rounded-full px-2.5 py-0.5 font-semibold " + (a.read ? "bg-surface-strong" : "bg-accent-soft text-invert")}>
                    {a.read ? "Sudah dibaca" : "Baru"}
                  </span>
                  {a.readMinutes} menit baca
                </span>
                <span className="text-[17px] font-semibold tracking-[-0.02em] group-hover:text-invert">{a.title}</span>
                <span className="text-ink-muted">{a.excerpt}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
