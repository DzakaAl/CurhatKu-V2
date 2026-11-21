"use client";

import { useEffect, useState } from "react";
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
          <span className="block text-[13.5px] font-semibold">Notifikasi push</span>
          <span className="block text-[13px] text-ink-muted">
            {state === "on" ? "Aktif di perangkat ini" : "Kabar sesi, balasan forum, dan pengingat mood harian"}
          </span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={state === "on"}
          aria-label="Notifikasi push"
          onClick={toggle}
          disabled={busy}
          className={
            "relative h-[26px] w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 " +
            (state === "on" ? "bg-invert" : "bg-line-strong")
          }
        >
          <span
            aria-hidden="true"
            className={"absolute left-[3px] top-[3px] h-5 w-5 rounded-full bg-surface shadow-sm transition-transform " + (state === "on" ? "translate-x-[18px]" : "")}
          />
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-caption font-medium text-danger">
          {error}
        </p>
      ) : null}
    </section>
  );
}
