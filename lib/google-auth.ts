import {
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export function isGoogleAuthError(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    error.code.startsWith("auth/")
  );
}

export function googleAuthErrorMessage(error: unknown) {
  if (!isGoogleAuthError(error)) {
    return null;
  }

  if (
    error.code === "auth/popup-closed-by-user" ||
    error.code === "auth/cancelled-popup-request"
  ) {
    return null;
  }
  if (error.code === "auth/unauthorized-domain") {
    return `Google 로그인은 localhost만 기본 허용입니다. 지금 주소(${window.location.hostname})를 승인 도메인에 넣어야 합니다.`;
  }
  return "구글 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.";
}

export async function signInWithGoogle(): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    const result = await signInWithPopup(getFirebaseAuth(), provider);
    return result.user;
  } catch (error) {
    if (googleAuthErrorMessage(error) === null) {
      return null;
    }
    throw error;
  }
}
