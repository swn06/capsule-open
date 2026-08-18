import {
  capsuleTitle,
  formatBuriedDate,
  formatBuriedTime,
  type CapsuleListItem,
} from "@/lib/capsule";
import { formatTemperature, weatherEmoji } from "@/lib/weather";

export function CapsuleSignpost({
  capsule,
  compact = false,
}: {
  capsule: CapsuleListItem;
  compact?: boolean;
}) {
  const who = capsuleTitle(capsule);
  const date = formatBuriedDate(capsule.createdAt);
  const time = formatBuriedTime(capsule.createdAt);
  const weather = capsule.weather
    ? `${weatherEmoji(capsule.weather.condition)} ${capsule.weather.condition} ${formatTemperature(capsule.weather.temperature)}°`
    : "";

  return (
    <div className={`flex flex-col items-center ${compact ? "w-[5.6rem]" : "w-[6.6rem]"}`}>
      <div
        className="relative w-full rounded-[3px] border border-[#c4a574] bg-[#e8d5b5] px-1.5 py-1.5 shadow-[1px_2px_0_rgba(92,64,51,0.18)]"
        style={{ transform: "rotate(-2deg)" }}
      >
        <p className="text-[8px] font-semibold tracking-[0.14em] text-[#8a6a3e]">NAME</p>
        <p className="mt-0.5 truncate border-b border-dotted border-[#b45309]/50 pb-0.5 text-[10px] leading-tight text-stone-800">
          {who}
        </p>
        <p className="mt-1 text-[8px] font-semibold tracking-[0.14em] text-[#8a6a3e]">DATE</p>
        <p className="mt-0.5 border-b border-dotted border-[#b45309]/50 pb-0.5 text-[10px] leading-tight text-stone-800">
          {date || "—"}
        </p>
        {time ? <p className="mt-0.5 text-[9px] text-stone-600">{time}</p> : null}
        {weather ? (
          <p className="mt-0.5 truncate text-[9px] leading-tight text-stone-600">{weather}</p>
        ) : null}
      </div>
      <span className="h-7 w-[3px] bg-[#8b5e3c]" />
      <span className="-mt-0.5 h-1.5 w-5 rounded-sm bg-[#6b4423]" />
    </div>
  );
}
