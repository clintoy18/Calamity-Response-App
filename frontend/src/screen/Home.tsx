import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, CloudFog, Droplets, Map as MapIcon, ShieldPlus, Siren } from "lucide-react";
import logo from "../assets/logo.png";
import type { AshfallReport, VolcanoAdvisory } from "../types";
import { fetchActiveVolcanoAdvisory, fetchAshfallReports } from "../services/api";
import { useEmergencies } from "../hooks/useEmergencies";
import { useGreeting } from "../hooks/useGreeting";
import { useHeatIndex } from "../hooks/useHeatIndex";
import { homeCopy, type Lang } from "../constants/greetings";
import { HeatCard } from "../components/home/HeatCard";
import { AdvisoryCard } from "../components/home/AdvisoryCard";
import { NearbyFeed } from "../components/home/NearbyFeed";

const LANG_KEY = "aidvocate:lang";

const readLang = (): Lang => {
  try {
    return localStorage.getItem(LANG_KEY) === "en" ? "en" : "ceb";
  } catch {
    return "ceb";
  }
};

interface ActionChipProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  badge?: string;
}

const ActionChip: React.FC<ActionChipProps> = ({ icon, label, onClick, badge }) => {
  const disabled = !onClick;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-14 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:hover:border-gray-200"
    >
      <span className={disabled ? "text-gray-400" : "text-gray-900"}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className={`block text-base font-medium leading-tight ${disabled ? "text-gray-400" : "text-gray-950"}`}>
          {label}
        </span>
        {badge && <span className="mt-0.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">{badge}</span>}
      </span>
    </button>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [lang, setLang] = useState<Lang>(readLang);
  const copy = homeCopy[lang];

  const { emergencies, isLoadingEmergencies, emergenciesError, refetchEmergencies } = useEmergencies();
  const heat = useHeatIndex();

  const [advisory, setAdvisory] = useState<VolcanoAdvisory | null>(null);
  const [ashfallReports, setAshfallReports] = useState<AshfallReport[]>([]);
  const [isLoadingAshfall, setIsLoadingAshfall] = useState(true);
  const [ashfallError, setAshfallError] = useState(false);

  const loadAshfall = useCallback(async (signal?: AbortSignal) => {
    setIsLoadingAshfall(true);
    setAshfallError(false);
    try {
      const [reports, active] = await Promise.all([
        fetchAshfallReports({ signal, hours: 72 }),
        fetchActiveVolcanoAdvisory({ signal }),
      ]);
      if (signal?.aborted) return;
      setAshfallReports(reports);
      setAdvisory(active);
    } catch (error) {
      if (signal?.aborted) return;
      console.error("Failed to load home awareness data:", error);
      setAshfallError(true);
    } finally {
      if (!signal?.aborted) setIsLoadingAshfall(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadAshfall(controller.signal);
    return () => controller.abort();
  }, [loadAshfall]);

  // ?preview=crisis|normal lets the team review both modes without touching advisory data
  const preview = searchParams.get("preview");
  const isCrisis = preview === "crisis" || (preview !== "normal" && advisory !== null);
  const greeting = useGreeting(lang, isCrisis);

  const switchLang = (next: Lang) => {
    setLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      // per-device preference only
    }
  };

  const openMap = () => navigate("/map");
  const requestHelp = () => navigate("/map?action=help");

  const advisoryCard = advisory && (
    <AdvisoryCard advisory={advisory} copy={copy} onOpen={openMap} />
  );

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-gray-950">
      <header className="mx-auto flex max-w-md items-center justify-between px-4 pt-4">
        <img src={logo} alt="AidVocate" className="h-7 w-auto" decoding="async" />
        <div className="flex items-center gap-1">
          <div className="flex rounded-full border border-gray-200 bg-white p-0.5" role="group" aria-label="Language">
            {(["ceb", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => switchLang(code)}
                aria-pressed={lang === code}
                className={`min-h-9 rounded-full px-3 text-sm font-semibold uppercase ${
                  lang === code ? "bg-gray-950 text-white" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={openMap}
            aria-label={copy.map}
            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 hover:bg-white"
          >
            <MapIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-5 px-4 pb-36 pt-8">
        <h1 className="font-alt text-[30px] font-bold leading-[1.15] tracking-tight motion-safe:animate-fade-in">
          <span className="block">{greeting.hello}</span>
          <span className={`block ${isCrisis ? "text-red-700" : "text-gray-400"}`}>{greeting.ask}</span>
        </h1>

        {isCrisis && advisoryCard}

        <HeatCard
          lang={lang}
          copy={copy}
          reading={heat.reading}
          isLoading={heat.isLoading}
          error={heat.error}
          onRetry={heat.reload}
        />

        <div className="grid grid-cols-2 gap-2">
          <ActionChip icon={<MapIcon className="h-5 w-5" />} label={copy.map} onClick={openMap} />
          <ActionChip
            icon={<CloudFog className="h-5 w-5" />}
            label={copy.report}
            onClick={() => navigate("/map?action=ashfall")}
          />
          <ActionChip icon={<Droplets className="h-5 w-5" />} label={copy.water} badge={copy.soon} />
          <ActionChip icon={<ShieldPlus className="h-5 w-5" />} label={copy.advisories} badge={copy.soon} />
        </div>

        {!isCrisis && advisoryCard}

        <NearbyFeed
          lang={lang}
          copy={copy}
          emergencies={emergencies}
          ashfallReports={ashfallReports}
          isLoading={isLoadingEmergencies || isLoadingAshfall}
          hasError={Boolean(emergenciesError) || ashfallError}
          onRetry={() => {
            void refetchEmergencies(true);
            void loadAshfall();
          }}
          onOpenMap={openMap}
        />
      </main>

      {/* Emergency action: same place on every visit, in every mode */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-md px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={requestHelp}
            className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-red-600 px-4 py-3 text-left text-white transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            <Siren className="h-6 w-6 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold leading-tight">{copy.needHelp}</span>
              <span className="block truncate text-sm text-red-100">{copy.needHelpSub}</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
