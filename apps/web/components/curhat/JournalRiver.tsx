"use client";

import { useState } from "react";
import Composer from "./Composer";
import River from "./River";
import { useDeleteJournal } from "@/lib/api/hooks";
import type { Journal } from "@/lib/api/types";

const DAY = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "short" });
const TIME = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" });
const parse = (s: string) => new Date(s.replace(" ", "T") + "+07:00");

function when(sql: string) {
  const d = parse(sql);
  const today = new Date();
  const yest = new Date(today.getTime() - 86_400_000);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const day = same(d, today) ? "Hari ini" : same(d, yest) ? "Kemarin" : DAY.format(d);
  return `${day}, ${TIME.format(d)}`;
}

/**
 * Curhat sebagai sungai: lama → baru dari atas ke bawah.
 * `open` = sungai masih mengalir ke kolom tulis di bawahnya.
 */
export default function JournalRiver({
  journals,
  open,
  clamp,
}: {
  journals: Journal[];
  open?: boolean;
  clamp?: boolean;
}) {
  const del = useDeleteJournal();
  const [editing, setEditing] = useState<number | null>(null);
  const [confirming, setConfirming] = useState<number | null>(null);
  const ordered = [...journals].reverse();

  return (
    <River
      open={open}
      items={ordered.map((j) => ({
        id: j.id,
        emotion: j.emotion,
        meta: `${when(j.createdAt)} · ${j.emotion ?? "emosi belum jelas"}`,
        body:
          editing === j.id ? (
            <Composer journal={j} autoFocus onDone={() => setEditing(null)} />
          ) : (
            <p className={"whitespace-pre-line " + (clamp ? "line-clamp-3" : "")}>{j.content}</p>
          ),
        actions: (
          <div className="-ml-3 flex flex-wrap items-center text-caption font-medium text-ink-muted">
            {editing === j.id ? (
              <ActionButton onClick={() => setEditing(null)}>Batal</ActionButton>
            ) : confirming === j.id ? (
              <>
                <span className="px-3">Hapus curhat ini?</span>
                <ActionButton
                  strong
                  onClick={() => del.mutate(j.id, { onSettled: () => setConfirming(null) })}
                >
                  Ya, hapus
                </ActionButton>
                <ActionButton onClick={() => setConfirming(null)}>Batal</ActionButton>
              </>
            ) : (
              <>
                <ActionButton onClick={() => setEditing(j.id)}>Ubah</ActionButton>
                <ActionButton onClick={() => setConfirming(j.id)}>Hapus</ActionButton>
              </>
            )}
          </div>
        ),
      }))}
    />
  );
}

function ActionButton({ children, onClick, strong }: { children: React.ReactNode; onClick: () => void; strong?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "min-h-11 rounded-full px-3 transition-colors hover:bg-surface-strong hover:text-ink " +
        (strong ? "font-extrabold text-ink" : "")
      }
    >
      {children}
    </button>
  );
}
