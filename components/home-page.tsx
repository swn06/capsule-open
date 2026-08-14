"use client";

import { CapsuleDashboard } from "@/components/capsule-dashboard";
import { GoogleSignInButton } from "@/components/auth-controls";
import { useAuth } from "@/lib/use-auth";

export function HomePage() {
  const { user, ready } = useAuth();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-12 sm:py-16">
      <div className="text-center">
        <h1 className="font-serif text-4xl font-medium tracking-tight text-stone-800 sm:text-5xl">
          캡슐 보드
        </h1>
        <p className="mt-4 text-base leading-relaxed tracking-wide text-stone-500">
          묻힌 캡슐과 열람까지 남은 시간을 한눈에 봐요
        </p>
        {ready && !user ? (
          <div className="mt-6 flex flex-col items-center gap-3">
            <GoogleSignInButton label="로그인하고 캡슐 묻기" />
          </div>
        ) : null}
      </div>
      <CapsuleDashboard />
    </div>
  );
}
