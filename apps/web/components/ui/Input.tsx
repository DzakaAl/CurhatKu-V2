import { forwardRef, useId } from "react";
import { FieldError } from "./States";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  labelRight?: React.ReactNode;
  hint?: string;
  error?: string;
};

/** Input mono: label eksplisit, latar abu, fokus = garis tinta. Tap ≥ 44px. */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, labelRight, hint, error, className = "", id, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errId = error ? `${inputId}-err` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="text-[12.5px] font-semibold text-ink-soft">
          {label}
        </label>
        {labelRight}
      </span>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errId].filter(Boolean).join(" ") || undefined}
        className={
          "min-h-12 rounded-[12px] border border-line-strong bg-surface px-4 py-3 text-body text-ink " +
          "placeholder:text-ink-muted/70 outline-none transition-shadow focus:border-invert focus:ring-[3px] focus:ring-accent-soft aria-[invalid]:border-danger " +
          className
        }
        {...props}
      />
      {hint ? (
        <span id={hintId} className="text-label text-ink-muted">
          {hint}
        </span>
      ) : null}
      <FieldError id={`${inputId}-err`}>{error}</FieldError>
    </div>
  );
});

export default Input;
