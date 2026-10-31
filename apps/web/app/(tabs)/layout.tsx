import type { ReactNode } from "react";
import BottomNav from "@/components/nav/BottomNav";

/** Layout grup tab — kolom mobile, nav hitam melayang di bawah. */
export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <div id="konten" className="mx-auto w-full max-w-clay min-h-dvh px-5 pb-32 pt-12">
      {children}
      <BottomNav />
    </div>
  );
}
