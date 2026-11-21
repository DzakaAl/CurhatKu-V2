"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import PushToggle from "@/components/nav/PushToggle";
import { Icon, type IconName } from "@/components/nav/icons";
import { ErrorBox, PageHeader, SectionHead, Skeleton } from "@/components/ui/States";
import { useLogout, useMe, useUpdateProfile } from "@/lib/api/hooks";
import { ApiError } from "@/lib/api/client";

/** Profil: identitas, nama samaran, pengingat, pintasan, keluar. */
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

  const links: { href: string; icon: IconName; title: string; body: string }[] = [
    { href: "/notifikasi", icon: "bell", title: "Notifikasi", body: "Balasan forum dan kabar sesi" },
    { href: "/konsultasi", icon: "heart", title: "Sesi konsultasi", body: "Jadwal dan pembayaranmu" },
    { href: "/journal", icon: "book", title: "Jurnal", body: "Semua curhat yang pernah kamu tulis" },
    { href: "/peta", icon: "search", title: "Peta layar", body: "Semua halaman dan alur di CurhatKu" },
    ...(u.role === "admin" ? [{ href: "/admin", icon: "shield" as IconName, title: "Panel admin", body: "Verifikasi pembayaran, terbitkan artikel" }] : []),
  ];

  return (
    <main className="flex flex-col gap-6">
      <PageHeader title="Profil" />

      {editing ? (
        <form onSubmit={submit} className="flex flex-col gap-4 border-t border-line pt-5">
          <Input name="name" label="Nama panggilan" defaultValue={u.name} required error={fields.name} />
          <Textarea name="bio" label="Bio (opsional)" defaultValue={u.bio ?? ""} rows={3} maxLength={500} error={fields.bio} />
          <Input name="avatarUrl" label="URL foto (opsional)" type="url" defaultValue={u.avatarUrl ?? ""} error={fields.avatarUrl} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? "Menyimpan…" : "Simpan profil"}
            </Button>
          </div>
        </form>
      ) : (
        <section className="glow flex flex-col gap-5 rounded-clay-xl bg-surface p-6 shadow-[0_0_0_1px_var(--ck-line)]">
          <div className="flex items-start gap-4">
            <span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-surface-strong text-[20px] font-bold">
              {u.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[22px] font-semibold tracking-[-0.035em]">{u.name}</h2>
              <p className="text-[13px] text-ink-muted">{u.email}</p>
              {u.bio ? <p className="mt-2 text-ink-soft">{u.bio}</p> : null}
            </div>
            <Button variant="surface" className="min-h-9 px-3.5 text-[12.5px]" onClick={() => setEditing(true)}>
              <Icon name="pen" className="h-4 w-4" />
              Ubah
            </Button>
          </div>
          <div className="flex items-center gap-3 border-t border-line pt-4">
            <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-accent-soft text-invert">
              <Icon name="eye" />
            </span>
            <div className="min-w-0">
              <b className="block text-[13.5px] font-semibold">Nama samaran di forum</b>
              <span className="font-mono text-[12.5px] text-ink-muted">{u.anonHandle}</span>
            </div>
          </div>
        </section>
      )}

      {!u.emailVerified ? (
        <p className="rounded-[12px] bg-warn-soft px-4 py-3 text-caption font-medium">
          Email {u.email} belum diverifikasi. Cek kotak masukmu untuk tautan verifikasi.
        </p>
      ) : null}

      <section className="flex flex-col gap-4">
        <SectionHead title="Pengingat" />
        <PushToggle />
      </section>

      <ul className="border-y border-line">
        {links.map((l) => (
          <li key={l.href} className="border-t border-line first:border-t-0">
            <Link href={l.href} className="-mx-3 flex items-center gap-3 rounded-[14px] px-3 py-3.5 hover:bg-surface-strong/50">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-surface-strong text-ink-soft">
                <Icon name={l.icon} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{l.title}</span>
                <span className="block text-[13px] text-ink-muted">{l.body}</span>
              </span>
              <Icon name="chev" className="h-[18px] w-[18px] text-ink-muted/60" />
            </Link>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="inline-flex min-h-10 items-center gap-2 self-start rounded-full px-3 text-[14px] font-semibold text-danger hover:bg-danger-soft"
      >
        <Icon name="back" className="h-4 w-4" />
        {logout.isPending ? "Keluar…" : "Keluar"}
      </button>
    </main>
  );
}
