"use client";

import { useState } from "react";
import AuthForm, { TextLink } from "@/components/auth/AuthForm";

export default function LupaPage() {
  const [sent, setSent] = useState<{ dev: string | null } | null>(null);

  if (sent) {
    return (
      <main className="flex flex-col gap-4">
        <h1 className="text-h1 font-extrabold leading-[0.95]">Cek emailmu</h1>
        <p className="text-body text-ink-muted">
          Jika email itu terdaftar, tautan untuk mengatur ulang kata sandi sudah dikirim. Tautan berlaku 1 jam.
        </p>
        {sent.dev ? (
          <p className="rounded-clay-md bg-surface p-4 text-caption">
            Mode pengembangan: <TextLink href={new URL(sent.dev).pathname + new URL(sent.dev).search}>buka tautan reset</TextLink>
          </p>
        ) : null}
        <TextLink href="/masuk">Kembali ke halaman masuk</TextLink>
      </main>
    );
  }

  return (
    <AuthForm
      title="Lupa kata sandi"
      intro="Masukkan email akunmu. Kami kirim tautan untuk membuat kata sandi baru."
      endpoint="/auth/forgot"
      submitLabel="Kirim tautan"
      fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }]}
      onDone={(body) => setSent({ dev: (body.devResetUrl as string | null) ?? null })}
      footer={<TextLink href="/masuk">Kembali ke halaman masuk</TextLink>}
    />
  );
}
