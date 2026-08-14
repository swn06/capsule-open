"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { GoogleSignInButton } from "@/components/auth-controls";
import {
  CAPSULES_COLLECTION,
  parseOpenAt,
} from "@/lib/capsule";
import { getDb, getFirebaseAuth, getFirebaseStorage } from "@/lib/firebase";
import { useAuth } from "@/lib/use-auth";

function getSafeExt(file: File): string {
  const mime = file.type.split("/")[1]?.toLowerCase() ?? "";
  if (/^[a-z0-9]+$/.test(mime)) {
    return mime === "jpeg" ? "jpg" : mime;
  }
  return "bin";
}

export default function NewCapsulePage() {
  const { user, ready } = useAuth();
  const [to, setTo] = useState("");
  const [letter, setLetter] = useState("");
  const [openAt, setOpenAt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [capsuleId, setCapsuleId] = useState<string | null>(null);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  function resetForm() {
    setTo("");
    setLetter("");
    setOpenAt("");
    setFiles([]);
    setError(null);
    setProgress("");
    setCapsuleId(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }

    const currentUser = getFirebaseAuth().currentUser;
    if (!currentUser) {
      setError("로그인 먼저!");
      return;
    }

    if (!openAt) {
      setError("열람일을 선택해 주세요.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setProgress("업로드 되는 중...");

    try {
      const db = getDb();
      const storage = getFirebaseStorage();
      const capsuleRef = doc(collection(db, CAPSULES_COLLECTION));
      const nextCapsuleId = capsuleRef.id;
      const photoPaths: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(`업로드 되는 중... 사진 ${i + 1}/${files.length}`);
        const path = `capsules/${nextCapsuleId}/${i}.${getSafeExt(file)}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file, { contentType: file.type });
        photoPaths.push(path);
      }

      setProgress("업로드 되는 중... 캡슐 정보를 저장하고 있어요");

      await setDoc(capsuleRef, {
        to: to.trim(),
        letter,
        openAt: parseOpenAt(openAt),
        createdAt: serverTimestamp(),
        ownerUid: currentUser.uid,
        photoPaths,
      });

      setCapsuleId(nextCapsuleId);
    } catch (caught) {
      console.error(caught);
      setError("업로드에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
      setProgress("");
    }
  }

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div
          className="h-40 w-full max-w-lg animate-pulse rounded-3xl bg-white/70"
          aria-hidden="true"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <main className="w-full max-w-lg rounded-3xl border border-amber-100/80 bg-white/75 px-8 py-12 text-center shadow-[0_28px_70px_-24px_rgba(92,58,32,0.28)] backdrop-blur-sm sm:px-10">
          <h1 className="font-serif text-4xl font-medium tracking-tight text-stone-800">
            로그인하고 묻기
          </h1>
          <p className="mt-4 text-sm leading-relaxed tracking-wide text-stone-500">
            캡슐을 묻으려면 먼저 로그인해 주세요.
          </p>
          <div className="mt-8 flex justify-center">
            <GoogleSignInButton />
          </div>
        </main>
      </div>
    );
  }

  if (capsuleId) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <main className="w-full max-w-lg rounded-3xl border border-amber-100/80 bg-white/75 px-8 py-12 text-center shadow-[0_28px_70px_-24px_rgba(92,58,32,0.28)] backdrop-blur-sm sm:px-10">
          <p className="text-sm tracking-wide text-stone-500">업로드 완료</p>
          <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-stone-800 sm:text-5xl">
            캡슐을 묻었어요
          </h1>
          <p className="mt-6 text-sm leading-relaxed tracking-wide text-stone-600">
            대시보드에서 카운트다운을 볼 수 있어요.
          </p>
          <p className="mt-4 break-all font-mono text-xs text-stone-400">
            캡슐 번호 {capsuleId}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-stone-800 px-8 py-3.5 text-sm tracking-wide text-amber-50 transition-colors hover:bg-stone-700"
            >
              대시보드 보기
            </Link>
            <Link
              href={`/capsule/${capsuleId}`}
              className="text-sm tracking-wide text-stone-400 underline-offset-4 transition-colors hover:text-stone-600 hover:underline"
            >
              이 캡슐 열기
            </Link>
            <button
              type="button"
              onClick={resetForm}
              className="text-sm tracking-wide text-stone-400 underline-offset-4 transition-colors hover:text-stone-600 hover:underline"
            >
              다른 캡슐 묻기
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <main className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-100/80 bg-white/75 px-8 py-12 shadow-[0_28px_70px_-24px_rgba(92,58,32,0.28)] backdrop-blur-sm sm:px-10">
        {submitting ? (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm"
            aria-live="polite"
            aria-busy="true"
          >
            <span
              className="h-10 w-10 animate-spin rounded-full border-2 border-stone-200 border-t-stone-800"
              aria-hidden="true"
            />
            <p className="text-sm tracking-wide text-stone-600">
              {progress || "업로드 되는 중..."}
            </p>
          </div>
        ) : null}

        <h1 className="text-center font-serif text-4xl font-medium tracking-tight text-stone-800 sm:text-5xl">
          캡슐 묻기
        </h1>

        <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
          <label className="flex flex-col gap-2 text-left">
            <span className="text-sm tracking-wide text-stone-600">받는 사람</span>
            <input
              type="text"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              disabled={submitting}
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-800 outline-none transition-shadow focus:border-stone-400 focus:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-2 text-left">
            <span className="text-sm tracking-wide text-stone-600">편지</span>
            <textarea
              value={letter}
              onChange={(event) => setLetter(event.target.value)}
              rows={6}
              disabled={submitting}
              className="resize-y rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-800 outline-none transition-shadow focus:border-stone-400 focus:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-2 text-left">
            <span className="text-sm tracking-wide text-stone-600">열람일</span>
            <input
              type="datetime-local"
              value={openAt}
              onChange={(event) => setOpenAt(event.target.value)}
              disabled={submitting}
              required
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-800 outline-none transition-shadow focus:border-stone-400 focus:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-2 text-left">
            <span className="text-sm tracking-wide text-stone-600">사진</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={submitting}
              onChange={(event) =>
                setFiles(event.target.files ? Array.from(event.target.files) : [])
              }
              className="text-sm text-stone-500 file:mr-4 file:rounded-full file:border-0 file:bg-stone-800 file:px-4 file:py-2 file:text-sm file:tracking-wide file:text-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          {previews.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {previews.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="h-20 w-20 rounded-2xl object-cover shadow-sm"
                />
              ))}
            </div>
          ) : null}

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-stone-800 px-8 py-3.5 text-sm tracking-wide text-amber-50 transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-amber-50/30 border-t-amber-50"
                  aria-hidden="true"
                />
                업로드 되는 중...
              </>
            ) : (
              "캡슐 묻기"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
