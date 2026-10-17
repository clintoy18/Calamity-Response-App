import React from "react";
import { CloudFog, LifeBuoy, ShieldCheck } from "lucide-react";
import type { AshfallReport, EmergencyRecord } from "../../types";
import type { HomeCopy, Lang } from "../../constants/greetings";

interface FeedItem {
  key: string;
  kind: "help" | "ashfall";
  place: string;
  detail: string;
  time: number;
  badge: string | null;
}

const timeAgo = (ms: number, lang: Lang): string => {
  const mins = Math.max(1, Math.round((Date.now() - ms) / 60000));
  if (mins < 60) return lang === "ceb" ? `${mins} min ang milabay` : `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return lang === "ceb" ? `${hours} ka oras ang milabay` : `${hours}h ago`;
  const days = Math.round(hours / 24);
  return lang === "ceb" ? `${days} ka adlaw ang milabay` : `${days}d ago`;
};

const shortPlace = (place?: string) => (place ? place.split(",").slice(0, 2).join(",").trim() : "—");

interface NearbyFeedProps {
  lang: Lang;
  copy: HomeCopy;
  emergencies: EmergencyRecord[];
  ashfallReports: AshfallReport[];
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
  onOpenMap: () => void;
}

export const NearbyFeed: React.FC<NearbyFeedProps> = ({
  lang,
  copy,
  emergencies,
  ashfallReports,
  isLoading,
  hasError,
  onRetry,
  onOpenMap,
}) => {
  const openCount = emergencies.filter((e) => e.status !== "responded").length;
  const respondedCount = emergencies.length - openCount;

  const items: FeedItem[] = [
    ...emergencies.map((e) => ({
      key: `e-${e.id}`,
      kind: "help" as const,
      place: shortPlace(e.placename),
      detail: e.needs?.length ? e.needs.join(", ") : copy.helpRequest,
      time: new Date(e.createdAt || e.timestamp).getTime(),
      badge: e.status === "responded" ? copy.responded : null,
    })),
    ...ashfallReports.map((r) => ({
      key: `a-${r.id}`,
      kind: "ashfall" as const,
      place: shortPlace(r.placename),
      detail: `${copy.ashfallReport} · ${r.ashLevel.toLowerCase()}`,
      time: new Date(r.createdAt || r.timestamp || Date.now()).getTime(),
      badge: r.isVerified ? copy.verified : null,
    })),
  ]
    .filter((item) => !Number.isNaN(item.time))
    .sort((a, b) => b.time - a.time)
    .slice(0, 5);

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold text-gray-950">{copy.nearby}</h2>
        {!isLoading && !hasError && emergencies.length > 0 && (
          <span className="text-sm text-gray-500">
            {openCount} {copy.requests} · {respondedCount} {copy.responded}
          </span>
        )}
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {isLoading && items.length === 0 ? (
          <ul aria-busy="true">
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex items-center gap-3 border-b border-gray-100 p-4 last:border-0">
                <div className="h-9 w-9 rounded-full bg-gray-100 motion-safe:animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 rounded bg-gray-100 motion-safe:animate-pulse" />
                  <div className="h-3 w-1/3 rounded bg-gray-100 motion-safe:animate-pulse" />
                </div>
              </li>
            ))}
          </ul>
        ) : hasError && items.length === 0 ? (
          <div className="flex items-center justify-between gap-3 p-4">
            <p className="text-base text-gray-600">{copy.loadError}</p>
            <button
              type="button"
              onClick={onRetry}
              className="min-h-11 shrink-0 rounded-full border border-gray-300 px-4 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              {copy.retry}
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="p-4 text-base text-gray-600">{copy.nearbyEmpty}</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.key} className="border-b border-gray-100 last:border-0">
                <button
                  type="button"
                  onClick={onOpenMap}
                  className="flex min-h-11 w-full items-center gap-3 p-4 text-left hover:bg-gray-50"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      item.kind === "help" ? "bg-red-50 text-red-600" : "bg-stone-100 text-stone-700"
                    }`}
                  >
                    {item.kind === "help" ? (
                      <LifeBuoy className="h-4 w-4" aria-hidden />
                    ) : (
                      <CloudFog className="h-4 w-4" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-medium text-gray-950">{item.place}</span>
                    <span className="block truncate text-sm capitalize text-gray-500">{item.detail}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-xs text-gray-500">{timeAgo(item.time, lang)}</span>
                    {item.badge && (
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-label={item.badge} />
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
