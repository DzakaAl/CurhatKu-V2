"use client";

import { Icon } from "@/components/nav/icons";
import { useSaved } from "@/lib/saved";

/** Simpan diskusi ke "Diskusiku" (di perangkat ini). */
export default function SaveButton({ id }: { id: number }) {
  const { isSaved, toggle } = useSaved();
  const on = isSaved(id);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Hapus dari simpanan" : "Simpan diskusi"}
      onClick={() => toggle(id)}
      className={"relative z-10 inline-flex min-h-9 items-center rounded-full px-2 transition-colors hover:bg-accent-soft hover:text-invert " + (on ? "text-invert" : "text-ink-muted")}
    >
      <Icon name="book" className="h-[18px] w-[18px]" fill={on ? "currentColor" : "none"} />
    </button>
  );
}
