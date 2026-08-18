"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import { doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { CapsuleFigure } from "@/components/capsule-figure";
import { KeywordChips, MoodPhrase } from "@/components/capsule-mood";
import { WeatherCard } from "@/components/capsule-weather";
import { Countdown } from "@/components/countdown";
import {
  CAPSULES_COLLECTION,
  capsuleTitle,
  deleteOpenedCapsule,
  formatDateTime,
  isCapsuleOpen,
  type CapsuleRecord,
} from "@/lib/capsule";
import { getDb, getFirebaseStorage } from "@/lib/firebase";
import { useAuth } from "@/lib/use-auth";
import { useNow } from "@/lib/use-now";

const isDev = process.env.NODE_ENV === "development";

export function CapsuleView({ capsuleId }: { capsuleId: string }) {
  const now = useNow();
  const { user } = useAuth();
  const [capsule, setCapsule] = useState<CapsuleRecord | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devPreview, setDevPreview] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCapsule() {
      setLoading(true);
      setError(null);
      setPhotoUrls([]);
      setDevPreview(false);

      try {
        const snapshot = await getDoc(doc(getDb(), CAPSULES_COLLECTION, capsuleId));
        if (!snapshot.exists()) {
          if (!cancelled) {
            setCapsule(null);
            setError("캡슐을 찾지 못했어요.");
          }
          return;
        }

        if (!cancelled) {
          setCapsule(snapshot.data() as CapsuleRecord);
        }
      } catch (caught) {
        console.error(caught);
        if (!cancelled) {
          setError("캡슐을 불러오지 못했어요.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCapsule();
    return () => {
      cancelled = true;
    };
  }, [capsuleId]);

  const naturallyOpen = isCapsuleOpen(capsule?.openAt, now);
  const canViewContent = naturallyOpen || (isDev && devPreview);
  const canDelete = Boolean(
    naturallyOpen && user && capsule?.ownerUid && capsule.ownerUid === user.uid,
  );
  const photoCount = capsule?.photoPaths?.length ?? 0;

  useEffect(() => {
    const photoPaths = capsule?.photoPaths ?? [];
    if (!capsule || !canViewContent || photoPaths.length === 0) {
      return;
    }

    let cancelled = false;

    async function loadPhotos() {
      setPhotosLoading(true);
      try {
        const storage = getFirebaseStorage();
        const urls = await Promise.all(
          photoPaths.map((path) => getDownloadURL(ref(storage, path))),
        );
        if (!cancelled) {
          setPhotoUrls(urls);
        }
      } catch (caught) {
        console.error(caught);
      } finally {
        if (!cancelled) {
          setPhotosLoading(false);
        }
      }
    }

    void loadPhotos();
    return () => {
      cancelled = true;
    };
  }, [capsule, canViewContent]);

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12 sm:py-16">
      <main className="w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-100/80 bg-white/75 shadow-[0_28px_70px_-24px_rgba(92,58,32,0.28)] backdrop-blur-sm">
        {loading ? (
          <div className="flex flex-col items-center gap-4 px-8 py-20" aria-live="polite">
            <span
              className="h-10 w-10 animate-spin rounded-full border-2 border-stone-200 border-t-stone-800"
              aria-hidden="true"
            />
            <p className="text-sm tracking-wide text-stone-600">캡슐을 여는 중...</p>
          </div>
        ) : error || !capsule ? (
          <div className="px-8 py-16 text-center">
            <h1 className="font-serif text-4xl font-medium tracking-tight text-stone-800">
              캡슐을 열 수 없어요
            </h1>
            <p className="mt-4 text-sm text-rose-600">{error}</p>
            <Link
              href="/"
              className="mt-8 inline-flex rounded-full bg-stone-800 px-8 py-3.5 text-sm tracking-wide text-amber-50 transition-colors hover:bg-stone-700"
            >
              대시보드로
            </Link>
          </div>
        ) : canViewContent ? (
          <CapsuleOpenView
            capsule={capsule}
            capsuleId={capsuleId}
            photoUrls={photoUrls}
            photosLoading={photosLoading}
            canDelete={canDelete}
            devPreview={devPreview && !naturallyOpen}
            onExitDevPreview={() => setDevPreview(false)}
          />
        ) : (
          <CapsuleSealedView
            capsule={capsule}
            capsuleId={capsuleId}
            now={now}
            photoCount={photoCount}
            onDevPreview={() => setDevPreview(true)}
          />
        )}
      </main>
    </div>
  );
}

function CapsuleSealedView({
  capsule,
  capsuleId,
  now,
  photoCount,
  onDevPreview,
}: {
  capsule: CapsuleRecord;
  capsuleId: string;
  now: number;
  photoCount: number;
  onDevPreview: () => void;
}) {
  return (
    <>
      <div
        className="border-b border-amber-100/80 px-8 py-10 text-center"
        style={
          capsule.mood
            ? {
                background: `linear-gradient(180deg, ${capsule.mood.colors.from}66, rgba(255,255,255,0.4))`,
                borderColor: `${capsule.mood.colors.accent}22`,
              }
            : undefined
        }
      >
        <div className="mx-auto flex justify-center">
          <CapsuleFigure mood={capsule.mood} size="lg" sealed dirty={0.72} />
        </div>
        <p className="mt-5 text-xs tracking-[0.2em] text-amber-800/70">SEALED</p>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight text-stone-800 sm:text-5xl">
          {capsuleTitle(capsule)}
        </h1>
        <p className="mt-4 text-sm leading-relaxed tracking-wide text-stone-600">
          아직 열람 기간이 남았어요.
          <br />
          편지와 사진은 열람일에 열리고, 지금은 키워드만 볼 수 있어요.
        </p>
      </div>

      <div className="px-8 py-10">
        <div className="rounded-3xl border border-amber-100 bg-white/80 px-6 py-8">
          <p className="text-center text-xs tracking-wide text-stone-400">열람까지 남은 시간</p>
          <div className="mt-6">
            <Countdown openAt={capsule.openAt} now={now} size="lg" />
          </div>
        </div>

        {capsule.mood?.keywords?.length ? (
          <div className="mt-8 rounded-3xl border border-stone-100 bg-white/80 px-6 py-6">
            <KeywordChips keywords={capsule.mood.keywords} hint />
          </div>
        ) : null}

        {capsule.weather ? (
          <div className="mt-8">
            <WeatherCard weather={capsule.weather} />
          </div>
        ) : null}

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <DetailItem label="묻은 날" value={formatDateTime(capsule.createdAt)} />
          <DetailItem label="열람일" value={formatDateTime(capsule.openAt)} />
          <DetailItem label="묻은 사진" value={`${photoCount}장`} />
          <DetailItem label="캡슐 번호" value={capsuleId} mono />
        </dl>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/"
            className="inline-flex rounded-full bg-stone-800 px-8 py-3.5 text-sm tracking-wide text-amber-50 transition-colors hover:bg-stone-700"
          >
            대시보드로
          </Link>

          {isDev ? (
            <button
              type="button"
              onClick={onDevPreview}
              className="text-xs tracking-wide text-stone-300 underline-offset-4 transition-colors hover:text-stone-400 hover:underline"
            >
              바로보기
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}

function CapsuleOpenView({
  capsule,
  capsuleId,
  photoUrls,
  photosLoading,
  canDelete,
  devPreview,
  onExitDevPreview,
}: {
  capsule: CapsuleRecord;
  capsuleId: string;
  photoUrls: string[];
  photosLoading: boolean;
  canDelete: boolean;
  devPreview: boolean;
  onExitDevPreview: () => void;
}) {
  return (
    <>
      <div
        className="border-b border-amber-100/80 px-8 py-10 text-center"
        style={
          capsule.mood
            ? {
                background: `linear-gradient(180deg, ${capsule.mood.colors.from}66, rgba(255,255,255,0.4))`,
                borderColor: `${capsule.mood.colors.accent}22`,
              }
            : undefined
        }
      >
        <div className="mx-auto flex justify-center">
          <CapsuleFigure mood={capsule.mood} size="lg" dirty={0.14} />
        </div>
        <p className="mt-5 text-xs tracking-[0.2em] text-emerald-800/70">
          {devPreview ? "DEV PREVIEW" : "OPENED"}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight text-stone-800 sm:text-5xl">
          {capsuleTitle(capsule)}
        </h1>
        <p className="mt-4 text-sm tracking-wide text-stone-500">
          {devPreview
            ? "개발 모드 미리보기입니다."
            : `열람일 ${formatDateTime(capsule.openAt)}`}
        </p>
      </div>

      <div className="px-8 py-10">
        {capsule.mood ? (
          <div className="mb-8">
            <MoodPhrase mood={capsule.mood} />
            {capsule.mood.keywords?.length ? (
              <div className="mt-4">
                <KeywordChips keywords={capsule.mood.keywords} />
              </div>
            ) : null}
          </div>
        ) : null}

        {capsule.weather ? (
          <div className="mb-8">
            <WeatherCard weather={capsule.weather} />
          </div>
        ) : null}

        {capsule.letter ? (
          <section>
            <h2 className="text-xs tracking-[0.18em] text-stone-400">편지</h2>
            <p className="mt-3 whitespace-pre-wrap rounded-3xl border border-stone-100 bg-white/90 px-6 py-5 text-base leading-relaxed text-stone-700">
              {capsule.letter}
            </p>
          </section>
        ) : null}

        {photoUrls.length > 0 || photosLoading ? (
          <section className={capsule.letter ? "mt-8" : ""}>
            <h2 className="text-xs tracking-[0.18em] text-stone-400">사진</h2>
            {photosLoading ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="h-40 animate-pulse rounded-2xl bg-stone-100" />
                <div className="h-40 animate-pulse rounded-2xl bg-stone-100" />
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {photoUrls.map((src, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className={
                      index === 0 && photoUrls.length % 2 === 1
                        ? "h-56 w-full rounded-2xl object-cover shadow-sm sm:col-span-2"
                        : "h-44 w-full rounded-2xl object-cover shadow-sm"
                    }
                  />
                ))}
              </div>
            )}
          </section>
        ) : null}

        <dl className="mt-8 grid gap-4 border-t border-stone-100 pt-8 sm:grid-cols-2">
          <DetailItem label="열람일" value={formatDateTime(capsule.openAt)} />
          <DetailItem label="캡슐 번호" value={capsuleId} mono />
        </dl>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/"
            className="inline-flex rounded-full bg-stone-800 px-8 py-3.5 text-sm tracking-wide text-amber-50 transition-colors hover:bg-stone-700"
          >
            대시보드로
          </Link>

          {canDelete ? (
            <CapsuleDeleteControls
              capsuleId={capsuleId}
              photoPaths={capsule.photoPaths ?? []}
            />
          ) : null}

          {isDev && devPreview ? (
            <button
              type="button"
              onClick={onExitDevPreview}
              className="text-xs tracking-wide text-stone-300 underline-offset-4 transition-colors hover:text-stone-400 hover:underline"
            >
              봉인 화면으로
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}

function CapsuleDeleteControls({
  capsuleId,
  photoPaths,
}: {
  capsuleId: string;
  photoPaths: string[];
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (deleting) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await deleteOpenedCapsule(capsuleId, photoPaths);
      router.replace("/");
    } catch (caught) {
      console.error(caught);
      if (
        caught instanceof FirebaseError &&
        (caught.code === "permission-denied" || caught.code === "storage/unauthorized")
      ) {
        setError("지울 권한이 없어요. 봉인된 캡슐은 지울 수 없어요.");
      } else {
        setError("캡슐을 지우지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
      setDeleting(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs tracking-wide text-stone-300 underline-offset-4 transition-colors hover:text-rose-400 hover:underline"
      >
        캡슐 지우기
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm tracking-wide text-stone-500">지운 캡슐은 되돌릴 수 없어요.</p>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-full bg-rose-600 px-5 py-2 text-sm tracking-wide text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deleting ? "지우는 중..." : "지우기"}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            setError(null);
          }}
          disabled={deleting}
          className="text-sm tracking-wide text-stone-400 underline-offset-4 transition-colors hover:text-stone-600 hover:underline disabled:opacity-60"
        >
          취소
        </button>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-stone-100 bg-white/70 px-4 py-3">
      <dt className="text-xs tracking-wide text-stone-400">{label}</dt>
      <dd
        className={
          mono
            ? "mt-1 break-all font-mono text-xs text-stone-600"
            : "mt-1 text-sm text-stone-700"
        }
      >
        {value}
      </dd>
    </div>
  );
}
