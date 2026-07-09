import React, { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CloudFog,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import type { VolcanoAdvisory } from "../../types";

interface AshfallAwarenessPanelProps {
  advisory: VolcanoAdvisory | null;
  reportCount: number;
  verifiedCount: number;
  isLoading: boolean;
  onRefresh: () => void;
  onReportAshfall: () => void;
}

const safetySteps = [
  "Stay indoors while ash is falling.",
  "Close doors and windows; place damp towels at draft gaps if needed.",
  "Use a well-fitting mask or cloth over nose and mouth if you must go outside.",
  "Avoid unnecessary driving because ash reduces visibility and can damage vehicles.",
  "Keep ash out of water containers, drains, machinery, and electronics.",
];

export const AshfallAwarenessPanel: React.FC<AshfallAwarenessPanelProps> = ({
  advisory,
  reportCount,
  verifiedCount,
  isLoading,
  onRefresh,
  onReportAshfall,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const publishedAt = advisory?.publishedAt
    ? new Date(advisory.publishedAt).toLocaleString()
    : "";

  return (
    <section className="fixed right-3 top-20 z-20 w-[calc(100vw-1.5rem)] max-w-sm rounded-2xl border border-gray-200 bg-white shadow-strong sm:right-4">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white">
            <CloudFog className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-950">Kanlaon Ashfall Watch</h2>
              {isLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin text-gray-500" />}
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {verifiedCount} verified / {reportCount} recent community reports
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
          {advisory ? (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {advisory.alertLevel && (
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
                    {advisory.alertLevel}
                  </span>
                )}
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-800">
                  Admin advisory
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-950">{advisory.title}</h3>
              <p className="text-xs leading-5 text-gray-700">{advisory.summary}</p>
              <p className="text-[11px] text-gray-500">
                Source: {advisory.sourceName}
                {publishedAt ? ` | ${publishedAt}` : ""}
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  No official advisory posted in this app
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-600">
                  Community reports remain visible as unverified until reviewed by admins.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onReportAshfall}
            className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            Report Ashfall
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="mt-3 flex w-full items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-left text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900"
          aria-expanded={isExpanded}
        >
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-700" />
            Safety steps
          </span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {isExpanded && (
          <ol className="mt-3 space-y-2 rounded-xl bg-gray-50 p-3 text-xs leading-5 text-gray-700">
            {safetySteps.map((step, index) => (
              <li key={step} className="flex gap-2">
                <span className="font-bold text-gray-950">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
};
