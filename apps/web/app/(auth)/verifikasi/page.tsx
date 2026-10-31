"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api/client";

function Verify() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<"loading" | "ok" | { error: string }>("loading");

  useEffect(() => {
    apiFetch("/auth/verify", { method: "POST", body: { token } })
      .then(() => setState("ok"))
      .catch((e) => setState({ error: e instanceof ApiError ? e.message : "Verifikasi gagal." }));
  }, [token]);

  return (
    <main className="flex flex-col gap-4" aria-live="polite">
      <h1 className="text-h1 font-extrabold leading-[0.95]">
        {state === "loading" ? "Memverifikasi…" : state === "ok" ? "Email terverifikasi" : "Verifikasi gagal"}
      </h1>
      {typeof state === "object" ? <p className="text-body text-ink-muted">{state.error}</p> : null}
      {state !== "loading" ? (
        <Link
          href="/dashboard"
          className="inline-flex min-h-12 w-fit items-center rounded-full bg-invert px-6 font-semibold text-on-invert"
        >
          Ke beranda
        </Link>
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
