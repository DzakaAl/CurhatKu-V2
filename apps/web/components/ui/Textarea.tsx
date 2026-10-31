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
      <label htmlFor={tid} className="text-caption font-medium text-ink-muted">
        {label}
      </label>
      <textarea
        ref={ref}
        id={tid}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${tid}-err` : undefined}
        className={
          "min-h-28 resize-y rounded-clay-md bg-surface px-4 py-3 text-body leading-relaxed text-ink outline-none ring-ink " +
          "placeholder:text-ink-muted/70 focus-visible:ring-2 aria-[invalid]:ring-2 aria-[invalid]:ring-[#b42318] " +
          className
        }
        {...props}
      />
      <FieldError id={`${tid}-err`}>{error}</FieldError>
    </div>
  );
});

export default Textarea;
