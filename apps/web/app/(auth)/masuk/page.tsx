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
      title="Masuk"
      intro="Lanjutkan curhatmu. Di forum kamu tetap tampil anonim."
      endpoint="/auth/login"
      submitLabel="Masuk"
      fields={[
        { name: "email", label: "Email", type: "email", autoComplete: "email" },
        { name: "password", label: "Kata sandi", type: "password", autoComplete: "current-password" },
      ]}
      onDone={() => router.replace(target)}
      footer={
        <div className="flex flex-col gap-3">
          <span>
            Belum punya akun? <TextLink href="/daftar">Daftar</TextLink>
          </span>
          <TextLink href="/lupa">Lupa kata sandi?</TextLink>
        </div>
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
