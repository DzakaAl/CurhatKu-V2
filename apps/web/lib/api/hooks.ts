"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiFetchRaw } from "./client";
import type {
  Article,
  Booking,
  Category,
  Dashboard,
  Journal,
  Message,
  Notification,
  Psychologist,
  Thread,
  User,
} from "./types";
import type { Emotion } from "@/lib/ml/emotions";

/* ---------- M1 Auth ---------- */

export const useMe = () =>
  useQuery({ queryKey: ["me"], queryFn: () => apiFetch<User>("/me"), retry: false });

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: { name: string; bio: string; avatarUrl: string }) =>
      apiFetch<User>("/me", { method: "PUT", body: b }),
    onSuccess: (u) => qc.setQueryData(["me"], u),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<boolean>("/auth/logout", { method: "POST" }),
    onSettled: () => {
      qc.clear();
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- reload penuh agar cache sesi lama bersih
      window.location.assign("/masuk");
    },
  });
}

/* ---------- M2/M3 Mood & Journal ---------- */

export const useDashboard = () =>
  useQuery({ queryKey: ["dashboard"], queryFn: () => apiFetch<Dashboard>("/dashboard") });

export function useCheckin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (emotion: Emotion) => apiFetch("/moods", { method: "POST", body: { emotion } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboard"] }),
  });
}

export const useJournals = () =>
  useQuery({ queryKey: ["journals"], queryFn: () => apiFetch<Journal[]>("/journals") });

export type JournalInput = Pick<Journal, "content" | "emotion" | "confidence" | "emotion2" | "confidence2">;

export function useSaveJournal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...b }: JournalInput & { id?: number }) =>
      apiFetch<Journal>(id ? `/journals/${id}` : "/journals", { method: id ? "PUT" : "POST", body: b }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journals"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteJournal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch(`/journals/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journals"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/* ---------- M4 Forum ---------- */

export const useCategories = () =>
  useQuery({ queryKey: ["categories"], queryFn: () => apiFetch<Category[]>("/forum/categories"), staleTime: Infinity });

export const useThreads = (category?: string) =>
  useQuery({
    queryKey: ["threads", category ?? "all"],
    queryFn: () => apiFetch<Thread[]>(`/forum/threads${category ? `?category=${category}` : ""}`),
  });

export const useThread = (id: number) =>
  useQuery({ queryKey: ["thread", id], queryFn: () => apiFetch<Thread>(`/forum/threads/${id}`) });

export function useCreateThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: { categoryId: number; title: string; body: string }) =>
      apiFetch<Thread>("/forum/threads", { method: "POST", body: b }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["threads"] }),
  });
}

export function useReply(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => apiFetch<Thread>(`/forum/threads/${id}/replies`, { method: "POST", body: { body } }),
    onSuccess: (t) => {
      qc.setQueryData(["thread", id], t);
      qc.invalidateQueries({ queryKey: ["threads"] });
    },
  });
}

export function useLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<{ liked: boolean; likesCount: number }>(`/forum/threads/${id}/like`, { method: "POST" }),
    onSuccess: (r, id) => {
      qc.setQueryData<Thread>(["thread", id], (t) => (t ? { ...t, ...r } : t));
      qc.setQueriesData<Thread[]>({ queryKey: ["threads"] }, (list) =>
        list?.map((t) => (t.id === id ? { ...t, ...r } : t))
      );
    },
  });
}

export function useDeleteThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch(`/forum/threads/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["threads"] }),
  });
}

/* ---------- M5 Artikel ---------- */

export const useArticles = () =>
  useQuery({ queryKey: ["articles"], queryFn: () => apiFetch<Article[]>("/articles") });

export const useArticle = (slug: string) =>
  useQuery({ queryKey: ["article", slug], queryFn: () => apiFetch<Article>(`/articles/${slug}`) });

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch(`/articles/${id}/read`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["articles"] }),
  });
}

export function usePublishArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: { title: string; excerpt: string; body: string }) =>
      apiFetch<Article>("/admin/articles", { method: "POST", body: b }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["articles"] }),
  });
}

/* ---------- M6 Konsultasi ---------- */

export const usePsychologists = () =>
  useQuery({ queryKey: ["psychologists"], queryFn: () => apiFetch<Psychologist[]>("/psychologists") });

export const usePsychologist = (id: number) =>
  useQuery({ queryKey: ["psychologist", id], queryFn: () => apiFetch<Psychologist>(`/psychologists/${id}`) });

export const useBookings = () =>
  useQuery({ queryKey: ["bookings"], queryFn: () => apiFetch<Booking[]>("/bookings") });

export const useBooking = (id: number) =>
  useQuery({ queryKey: ["booking", id], queryFn: () => apiFetch<Booking>(`/bookings/${id}`) });

export function useBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slotId: number) => apiFetch<Booking>("/bookings", { method: "POST", body: { slotId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["psychologist"] });
    },
  });
}

export function useUploadProof(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("proof", file);
      return apiFetch<Booking>(`/bookings/${id}/proof`, { method: "POST", body: fd });
    },
    onSuccess: (b) => {
      qc.setQueryData(["booking", id], b);
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useCancelBooking(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<Booking>(`/bookings/${id}/cancel`, { method: "POST" }),
    onSuccess: (b) => {
      qc.setQueryData(["booking", id], b);
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export const useMessages = (id: number, enabled: boolean) =>
  useQuery({
    queryKey: ["messages", id],
    queryFn: () => apiFetch<Message[]>(`/bookings/${id}/messages`),
    enabled,
    refetchInterval: 4000, // polling chat
  });

export function useSendMessage(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => apiFetch<Message[]>(`/bookings/${id}/messages`, { method: "POST", body: { body } }),
    onSuccess: (msgs) => qc.setQueryData(["messages", id], msgs),
  });
}

/* ---------- M7+ Notifikasi ---------- */

export const useNotifications = () =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiFetchRaw<{ data: Notification[]; unread: number }>("/notifications"),
    refetchInterval: 30000,
  });

export function useReadAll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch("/notifications/read", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

/* ---------- Admin ---------- */

export const useAdminBookings = () =>
  useQuery({ queryKey: ["admin-bookings"], queryFn: () => apiFetch<Booking[]>("/admin/bookings") });

export function useVerifyBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approve, note }: { id: number; approve: boolean; note?: string }) =>
      apiFetch<Booking>(`/admin/bookings/${id}/verify`, {
        method: "POST",
        body: { approve: approve ? "1" : "0", note },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-bookings"] }),
  });
}
