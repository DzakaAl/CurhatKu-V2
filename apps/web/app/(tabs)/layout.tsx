import type { ReactNode } from "react";
import BottomNav from "@/components/nav/BottomNav";
import Sidebar from "@/components/nav/Sidebar";
import Topbar from "@/components/nav/Topbar";

/** Shell aplikasi: sidebar (desktop), topbar, konten lebar penuh, tab bawah (mobile). */
export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh md:grid-cols-[240px_minmax(0,1fr)]">
      <Sidebar />
      <div className="flex min-w-0 flex-col">
        <Topbar />
        <div id="konten" className="w-full px-4 pb-32 pt-8 md:px-10 md:pb-16">
          {children}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
