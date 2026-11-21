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
    <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
      <span aria-hidden="true" className="flex gap-1.5">
        <i className="h-2.5 w-2.5 rounded-full bg-mood-senang" />
        <i className="h-2.5 w-2.5 rounded-full bg-mood-terkejut" />
        <i className="h-2.5 w-2.5 rounded-full bg-mood-percaya" />
      </span>
      <h2 className="text-[17px] font-semibold">{title}</h2>
      <p className="max-w-[38ch] text-ink-muted">{body}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-2 inline-flex min-h-10 items-center rounded-full bg-invert px-5 text-[13.5px] font-semibold text-on-invert hover:brightness-110"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
