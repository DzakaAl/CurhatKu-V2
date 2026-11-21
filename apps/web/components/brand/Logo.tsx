/** Tanda CurhatKu: gelembung curhat dengan tiga titik warna emosi (sedang mengetik). */
export function LogoMark({ size = 30, fill = "var(--ck-invert)" }: { size?: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="block shrink-0">
      <path
        d="M16 3.5C8.8 3.5 3 8.7 3 15.2c0 3.1 1.3 5.9 3.5 8L5.2 28.6l6.1-2.5c1.5.4 3 .6 4.7.6 7.2 0 13-5.2 13-11.5S23.2 3.5 16 3.5z"
        fill={fill}
      />
      <circle cx="10.6" cy="15.2" r="2.4" fill="var(--ck-mood-senang)" />
      <circle cx="16" cy="15.2" r="2.4" fill="var(--ck-mood-terkejut)" />
      <circle cx="21.4" cy="15.2" r="2.4" fill="var(--ck-mood-percaya)" />
    </svg>
  );
}

/** Logo + nama "curhatku" (huruf kecil, "ku" beraksen). */
export function Wordmark({ size = 30, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-semibold tracking-[-0.035em] ${className}`} style={{ fontSize: size * 0.6 }}>
      <LogoMark size={size} />
      <span>
        curhat<span className="text-invert">ku</span>
      </span>
    </span>
  );
}
