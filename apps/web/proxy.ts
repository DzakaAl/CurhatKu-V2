import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth guard (pengganti middleware.ts di Next 16).
 * Hanya cek keberadaan refresh cookie httpOnly (ck_rt) — validasi sebenarnya
 * di API; access token kedaluwarsa diperbarui otomatis oleh client.
 * Cookie berlaku per-host, jadi cookie dari API localhost:8080 terbaca di :3000.
 */
const PUBLIC = ["/masuk", "/daftar", "/lupa", "/reset", "/verifikasi", "/dev"];
const GUEST_ONLY = ["/masuk", "/daftar"];

const match = (path: string, list: string[]) => list.some((p) => path === p || path.startsWith(p + "/"));

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has("ck_rt");

  if (!hasSession && !match(pathname, PUBLIC)) {
    const url = request.nextUrl.clone();
    url.pathname = "/masuk";
    url.search = pathname === "/" ? "" : `?lanjut=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (hasSession && match(pathname, GUEST_ONLY)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|ml/).*)"],
};
