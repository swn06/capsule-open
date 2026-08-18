import { FirebaseError } from "firebase/app";
import { deleteDoc, doc, Timestamp } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import type { CapsuleMood } from "@/lib/mood";
import type { CapsuleWeather } from "@/lib/weather";
import { getDb, getFirebaseStorage } from "@/lib/firebase";

export const CAPSULES_COLLECTION = "capsules";

export type CapsuleRecord = {
  to: string;
  letter: string;
  openAt: Timestamp;
  createdAt: Timestamp;
  ownerUid: string;
  photoPaths: string[];
  weather?: CapsuleWeather | null;
  mood?: CapsuleMood | null;
};

export type CapsuleListItem = CapsuleRecord & { id: string };

export function parseOpenAt(value: string): Timestamp {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("invalid-open-at");
  }
  return Timestamp.fromDate(date);
}

export function toMillis(value: Timestamp | undefined): number | null {
  if (!value || typeof value.toMillis !== "function") {
    return null;
  }
  return value.toMillis();
}

export function isCapsuleOpen(openAt: Timestamp | undefined, now = Date.now()) {
  const ms = toMillis(openAt);
  return ms !== null && now >= ms;
}

export async function deleteOpenedCapsule(capsuleId: string, photoPaths: string[]) {
  const storage = getFirebaseStorage();

  await Promise.all(
    photoPaths.map(async (path) => {
      try {
        await deleteObject(ref(storage, path));
      } catch (caught) {
        if (caught instanceof FirebaseError && caught.code === "storage/object-not-found") {
          return;
        }
        throw caught;
      }
    }),
  );

  await deleteDoc(doc(getDb(), CAPSULES_COLLECTION, capsuleId));
}

export function formatDateTime(value: Timestamp | undefined) {
  const ms = toMillis(value);
  if (ms === null) {
    return "";
  }
  return new Date(ms).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatBuriedDate(value: Timestamp | undefined) {
  const ms = toMillis(value);
  if (ms === null) {
    return "";
  }
  return new Date(ms).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatBuriedTime(value: Timestamp | undefined) {
  const ms = toMillis(value);
  if (ms === null) {
    return "";
  }
  return new Date(ms).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatRemaining(openAt: Timestamp | undefined, now = Date.now()) {
  const ms = toMillis(openAt);
  if (ms === null) {
    return "";
  }
  const remaining = ms - now;
  if (remaining <= 0) {
    return "지금 열 수 있어요";
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}일 ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatDday(openAt: Timestamp | undefined, now = Date.now()) {
  const ms = toMillis(openAt);
  if (ms === null) {
    return "";
  }
  const remaining = ms - now;
  if (remaining <= 0) {
    return "D-Day";
  }
  const days = Math.floor(remaining / 86400000);
  return days === 0 ? "D-Day" : `D-${days}`;
}

export function capsuleTitle(capsule: Pick<CapsuleRecord, "to">) {
  return capsule.to?.trim() ? `${capsule.to.trim()}에게` : "이름 없는 캡슐";
}

export function seedFromId(id: string) {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function capsuleRipeness(openAt: Timestamp | undefined, now = Date.now()) {
  const ms = toMillis(openAt);
  if (ms === null) {
    return 0;
  }
  const remainingDays = (ms - now) / 86_400_000;
  if (remainingDays <= 0) {
    return 1;
  }
  return Math.max(0, Math.min(1, 1 - remainingDays / 120));
}

export function capsuleEmergence(openAt: Timestamp | undefined, now = Date.now()) {
  const ms = toMillis(openAt);
  if (ms === null) {
    return 0;
  }
  const remainingDays = (ms - now) / 86_400_000;
  if (remainingDays <= 0) {
    return 1;
  }
  if (remainingDays >= 45) {
    return 0.14;
  }
  if (remainingDays >= 10) {
    return 0.14 + ((45 - remainingDays) / 35) * 0.36;
  }
  return 0.5 + ((10 - remainingDays) / 10) * 0.5;
}
