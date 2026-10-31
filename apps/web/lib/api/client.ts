/**
 * HTTP client FE ↔ CI4 REST API. Sesi = cookie httpOnly (ck_at + ck_rt).
 * 401 → coba /auth/refresh sekali (rotasi), lalu ulangi request.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message);
  }
}

type FetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

let refreshing: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshing ??= fetch(`${API_BASE_URL}/api/auth/refresh`, { method: "POST", credentials: "include" })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function raw(path: string, options: FetchOptions): Promise<Response> {
  const { body, headers, ...rest } = options;
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  return fetch(`${API_BASE_URL}/api${path}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body !== undefined && !isForm ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    ...rest,
  });
}

/** Mengembalikan isi `data` dari respons JSON API. */
export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  let res: Response;
  try {
    res = await raw(path, options);
    if (res.status === 401 && !path.startsWith("/auth/") && (await refreshSession())) {
      res = await raw(path, options);
    }
  } catch {
    throw new ApiError(0, "Tidak bisa terhubung ke server. Periksa koneksimu lalu coba lagi.");
  }

  let json: { data?: T; message?: string; fields?: Record<string, string> } = {};
  try {
    json = await res.json();
  } catch {
    /* respons kosong / non-JSON */
  }

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined" && !path.startsWith("/auth/")) {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- reload penuh agar cache sesi lama bersih
      window.location.assign(`/masuk?lanjut=${encodeURIComponent(location.pathname)}`);
    }
    throw new ApiError(res.status, json.message ?? `Terjadi kesalahan (${res.status}).`, json.fields);
  }
  return json.data as T;
}

/** Versi yang mengembalikan seluruh body (untuk field di luar `data`). */
export async function apiFetchRaw<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const res = await raw(path, options);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, json.message ?? `Terjadi kesalahan (${res.status}).`, json.fields);
  return json as T;
}

export const apiUrl = (path: string) => `${API_BASE_URL}/api${path}`;
