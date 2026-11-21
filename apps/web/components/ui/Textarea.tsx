import { forwardRef, useId } from "react";
import { FieldError } from "./States";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

/** Textarea mono dengan label & error terhubung (aria-describedby). */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className = "", id, ...props },
  ref
) {
  const autoId = useId();
  const tid = id ?? autoId;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={tid} className="text-[12.5px] font-semibold text-ink-soft">
        {label}
      </label>
      <textarea
        ref={ref}
        id={tid}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${tid}-err` : undefined}
        className={
          "min-h-28 resize-y rounded-[12px] border border-line-strong bg-surface px-4 py-3 text-body leading-relaxed text-ink outline-none " +
          "placeholder:text-ink-muted/70 focus:border-invert focus:ring-[3px] focus:ring-accent-soft aria-[invalid]:border-danger " +
          className
        }
        {...props}
      />
      <FieldError id={`${tid}-err`}>{error}</FieldError>
    </div>
  );
});

export default Textarea;
