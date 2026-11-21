"use client";

import { useState } from "react";
import { Icon } from "@/components/nav/icons";

/** Salin tautan diskusi ke clipboard. */
export default function ShareButton({ id }: { id: number }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label={done ? "Tautan disalin" : "Salin tautan diskusi"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(`${location.origin}/forum/${id}`);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          /* clipboard ditolak: biarkan */
        }
      }}
      className="relative z-10 inline-flex min-h-9 items-center gap-1.5 rounded-full px-2 text-[13px] text-ink-muted transition-colors hover:bg-accent-soft hover:text-invert"
    >
      <Icon name="share" />
      {done ? <span>Disalin</span> : null}
    </button>
  );
}
