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
  return (
    <main className="flex flex-col gap-10">
      <PageHeader title="Admin" back="/profil" />
      <Payments />
      <Publish />
    </main>
  );
}

function Payments() {
  const list = useAdminBookings();
  const verify = useVerifyBooking();
  const [notes, setNotes] = useState<Record<number, string>>({});

  return (
    <section aria-labelledby="verif" className="flex flex-col gap-4">
      <h2 id="verif" className="text-h2 font-semibold">
        Menunggu verifikasi
      </h2>
      {list.isPending ? (
        <Skeleton rows={1} />
      ) : list.isError ? (
        <ErrorBox error={list.error} onRetry={() => list.refetch()} />
      ) : list.data.length === 0 ? (
        <p className="text-ink-muted">Tidak ada bukti transfer yang menunggu.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {list.data.map((b) => (
            <li key={b.id} className="flex flex-col gap-3 rounded-clay-lg bg-surface p-5">
              <p className="font-semibold">
                #{b.id} · {b.client} → {b.psychologist.name}
              </p>
              <p className="text-caption text-ink-muted">
                {formatSlot(b.startsAt)} · {rupiah(b.amount)}
              </p>
              <a href={apiUrl(`/bookings/${b.id}/proof`)} target="_blank" rel="noreferrer" className="block">
                <img
                  src={apiUrl(`/bookings/${b.id}/proof`)}
                  alt={`Bukti transfer booking #${b.id}`}
                  className="max-h-72 w-full rounded-clay-md bg-bg object-contain"
                />
              </a>
              <Input
                label="Catatan (wajib bila ditolak)"
                value={notes[b.id] ?? ""}
                onChange={(e) => setNotes((n) => ({ ...n, [b.id]: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button disabled={verify.isPending} onClick={() => verify.mutate({ id: b.id, approve: true, note: notes[b.id] })}>
                  Konfirmasi
                </Button>
                <Button
                  variant="surface"
                  disabled={verify.isPending || !notes[b.id]?.trim()}
                  onClick={() => verify.mutate({ id: b.id, approve: false, note: notes[b.id] })}
                >
                  Tolak
                </Button>
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
    <section aria-labelledby="terbit" className="flex flex-col gap-4">
      <h2 id="terbit" className="text-h2 font-semibold">
        Terbitkan artikel
      </h2>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Input name="title" label="Judul" required error={fields.title} />
        <Input name="excerpt" label="Ringkasan (maks. 300 karakter)" maxLength={300} required error={fields.excerpt} />
        <Textarea name="body" label="Isi — pisahkan paragraf dengan baris kosong" rows={10} required error={fields.body} />
        <Button type="submit" disabled={pub.isPending} className="self-start">
          {pub.isPending ? "Menerbitkan…" : "Terbitkan"}
        </Button>
        <p aria-live="polite" className="text-caption font-medium">
          {done}
        </p>
      </form>
    </section>
  );
}
