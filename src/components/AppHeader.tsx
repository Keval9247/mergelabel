"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Generate" },
  { href: "/settings", label: "Stores" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 flex-col leading-tight outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
        >
          <span className="text-base font-semibold tracking-tight text-[var(--foreground)] group-hover:text-[var(--accent)]">
            MergeLabel
          </span>
          <span className="text-[11px] font-medium tracking-wide text-[var(--muted)]">
            Green Bharat
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="flex flex-wrap items-center gap-1 text-sm"
        >
          {NAV.map(({ href, label }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "rounded-md bg-[var(--accent-soft)] px-3 py-1.5 font-medium text-[var(--accent)]"
                    : "rounded-md px-3 py-1.5 text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
