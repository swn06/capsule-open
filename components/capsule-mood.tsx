import type { CapsuleMood } from "@/lib/mood";

export function KeywordChips({
  keywords,
  hint = false,
}: {
  keywords?: string[] | null;
  hint?: boolean;
}) {
  if (!keywords || keywords.length === 0) {
    return null;
  }

  return (
    <div>
      {hint ? (
        <p className="text-xs tracking-[0.18em] text-stone-400">키워드 힌트</p>
      ) : null}
      <div className={`flex flex-wrap gap-2 ${hint ? "mt-3" : ""}`}>
        {keywords.map((keyword) => (
          <span
            key={keyword}
            className="rounded-full border border-stone-200/80 bg-white/80 px-3 py-1 text-xs tracking-wide text-stone-600"
          >
            #{keyword}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MoodPhrase({ mood }: { mood?: CapsuleMood | null }) {
  if (!mood?.phrase) {
    return null;
  }

  return (
    <blockquote className="rounded-3xl border border-amber-100/80 bg-white/80 px-6 py-5">
      <p className="text-xs tracking-[0.18em] text-stone-400">그날의 한마디</p>
      <p className="mt-3 font-serif text-xl leading-relaxed tracking-tight text-stone-800">
        {mood.phrase}
      </p>
    </blockquote>
  );
}
