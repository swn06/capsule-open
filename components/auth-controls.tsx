"use client";

import { useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/lib/use-auth";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function authErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    if (
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      return null;
    }
    if (error.code === "auth/unauthorized-domain") {
      return `Google 로그인은 localhost만 기본 허용입니다. 지금 주소(${window.location.hostname})를 승인 도메인에 넣어야 합니다.`;
    }
  }
  return "구글 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.";
}

export function GoogleSignInButton({
  label = "Google로 계속하기",
}: {
  label?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setError(null);
    setPending(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(getFirebaseAuth(), provider);
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={pending}
        className="inline-flex items-center gap-3 rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm tracking-wide text-stone-700 shadow-sm transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon />
        {pending ? "로그인 중..." : label}
      </button>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

export function AccountMenu() {
  const { user, ready } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setError(null);
    setPending(true);
    try {
      await signOut(getFirebaseAuth());
    } catch {
      setError("로그아웃에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setPending(false);
    }
  }

  if (!ready) {
    return (
      <div
        className="h-9 w-28 animate-pulse rounded-full bg-stone-200/80"
        aria-hidden="true"
      />
    );
  }

  if (!user) {
    return <GoogleSignInButton />;
  }

  const displayName = user.displayName ?? user.email ?? "친구";

  return (
    <div className="flex items-center gap-3">
      {user.photoURL ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.photoURL}
          alt=""
          className="h-8 w-8 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : null}
      <span className="hidden max-w-32 truncate text-sm tracking-wide text-stone-600 sm:inline">
        {displayName}
      </span>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={pending}
        className="text-sm tracking-wide text-stone-400 underline-offset-4 transition-colors hover:text-stone-600 hover:underline disabled:opacity-60"
      >
        {pending ? "로그아웃 중..." : "로그아웃"}
      </button>
      {error ? (
        <p className="sr-only" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
