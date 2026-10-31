"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { ErrorBox, Skeleton } from "@/components/ui/States";
import { useLogout, useMe, useUpdateProfile } from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";

/** Profil: identitas samaran, edit profil, pintasan, keluar. */
export default function ProfilPage() {
  const me = useMe();
  const update = useUpdateProfile();
  const logout = useLogout();
  const [editing, setEditing] = useState(false);

  if (me.isPending) return <Skeleton rows={2} />;
  if (me.isError) return <ErrorBox error={me.error} onRetry={() => me.refetch()} />;
  const u = me.data;
  const fields = update.error instanceof ApiError ? update.error.fields ?? {} : {};

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    update.mutate(
      { name: String(f.get("name")), bio: String(f.get("bio")), avatarUrl: String(f.get("avatarUrl")) },
      { onSuccess: () => setEditing(false) }
    );
  }

  const links = [
    { href: "/konsultasi", title: "Konsultasi psikolog", body: "Sesi dan jadwalmu" },
    { href: "/notifikasi", title: "Notifikasi", body: "Balasan forum & kabar sesi" },
    ...(u.role === "admin" ? [{ href: "/admin", title: "Panel admin", body: "Verifikasi pembayaran, terbitkan artikel" }] : []),
  ];

  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-h1 font-extrabold">Profil</h1>

      <section className="flex items-center gap-4 rounded-clay-lg bg-invert p-5 text-on-invert">
        <span
          aria-hidden="true"
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-mood-takut text-h3 font-extrabold text-night"
        >
          {u.anonHandle.charAt(0)}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-h3 font-semibold tracking-[-0.02em]">{u.name}</h2>
          <p className="text-caption text-on-invert-muted">Di forum kamu tampil sebagai {u.anonHandle}</p>
        </div>
      </section>

      {!u.emailVerified ? (
        <p className="rounded-clay-md bg-mood-waspada px-4 py-3 text-caption font-medium text-night">
          Email {u.email} belum diverifikasi. Cek kotak masukmu untuk tautan verifikasi.
        </p>
      ) : null}

      {editing ? (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Input name="name" label="Nama panggilan" defaultValue={u.name} required error={fields.name} />
          <Textarea name="bio" label="Bio (opsional)" defaultValue={u.bio ?? ""} rows={3} maxLength={500} error={fields.bio} />
          <Input name="avatarUrl" label="URL foto (opsional)" type="url" defaultValue={u.avatarUrl ?? ""} error={fields.avatarUrl} />
          <div className="flex gap-2">
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? "Menyimpan…" : "Simpan profil"}
            </Button>
            <Button type="button" variant="surface" onClick={() => setEditing(false)}>
              Batal
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          {u.bio ? <p className="leading-relaxed">{u.bio}</p> : null}
          <Button variant="surface" className="self-start" onClick={() => setEditing(true)}>
            Ubah profil
          </Button>
        </div>
      )}

      <ul className="flex flex-col divide-y divide-line border-y border-line">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="flex items-center justify-between gap-4 py-4 hover:underline hover:underline-offset-4">
              <span>
                <span className="block font-semibold">{l.title}</span>
                <span className="block text-caption text-ink-muted">{l.body}</span>
              </span>
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>

      <Button variant="ghost" className="self-start" onClick={() => logout.mutate()} disabled={logout.isPending}>
        Keluar
      </Button>
    </main>
  );
}
