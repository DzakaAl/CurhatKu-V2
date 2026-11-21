import Link from "next/link";
import { Dot } from "@/components/ui/Kit";
import { dayLabel, timeLabel } from "@/lib/date";
import type { Journal } from "@/lib/api/types";

/** Ringkasan curhat terakhir (beranda): titik emosi, waktu, dua baris isi. */
export default function JournalList({ journals }: { journals: Journal[] }) {
  return (
    <ul className="flex flex-col">
      {journals.map((j) => (
        <li key={j.id} className="border-t border-line first:border-t-0">
          <Link href="/journal" className="-mx-3 flex gap-3 rounded-[14px] px-3 py-4 hover:bg-surface-strong/50">
            <Dot e={j.emotion} size={12} className="mt-1.5" />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink-muted">
                <b className="font-semibold text-ink">{j.emotion ?? "Belum jelas"}</b>·
                <span>
                  {dayLabel(j.createdAt)}, {timeLabel(j.createdAt)}
                </span>
              </p>
              <p className="mt-0.5 line-clamp-2 text-ink-muted">{j.content}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
