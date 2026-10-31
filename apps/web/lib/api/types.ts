import type { Emotion } from "@/lib/ml/emotions";

export interface User {
  id: number;
  email: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  role: "user" | "admin" | "psychologist";
  anonHandle: string;
  emailVerified: boolean;
}

export interface Dashboard {
  streak: number;
  todayMood: Emotion | null;
  week: { date: string; emotion: Emotion | null }[];
  journalCount: number;
}

export interface Journal {
  id: number;
  content: string;
  emotion: Emotion | null;
  confidence: number | null;
  emotion2: Emotion | null;
  confidence2: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
}

export interface Thread {
  id: number;
  title: string;
  body: string;
  author: string;
  category: { slug: string; name: string };
  likesCount: number;
  repliesCount: number;
  liked: boolean;
  mine: boolean;
  createdAt: string;
  replies?: { id: number; body: string; author: string; mine: boolean; createdAt: string }[];
}

export interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  readMinutes: number;
  publishedAt: string;
  read: boolean;
  body?: string;
}

export interface Psychologist {
  id: number;
  name: string;
  title: string;
  bio: string;
  specialties: string[];
  price: number;
  slots?: { id: number; startsAt: string }[];
}

export type BookingStatus =
  | "pending_payment"
  | "awaiting_verification"
  | "confirmed"
  | "rejected"
  | "cancelled";

export interface Booking {
  id: number;
  status: BookingStatus;
  statusLabel: string;
  amount: number;
  startsAt: string;
  hasProof: boolean;
  adminNote: string | null;
  psychologist: { id: number; name: string; title: string };
  client: string;
  createdAt: string;
}

export interface Message {
  id: number;
  body: string;
  mine: boolean;
  fromPsychologist: boolean;
  createdAt: string;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}
