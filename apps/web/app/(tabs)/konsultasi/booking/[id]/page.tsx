"use client";

import { use, useEffect, useRef, useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/nav/icons";
import { Initials, KV } from "@/components/ui/Kit";
import { ErrorBox, SectionHead, Skeleton, formatSlot, rupiah, timeAgo } from "@/components/ui/States";
import type { Booking } from "@/lib/api/types";
import {
  useBooking,
  useCancelBooking,
  useMe,
  useMessages,
  useSendMessage,
  useUploadProof,
} from "@/lib/api/hooks";
import { STATUS_STYLE } from "@/lib/api/status";

const STEPS = [
  ["Pesan", "Jadwal dipilih"],
  ["Bayar", "Unggah bukti"],
  ["Verifikasi", "Maks. 1×24 jam"],
  ["Sesi", "Chat terbuka"],
] as const;

/** Tahap tiap langkah menurut status: done / cur / fail / "" */
function stepState(status: Booking["status"], i: number): string {
  const map: Record<Booking["status"], string[]> = {
    pending_payment: ["done", "cur", "", ""],
    rejected: ["done", "fail", "", ""],
    awaiting_verification: ["done", "done", "cur", ""],
    confirmed: ["done", "done", "done", "cur"],
    cancelled: ["done", "", "", ""],
  };
  return map[status][i];
}

const BAR: Record<string, string> = {
  done: "bg-invert",
  cur: "bg-[linear-gradient(90deg,var(--ck-invert)_50%,var(--ck-surface-strong)_50%)]",
  fail: "bg-danger",
  "": "bg-surface-strong",
};

/** Status booking → bayar (upload bukti) → verifikasi → chat setelah terkonfirmasi. */
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
  const who = isClient ? b.psychologist.name : b.client;

  return (
    <main className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-6">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Initials name={who} size={52} accent />
            <div className="min-w-0">
              <h1 className="text-[18px] font-semibold tracking-[-0.025em]">{who}</h1>
              <p className="text-[12.5px] text-ink-muted">
                {formatSlot(b.startsAt)} · <span className="font-mono">#{b.id}</span>
              </p>
            </div>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${STATUS_STYLE[b.status]}`}>{b.statusLabel}</span>
        </section>

        {b.status !== "cancelled" ? (
          <ol className="grid grid-cols-2 gap-y-3.5 border-t border-line pt-5 sm:grid-cols-4">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="flex flex-col gap-2 pr-2 text-[12px] text-ink-muted">
                <span aria-hidden="true" className={`h-1 rounded-full ${BAR[stepState(b.status, i)]}`} />
                <b className="text-[12.5px] font-semibold text-ink">{t}</b>
                <span>{d}</span>
              </li>
            ))}
          </ol>
        ) : null}

        {canPay ? (
          <section aria-labelledby="bayar" className="flex flex-col gap-4 border-t border-line pt-5">
            <div className="flex items-center justify-between">
              <h2 id="bayar" className="text-[13px] font-semibold">
                Pembayaran
              </h2>
              <b className="font-mono font-medium">{rupiah(b.amount)}</b>
            </div>
            {b.status === "rejected" ? (
              <p role="alert" className="rounded-[12px] bg-danger-soft px-4 py-3 text-[13px]">
                <b className="font-semibold text-danger">Bukti ditolak.</b> {b.adminNote ? `Catatan admin: ${b.adminNote}` : "Unggah ulang bukti yang sesuai."}
              </p>
            ) : null}
            <ol className="flex list-decimal flex-col gap-2 pl-[18px] text-ink-soft">
              <li>
                Transfer tepat <b className="font-mono font-medium">{rupiah(b.amount)}</b> ke rekening di bawah.
              </li>
              <li>Simpan foto atau tangkapan layar bukti transfer.</li>
              <li>Unggah di sini. Admin memeriksa dalam 1×24 jam.</li>
            </ol>
            <p className="rounded-[12px] bg-surface-strong px-4 py-3 font-mono text-[13px]">[NAMA BANK] · [NO. REKENING] · a.n. [ATAS NAMA]</p>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[16px] border-[1.5px] border-dashed border-line-strong px-4 py-7 text-center text-[13px] text-ink-muted transition-colors hover:border-invert hover:bg-accent-soft has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-invert">
              <Icon name="share" className="h-6 w-6 text-invert" />
              <b className="font-semibold text-ink">
                {upload.isPending ? "Mengunggah…" : b.status === "rejected" ? "Unggah ulang bukti transfer" : "Pilih bukti transfer"}
              </b>
              <span>JPG, PNG, atau WEBP · maks. 4 MB</span>
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
            {upload.isError ? <ErrorBox error={upload.error} /> : null}
          </section>
        ) : null}

        {b.status === "awaiting_verification" ? (
          <p className="rounded-[12px] bg-warn-soft px-4 py-3 text-[13px]">
            <b className="font-semibold">Bukti sudah kami terima.</b> Admin sedang memeriksa. Kamu akan dapat notifikasi begitu sesi terkonfirmasi.
          </p>
        ) : null}

        {b.status === "confirmed" ? <Chat id={id} /> : null}
      </div>

      <aside className="flex flex-col gap-4 xl:sticky xl:top-24">
        <SectionHead title="Detail sesi" />
        <KV
          rows={[
            ["Kode", <span key="k" className="font-mono">#{b.id}</span>],
            ["Jadwal", formatSlot(b.startsAt)],
            ["Psikolog", b.psychologist.name.replace(/,.*$/, "")],
            ["Biaya", <span key="b" className="font-mono">{rupiah(b.amount)}</span>],
          ]}
        />
        {isClient && b.status !== "confirmed" && b.status !== "cancelled" ? (
          <button
            type="button"
            disabled={cancel.isPending}
            onClick={() => cancel.mutate()}
            className="min-h-10 rounded-full border border-danger/30 text-[13px] font-semibold text-danger hover:bg-danger-soft disabled:opacity-50"
          >
            {cancel.isPending ? "Membatalkan…" : "Batalkan pemesanan"}
          </button>
        ) : null}
      </aside>
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
    <section aria-labelledby="chat" className="flex flex-col gap-3 border-t border-line pt-5">
      <div className="flex items-center justify-between">
        <h2 id="chat" className="text-[13px] font-semibold">
          Percakapan
        </h2>
        <span className="flex items-center gap-1.5 text-[12px] text-ink-muted">
          <Icon name="lock" className="h-[13px] w-[13px]" />
          Tersimpan aman
        </span>
      </div>
      <ol aria-live="polite" className="flex max-h-[50dvh] flex-col gap-2 overflow-y-auto rounded-clay-lg bg-surface p-4 shadow-[0_0_0_1px_var(--ck-line)]">
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
              (m.mine ? "self-end rounded-br-md bg-invert text-on-invert" : "self-start rounded-bl-md bg-surface-strong text-ink")
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
          className="min-h-12 flex-1 resize-none rounded-[24px] border border-line-strong bg-surface px-4 py-3 outline-none focus:border-invert focus:ring-[3px] focus:ring-accent-soft"
        />
        <Button type="submit" disabled={!text.trim() || send.isPending} className="min-h-12" aria-label="Kirim pesan">
          Kirim
        </Button>
      </form>
      {send.isError ? <ErrorBox error={send.error} /> : null}
    </section>
  );
}
