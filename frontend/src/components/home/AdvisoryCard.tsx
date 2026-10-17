import React from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import type { VolcanoAdvisory } from "../../types";
import type { HomeCopy } from "../../constants/greetings";

interface AdvisoryCardProps {
  advisory: VolcanoAdvisory;
  copy: HomeCopy;
  onOpen: () => void;
}

export const AdvisoryCard: React.FC<AdvisoryCardProps> = ({ advisory, copy, onOpen }) => {
  const published = new Date(advisory.publishedAt).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-red-700">
        <AlertTriangle className="h-4 w-4" aria-hidden />
        {copy.activeAdvisory}
        {advisory.alertLevel && (
          <span className="ml-auto rounded-full bg-red-700 px-2.5 py-0.5 text-sm font-semibold normal-case tracking-normal text-white">
            {advisory.alertLevel}
          </span>
        )}
      </div>

      <h2 className="mt-2 text-lg font-semibold leading-snug text-gray-950">{advisory.title}</h2>
      <p className="mt-1 line-clamp-3 text-base leading-snug text-gray-700">{advisory.summary}</p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-xs text-gray-600">
          {copy.source} {advisory.sourceName} · {published}
        </span>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full bg-gray-950 px-4 text-sm font-semibold text-white hover:bg-gray-800"
        >
          {copy.openAdvisory}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </section>
  );
};
