"use client";

import { use, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Avatar, { splitHandle } from "@/components/forum/Avatar";
import ForumAside from "@/components/forum/ForumAside";
import LikeButton from "@/components/forum/LikeButton";
import SaveButton from "@/components/forum/SaveButton";
import ShareButton from "@/components/forum/ShareButton";
import { Icon } from "@/components/nav/icons";
import { ErrorBox, Skeleton, timeAgo } from "@/components/ui/States";
import { useDeleteThread, useMe, useReply, useThread } from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";

/** Detail diskusi bergaya linimasa: postingan utama besar, kolom balas, lalu balasan. */
export default function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number(use(params).id);
  const router = useRouter();
  const me = useMe();
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
  const [name, num] = splitHandle(t.author);
  const fieldErr = reply.error instanceof ApiError ? reply.error.fields?.body ?? reply.error.message : undefined;

  return (
    <div className="-mx-4 -mt-8 grid items-start gap-10 md:mx-0 xl:grid-cols-[minmax(0,1fr)_340px]">
      <main className="min-w-0 md:border-x md:border-line">
        <article className="border-b border-line px-5 py-5">
          <div className="flex items-center gap-3">
            <Avatar name={name} size={44} />
            <div className="min-w-0">
              <b className="block font-semibold">{t.mine ? "Kamu" : name}</b>
              {num ? <span className="font-mono text-[13px] text-ink-muted">{num}</span> : null}
            </div>
            {t.mine ? (
              <button
                type="button"
                onClick={() => del.mutate(id, { onSuccess: () => router.replace("/forum") })}
                className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-danger hover:bg-danger-soft"
              >
                <Icon name="trash" className="h-4 w-4" />
                Hapus
              </button>
            ) : null}
          </div>
          <h1 className="mt-4 text-[24px] font-semibold tracking-[-0.03em]">{t.title}</h1>
          <p className="mt-2.5 whitespace-pre-line text-[18px] leading-relaxed">{t.body}</p>
          <p className="mt-3 border-b border-line py-3.5 text-[13.5px] text-ink-muted">
            {timeAgo(t.createdAt)} · <span className="font-medium text-invert">#{t.category.name.replace(/\s|&/g, "")}</span>
          </p>
          <p className="flex gap-5 border-b border-line py-3 text-[14px] text-ink-muted">
            <span>
              <b className="font-mono font-medium text-ink">{t.repliesCount}</b> balasan
            </span>
            <span>
              <b className="font-mono font-medium text-ink">{t.likesCount}</b> peluk
            </span>
          </p>
          <div className="-mb-2 mt-1.5 flex justify-around">
            <a href="#balas" aria-label="Balas" className="inline-flex min-h-9 items-center rounded-full px-2 text-ink-muted hover:bg-accent-soft hover:text-invert">
              <Icon name="chat" />
            </a>
            <LikeButton t={t} />
            <SaveButton id={t.id} />
            <ShareButton id={t.id} />
          </div>
        </article>

        <form id="balas" onSubmit={submit} className="flex gap-3 border-b border-line px-5 py-4">
          <Avatar name={me.data?.anonHandle ?? "K"} size={44} />
          <div className="min-w-0 flex-1">
            <label htmlFor="reply" className="sr-only">Balasan</label>
            <textarea
              id="reply"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              maxLength={3000}
              placeholder="Tulis balasan yang baik…"
              aria-invalid={fieldErr ? true : undefined}
              className="w-full resize-none bg-transparent py-1.5 text-[16px] outline-none placeholder:text-ink-muted/70"
            />
            {fieldErr ? <p className="text-caption text-danger">{fieldErr}</p> : null}
            <div className="mt-1 flex items-center gap-3 border-t border-line pt-3">
              <span className="text-[12px] text-ink-muted">Membalas {t.mine ? "diskusimu" : name}</span>
              <button type="submit" disabled={!text.trim() || reply.isPending} className="ml-auto min-h-9 rounded-full bg-invert px-4 text-[13px] font-semibold text-on-invert hover:brightness-110 disabled:opacity-50">
                {reply.isPending ? "Mengirim…" : "Balas"}
              </button>
            </div>
          </div>
        </form>

        <section aria-label="Balasan">
          {t.replies?.length ? (
            <ul>
              {t.replies.map((r) => {
                const [rn, rnum] = splitHandle(r.author);
                return (
                  <li key={r.id} className="flex gap-3 border-b border-line px-5 py-4">
                    <Avatar name={rn} />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-1.5 text-[14px]">
                        <b className="font-semibold">{r.mine ? "Kamu" : rn}</b>
                        {rnum && !r.mine ? <span className="font-mono text-[12.5px] text-ink-muted">{rnum}</span> : null}
                        <span className="text-ink-muted">· {timeAgo(r.createdAt)}</span>
                      </p>
                      <p className="mt-1 whitespace-pre-line text-ink-soft">{r.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-5 py-6 text-ink-muted">Belum ada balasan. Jadilah yang pertama menanggapi.</p>
          )}
        </section>
      </main>
      <ForumAside />
    </div>
  );
}
