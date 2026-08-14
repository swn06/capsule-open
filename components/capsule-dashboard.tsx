"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Countdown } from "@/components/countdown";
import {
  CAPSULES_COLLECTION,
  capsuleTitle,
  formatDateTime,
  isCapsuleOpen,
  toMillis,
  type CapsuleListItem,
} from "@/lib/capsule";
import { getDb } from "@/lib/firebase";
import { useAuth } from "@/lib/use-auth";
import { useNow } from "@/lib/use-now";

type Filter = "all" | "mine" | "sealed" | "open";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "mine", label: "내 캡슐" },
  { id: "sealed", label: "봉인됨" },
  { id: "open", label: "열람 가능" },
];

export function CapsuleDashboard() {
  const { user } = useAuth();
  const now = useNow();
  const [capsules, setCapsules] = useState<CapsuleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(getDb(), CAPSULES_COLLECTION),
      (snapshot) => {
        const items = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<CapsuleListItem, "id">),
        }));
        items.sort(
          (a, b) => (toMillis(a.openAt) ?? Number.MAX_SAFE_INTEGER) - (toMillis(b.openAt) ?? Number.MAX_SAFE_INTEGER),
        );
        setCapsules(items);
        setError(null);
        setLoading(false);
      },
      (caught) => {
        console.error(caught);
        setError("캡슐 목록을 불러오지 못했어요.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const sealedCount = capsules.filter((capsule) => !isCapsuleOpen(capsule.openAt, now)).length;
  const openCount = capsules.length - sealedCount;
  const mineCount = user
    ? capsules.filter((capsule) => capsule.ownerUid === user.uid).length
    : 0;

  const visibleCapsules = useMemo(() => {
    return capsules.filter((capsule) => {
      const open = isCapsuleOpen(capsule.openAt, now);
      if (filter === "sealed") {
        return !open;
      }
      if (filter === "open") {
        return open;
      }
      if (filter === "mine") {
        return user ? capsule.ownerUid === user.uid : false;
      }
      return true;
    });
  }, [capsules, filter, now, user]);

  return (
    <section className="mt-10">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="묻힌 캡슐" value={capsules.length} />
        <StatCard label="기다리는 중" value={sealedCount} />
        <StatCard label="열람 가능" value={openCount} />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((item) => {
          const active = filter === item.id;
          const count =
            item.id === "all"
              ? capsules.length
              : item.id === "mine"
                ? mineCount
                : item.id === "sealed"
                  ? sealedCount
                  : openCount;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={
                active
                  ? "rounded-full bg-stone-800 px-4 py-2 text-sm tracking-wide text-amber-50"
                  : "rounded-full border border-stone-200 bg-white/80 px-4 py-2 text-sm tracking-wide text-stone-600 transition-colors hover:border-stone-300"
              }
            >
              {item.label} {count}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="mt-8 flex flex-col gap-3" aria-live="polite">
          <div className="h-28 animate-pulse rounded-3xl bg-white/70" />
          <div className="h-28 animate-pulse rounded-3xl bg-white/70" />
        </div>
      ) : error ? (
        <p className="mt-8 text-sm text-rose-600">{error}</p>
      ) : filter === "mine" && !user ? (
        <EmptyState message="내 캡슐을 보려면 로그인해 주세요." />
      ) : visibleCapsules.length === 0 ? (
        <EmptyState
          message={
            filter === "mine"
              ? "아직 묻은 캡슐이 없어요."
              : "아직 묻힌 캡슐이 없어요."
          }
        />
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {visibleCapsules.map((capsule) => {
            const open = isCapsuleOpen(capsule.openAt, now);
            const photoCount = capsule.photoPaths?.length ?? 0;

            return (
              <li key={capsule.id}>
                <Link
                  href={`/capsule/${capsule.id}`}
                  className="block rounded-3xl border border-amber-100/80 bg-white/80 px-5 py-5 shadow-[0_18px_40px_-28px_rgba(92,58,32,0.35)] transition-transform hover:-translate-y-0.5 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={
                            open
                              ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs tracking-wide text-emerald-800"
                              : "rounded-full bg-amber-100 px-2.5 py-1 text-xs tracking-wide text-amber-900"
                          }
                        >
                          {open ? "열람 가능" : "봉인됨"}
                        </span>
                        {user && capsule.ownerUid === user.uid ? (
                          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs tracking-wide text-stone-500">
                            내가 묻음
                          </span>
                        ) : null}
                      </div>
                      <h2 className="mt-3 truncate font-serif text-2xl tracking-tight text-stone-800">
                        {capsuleTitle(capsule)}
                      </h2>
                      <p className="mt-2 text-sm tracking-wide text-stone-500">
                        {open
                          ? capsule.letter?.trim()
                            ? `${capsule.letter.trim().slice(0, 42)}${capsule.letter.trim().length > 42 ? "…" : ""}`
                            : photoCount > 0
                              ? `사진 ${photoCount}장`
                              : "열린 캡슐"
                          : `봉인된 기억 · 사진 ${photoCount}장`}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <Countdown openAt={capsule.openAt} now={now} />
                    </div>
                  </div>
                  <p className="mt-4 text-xs tracking-wide text-stone-400">
                    열람일 {formatDateTime(capsule.openAt)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-amber-100/80 bg-white/70 px-4 py-5 text-center">
      <p className="font-serif text-3xl tracking-tight text-stone-800">{value}</p>
      <p className="mt-1 text-xs tracking-wide text-stone-500">{label}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-8 rounded-3xl border border-dashed border-stone-200 bg-white/50 px-6 py-14 text-center">
      <p className="text-sm tracking-wide text-stone-500">{message}</p>
      <Link
        href="/new"
        className="mt-5 inline-flex rounded-full bg-stone-800 px-6 py-2.5 text-sm tracking-wide text-amber-50 transition-colors hover:bg-stone-700"
      >
        첫 캡슐 묻기
      </Link>
    </div>
  );
}
