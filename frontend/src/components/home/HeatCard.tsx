import React from "react";
import { RefreshCw, Thermometer } from "lucide-react";
import type { HeatLevel, HeatReading } from "../../hooks/useHeatIndex";
import type { HomeCopy, Lang } from "../../constants/greetings";

const levelStyles: Record<HeatLevel, { bar: string; chip: string; number: string }> = {
  normal: { bar: "bg-stone-300", chip: "bg-stone-100 text-stone-700", number: "text-gray-950" },
  caution: { bar: "bg-amber-400", chip: "bg-amber-100 text-amber-800", number: "text-gray-950" },
  extreme_caution: { bar: "bg-orange-500", chip: "bg-orange-100 text-orange-800", number: "text-orange-700" },
  danger: { bar: "bg-red-600", chip: "bg-red-100 text-red-800", number: "text-red-700" },
  extreme_danger: { bar: "bg-red-800", chip: "bg-red-800 text-white", number: "text-red-800" },
};

const levelText: Record<Lang, Record<HeatLevel, { label: string; tip: string }>> = {
  ceb: {
    normal: { label: "Normal", tip: "Komportable ra ang panahon karon." },
    caution: { label: "Caution", tip: "Inom og tubig kanunay. Pahulay kung kapoy na." },
    extreme_caution: { label: "Extreme Caution", tip: "Likayi ang dugay nga pagbilad sa adlaw, 10AM hangtod 4PM. Inom og tubig bisan dili uhaw." },
    danger: { label: "Danger", tip: "Posible ang heat cramps ug heat stroke. Pabilin sa landong ug bantayi ang mga tigulang ug bata." },
    extreme_danger: { label: "Extreme Danger", tip: "Delikado kaayo. Pabilin sa sulod. Kung naay nakuyapan, tawag dayon og tabang." },
  },
  en: {
    normal: { label: "Normal", tip: "Comfortable conditions right now." },
    caution: { label: "Caution", tip: "Drink water regularly. Rest when you feel tired." },
    extreme_caution: { label: "Extreme Caution", tip: "Avoid long sun exposure from 10AM to 4PM. Drink water even if you're not thirsty." },
    danger: { label: "Danger", tip: "Heat cramps and heat stroke are possible. Stay in the shade and check on older people and kids." },
    extreme_danger: { label: "Extreme Danger", tip: "Very dangerous. Stay indoors. If someone faints, call for help right away." },
  },
};

interface HeatCardProps {
  lang: Lang;
  copy: HomeCopy;
  reading: HeatReading | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const HeatCard: React.FC<HeatCardProps> = ({ lang, copy, reading, isLoading, error, onRetry }) => {
  if (isLoading && !reading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-4" aria-busy="true">
        <div className="h-3 w-24 rounded bg-gray-100 motion-safe:animate-pulse" />
        <div className="mt-3 h-9 w-28 rounded bg-gray-100 motion-safe:animate-pulse" />
        <div className="mt-3 h-3 w-full rounded bg-gray-100 motion-safe:animate-pulse" />
      </div>
    );
  }

  if (error || !reading) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-base text-gray-600">{copy.heatError}</p>
        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 shrink-0 rounded-full border border-gray-300 px-4 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          {copy.retry}
        </button>
      </div>
    );
  }

  const style = levelStyles[reading.level];
  const text = levelText[lang][reading.level];
  const time = reading.fetchedAt.toLocaleTimeString(lang === "ceb" ? "en-PH" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className={`h-1 ${style.bar}`} />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500">
            <Thermometer className="h-4 w-4" aria-hidden />
            {copy.heatTitle}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-sm font-semibold ${style.chip}`}>
            {text.label}
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-3">
          <span className={`font-alt text-[40px] font-bold leading-none tracking-tight ${style.number}`}>
            {Math.round(reading.heatIndexC)}°C
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(reading.temperatureC)}°C · {reading.humidity}% RH
          </span>
        </div>

        <p className="mt-3 text-base leading-snug text-gray-800">{text.tip}</p>

        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-xs text-gray-500">
            {copy.heatEstimated} · {time} · PAGASA scale
          </span>
          <button
            type="button"
            onClick={onRetry}
            aria-label={copy.retry}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-gray-500 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "motion-safe:animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </section>
  );
};
