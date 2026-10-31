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
}) {
  const qc = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
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
    <main className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-h1 font-extrabold leading-[0.95]">{title}</h1>
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
            defaultValue={initial[f.name]}
            error={errors[f.name]}
            required
          />
        ))}
        {formError ? (
          <p role="alert" className="rounded-clay-md bg-mood-marah px-4 py-3 text-caption font-medium text-night">
            {formError}
          </p>
        ) : null}
        <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
          {pending ? "Memproses…" : submitLabel}
        </Button>
      </form>
      {footer ? <div className="text-caption text-ink-muted">{footer}</div> : null}
    </main>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-ink underline underline-offset-4">
      {children}
    </Link>
  );
}
