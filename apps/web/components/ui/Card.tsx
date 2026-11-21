import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

/** Kartu putih bergaris tipis — dipakai hemat, hanya untuk yang perlu menonjol. */
export default function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-clay-lg bg-surface p-5 shadow-[0_0_0_1px_var(--ck-line),0_8px_24px_-12px_rgba(20,28,56,.12)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
