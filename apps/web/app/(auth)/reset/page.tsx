"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  return (
    <AuthForm
      title="Kata sandi baru"
      intro="Setelah disimpan, semua sesi lain akan keluar otomatis."
      endpoint="/auth/reset"
      submitLabel="Simpan kata sandi"
      extra={{ token }}
      fields={[
        { name: "password", label: "Kata sandi baru", type: "password", autoComplete: "new-password", hint: "Minimal 8 karakter." },
      ]}
      onDone={() => router.replace("/masuk")}
    />
  );
}

export default function ResetPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
