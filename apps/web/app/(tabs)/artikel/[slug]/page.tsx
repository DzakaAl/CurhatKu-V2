"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import Cover from "@/components/curhat/Cover";
import { Icon } from "@/components/nav/icons";
import { ErrorBox, Skeleton } from "@/components/ui/States";
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
    <article className="flex flex-col gap-5">
      <Cover seed={a.slug} />
      <p className="text-[12.5px] text-ink-muted">{a.readMinutes} menit baca · Tim CurhatKu</p>
      <h1 className="max-w-[24ch] text-[clamp(28px,3.6vw,38px)] font-semibold tracking-[-0.04em]">{a.title}</h1>
      <p className="max-w-[60ch] text-[18px] text-ink-muted">{a.excerpt}</p>
      <div className="flex max-w-[66ch] flex-col gap-3.5 text-[16px] leading-[1.75] text-ink-soft">
        {a.body?.split(/\n{2,}/).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <div>
          <b className="block font-semibold">Mau mencobanya sekarang?</b>
          <span className="text-[13px] text-ink-muted">Tulis bagaimana perasaanmu setelah membaca.</span>
        </div>
        <Link href="/dashboard#tulis" className="inline-flex min-h-9 items-center gap-2 rounded-full bg-invert px-4 text-[13px] font-semibold text-on-invert hover:brightness-110">
          <Icon name="pen" className="h-4 w-4" />
          Tulis curhat
        </Link>
      </div>
    </article>
  );
}
