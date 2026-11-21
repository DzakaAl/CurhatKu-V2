"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { apiFetchRaw, ApiError } from "@/lib/api/client";

type FieldDef = {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  hint?: string;
  placeholder?: string;
  labelRight?: ReactNode;
  /** Hanya untuk validasi di klien, tidak dikirim ke API. */
  local?: boolean;
};

/**
 * Form auth generik: kirim JSON ke endpoint, tampilkan error per-field,
 * lalu jalankan onDone dengan body respons.
 */
export default function AuthForm({
  title,
  intro,
  fields,
  endpoint,
  submitLabel,
  extra,
  footer,
  onDone,
  initial = {},
  validate,
}: {
  title: string;
  intro?: ReactNode;
  fields: FieldDef[];
  endpoint: string;
  submitLabel: string;
  extra?: Record<string, string>;
  footer?: ReactNode;
  onDone: (body: Record<string, unknown>) => void;
  initial?: Record<string, string>;
  validate?: (values: Record<string, string>) => Record<string, string> | null;
}) {
  const qc = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const localErr = validate?.(values);
    if (localErr) {
      setErrors(localErr);
      setFormError("");
      return;
    }
    fields.filter((f) => f.local).forEach((f) => delete values[f.name]);
    setPending(true);
    setErrors({});
    setFormError("");
    try {
      const body = await apiFetchRaw<Record<string, unknown>>(endpoint, {
        method: "POST",
        body: { ...values, ...extra },
      });
      qc.removeQueries({ queryKey: ["me"] });
      onDone(body);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields ?? {});
        setFormError(err.fields ? "" : err.message);
      } else {
        setFormError("Tidak bisa terhubung ke server. Coba lagi.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <h1 className="text-[30px] font-semibold tracking-[-0.04em]">{title}</h1>
        {intro ? <p className="text-body text-ink-muted">{intro}</p> : null}
      </div>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        {fields.map((f) => (
          <Input
            key={f.name}
            name={f.name}
            label={f.label}
            type={f.type ?? "text"}
            autoComplete={f.autoComplete}
            hint={f.hint}
            placeholder={f.placeholder}
            labelRight={f.labelRight}
            defaultValue={initial[f.name]}
            error={errors[f.name]}
            required
          />
        ))}
        {formError ? (
          <p role="alert" className="rounded-[12px] bg-danger-soft px-4 py-3 text-caption font-medium text-danger">
            {formError}
          </p>
        ) : null}
        <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full min-h-12">
          {pending ? "Memproses…" : submitLabel}
        </Button>
      </form>
      {footer ? <div className="text-center text-[13.5px] text-ink-muted">{footer}</div> : null}
    </main>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-invert hover:underline hover:underline-offset-4">
      {children}
    </Link>
  );
}
