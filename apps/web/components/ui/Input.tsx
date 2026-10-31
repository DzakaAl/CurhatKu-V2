import { forwardRef, useId } from "react";
import { FieldError } from "./States";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

/** Input mono: label eksplisit, latar abu, fokus = garis tinta. Tap ≥ 44px. */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className = "", id, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errId = error ? `${inputId}-err` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-caption font-medium text-ink-muted">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errId].filter(Boolean).join(" ") || undefined}
        className={
          "min-h-12 rounded-clay-md bg-surface px-4 py-3 text-body text-ink " +
          "placeholder:text-ink-muted/70 outline-none ring-ink transition-shadow focus-visible:ring-2 aria-[invalid]:ring-2 aria-[invalid]:ring-[#b42318] " +
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
