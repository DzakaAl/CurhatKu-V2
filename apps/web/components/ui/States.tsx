import type { ReactNode } from "react";
import { ApiError } from "@/lib/api/client";

/** Kerangka abu berdenyut — bentuknya meniru konten yang akan datang. */
export function Skeleton({ rows = 3, className = "" }: { rows?: number; className?: string }) {
  return (
    <div role="status" aria-label="Memuat" className={`flex flex-col gap-3 ${className}`}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-clay-lg bg-surface-strong" />
      ))}
    </div>
  );
}

/** Error = apa yang salah + cara memperbaikinya. */
export function ErrorBox({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const msg = error instanceof ApiError ? error.message : "Terjadi kesalahan. Coba lagi.";
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-clay-md bg-danger-soft p-4 text-ink">
      <p className="font-medium">{msg}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="min-h-10 rounded-full border border-line-strong px-4 text-[13.5px] font-semibold hover:bg-surface-strong"
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
    <p id={id} className="text-caption font-medium text-danger">
      {children}
    </p>
  );
}

/** Judul halaman. Tombol kembali ada di topbar, jadi `back` hanya untuk kompatibilitas. */
export function PageHeader({
  title,
  action,
  subtitle,
}: {
  title: string;
  back?: string;
  action?: ReactNode;
  subtitle?: string;
}) {
  return (
    <header className="mb-2 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[clamp(26px,3vw,32px)] font-semibold tracking-[-0.04em]">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-[56ch] text-ink-muted">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}

/** Judul kecil sebuah bagian + tautan opsional di kanan. */
export function SectionHead({ title, id, right }: { title: string; id?: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
      <h2 id={id} className="text-[13px] font-semibold tracking-[-0.005em] text-ink">
        {title}
      </h2>
      {right}
    </div>
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
