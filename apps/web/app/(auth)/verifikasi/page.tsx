"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { Icon } from "@/components/nav/icons";
import Button from "@/components/ui/Button";
import { apiFetch, apiFetchRaw, ApiError } from "@/lib/api/client";

const LEN = 6;

function Verify() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const linkToken = params.get("token") ?? "";
  const [digits, setDigits] = useState<string[]>(Array(LEN).fill(""));
  const [state, setState] = useState<"idle" | "loading" | "ok" | { error: string }>(linkToken ? "loading" : "idle");
  const [info, setInfo] = useState(() => {
    const dev = typeof window === "undefined" ? null : sessionStorage.getItem("ck_dev_code");
    return dev ? `Mode pengembangan: kodenya ${dev}` : "";
  });
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function request(code: string) {
    return apiFetch("/auth/verify", { method: "POST", body: email ? { email, code } : { token: code } }).then(
      () => {
        setState("ok");
        setTimeout(() => router.replace("/dashboard"), 900);
      },
      (e) => setState({ error: e instanceof ApiError ? e.message : "Verifikasi gagal. Coba lagi." })
    );
  }

  function verify(code: string) {
    setState("loading");
    request(code);
  }

  // Dari tautan email: verifikasi otomatis.
  useEffect(() => {
    if (linkToken) request(linkToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hanya sekali saat halaman dibuka
  }, []);

  function setAt(i: number, v: string) {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < LEN - 1) refs.current[i + 1]?.focus();
  }

  function onKey(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LEN);
    if (!p) return;
    e.preventDefault();
    setDigits(Array.from({ length: LEN }, (_, i) => p[i] ?? ""));
    refs.current[Math.min(p.length, LEN - 1)]?.focus();
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length === LEN) verify(code);
  }

  async function resend() {
    setInfo("");
    try {
      const body = await apiFetchRaw<{ devVerifyCode?: string | null }>("/auth/resend-verify", { method: "POST" });
      setInfo(body.devVerifyCode ? `Kode baru dikirim. Mode pengembangan: ${body.devVerifyCode}` : "Kode baru sudah dikirim ke emailmu.");
    } catch (e) {
      setInfo(e instanceof ApiError ? e.message : "Gagal mengirim ulang. Coba lagi.");
    }
  }

  if (linkToken || state === "ok") {
    return (
      <main className="flex flex-col gap-4" aria-live="polite">
        <h1 className="text-[30px] font-semibold tracking-[-0.04em]">
          {state === "loading" ? "Memverifikasi…" : state === "ok" ? "Email terverifikasi" : "Verifikasi gagal"}
        </h1>
        {typeof state === "object" ? <p className="text-ink-muted">{state.error}</p> : null}
        {state === "ok" ? <p className="text-ink-muted">Mengarahkan ke beranda…</p> : null}
        {typeof state === "object" ? (
          <Link href="/dashboard" className="inline-flex min-h-11 w-fit items-center rounded-full bg-invert px-5 text-[14px] font-semibold text-on-invert hover:brightness-110">
            Ke beranda
          </Link>
        ) : null}
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-accent-soft text-invert">
          <Icon name="bell" />
        </span>
        <h1 className="text-[30px] font-semibold tracking-[-0.04em]">Cek emailmu</h1>
        <p className="text-ink-muted">
          Kami mengirim 6 digit kode ke {email ? <b className="font-semibold text-ink">{email}</b> : "emailmu"}. Masukkan kodenya di bawah.
        </p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div role="group" aria-label="Kode verifikasi" className="grid grid-cols-6 gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={d}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              onPaste={onPaste}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              aria-label={`Digit ${i + 1}`}
              className="h-14 min-w-0 rounded-[12px] border border-line-strong bg-surface text-center font-mono text-[20px] outline-none focus:border-invert focus:ring-[3px] focus:ring-accent-soft"
            />
          ))}
        </div>
        {typeof state === "object" ? (
          <p role="alert" className="rounded-[12px] bg-danger-soft px-4 py-3 text-caption font-medium text-danger">
            {state.error}
          </p>
        ) : null}
        <Button type="submit" size="lg" className="min-h-12 w-full" disabled={digits.join("").length < LEN || state === "loading"}>
          {state === "loading" ? "Memverifikasi…" : "Verifikasi"}
        </Button>
      </form>
      <p className="text-center text-[13.5px] text-ink-muted">
        Belum menerima?{" "}
        <button type="button" onClick={resend} className="font-semibold text-invert hover:underline">
          Kirim ulang
        </button>{" "}
        ·{" "}
        <Link href="/dashboard" className="font-semibold text-invert hover:underline">
          Nanti saja
        </Link>
      </p>
      {info ? (
        <p aria-live="polite" className="rounded-[12px] bg-surface-strong px-4 py-3 text-center text-caption">
          {info}
        </p>
      ) : null}
    </main>
  );
}

export default function VerifikasiPage() {
  return (
    <Suspense>
      <Verify />
    </Suspense>
  );
}
