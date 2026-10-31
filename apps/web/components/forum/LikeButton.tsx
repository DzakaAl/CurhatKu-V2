"use client";

import { useLike } from "@/lib/api/hooks";
import type { Thread } from "@/lib/api/types";

/** "Peluk" = like versi CurhatKu. */
export default function LikeButton({ t }: { t: Pick<Thread, "id" | "liked" | "likesCount"> }) {
  const like = useLike();
  return (
    <button
      type="button"
      aria-pressed={t.liked}
      aria-label={`${t.liked ? "Batal peluk" : "Kirim peluk"} (${t.likesCount})`}
      onClick={() => like.mutate(t.id)}
      disabled={like.isPending}
      className={
        "inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-caption font-semibold transition-[transform,background-color] active:scale-95 " +
        (t.liked ? "bg-mood-terkejut text-night" : "hover:bg-surface-strong")
      }
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill={t.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
      </svg>
      {t.likesCount}
    </button>
  );
}

