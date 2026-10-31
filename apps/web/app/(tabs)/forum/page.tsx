"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import EmptyState from "@/components/curhat/EmptyState";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { ErrorBox, PageHeader, Skeleton, timeAgo } from "@/components/ui/States";
import LikeButton from "@/components/forum/LikeButton";
import { CATEGORY_BG } from "@/lib/api/status";
import { useCategories, useCreateThread, useThreads } from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";
import type { Thread } from "@/lib/api/types";

/** Forum anonim — semua orang tampil dengan nama samaran. */
export default function ForumPage() {
  const [cat, setCat] = useState<string | undefined>();
  const [writing, setWriting] = useState(false);
  const cats = useCategories();
  const threads = useThreads(cat);

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Forum"
        subtitle="Diskusi yang sedang mengalir sekarang. Semua tampil dengan nama samaran."
        action={
          <Button onClick={() => setWriting((w) => !w)} aria-expanded={writing} variant={writing ? "surface" : "primary"}>
            {writing ? "Tutup" : "Tulis diskusi"}
          </Button>
        }
      />

      {writing ? <NewThread onDone={() => setWriting(false)} /> : null}

      <nav aria-label="Kategori" className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex w-max gap-2">
          {[{ slug: undefined, name: "Semua" }, ...(cats.data ?? [])].map((c) => (
            <li key={c.slug ?? "all"}>
              <button
                type="button"
                aria-pressed={cat === c.slug}
                onClick={() => setCat(c.slug)}
                className={
                  "min-h-11 whitespace-nowrap rounded-full px-4 text-caption font-semibold transition-colors " +
                  (cat === c.slug ? "bg-invert text-on-invert" : "bg-surface text-ink hover:bg-surface-strong")
                }
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {threads.isPending ? (
        <Skeleton />
      ) : threads.isError ? (
        <ErrorBox error={threads.error} onRetry={() => threads.refetch()} />
      ) : threads.data.length === 0 ? (
        <EmptyState
          title="Belum ada diskusi"
          body="Jadilah yang pertama bercerita. Namamu tetap tersembunyi."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {threads.data.map((t) => (
            <ThreadCard key={t.id} t={t} />
          ))}
        </ul>
      )}
    </main>
  );
}

function ThreadCard({ t }: { t: Thread }) {
  return (
    <li className="relative flex gap-4 rounded-clay-lg bg-surface p-4">
      <span aria-hidden="true" className={`w-1 shrink-0 rounded-full ${CATEGORY_BG[t.category.slug] ?? "bg-mood-none"}`} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="text-label text-ink-muted">
          {t.author} · {t.category.name} · {timeAgo(t.createdAt)}
        </p>
        <h2 className="text-[17px] font-semibold leading-snug tracking-[-0.01em]">
          <Link href={`/forum/${t.id}`} className="after:absolute after:inset-0 after:rounded-clay-lg">
            {t.title}
          </Link>
        </h2>
        <p className="line-clamp-2 text-caption text-ink-muted">{t.body}</p>
        <div className="relative z-10 -mb-2 -ml-3 flex items-center gap-1">
          <LikeButton t={t} />
          <span className="px-2 text-caption text-ink-muted">{t.repliesCount} balasan</span>
        </div>
      </div>
    </li>
  );
}

function NewThread({ onDone }: { onDone: () => void }) {
  const cats = useCategories();
  const create = useCreateThread();
  const fields = create.error instanceof ApiError ? create.error.fields ?? {} : {};

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    create.mutate(
      { categoryId: Number(f.get("categoryId")), title: String(f.get("title")), body: String(f.get("body")) },
      { onSuccess: onDone }
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-clay-lg bg-surface p-5 [&_input]:bg-bg [&_select]:bg-bg [&_textarea]:bg-bg">
      <p className="text-caption text-ink-muted">Kamu akan tampil sebagai nama samaranmu, bukan nama asli.</p>
      <div className="flex flex-col gap-2">
        <label htmlFor="cat" className="text-caption font-medium text-ink-muted">
          Kategori
        </label>
        <select id="cat" name="categoryId" required className="min-h-12 rounded-clay-md px-4 text-body text-ink outline-none ring-ink focus-visible:ring-2">
          {cats.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <Input name="title" label="Judul" maxLength={160} required error={fields.title} />
      <Textarea name="body" label="Ceritakan" rows={5} required error={fields.body} />
      {create.isError && !Object.keys(fields).length ? <ErrorBox error={create.error} /> : null}
      <Button type="submit" disabled={create.isPending} className="self-start">
        {create.isPending ? "Mengirim…" : "Kirim diskusi"}
      </Button>
    </form>
  );
}
