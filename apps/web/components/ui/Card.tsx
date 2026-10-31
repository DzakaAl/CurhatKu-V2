import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

/** Panel datar abu — hierarki dari warna latar, bukan bayangan. */
export default function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div className={`rounded-clay-lg bg-surface p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}
