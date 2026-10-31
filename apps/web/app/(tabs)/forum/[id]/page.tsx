"use client";

import { use, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import LikeButton from "@/components/forum/LikeButton";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import { ErrorBox, PageHeader, Skeleton, timeAgo } from "@/components/ui/States";
import { useDeleteThread, useReply, useThread } from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";

/** Detail diskusi + balasan anonim. */
export default function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number(use(params).id);
  const router = useRouter();
  const thread = useThread(id);
  const reply = useReply(id);
  const del = useDeleteThread();
  const [text, setText] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    reply.mutate(text, { onSuccess: () => setText("") });
  }

  if (thread.isPending) return <Skeleton rows={2} />;
  if (thread.isError) return <ErrorBox error={thread.error} onRetry={() => thread.refetch()} />;
  const t = thread.data;
  const fieldErr = reply.error instanceof ApiError ? reply.error.fields?.body ?? reply.error.message : undefined;

  return (
    <main className="flex flex-col gap-6">
      <PageHeader title={t.title} back="/forum" />
      <article className="flex flex-col gap-3">
        <p className="text-caption text-ink-muted">
          {t.author} · {t.category.name} · {timeAgo(t.createdAt)}
        </p>
        <p className="whitespace-pre-line text-body leading-relaxed">{t.body}</p>
        <div className="-ml-3 flex items-center gap-2">
          <LikeButton t={t} />
          {t.mine ? (
            <button
              type="button"
              onClick={() => del.mutate(id, { onSuccess: () => router.replace("/forum") })}
              className="min-h-11 rounded-full px-3 text-caption font-medium text-ink-muted underline underline-offset-4"
            >
              Hapus diskusi
            </button>
          ) : null}
        </div>
      </article>

      <section aria-labelledby="balasan" className="flex flex-col gap-3 border-t border-line pt-5">
        <h2 id="balasan" className="text-h3 font-semibold tracking-[-0.02em]">
          {t.repliesCount} balasan
        </h2>
        <ul className="flex flex-col gap-3">
          {t.replies?.map((r) => (
            <li key={r.id} className={"rounded-clay-lg p-4 " + (r.mine ? "bg-invert text-on-invert" : "bg-surface")}>
              <p className={"text-caption " + (r.mine ? "text-on-invert-muted" : "text-ink-muted")}>
                {r.mine ? "Kamu" : r.author} · {timeAgo(r.createdAt)}
              </p>
              <p className="mt-1 whitespace-pre-line">{r.body}</p>
            </li>
          ))}
        </ul>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Textarea
            label="Balas dengan baik"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={3000}
            error={fieldErr}
          />
          <Button type="submit" disabled={!text.trim() || reply.isPending} className="self-start">
            {reply.isPending ? "Mengirim…" : "Kirim balasan"}
          </Button>
        </form>
      </section>
    </main>
  );
}
