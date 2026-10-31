"use client";

import { use, useEffect, useRef, useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import { ErrorBox, PageHeader, Skeleton, formatSlot, rupiah, timeAgo } from "@/components/ui/States";
import {
  useBooking,
  useCancelBooking,
  useMe,
  useMessages,
  useSendMessage,
  useUploadProof,
} from "@/lib/api/hooks";
import { STATUS_STYLE } from "@/lib/api/status";

/** Status booking → bayar (upload bukti) → chat setelah terkonfirmasi. */
export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number(use(params).id);
  const me = useMe();
  const booking = useBooking(id);
  const upload = useUploadProof(id);
  const cancel = useCancelBooking(id);

  if (booking.isPending) return <Skeleton rows={3} />;
  if (booking.isError) return <ErrorBox error={booking.error} onRetry={() => booking.refetch()} />;
  const b = booking.data;
  const isClient = me.data?.role !== "psychologist";
  const canPay = isClient && (b.status === "pending_payment" || b.status === "rejected");

  return (
    <main className="flex flex-col gap-6">
      <PageHeader title={isClient ? b.psychologist.name : b.client} back="/konsultasi" />

      <section className="flex flex-col gap-3 rounded-clay-lg bg-surface p-5">
        <span className={`w-fit rounded-full px-3 py-1.5 text-label font-semibold ${STATUS_STYLE[b.status]}`}>
          {b.statusLabel}
        </span>
        <p className="text-h3 font-semibold tracking-[-0.02em]">{formatSlot(b.startsAt)}</p>
        <p className="text-caption text-ink-muted">
          {b.psychologist.title} · {rupiah(b.amount)}
        </p>
        {b.adminNote ? <p className="text-caption">Catatan admin: {b.adminNote}</p> : null}
      </section>

      {canPay ? (
        <section aria-labelledby="bayar" className="flex flex-col gap-4">
          <h2 id="bayar" className="text-h3 font-semibold tracking-[-0.02em]">
            Bayar dengan transfer
          </h2>
          <ol className="flex flex-col gap-2 text-body">
            <li>1. Transfer {rupiah(b.amount)} ke rekening [NAMA BANK · NO. REKENING · ATAS NAMA].</li>
            <li>2. Foto atau screenshot bukti transfer.</li>
            <li>3. Unggah di bawah. Admin memeriksa dalam 1×24 jam.</li>
          </ol>
          <label className="flex min-h-14 cursor-pointer items-center justify-center rounded-full bg-invert px-6 font-semibold text-on-invert has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink has-[:focus-visible]:ring-offset-2">
            {upload.isPending ? "Mengunggah…" : b.status === "rejected" ? "Unggah ulang bukti" : "Unggah bukti transfer"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={upload.isPending}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload.mutate(f);
                e.target.value = "";
              }}
            />
          </label>
          <p className="text-caption text-ink-muted">JPG, PNG, atau WEBP, maksimal 4 MB.</p>
          {upload.isError ? <ErrorBox error={upload.error} /> : null}
        </section>
      ) : null}

      {b.status === "confirmed" ? <Chat id={id} /> : null}

      {isClient && b.status !== "confirmed" && b.status !== "cancelled" ? (
        <Button variant="ghost" className="self-start" disabled={cancel.isPending} onClick={() => cancel.mutate()}>
          Batalkan pesanan
        </Button>
      ) : null}
    </main>
  );
}

function Chat({ id }: { id: number }) {
  const msgs = useMessages(id, true);
  const send = useSendMessage(id);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const count = msgs.data?.length ?? 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [count]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    send.mutate(text, { onSuccess: () => setText("") });
  }

  return (
    <section aria-labelledby="chat" className="flex flex-col gap-3">
      <h2 id="chat" className="text-h3 font-semibold tracking-[-0.02em]">
        Chat sesi
      </h2>
      <ol aria-live="polite" className="flex max-h-[50dvh] flex-col gap-2 overflow-y-auto rounded-clay-lg bg-surface p-3">
        {count === 0 ? (
          <li className="p-3 text-caption text-ink-muted">
            {msgs.isPending ? "Memuat pesan…" : "Mulai percakapan. Pesan tersimpan aman."}
          </li>
        ) : null}
        {msgs.data?.map((m) => (
          <li
            key={m.id}
            className={
              "max-w-[85%] rounded-[20px] px-4 py-2.5 " +
              (m.mine ? "self-end bg-invert text-on-invert" : "self-start bg-mood-sedih text-night")
            }
          >
            <span className="sr-only">{m.mine ? "Kamu" : m.fromPsychologist ? "Psikolog" : "Klien"}: </span>
            <p className="whitespace-pre-line">{m.body}</p>
            <p className="mt-0.5 text-[11px] opacity-70">{timeAgo(m.createdAt)}</p>
          </li>
        ))}
        <div ref={endRef} />
      </ol>
      <form onSubmit={submit} className="flex items-end gap-2">
        <label htmlFor="msg" className="sr-only">
          Tulis pesan
        </label>
        <textarea
          id="msg"
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(e);
            }
          }}
          placeholder="Tulis pesan…"
          className="min-h-12 flex-1 resize-none rounded-clay-md bg-surface px-4 py-3 outline-none ring-ink focus-visible:ring-2"
        />
        <Button type="submit" disabled={!text.trim() || send.isPending} className="min-h-12">
          Kirim
        </Button>
      </form>
      {send.isError ? <ErrorBox error={send.error} /> : null}
    </section>
  );
}
