import Link from "next/link";
import type { ReactNode } from "react";
import { ApiError } from "@/lib/api/client";

/** Kerangka abu berdenyut — bentuknya meniru konten yang akan datang. */
export function Skeleton({ rows = 3, className = "" }: { rows?: number; className?: string }) {
  return (
    <div role="status" aria-label="Memuat" className={`flex flex-col gap-3 ${className}`}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-clay-lg bg-surface" />
      ))}
    </div>
  );
}

/** Error = apa yang salah + cara memperbaikinya. */
export function ErrorBox({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const msg = error instanceof ApiError ? error.message : "Terjadi kesalahan. Coba lagi.";
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-clay-lg bg-mood-marah p-5 text-night">
      <p className="font-medium">{msg}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 rounded-full bg-night px-5 text-[15px] font-semibold text-night-ink"
        >
          Coba lagi
        </button>
      ) : null}
    </div>
  );
}

export function FieldError({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className="text-caption font-medium text-[#b42318] dark:text-mood-marah">
      {children}
    </p>
  );
}

/** Judul halaman + tombol kembali opsional. */
export function PageHeader({
  title,
  back,
  action,
  subtitle,
}: {
  title: string;
  back?: string;
  action?: ReactNode;
  subtitle?: string;
}) {
  return (
    <header className="flex flex-col gap-4">
      {back ? (
        <Link
          href={back}
          className="-ml-2 inline-flex min-h-11 w-fit items-center gap-1 rounded-full px-2 text-caption font-medium text-ink-muted hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          Kembali
        </Link>
      ) : null}
      <div className="flex items-end justify-between gap-4">
        <h1 className="min-w-0 text-h1 font-extrabold">{title}</h1>
        {action}
      </div>
      {subtitle ? <p className="-mt-2 max-w-[38ch] text-caption text-ink-muted">{subtitle}</p> : null}
    </header>
  );
}

export const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const REL = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });

/** "2 jam yang lalu" — format waktu SQL (zona server = Asia/Jakarta). */
export function timeAgo(sql: string): string {
  const t = new Date(sql.replace(" ", "T") + "+07:00").getTime();
  const s = Math.round((t - Date.now()) / 1000);
  const abs = Math.abs(s);
  if (abs < 60) return "baru saja";
  if (abs < 3600) return REL.format(Math.round(s / 60), "minute");
  if (abs < 86400) return REL.format(Math.round(s / 3600), "hour");
  return REL.format(Math.round(s / 86400), "day");
}

export function formatSlot(sql: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(sql.replace(" ", "T") + "+07:00"));
}
