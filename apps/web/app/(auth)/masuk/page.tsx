"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AuthForm, { TextLink } from "@/components/auth/AuthForm";

function MasukForm() {
  const router = useRouter();
  const next = useSearchParams().get("lanjut");
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  return (
    <AuthForm
      title="Selamat datang lagi"
      intro="Masuk untuk melanjutkan curhatmu. Di forum kamu tetap tampil dengan nama samaran."
      endpoint="/auth/login"
      submitLabel="Masuk"
      fields={[
        { name: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "nama@email.com" },
        {
          name: "password",
          label: "Kata sandi",
          type: "password",
          autoComplete: "current-password",
          placeholder: "Minimal 8 karakter",
          labelRight: <TextLink href="/lupa">Lupa kata sandi?</TextLink>,
        },
      ]}
      onDone={() => router.replace(target)}
      footer={
        <span>
          Belum punya akun? <TextLink href="/daftar">Daftar gratis</TextLink>
        </span>
      }
    />
  );
}

export default function MasukPage() {
  return (
    <Suspense>
      <MasukForm />
    </Suspense>
  );
}
