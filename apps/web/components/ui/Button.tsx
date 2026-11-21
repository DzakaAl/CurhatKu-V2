import { forwardRef } from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "surface" | "ghost";
  size?: "md" | "lg";
};

/** Tombol pil: biru (primary), garis (surface), atau teks (ghost). Tap ≥ 44px. */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className = "", children, ...props },
  ref
) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold text-[14px] " +
    "min-h-11 px-5 select-none transition-[transform,background-color,opacity,filter] duration-150 " +
    "active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100";

  const variants = {
    primary: "bg-invert text-on-invert hover:brightness-110",
    surface: "bg-transparent text-ink border border-line-strong hover:bg-surface-strong",
    ghost: "bg-transparent text-ink-muted hover:bg-surface-strong hover:text-ink",
  } as const;

  const sizes = { md: "", lg: "min-h-12 px-6 text-[15px]" } as const;

  return (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
