"use client";

/* eslint-disable @next/next/no-img-element -- bukti transfer dari API, butuh cookie */
import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { ErrorBox, PageHeader, Skeleton, formatSlot, rupiah } from "@/components/ui/States";
import { useAdminBookings, useMe, usePublishArticle, useVerifyBooking } from "@/lib/api/hooks";
import { apiUrl, ApiError } from "@/lib/api/client";

/** Panel admin: verifikasi bukti transfer & terbitkan artikel. */
export default function AdminPage() {
  const me = useMe();
  if (me.data && me.data.role !== "admin") {
    return <ErrorBox error={new ApiError(403, "Halaman ini khusus admin.")} />;
  }
  return <AdminTabs />;
}

function AdminTabs() {
  const [tab, setTab] = useState<"verif" | "pub">("verif");
  const count = useAdminBookings().data?.length ?? 0;
  return (
    <main className="flex flex-col gap-6">
      <PageHeader title="Panel admin" subtitle="Verifikasi pembayaran sesi dan terbitkan artikel." />
      <div role="tablist" className="inline-flex max-w-full gap-0.5 self-start overflow-x-auto rounded-full bg-surface-strong p-[3px]">
        {([["verif", `Verifikasi pembayaran`], ["pub", "Terbitkan artikel"]] as const).map(([k, l]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={"h-8 whitespace-nowrap rounded-full px-3.5 text-[12.5px] font-medium " + (tab === k ? "bg-surface text-ink shadow-[0_0_0_1px_var(--ck-line-strong)]" : "text-ink-muted")}
          >
            {l}
            {k === "verif" ? <span className="ml-1.5 font-mono">{count}</span> : null}
          </button>
        ))}
      </div>
      {tab === "verif" ? <Payments /> : <Publish />}
    </main>
  );
}

function Payments() {
  const list = useAdminBookings();
  const verify = useVerifyBooking();
  const [notes, setNotes] = useState<Record<number, string>>({});

  return (
    <section aria-label="Menunggu verifikasi" className="flex flex-col gap-4">
      {list.isPending ? (
        <Skeleton rows={1} />
      ) : list.isError ? (
        <ErrorBox error={list.error} onRetry={() => list.refetch()} />
      ) : list.data.length === 0 ? (
        <p className="border-t border-line pt-5 text-ink-muted">Semua sudah diverifikasi. Tidak ada bukti transfer yang menunggu.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {list.data.map((b) => (
            <li key={b.id} className="flex items-start gap-4 border-t border-line py-5">
              <a href={apiUrl(`/bookings/${b.id}/proof`)} target="_blank" rel="noreferrer" className="block shrink-0" aria-label={`Buka bukti transfer #${b.id}`}>
                <img
                  src={apiUrl(`/bookings/${b.id}/proof`)}
                  alt={`Bukti transfer booking #${b.id}`}
                  className="h-[120px] w-24 rounded-[12px] bg-surface-strong object-cover shadow-[0_0_0_1px_var(--ck-line)]"
                />
              </a>
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div>
                  <p className="flex flex-wrap justify-between gap-2 font-mono font-medium">
                    <span>#{b.id}</span>
                    <span>{rupiah(b.amount)}</span>
                  </p>
                  <p className="text-[12.5px] text-ink-muted">
                    {b.client} → {b.psychologist.name} · {formatSlot(b.startsAt)}
                  </p>
                </div>
                <Input
                  label="Catatan (wajib bila ditolak)"
                  placeholder="Contoh: nominal tidak sesuai"
                  value={notes[b.id] ?? ""}
                  onChange={(e) => setNotes((n) => ({ ...n, [b.id]: e.target.value }))}
                />
                <div className="flex flex-wrap gap-2">
                  <Button className="min-h-9 px-4 text-[13px]" disabled={verify.isPending} onClick={() => verify.mutate({ id: b.id, approve: true, note: notes[b.id] })}>
                    Setujui
                  </Button>
                  <button
                    type="button"
                    disabled={verify.isPending || !notes[b.id]?.trim()}
                    onClick={() => verify.mutate({ id: b.id, approve: false, note: notes[b.id] })}
                    className="min-h-9 rounded-full border border-danger/30 px-4 text-[13px] font-semibold text-danger hover:bg-danger-soft disabled:opacity-40"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Publish() {
  const pub = usePublishArticle();
  const [done, setDone] = useState("");
  const fields = pub.error instanceof ApiError ? pub.error.fields ?? {} : {};

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    pub.mutate(
      { title: String(f.get("title")), excerpt: String(f.get("excerpt")), body: String(f.get("body")) },
      {
        onSuccess: (a) => {
          form.reset();
          setDone(`"${a.title}" terbit.`);
        },
      }
    );
  }

  return (
    <section aria-label="Terbitkan artikel" className="flex flex-col gap-4">
      <form onSubmit={submit} className="flex flex-col gap-4 border-t border-line pt-5">
        <Input name="title" label="Judul" required error={fields.title} />
        <Input name="excerpt" label="Ringkasan" hint="Maksimal 300 karakter. Tampil di daftar artikel." maxLength={300} required error={fields.excerpt} />
        <Textarea name="body" label="Isi (pisahkan paragraf dengan baris kosong)" rows={10} required error={fields.body} />
        <Button type="submit" disabled={pub.isPending} className="self-end">
          {pub.isPending ? "Menerbitkan…" : "Terbitkan"}
        </Button>
        <p aria-live="polite" className="text-caption font-medium">
          {done}
        </p>
      </form>
    </section>
  );
}
