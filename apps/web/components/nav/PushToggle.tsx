"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { currentSubscription, disablePush, enablePush, pushSupported } from "@/lib/push";

/** Toggle notifikasi push di perangkat ini. Fallback: lonceng in-app tetap jalan. */
export default function PushToggle() {
  const [state, setState] = useState<"loading" | "on" | "off" | "unsupported">("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    currentSubscription().then(
      (s) => setState(!pushSupported() ? "unsupported" : s ? "on" : "off"),
      () => setState("off")
    );
  }, []);

  if (state === "loading" || state === "unsupported") return null;

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      if (state === "on") {
        await disablePush();
        setState("off");
      } else {
        await enablePush();
        setState("on");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengubah notifikasi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <span>
          <span className="block font-semibold">Notifikasi push</span>
          <span className="block text-caption text-ink-muted">
            {state === "on" ? "Aktif di perangkat ini" : "Kabar sesi, balasan forum & pengingat mood"}
          </span>
        </span>
        <Button variant="surface" onClick={toggle} disabled={busy} aria-pressed={state === "on"}>
          {busy ? "…" : state === "on" ? "Matikan" : "Aktifkan"}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-caption font-medium text-[#b42318]">
          {error}
        </p>
      ) : null}
    </section>
  );
}
