"use client";

import Link from "next/link";
import { useState } from "react";
import AuthForm, { TextLink } from "@/components/auth/AuthForm";
import { Icon } from "@/components/nav/icons";

const BackLink = () => (
  <Link href="/masuk" className="mb-6 inline-flex w-fit items-center gap-1 text-[13px] font-semibold text-invert hover:underline">
    <Icon name="back" className="h-4 w-4" />
    Kembali ke masuk
  </Link>
);

export default function LupaPage() {
  const [sent, setSent] = useState<{ dev: string | null } | null>(null);

  if (sent) {
    return (
      <main className="flex flex-col gap-4">
        <BackLink />
        <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-accent-soft text-invert">
          <Icon name="bell" />
        </span>
        <h1 className="text-[30px] font-semibold tracking-[-0.04em]">Cek emailmu</h1>
        <p className="text-ink-muted">Jika email itu terdaftar, tautan untuk membuat kata sandi baru sudah dikirim. Tautan berlaku 1 jam.</p>
        {sent.dev ? (
          <p className="rounded-[12px] bg-surface-strong p-4 text-caption">
            Mode pengembangan: <TextLink href={new URL(sent.dev).pathname + new URL(sent.dev).search}>buka tautan reset</TextLink>
          </p>
        ) : null}
      </main>
    );
  }

  return (
    <div>
      <BackLink />
      <AuthForm
        title="Lupa kata sandi"
        intro="Masukkan email akunmu. Kami kirim tautan untuk membuat kata sandi baru."
        endpoint="/auth/forgot"
        submitLabel="Kirim tautan"
        fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "nama@email.com" }]}
        onDone={(body) => setSent({ dev: (body.devResetUrl as string | null) ?? null })}
      />
    </div>
  );
}
