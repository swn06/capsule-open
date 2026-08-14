"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/auth-controls";
import { useAuth } from "@/lib/use-auth";

export function SiteHeader() {
  const pathname = usePathname();
  const { user, ready } = useAuth();
  const onNewPage = pathname === "/new";

  return (
    <header className="sticky top-0 z-20 border-b border-amber-100/80 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="font-serif text-xl tracking-tight text-stone-800 transition-colors hover:text-stone-600"
        >
          캡슐 오픈
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          {ready && user && !onNewPage ? (
            <Link
              href="/new"
              className="inline-flex rounded-full bg-stone-800 px-4 py-2 text-sm tracking-wide text-amber-50 transition-colors hover:bg-stone-700"
            >
              캡슐 묻기
            </Link>
          ) : null}
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
