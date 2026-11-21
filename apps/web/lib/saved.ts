"use client";

import { useSyncExternalStore } from "react";

/** Diskusi yang disimpan — tersimpan di perangkat ini (localStorage). */
const KEY = "ck_saved_threads";
const listeners = new Set<() => void>();
let cache: number[] | null = null;

function read(): number[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    cache = [];
  }
  return cache!;
}

const EMPTY: number[] = [];

export function useSaved() {
  const saved = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => EMPTY
  );
  const toggle = (id: number) => {
    const cur = read();
    cache = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    try {
      localStorage.setItem(KEY, JSON.stringify(cache));
    } catch {
      /* penyimpanan diblokir: tetap di memori */
    }
    listeners.forEach((l) => l());
  };
  return { saved, isSaved: (id: number) => saved.includes(id), toggle };
}
