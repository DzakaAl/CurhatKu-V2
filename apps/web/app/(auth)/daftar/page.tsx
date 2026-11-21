"use client";

import { useRouter } from "next/navigation";
import AuthForm, { TextLink } from "@/components/auth/AuthForm";

export default function DaftarPage() {
  const router = useRouter();
  return (
    <AuthForm
      title="Buat akun"
      intro="Gratis. Namamu tidak pernah tampil di forum, kamu akan mendapat nama samaran acak."
      endpoint="/auth/register"
      submitLabel="Daftar dan kirim kode"
      fields={[
        { name: "name", label: "Nama panggilan", autoComplete: "nickname", placeholder: "Contoh: Raka" },
        { name: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "nama@email.com" },
        {
          name: "password",
          label: "Kata sandi",
          type: "password",
          autoComplete: "new-password",
          placeholder: "Minimal 8 karakter",
          hint: "Pakai kombinasi huruf dan angka.",
        },
      ]}
      onDone={(body) => {
        const user = body.data as { email: string };
        const devCode = body.devVerifyCode as string | null;
        if (devCode) sessionStorage.setItem("ck_dev_code", devCode);
        router.replace(`/verifikasi?email=${encodeURIComponent(user.email)}`);
      }}
      footer={
        <span>
          Sudah punya akun? <TextLink href="/masuk">Masuk</TextLink>
        </span>
      }
    />
  );
}
