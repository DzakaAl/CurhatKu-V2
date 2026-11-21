"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import { TABS, isActive } from "./routes";

/** Tab bawah untuk mobile (< md). */
export default function BottomNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Tab"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-nav/95 px-2 pb-[calc(6px+env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl md:hidden"
    >
      <ul className="flex">
        {TABS.map((t) => {
          const on = isActive(path, t);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={"flex min-h-12 flex-col items-center justify-center gap-0.5 text-[10.5px] font-semibold " + (on ? "text-invert" : "text-nav-ink")}
              >
                <span className={"grid h-7 w-12 place-items-center rounded-full " + (on ? "bg-accent-soft" : "")}>
                  <Icon name={t.icon} className="h-[21px] w-[21px]" />
                </span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
