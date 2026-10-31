"use client";

import { useRouter } from "next/navigation";
import AuthForm, { TextLink } from "@/components/auth/AuthForm";

export default function DaftarPage() {
  const router = useRouter();
  return (
    <AuthForm
      title="Buat akun"
      intro="Namamu tidak pernah tampil di forum. Kamu akan mendapat nama samaran acak."
      endpoint="/auth/register"
      submitLabel="Daftar"
      fields={[
        { name: "name", label: "Nama panggilan", autoComplete: "nickname" },
        { name: "email", label: "Email", type: "email", autoComplete: "email" },
        {
          name: "password",
          label: "Kata sandi",
          type: "password",
          autoComplete: "new-password",
          hint: "Minimal 8 karakter.",
        },
      ]}
      onDone={(body) => {
        const dev = body.devVerifyUrl as string | null;
        if (dev) console.info("[dev] Tautan verifikasi:", dev);
        router.replace("/dashboard");
      }}
      footer={
        <span>
          Sudah punya akun? <TextLink href="/masuk">Masuk</TextLink>
        </span>
      }
    />
  );
}
