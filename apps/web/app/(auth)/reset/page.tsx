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
      intro="Buat kata sandi yang belum pernah kamu pakai. Setelah disimpan, semua sesi lain akan keluar otomatis."
      endpoint="/auth/reset"
      submitLabel="Simpan dan masuk"
      extra={{ token }}
      fields={[
        { name: "password", label: "Kata sandi baru", type: "password", autoComplete: "new-password", placeholder: "Minimal 8 karakter" },
        { name: "password2", label: "Ulangi kata sandi", type: "password", autoComplete: "new-password", local: true },
      ]}
      validate={(v) => (v.password !== v.password2 ? { password2: "Kata sandi tidak sama." } : null)}
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
