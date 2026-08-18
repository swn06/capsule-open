"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { BuryRitual } from "@/components/bury-ritual";
import { LiveWeatherPanel } from "@/components/capsule-weather";
import { useSeasonTheme } from "@/components/season-shell";
import {
  CAPSULES_COLLECTION,
  parseOpenAt,
} from "@/lib/capsule";
import { getDb, getFirebaseAuth, getFirebaseStorage } from "@/lib/firebase";
import { googleAuthErrorMessage, isGoogleAuthError, signInWithGoogle } from "@/lib/google-auth";
import { fetchCapsuleMood, type CapsuleMood } from "@/lib/mood";
import { treeSeason } from "@/lib/season-theme";
import { useAuth } from "@/lib/use-auth";
import { useLiveWeather } from "@/lib/use-live-weather";
import { fetchWeatherSnapshot, getBrowserCoords } from "@/lib/weather";

function getSafeExt(file: File): string {
  const mime = file.type.split("/")[1]?.toLowerCase() ?? "";
  if (/^[a-z0-9]+$/.test(mime)) {
    return mime === "jpeg" ? "jpg" : mime;
  }
  return "bin";
}

export default function NewCapsulePage() {
  const { user, ready } = useAuth();
  const liveWeather = useLiveWeather();
  const theme = useSeasonTheme();
  const [to, setTo] = useState("");
  const [letter, setLetter] = useState("");
  const [openAt, setOpenAt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [capsuleId, setCapsuleId] = useState<string | null>(null);
  const [savedMood, setSavedMood] = useState<CapsuleMood | null>(null);
  const [savedLetter, setSavedLetter] = useState("");

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
    setSavedMood(null);
    setSavedLetter("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }

    if (!ready) {
      return;
    }

    if (!openAt) {
      setError("열람일을 선택해 주세요.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let currentUser = getFirebaseAuth().currentUser;
      if (!currentUser) {
        setProgress("구글로 로그인하고 있어요...");
        currentUser = await signInWithGoogle();
        if (!currentUser) {
          setError("캡슐을 묻으려면 로그인이 필요해요.");
          return;
        }
      }

      setProgress("그날의 날씨를 담고 있어요...");

      const weatherPromise = liveWeather.weather
        ? Promise.resolve(liveWeather.weather)
        : getBrowserCoords().then(fetchWeatherSnapshot);
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

      setProgress("그날의 한마디를 짓고 있어요...");
      const weather = await weatherPromise;
      const mood = await fetchCapsuleMood({
        weather,
        letter,
        to: to.trim(),
      });

      await setDoc(capsuleRef, {
        to: to.trim(),
        letter,
        openAt: parseOpenAt(openAt),
        createdAt: serverTimestamp(),
        ownerUid: currentUser.uid,
        photoPaths,
        ...(weather ? { weather } : {}),
        ...(mood ? { mood } : {}),
      });

      setSavedMood(mood);
      setSavedLetter(letter);
      setCapsuleId(nextCapsuleId);
    } catch (caught) {
      console.error(caught);
      if (isGoogleAuthError(caught)) {
        setError(
          googleAuthErrorMessage(caught) ??
            "캡슐을 묻으려면 로그인이 필요해요.",
        );
      } else {
        setError("업로드에 실패했어요. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setSubmitting(false);
      setProgress("");
    }
  }

  if (capsuleId) {
    return (
      <BuryRitual
        capsuleId={capsuleId}
        mood={savedMood}
        season={treeSeason(theme)}
        letter={savedLetter}
        onAgain={resetForm}
      />
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <main className="season-card relative w-full max-w-lg overflow-hidden rounded-3xl border px-8 py-12 shadow-[0_28px_70px_-24px_rgba(92,58,32,0.28)] backdrop-blur-sm sm:px-10">
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

        <p className="text-center text-xs tracking-[0.22em] text-stone-500">
          {theme.emoji} {theme.label}
        </p>
        <h1 className="mt-3 text-center font-serif text-4xl font-medium tracking-tight text-stone-800 sm:text-5xl">
          캡슐 묻기
        </h1>
        <p className="mt-3 text-center text-sm leading-relaxed tracking-wide text-stone-500">
          {theme.greeting}
        </p>

        <div className="mt-8">
          <LiveWeatherPanel
            live={liveWeather}
            compact
            caption="캡슐에 담길 지금"
          />
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
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

          <p className="text-xs leading-relaxed tracking-wide text-stone-400">
            지금 하늘이 배경이 되고, 편지는 유리병 안에 말려 나무 아래로 묻혀요.
            열람일이 가까워지면 흙 묻은 병이 땅속에서 올라옵니다.
          </p>

          <button
            type="submit"
            disabled={submitting || !ready}
            className="season-cta mt-2 inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-60"
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
          {ready && !user ? (
            <p className="text-center text-xs tracking-wide text-stone-400">
              적은 내용은 그대로 두고, 묻기 버튼을 누르면 구글 로그인이 열려요.
            </p>
          ) : null}
        </form>
      </main>
    </div>
  );
}
