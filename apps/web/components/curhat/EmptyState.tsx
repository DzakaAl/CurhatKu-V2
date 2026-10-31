import Link from "next/link";
import type { ReactNode } from "react";

/** Kosong = ajakan bertindak, bukan suasana. */
export default function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-clay-lg bg-surface p-6">
      <h2 className="text-h2 font-semibold">{title}</h2>
      <p className="max-w-[36ch] text-caption text-ink-muted">{body}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-2 inline-flex min-h-11 items-center rounded-full bg-invert px-5 text-[15px] font-semibold text-on-invert transition-transform active:scale-[0.97]"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
