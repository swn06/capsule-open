"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { GoogleSignInButton } from "@/components/auth-controls";
import { CapsuleGrove } from "@/components/capsule-grove";
import {
  CAPSULES_COLLECTION,
  isCapsuleOpen,
  toMillis,
  type CapsuleListItem,
} from "@/lib/capsule";
import { getDb } from "@/lib/firebase";
import { treeSeason } from "@/lib/season-theme";
import { useSeasonTheme } from "@/components/season-shell";
import { useAuth } from "@/lib/use-auth";
import { useNow } from "@/lib/use-now";

type Filter = "all" | "mine" | "sealed" | "open";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "mine", label: "내 캡슐" },
  { id: "sealed", label: "땅속" },
  { id: "open", label: "열린 캡슐" },
];

export function CapsuleDashboard() {
  const { user } = useAuth();
  const now = useNow(30_000);
  const theme = useSeasonTheme();
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
        setError("캡슐 숲을 불러오지 못했어요.");
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
      if (filter === "mine") {
        return user ? capsule.ownerUid === user.uid && open : false;
      }
      return open;
    });
  }, [capsules, filter, now, user]);

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
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
                    ? "rounded-full season-cta px-4 py-2 text-sm tracking-wide"
                    : "rounded-full border border-white/50 bg-white/55 px-4 py-2 text-sm tracking-wide text-stone-600 backdrop-blur-sm"
                }
              >
                {item.label} {count}
              </button>
            );
          })}
        </div>
        <p className="text-xs tracking-wide text-stone-500">
          {filter === "sealed"
            ? "푯말에 묻은 날짜, 시간, 날씨, 받는 사람이 적혀 있어요"
            : "열린 캡슐만 떠다녀요. 묻힌 자리는 땅속 버튼에서 볼 수 있어요"}
        </p>
      </div>

      {loading ? (
        <div className="h-[min(78vh,840px)] animate-pulse rounded-[2.2rem] bg-white/40" />
      ) : error ? (
        <p className="text-sm text-rose-600">{error}</p>
      ) : filter === "mine" && !user ? (
        <EmptyState
          message="내 캡슐을 보려면 로그인해 주세요."
          action={<GoogleSignInButton label="구글로 로그인" />}
        />
      ) : (
        <CapsuleGrove
          capsules={visibleCapsules}
          now={now}
          season={treeSeason(theme)}
          layout={filter === "sealed" ? "buried" : "float"}
          emptyMessage={
            filter === "sealed"
              ? "아직 묻힌 캡슐이 없어요."
              : filter === "mine"
                ? "아직 열린 내 캡슐이 없어요. 묻힌 자리는 땅속 버튼에서 볼 수 있어요."
                : "아직 열린 캡슐이 없어요. 땅속 버튼을 누르면 묻힌 자리를 볼 수 있어요."
          }
        />
      )}
    </section>
  );
}

function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[2.2rem] border border-dashed border-white/70 bg-white/40 px-6 py-16 text-center backdrop-blur-sm">
      <p className="text-sm tracking-wide text-stone-500">{message}</p>
      {action ? (
        <div className="mt-5 flex justify-center">{action}</div>
      ) : (
        <Link
          href="/new"
          className="season-cta mt-5 inline-flex rounded-full px-6 py-2.5 text-sm tracking-wide"
        >
          첫 캡슐 묻기
        </Link>
      )}
    </div>
  );
}
