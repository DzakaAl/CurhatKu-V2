"use client";

import { use, useEffect } from "react";
import { ErrorBox, PageHeader, Skeleton } from "@/components/ui/States";
import { useArticle, useMarkRead } from "@/lib/api/hooks";

/** Detail artikel — ditandai sudah dibaca saat dibuka. */
export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const article = useArticle(slug);
  const { mutate: markRead } = useMarkRead();
  const id = article.data?.id;
  const read = article.data?.read;

  useEffect(() => {
    if (id && !read) markRead(id);
  }, [id, read, markRead]);

  if (article.isPending) return <Skeleton rows={3} />;
  if (article.isError) return <ErrorBox error={article.error} onRetry={() => article.refetch()} />;
  const a = article.data;

  return (
    <main className="flex flex-col gap-6">
      <PageHeader title={a.title} back="/artikel" />
      <p className="text-caption text-ink-muted">{a.readMinutes} menit membaca</p>
      <p className="text-h3 leading-snug">{a.excerpt}</p>
      <div className="flex max-w-[62ch] flex-col gap-4 text-body leading-[1.7]">
        {a.body?.split(/\n{2,}/).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </main>
  );
}
