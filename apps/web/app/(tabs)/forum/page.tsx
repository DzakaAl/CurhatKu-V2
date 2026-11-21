"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import EmptyState from "@/components/curhat/EmptyState";
import Avatar, { splitHandle } from "@/components/forum/Avatar";
import ForumAside from "@/components/forum/ForumAside";
import LikeButton from "@/components/forum/LikeButton";
import SaveButton from "@/components/forum/SaveButton";
import ShareButton from "@/components/forum/ShareButton";
import { useSaved } from "@/lib/saved";
import { Icon } from "@/components/nav/icons";
import { ErrorBox, Skeleton, timeAgo } from "@/components/ui/States";
import { useCategories, useCreateThread, useMe, useThreads } from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";
import type { Thread } from "@/lib/api/types";

const tag = (name: string) => "#" + name.replace(/\s|&/g, "");

/** Forum anonim bergaya linimasa — semua orang tampil dengan nama samaran. */
export default function ForumPage() {
  const [cat, setCat] = useState<string | undefined>();
  const [tab, setTab] = useState<"semua" | "saya">("semua");
  const cats = useCategories();
  const threads = useThreads(cat);
  const { saved } = useSaved();
  const list = (threads.data ?? []).filter((t) => tab === "semua" || t.mine || saved.includes(t.id));

  return (
    <div className="-mx-4 -mt-8 grid items-start gap-10 md:mx-0 xl:grid-cols-[minmax(0,1fr)_340px]">
      <main className="min-w-0 md:border-x md:border-line">
        <div role="tablist" aria-label="Tampilan" className="sticky top-16 z-20 flex border-b border-line bg-bg/85 backdrop-blur-xl">
          {(["semua", "saya"] as const).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={
                "relative h-[54px] flex-1 font-medium hover:bg-surface-strong/50 " +
                (tab === k ? "font-semibold text-ink after:absolute after:bottom-0 after:left-1/2 after:h-[3px] after:w-14 after:-translate-x-1/2 after:rounded-full after:bg-invert" : "text-ink-muted")
              }
            >
              {k === "semua" ? "Terbaru" : "Diskusiku"}
            </button>
          ))}
        </div>

        <NewThread />

        <nav aria-label="Kategori" className="overflow-x-auto border-b border-line px-5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex w-max gap-2">
            {[{ slug: undefined, name: "Semua" }, ...(cats.data ?? [])].map((c) => (
              <li key={c.slug ?? "all"}>
                <button
                  type="button"
                  aria-pressed={cat === c.slug}
                  onClick={() => setCat(c.slug)}
                  className={
                    "min-h-8 whitespace-nowrap rounded-full border px-3.5 text-[12.5px] font-medium transition-colors " +
                    (cat === c.slug ? "border-ink bg-ink text-bg" : "border-line-strong text-ink-soft hover:bg-surface-strong")
                  }
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {threads.isPending ? (
          <Skeleton className="p-5" />
        ) : threads.isError ? (
          <div className="p-5">
            <ErrorBox error={threads.error} onRetry={() => threads.refetch()} />
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            title={tab === "saya" ? "Belum ada diskusimu atau yang kamu simpan" : "Belum ada diskusi"}
            body="Jadilah yang pertama bercerita. Namamu tetap tersembunyi."
          />
        ) : (
          <ul>
            {list.map((t) => (
              <Post key={t.id} t={t} onTag={() => setCat(t.category.slug)} />
            ))}
          </ul>
        )}
      </main>
      <ForumAside onPick={setCat} />
    </div>
  );
}

function Post({ t, onTag }: { t: Thread; onTag: () => void }) {
  const [name, num] = splitHandle(t.author);
  return (
    <li className="relative flex gap-3 border-b border-line px-5 py-4 transition-colors hover:bg-surface-strong/40">
      <Avatar name={name} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-1.5 text-[14px]">
          <b className="font-semibold">{t.mine ? "Kamu" : name}</b>
          {num ? <span className="font-mono text-[12.5px] text-ink-muted">{num}</span> : null}
          <span className="text-ink-muted">· {timeAgo(t.createdAt)}</span>
        </p>
        <h2 className="mt-0.5 text-[15.5px] font-semibold tracking-[-0.01em]">
          <Link href={`/forum/${t.id}`} className="after:absolute after:inset-0">
            {t.title}
          </Link>
        </h2>
        <p className="mt-0.5 line-clamp-2 text-ink-soft">{t.body}</p>
        <button type="button" onClick={onTag} className="relative z-10 mt-1.5 text-[13.5px] font-medium text-invert hover:underline">
          {tag(t.category.name)}
        </button>
        <div className="-mb-1.5 -ml-2 mt-2 flex max-w-[440px] items-center justify-between">
          <Link href={`/forum/${t.id}`} aria-label={`${t.repliesCount} balasan`} className="relative z-10 inline-flex min-h-9 items-center gap-1.5 rounded-full px-2 text-[13px] text-ink-muted hover:bg-accent-soft hover:text-invert">
            <Icon name="chat" />
            <span className="font-mono">{t.repliesCount}</span>
          </Link>
          <LikeButton t={t} />
          <SaveButton id={t.id} />
          <ShareButton id={t.id} />
        </div>
      </div>
    </li>
  );
}

function NewThread() {
  const me = useMe();
  const cats = useCategories();
  const create = useCreateThread();
  const fields = create.error instanceof ApiError ? create.error.fields ?? {} : {};

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    create.mutate(
      { categoryId: Number(f.get("categoryId")), title: String(f.get("title")), body: String(f.get("body")) },
      { onSuccess: () => form.reset() }
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-3 border-b border-line px-5 py-4">
      <Avatar name={me.data?.anonHandle ?? "K"} size={44} />
      <div className="min-w-0 flex-1">
        <label htmlFor="nt-title" className="sr-only">Judul diskusi</label>
        <input id="nt-title" name="title" maxLength={160} required placeholder="Judul diskusi" className="w-full bg-transparent pt-1.5 text-[17px] font-semibold outline-none placeholder:text-ink-muted/70" />
        {fields.title ? <p className="text-caption text-danger">{fields.title}</p> : null}
        <label htmlFor="nt-body" className="sr-only">Cerita</label>
        <textarea id="nt-body" name="body" rows={2} required placeholder="Apa yang sedang kamu rasakan?" className="w-full resize-none bg-transparent py-1.5 text-[16px] leading-normal outline-none placeholder:text-ink-muted/70" />
        {fields.body ? <p className="text-caption text-danger">{fields.body}</p> : null}
        <div className="mt-1 flex flex-wrap items-center gap-2.5 border-t border-line pt-3">
          <label htmlFor="nt-cat" className="sr-only">Kategori</label>
          <select id="nt-cat" name="categoryId" required className="h-8 rounded-full border border-invert/30 bg-transparent px-3 text-[12.5px] font-semibold text-invert">
            {cats.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="text-[12px] text-ink-muted">Tampil sebagai {me.data?.anonHandle ?? "nama samaranmu"}</span>
          <button type="submit" disabled={create.isPending} className="ml-auto min-h-9 rounded-full bg-invert px-4 text-[13px] font-semibold text-on-invert hover:brightness-110 disabled:opacity-50">
            {create.isPending ? "Mengirim…" : "Kirim"}
          </button>
        </div>
        {create.isError && !Object.keys(fields).length ? <div className="mt-3"><ErrorBox error={create.error} /></div> : null}
      </div>
    </form>
  );
}
