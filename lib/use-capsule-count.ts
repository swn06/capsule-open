"use client";

import { useEffect, useState } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { CAPSULES_COLLECTION } from "@/lib/capsule";
import { getDb } from "@/lib/firebase";

export function useCapsuleCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    getCountFromServer(collection(getDb(), CAPSULES_COLLECTION))
      .then((snapshot) => {
        if (!cancelled) {
          setCount(snapshot.data().count);
        }
      })
      .catch((caught) => {
        console.error(caught);
        if (!cancelled) {
          setCount(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return count;
}
